import { getDoc, doc, getFirestore } from "firebase/firestore";
import firebase_app from "@/firebase/config";
import { batchWrite } from "@/firebase/firestore/batchWrite";

const db = getFirestore(firebase_app);

/**
 * 1. Agrupar en bloques
 * 2. Descargar métricas globales
 * 3. Asignar operador a bloque
 * 4. Actualizar en Firebase
 */
// Auxiliar para convertir "HH:mm" a minutos desde la medianoche
const timeToMinutes = (str) => {
    if (!str) return 0;
    const [h, m] = str.split(':').map(Number);
    return h * 60 + m;
};

// Auxiliar para calcular y asignar las horas de inicio y fin de un bloque
const formatBlockTimes = (bloque) => {
    bloque.horaInicio = bloque.audiencias[0]?.hora || "08:00";
    bloque.horaInicioMinutos = timeToMinutes(bloque.horaInicio);
    bloque.horaFinMinutos = bloque.horaInicioMinutos + bloque.cargaEstimada;
};

// Comprueba si un operador tiene conflicto de horario con un nuevo bloque en este sorteo
const tieneConflictoHorario = (op, bloque) => {
    if (!op.bloquesAsignadosLista || op.bloquesAsignadosLista.length === 0) {
        return false;
    }

    const s1 = bloque.horaInicioMinutos;
    const e1 = bloque.horaFinMinutos;
    const juez1 = bloque.juez;
    const BUFFER_TRANSICION = 10; // 10 minutos de margen para desplazarse entre salas/jueces

    for (const bAssigned of op.bloquesAsignadosLista) {
        const s2 = bAssigned.horaInicioMinutos;
        const e2 = bAssigned.horaFinMinutos;
        const juez2 = bAssigned.juez;

        // Si es con el mismo juez, no hay problema de traslado
        if (juez1 && juez2 && juez1 === juez2) {
            continue;
        }

        // Verificar solapamiento considerando el margen de transición
        const solapa = (s1 < e2 + BUFFER_TRANSICION && s2 < e1 + BUFFER_TRANSICION);
        if (solapa) {
            return true;
        }
    }
    return false;
};

// Comprueba si un operador tiene conflicto de debate (no 2 debates, ni otras audiencias excepto bastante antes)
const tieneConflictoDebate = (op, bloque) => {
    const gapMinimo = 30; // Minutos de holgura mínima antes del debate

    // Caso A: El bloque que queremos asignar es un Debate
    if (bloque.esDebate) {
        for (const b of op.bloquesAsignadosLista) {
            if (b.esDebate) return true; // No se permiten 2 debates el mismo día
            if (b.horaFinMinutos + gapMinimo > bloque.horaInicioMinutos) {
                return true; // El bloque existente no termina lo suficientemente temprano
            }
        }
        return false;
    }

    // Caso B: El bloque que queremos asignar es común/ejecución, y el operador ya tiene un debate asignado
    const debateAsignado = op.bloquesAsignadosLista.find(b => b.esDebate);
    if (debateAsignado) {
        if (bloque.horaFinMinutos + gapMinimo > debateAsignado.horaInicioMinutos) {
            return true; // El bloque que queremos asignar no termina bastante antes de que empiece el debate
        }
    }

    return false;
};

// Auxiliar para obtener la clave del tipo de audiencia
const getTipoClave = (aud) => {
    const tipoStr = `${aud.tipo || ''} ${aud.tipo2 || ''} ${aud.tipo3 || ''}`.toLowerCase();
    // Excluir juicios abreviados, ya que no son debates de larga duración
    if (tipoStr.includes('abreviado')) {
        return 'general';
    }
    // Considerar debate si contiene "debate" o "juicio oral"
    if (tipoStr.includes('debate') || tipoStr.includes('juicio oral')) {
        return 'debate';
    }
    if (tipoStr.includes('ejecuci') || tipoStr.includes('ejecucion')) {
        return 'ejecucion';
    }
    return 'general';
};

export async function generarSorteoUGA(audienciasSeleccionadas, operadoresSeleccionados, dateCollection) {
    if (!audienciasSeleccionadas || audienciasSeleccionadas.length === 0) return null;
    if (!operadoresSeleccionados || operadoresSeleccionados.length === 0) return null;

    try {
        // 1. Descargar las estadísticas de todos
        const docRef = doc(db, "centro_uga", "datos_globales");
        const docSnap = await getDoc(docRef);
        let datos = docSnap.exists() ? docSnap.data() : { estadisticas_operadores: {}, promedios_historicos: {} };
        const statsOps = datos.estadisticas_operadores || {};
        const promedios = datos.promedios_historicos || {};

        // Inicializar stats en memoria para los operadores seleccionados
        const opsDisponibles = operadoresSeleccionados.map(opNombre => {
            const uid = opNombre.trim().toLowerCase().replace(/\s+/g, '_');
            const stat = statsOps[uid]?.mensual || {
                debates: 0, tramites_ejecucion: 0, tiempo_total_minutos: 0, minutos_fuera_horario: 0
            };
            return {
                nombre: opNombre,
                uid,
                stats: { ...stat },
                bloquesAsignados: 0,
                audienciasAsignadas: 0,
                bloquesAsignadosLista: [] // Rastrear asignaciones de este sorteo para evitar solapes
            };
        });

        // 2. Agrupar en bloques iniciales por juez y tipo (esDebate, esEjecucion, general)
        let bloques = [];
        
        // Ordenar por juez, tipo y hora para facilitar la agrupación
        const audsOrdenadas = [...audienciasSeleccionadas].sort((a, b) => {
            if ((a.juez || '') !== (b.juez || '')) {
                return (a.juez || '').localeCompare(b.juez || '');
            }
            const tipoA = getTipoClave(a);
            const tipoB = getTipoClave(b);
            if (tipoA !== tipoB) return tipoA.localeCompare(tipoB);
            return (a.hora || '').localeCompare(b.hora || '');
        });

        let bloqueActual = null;

        for (const aud of audsOrdenadas) {
            const tipoClave = getTipoClave(aud);
            const esDebate = tipoClave === 'debate';
            const esEjecucion = tipoClave === 'ejecucion';
            const juezFormat = aud.juez ? aud.juez.toLowerCase().replace(/\s+/g, '_') : 'sin_juez';
            const tipoMetrica = esDebate ? 'debate' : (esEjecucion ? 'tramites_ejecucion' : 'audiencia_general');

            let duracionEstimada = 45;
            if (promedios[juezFormat] && promedios[juezFormat][tipoMetrica]) {
                duracionEstimada = promedios[juezFormat][tipoMetrica].avg || duracionEstimada;
            } else if (esDebate) duracionEstimada = 120;
            else if (esEjecucion) duracionEstimada = 15;

            if (esDebate) {
                if (bloqueActual) {
                    formatBlockTimes(bloqueActual);
                    bloques.push(bloqueActual);
                }
                const debBlock = {
                    juez: aud.juez,
                    esDebate: true,
                    esEjecucion: false,
                    audiencias: [aud],
                    cargaEstimada: duracionEstimada
                };
                formatBlockTimes(debBlock);
                bloques.push(debBlock);
                bloqueActual = null;
            } else {
                if (!bloqueActual || bloqueActual.juez !== aud.juez || bloqueActual.esDebate || bloqueActual.esEjecucion !== esEjecucion) {
                    if (bloqueActual) {
                        formatBlockTimes(bloqueActual);
                        bloques.push(bloqueActual);
                    }
                    bloqueActual = {
                        juez: aud.juez,
                        esDebate: false,
                        esEjecucion: esEjecucion,
                        audiencias: [aud],
                        cargaEstimada: duracionEstimada
                    };
                } else {
                    bloqueActual.audiencias.push(aud);
                    bloqueActual.cargaEstimada += duracionEstimada;
                }
            }
        }
        if (bloqueActual) {
            formatBlockTimes(bloqueActual);
            bloques.push(bloqueActual);
        }

        // Dividir bloques si hay más operadores disponibles que bloques creados.
        // Esto evita que algunos operadores queden sin tareas asignadas en este sorteo.
        const numOps = operadoresSeleccionados.length;
        while (bloques.length < numOps) {
            let maxIndex = -1;
            let maxAudCount = 1;

            // Buscamos el bloque no-debate con más audiencias para poder dividirlo
            for (let i = 0; i < bloques.length; i++) {
                if (!bloques[i].esDebate && bloques[i].audiencias.length > maxAudCount) {
                    maxAudCount = bloques[i].audiencias.length;
                    maxIndex = i;
                }
            }

            // Si no hay ningún bloque que se pueda subdividir, salimos
            if (maxIndex === -1) break;

            const bloqueADividir = bloques[maxIndex];
            const auds = bloqueADividir.audiencias;
            const mid = Math.ceil(auds.length / 2);
            const auds1 = auds.slice(0, mid);
            const auds2 = auds.slice(mid);

            // Recalcular carga estimada para cada nuevo subbloque
            const calcularCarga = (listaAuds) => {
                let totalCarga = 0;
                for (const aud of listaAuds) {
                    const tipoClave = getTipoClave(aud);
                    const esEjecucion = tipoClave === 'ejecucion';
                    const juezFormat = aud.juez ? aud.juez.toLowerCase().replace(/\s+/g, '_') : 'sin_juez';
                    
                    let dur = 45;
                    if (promedios[juezFormat] && promedios[juezFormat][tipoClave === 'ejecucion' ? 'tramites_ejecucion' : 'audiencia_general']) {
                        dur = promedios[juezFormat][tipoClave === 'ejecucion' ? 'tramites_ejecucion' : 'audiencia_general'].avg || dur;
                    } else if (esEjecucion) dur = 15;
                    totalCarga += dur;
                }
                return totalCarga;
            };

            const nuevoBloque1 = {
                juez: bloqueADividir.juez,
                esDebate: false,
                esEjecucion: bloqueADividir.esEjecucion,
                audiencias: auds1,
                cargaEstimada: calcularCarga(auds1)
            };
            formatBlockTimes(nuevoBloque1);

            const nuevoBloque2 = {
                juez: bloqueADividir.juez,
                esDebate: false,
                esEjecucion: bloqueADividir.esEjecucion,
                audiencias: auds2,
                cargaEstimada: calcularCarga(auds2)
            };
            formatBlockTimes(nuevoBloque2);

            bloques.splice(maxIndex, 1, nuevoBloque1, nuevoBloque2);
        }

        // 3. Asignación (El Sorteo)
        // Ordenar bloques: debates primero, luego ejecuciones, luego mayor carga
        bloques.sort((a, b) => {
            if (a.esDebate && !b.esDebate) return -1;
            if (!a.esDebate && b.esDebate) return 1;
            if (a.esEjecucion && !b.esEjecucion) return -1;
            if (!a.esEjecucion && b.esEjecucion) return 1;
            return b.cargaEstimada - a.cargaEstimada;
        });

        const resultadosParaFirebase = [];
        const resumenOperadores = {};

        for (const bloque of bloques) {
            let mejorOp = null;

            // Ordenamos los operadores disponibles según conflicto de horarios, restricciones de debate,
            // asignaciones de ejecución, carga de trabajo y estadísticas históricas
            opsDisponibles.sort((a, b) => {
                // 1. Conflicto horario general (jueces diferentes solapados)
                const confHorarioA = tieneConflictoHorario(a, bloque);
                const confHorarioB = tieneConflictoHorario(b, bloque);
                if (confHorarioA !== confHorarioB) return confHorarioA ? 1 : -1;

                // 2. Conflicto de debate (holgura de 30 mins o doble debate)
                const confDebA = tieneConflictoDebate(a, bloque);
                const confDebB = tieneConflictoDebate(b, bloque);
                if (confDebA !== confDebB) return confDebA ? 1 : -1;

                // 3. Restricción de Juicios/Debates: Si el bloque actual NO es un debate, 
                // pero un operador ya tiene un debate asignado hoy, queremos EVITAR asignarle más carga.
                // Lo enviamos al final de la fila.
                if (!bloque.esDebate) {
                    const tieneDebA = a.bloquesAsignadosLista.some(x => x.esDebate);
                    const tieneDebB = b.bloquesAsignadosLista.some(x => x.esDebate);
                    if (tieneDebA !== tieneDebB) return tieneDebA ? 1 : -1;
                }

                // 4. Clustering de Trámites de Ejecución:
                // Si el bloque actual es de ejecución: preferir operadores que YA tengan ejecuciones asignadas hoy.
                // Si el bloque actual NO es de ejecución: preferir operadores que NO tengan ejecuciones asignadas hoy (para no sobrecargarlos).
                const tieneEjeA = a.bloquesAsignadosLista.some(x => x.esEjecucion);
                const tieneEjeB = b.bloquesAsignadosLista.some(x => x.esEjecucion);
                if (bloque.esEjecucion) {
                    if (tieneEjeA !== tieneEjeB) return tieneEjeA ? -1 : 1; // Priorizar al que ya tiene
                } else {
                    if (tieneEjeA !== tieneEjeB) return tieneEjeA ? 1 : -1; // Evitar al que tiene ejecución
                }

                // 5. Carga de bloques en este sorteo
                if (a.bloquesAsignados !== b.bloquesAsignados) {
                    return a.bloquesAsignados - b.bloquesAsignados;
                }

                // 6. Carga de audiencias en este sorteo
                if (a.audienciasAsignadas !== b.audienciasAsignadas) {
                    return a.audienciasAsignadas - b.audienciasAsignadas;
                }

                // 7. Estadísticas históricas de Firebase
                if (bloque.esDebate) {
                    return a.stats.debates - b.stats.debates;
                }

                // Si es horario de fin de mañana (12 a 14) preferimos al que tenga menos minutos fuera de horario
                const hStart = bloque.horaFinMinutos ? Math.floor(bloque.horaFinMinutos / 60) : 0;
                const cercaFinManana = hStart >= 12 && hStart < 14;
                if (cercaFinManana) {
                    if (a.stats.minutos_fuera_horario === b.stats.minutos_fuera_horario) {
                        return a.stats.tiempo_total_minutos - b.stats.tiempo_total_minutos;
                    }
                    return a.stats.minutos_fuera_horario - b.stats.minutos_fuera_horario;
                }

                return a.stats.tiempo_total_minutos - b.stats.tiempo_total_minutos;
            });

            mejorOp = opsDisponibles[0];

            for (const aud of bloque.audiencias) {
                resultadosParaFirebase.push({
                    id: aud.id,
                    operador: mejorOp.nombre
                });
                if (!resumenOperadores[mejorOp.nombre]) resumenOperadores[mejorOp.nombre] = 0;
                resumenOperadores[mejorOp.nombre]++;
            }

            if (bloque.esDebate) mejorOp.stats.debates++;
            mejorOp.stats.tiempo_total_minutos += bloque.cargaEstimada;
            mejorOp.bloquesAsignados++;
            mejorOp.audienciasAsignadas += bloque.audiencias.length;
            mejorOp.bloquesAsignadosLista.push(bloque);
        }

        // 4. Retornar asignaciones en memoria para previsualizacion y edicion
        return {
            success: true,
            asignadas: resultadosParaFirebase.length,
            resumen: resumenOperadores,
            resultados: resultadosParaFirebase
        };

    } catch (e) {
        console.error("Error en generarSorteoUGA:", e);
        return { success: false, error: e.message };
    }
}
