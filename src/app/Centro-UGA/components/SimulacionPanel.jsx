'use client'
import { useContext, useEffect, useState } from 'react';
import { DataContext } from '@/context/DataContext';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import firebase_app from '@/firebase/config';
import styles from '../centroUga.module.css';

const db = getFirestore(firebase_app);

// Auxiliares locales para cálculo de tiempo
const timeToMinutes = (str) => {
    if (!str) return 0;
    const [h, m] = str.split(':').map(Number);
    return h * 60 + m;
};

const formatBlockTimes = (bloque) => {
    bloque.horaInicio = bloque.audiencias[0]?.hora || "08:00";
    bloque.horaInicioMinutos = timeToMinutes(bloque.horaInicio);
    bloque.horaFinMinutos = bloque.horaInicioMinutos + bloque.cargaEstimada;
};

const tieneConflictoHorario = (op, bloque) => {
    if (!op.bloquesAsignadosLista || op.bloquesAsignadosLista.length === 0) {
        return false;
    }

    const s1 = bloque.horaInicioMinutos;
    const e1 = bloque.horaFinMinutos;
    const juez1 = bloque.juez;
    const BUFFER_TRANSICION = 10;

    for (const bAssigned of op.bloquesAsignadosLista) {
        const s2 = bAssigned.horaInicioMinutos;
        const e2 = bAssigned.horaFinMinutos;
        const juez2 = bAssigned.juez;

        if (juez1 && juez2 && juez1 === juez2) {
            continue;
        }

        const solapa = (s1 < e2 + BUFFER_TRANSICION && s2 < e1 + BUFFER_TRANSICION);
        if (solapa) {
            return {
                bloqueConflicto: bAssigned,
                razon: `Solapamiento con Juez: ${juez2.toUpperCase()} (${bAssigned.horaInicio} - ${Math.floor(bAssigned.horaFinMinutos / 60)}:${String(bAssigned.horaFinMinutos % 60).padStart(2, '0')})`
            };
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

// Comprueba si un operador tiene conflicto de debate (no 2 debates, ni otras audiencias excepto bastante antes)
const tieneConflictoDebate = (op, bloque) => {
    const gapMinimo = 30; // Minutos de holgura mínima antes del debate

    // Caso A: El bloque que queremos asignar es un Debate
    if (bloque.esDebate) {
        for (const b of op.bloquesAsignadosLista) {
            if (b.esDebate) {
                return { razon: "Ya tiene otro Debate/Juicio asignado hoy" };
            }
            if (b.horaFinMinutos + gapMinimo > bloque.horaInicioMinutos) {
                return { razon: `Audiencia previa finaliza demasiado tarde (${Math.floor(b.horaFinMinutos / 60)}:${String(b.horaFinMinutos % 60).padStart(2, '0')})` };
            }
        }
        return false;
    }

    // Caso B: El bloque que queremos asignar es común/ejecución, y el operador ya tiene un debate asignado
    const debateAsignado = op.bloquesAsignadosLista.find(b => b.esDebate);
    if (debateAsignado) {
        if (bloque.horaFinMinutos + gapMinimo > debateAsignado.horaInicioMinutos) {
            return { razon: `No hay 30 mins de holgura antes de su Debate (${debateAsignado.horaInicio})` };
        }
    }

    return false;
};

export default function SimulacionPanel() {
    const { bydate: data, updateByDate, desplegables, updateDesplegables } = useContext(DataContext);
    
    const [selectedDate, setSelectedDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    });

    const [audienciasList, setAudienciasList] = useState([]);
    const [selectedAudiencias, setSelectedAudiencias] = useState({});
    
    const [operadoresDisponibles, setOperadoresDisponibles] = useState([]);
    const [selectedOperadores, setSelectedOperadores] = useState({});

    const [simulacionActiva, setSimulacionActiva] = useState(false);
    const [resultadoSimulacion, setResultadoSimulacion] = useState(null); // { asignaciones: { idAud: opName }, resumenOps: [], conflictos: {} }
    const [isLoading, setIsLoading] = useState(false);

    // Cargar listas desplegables al montar
    useEffect(() => {
        if (updateDesplegables) updateDesplegables();
    }, []);

    // Inicializar operadores
    useEffect(() => {
        if (desplegables?.operador) {
            setOperadoresDisponibles(desplegables.operador);
            const selOps = {};
            desplegables.operador.forEach(op => {
                const opName = typeof op === 'string' ? op : op.nombre || op.value;
                selOps[opName] = false;
            });
            setSelectedOperadores(selOps);
        }
    }, [desplegables?.operador]);

    // Cuando cambia la data de las audiencias
    useEffect(() => {
        if (data && Array.isArray(data)) {
            // Ordenamos por hora, secundariamente por legajo
            const sortedData = [...data].sort((a, b) => {
                const cmp = (a.hora || '').localeCompare(b.hora || '');
                if (cmp !== 0) return cmp;
                return (a.numeroLeg || '').localeCompare(b.numeroLeg || '');
            });
            setAudienciasList(sortedData);

            // Auto-seleccionar todas por defecto para simular
            const selAuds = {};
            sortedData.forEach(aud => {
                selAuds[aud.id] = true;
            });
            setSelectedAudiencias(selAuds);
            setResultadoSimulacion(null);
            setSimulacionActiva(false);
        } else {
            setAudienciasList([]);
        }
    }, [data]);

    const handleLoadDate = async () => {
        if (!selectedDate) return;
        const formattedDate = selectedDate.split('-').reverse().join(''); 
        setIsLoading(true);
        await updateByDate(formattedDate);
        setIsLoading(false);
    };

    const toggleAud = (id) => {
        setSelectedAudiencias(prev => ({ ...prev, [id]: !prev[id] }));
        setResultadoSimulacion(null);
        setSimulacionActiva(false);
    };

    const toggleOp = (name) => {
        setSelectedOperadores(prev => ({ ...prev, [name]: !prev[name] }));
        setResultadoSimulacion(null);
        setSimulacionActiva(false);
    };

    // Distribuir audiencias en 3 columnas ordenadas por legajo (consecutivas verticalmente)
    const limit = Math.ceil(audienciasList.length / 3);
    const col1 = audienciasList.slice(0, limit);
    const col2 = audienciasList.slice(limit, limit * 2);
    const col3 = audienciasList.slice(limit * 2);

    const countSelectedAuds = Object.values(selectedAudiencias).filter(v => v).length;
    const countSelectedOps = Object.values(selectedOperadores).filter(v => v).length;

    // Ejecutar simulación local de sorteo
    const handleSimularSorteo = async () => {
        const audsASimular = audienciasList.filter(aud => selectedAudiencias[aud.id]);
        const opsASimular = Object.keys(selectedOperadores).filter(op => selectedOperadores[op]);

        if (audsASimular.length === 0 || opsASimular.length === 0) return;

        setIsLoading(true);

        try {
            // Descargar métricas globales de Firestore (solo lectura, sin guardar nada)
            const docRef = doc(db, "centro_uga", "datos_globales");
            const docSnap = await getDoc(docRef);
            let datos = docSnap.exists() ? docSnap.data() : { estadisticas_operadores: {}, promedios_historicos: {} };
            const statsOps = datos.estadisticas_operadores || {};
            const promedios = datos.promedios_historicos || {};

            // Inicializar operadores en memoria
            const opsDisponiblesSim = opsASimular.map(opNombre => {
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
                    bloquesAsignadosLista: []
                };
            });

            // 1. Agrupar en bloques iniciales por juez y tipo (esDebate, esEjecucion, general)
            let bloques = [];
            const audsOrdenadas = [...audsASimular].sort((a, b) => {
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

            // Dividir bloques
            const numOps = opsDisponiblesSim.length;
            while (bloques.length < numOps) {
                let maxIndex = -1;
                let maxAudCount = 1;

                for (let i = 0; i < bloques.length; i++) {
                    if (!bloques[i].esDebate && bloques[i].audiencias.length > maxAudCount) {
                        maxAudCount = bloques[i].audiencias.length;
                        maxIndex = i;
                    }
                }

                if (maxIndex === -1) break;

                const bloqueADividir = bloques[maxIndex];
                const auds = bloqueADividir.audiencias;
                const mid = Math.ceil(auds.length / 2);
                const auds1 = auds.slice(0, mid);
                const auds2 = auds.slice(mid);

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

            // Ordenar bloques para asignación: debates primero, luego ejecuciones, luego mayor carga
            bloques.sort((a, b) => {
                if (a.esDebate && !b.esDebate) return -1;
                if (!a.esDebate && b.esDebate) return 1;
                if (a.esEjecucion && !b.esEjecucion) return -1;
                if (!a.esEjecucion && b.esEjecucion) return 1;
                return b.cargaEstimada - a.cargaEstimada;
            });

            const asignaciones = {}; // idAud -> opName
            const conflictos = {}; // idAud -> texto de conflicto

            for (const bloque of bloques) {
                // Ordenar operadores en memoria según las mismas reglas de sorteoAlgoritmo
                opsDisponiblesSim.sort((a, b) => {
                    // 1. Conflicto horario general
                    const confHorarioA = tieneConflictoHorario(a, bloque);
                    const confHorarioB = tieneConflictoHorario(b, bloque);
                    if (!!confHorarioA !== !!confHorarioB) return confHorarioA ? 1 : -1;

                    // 2. Conflicto de debate
                    const confDebA = tieneConflictoDebate(a, bloque);
                    const confDebB = tieneConflictoDebate(b, bloque);
                    if (!!confDebA !== !!confDebB) return confDebA ? 1 : -1;

                    // 3. Restricción de debate: si no es debate, evitar operadores que ya tengan debate
                    if (!bloque.esDebate) {
                        const tieneDebA = a.bloquesAsignadosLista.some(x => x.esDebate);
                        const tieneDebB = b.bloquesAsignadosLista.some(x => x.esDebate);
                        if (tieneDebA !== tieneDebB) return tieneDebA ? 1 : -1;
                    }

                    // 4. Clustering de ejecución
                    const tieneEjeA = a.bloquesAsignadosLista.some(x => x.esEjecucion);
                    const tieneEjeB = b.bloquesAsignadosLista.some(x => x.esEjecucion);
                    if (bloque.esEjecucion) {
                        if (tieneEjeA !== tieneEjeB) return tieneEjeA ? -1 : 1;
                    } else {
                        if (tieneEjeA !== tieneEjeB) return tieneEjeA ? 1 : -1;
                    }

                    // 5. Carga de bloques
                    if (a.bloquesAsignados !== b.bloquesAsignados) {
                        return a.bloquesAsignados - b.bloquesAsignados;
                    }

                    // 6. Carga de audiencias
                    if (a.audienciasAsignadas !== b.audienciasAsignadas) {
                        return a.audienciasAsignadas - b.audienciasAsignadas;
                    }

                    // 7. Estadísticas históricas
                    if (bloque.esDebate) {
                        return a.stats.debates - b.stats.debates;
                    }

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

                const mejorOp = opsDisponiblesSim[0];
                const confInfo = tieneConflictoHorario(mejorOp, bloque);
                const confDebInfo = tieneConflictoDebate(mejorOp, bloque);

                for (const aud of bloque.audiencias) {
                    asignaciones[aud.id] = mejorOp.nombre;
                    if (confInfo) {
                        conflictos[aud.id] = confInfo.razon;
                    } else if (confDebInfo) {
                        conflictos[aud.id] = confDebInfo.razon;
                    }
                }

                if (bloque.esDebate) mejorOp.stats.debates++;
                mejorOp.stats.tiempo_total_minutos += bloque.cargaEstimada;
                mejorOp.bloquesAsignados++;
                mejorOp.audienciasAsignadas += bloque.audiencias.length;
                mejorOp.bloquesAsignadosLista.push(bloque);
            }

            setResultadoSimulacion({
                asignaciones,
                conflictos,
                resumenOps: opsDisponiblesSim
            });
            setSimulacionActiva(true);

        } catch (error) {
            console.error("Error al simular el sorteo:", error);
            alert("Ocurrió un error en la simulación: " + error.message);
        }

        setIsLoading(false);
    };

    const renderCard = (aud) => {
        const isSelected = !!selectedAudiencias[aud.id];
        const operadorSim = resultadoSimulacion?.asignaciones[aud.id];
        const conflictoTxt = resultadoSimulacion?.conflictos[aud.id];
        const type = `${aud.tipo || ''} ${aud.tipo2 || ''} ${aud.tipo3 || ''}`.trim();

        return (
            <div 
                key={aud.id} 
                className={styles.card} 
                onClick={() => toggleAud(aud.id)}
                style={{ 
                    marginBottom: '10px', 
                    padding: '12px', 
                    borderLeft: isSelected ? '4px solid #569CD6' : '1px solid #2B2B2B',
                    opacity: isSelected ? 1 : 0.4,
                    cursor: 'pointer',
                    userSelect: 'none'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ color: '#fff', fontWeight: 'bold' }}>{aud.numeroLeg || 'S/D'}</span>
                            <span style={{ color: '#ffc107', fontSize: '12px' }}>{aud.hora || 'S/H'}</span>
                        </div>
                        <div style={{ fontSize: '13px', color: '#ccc', textTransform: 'capitalize', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {aud.juez ? aud.juez.toLowerCase() : 'Sin Juez'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#868686', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {type}
                        </div>

                        {simulacionActiva && isSelected && (
                            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #2B2B2B', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <div style={{ fontSize: '12px' }}>
                                    Asignado: <strong style={{ color: '#569CD6' }}>{operadorSim || 'Ninguno'}</strong>
                                </div>
                                {conflictoTxt && (
                                    <div style={{ fontSize: '11px', color: '#F44336', background: 'rgba(244, 67, 54, 0.1)', padding: '4px', borderRadius: '2px', border: '1px solid rgba(244, 67, 54, 0.2)' }}>
                                        ⚠️ {conflictoTxt}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={styles.panel}>
            {/* CONTROL BAR */}
            <div className={styles.card}>
                <h2 className={styles.title}>Simulación y Pruebas de Sorteo</h2>
                <p className={styles.textMuted} style={{ marginBottom: '15px' }}>
                    Prueba la agrupación de bloques y la distribución de operadores sin alterar los datos reales de la base de datos.
                </p>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input 
                        type="date" 
                        className={styles.input} 
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                    />
                    <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleLoadDate} disabled={isLoading}>
                        {isLoading ? 'Cargando...' : 'Cargar Audiencias'}
                    </button>
                    
                    {audienciasList.length > 0 && (
                        <button 
                            className={`${styles.btn}`} 
                            style={{ 
                                background: (countSelectedAuds === 0 || countSelectedOps === 0) ? '#1f1f1f' : '#2D8CFF', 
                                border: 'none',
                                color: '#fff', 
                                fontWeight: 'bold',
                                opacity: (countSelectedAuds === 0 || countSelectedOps === 0 || isLoading) ? 0.5 : 1
                            }}
                            disabled={countSelectedAuds === 0 || countSelectedOps === 0 || isLoading}
                            onClick={handleSimularSorteo}
                        >
                            Simular Sorteo ({countSelectedAuds} Auds a {countSelectedOps} Ops)
                        </button>
                    )}
                </div>
            </div>

            {audienciasList.length === 0 ? (
                <div className={styles.card} style={{ textAlign: 'center', padding: '40px' }}>
                    <p className={styles.textMuted}>No hay datos cargados. Selecciona una fecha y haz click en "Cargar Audiencias".</p>
                </div>
            ) : (
                <div style={{ display: 'flex', gap: '10px', flex: 1, minHeight: '0' }}>
                    {/* LAYOUT 3 COLUMNAS */}
                    <div style={{ flex: 3, display: 'flex', gap: '10px', overflowY: 'auto' }}>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ padding: '8px', borderBottom: '1px solid #2B2B2B', color: '#868686', fontSize: '11px', textTransform: 'uppercase', marginBottom: '8px' }}>
                                Columna 1 ({col1.length})
                            </div>
                            <div style={{ overflowY: 'visible' }}>{col1.map(renderCard)}</div>
                        </div>

                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ padding: '8px', borderBottom: '1px solid #2B2B2B', color: '#868686', fontSize: '11px', textTransform: 'uppercase', marginBottom: '8px' }}>
                                Columna 2 ({col2.length})
                            </div>
                            <div style={{ overflowY: 'visible' }}>{col2.map(renderCard)}</div>
                        </div>

                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ padding: '8px', borderBottom: '1px solid #2B2B2B', color: '#868686', fontSize: '11px', textTransform: 'uppercase', marginBottom: '8px' }}>
                                Columna 3 ({col3.length})
                            </div>
                            <div style={{ overflowY: 'visible' }}>{col3.map(renderCard)}</div>
                        </div>
                    </div>

                    {/* OPERADORES Y RESULTADOS */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {/* SELECCION OPERADORES */}
                        <div className={styles.card} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'hidden' }}>
                            <h3 className={styles.title} style={{ fontSize: '15px' }}>Operadores Disponibles</h3>
                            <p className={styles.textMuted} style={{ marginBottom: '10px' }}>Activa a los que participan:</p>
                            <div style={{ overflowY: 'auto', flex: 1, border: '1px solid #2B2B2B', padding: '10px', borderRadius: '4px' }}>
                                {operadoresDisponibles.map((op, idx) => {
                                    const opName = typeof op === 'string' ? op : op.nombre || op.value;
                                    return (
                                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                            <input 
                                                type="checkbox" 
                                                checked={!!selectedOperadores[opName]}
                                                onChange={() => toggleOp(opName)}
                                                id={`sim-op-${idx}`}
                                            />
                                            <label htmlFor={`sim-op-${idx}`} style={{ cursor: 'pointer', flex: 1, color: '#d7d7d7', fontSize: '13px' }}>
                                                {opName}
                                            </label>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* RESULTADO DE SIMULACION */}
                        {simulacionActiva && resultadoSimulacion && (
                            <div className={styles.card} style={{ display: 'flex', flexDirection: 'column', flex: 1.2, overflowY: 'hidden' }}>
                                <h3 className={styles.title} style={{ fontSize: '15px' }}>Resultados de la Prueba</h3>
                                <div style={{ overflowY: 'auto', flex: 1, fontSize: '13px' }}>
                                    <table className={styles.table} style={{ fontSize: '12px' }}>
                                        <thead>
                                            <tr>
                                                <th>Operador</th>
                                                <th>Bloques</th>
                                                <th>Auds</th>
                                                <th>Carga Est.</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {resultadoSimulacion.resumenOps.map((op, i) => (
                                                <tr key={i}>
                                                    <td style={{ color: '#fff', fontWeight: op.bloquesAsignados === 0 ? 'normal' : 'bold' }}>
                                                        {op.nombre}
                                                    </td>
                                                    <td style={{ color: op.bloquesAsignados === 0 ? '#868686' : '#fff' }}>
                                                        {op.bloquesAsignados}
                                                    </td>
                                                    <td style={{ color: op.audienciasAsignadas === 0 ? '#868686' : '#fff' }}>
                                                        {op.audienciasAsignadas}
                                                    </td>
                                                    <td style={{ color: '#ffc107', fontWeight: 'bold' }}>
                                                        {op.stats.tiempo_total_minutos}m
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {/* ALERTAS GENERALES */}
                                    <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        {resultadoSimulacion.resumenOps.some(op => op.bloquesAsignados === 0) && (
                                            <div style={{ padding: '8px', background: 'rgba(255, 193, 7, 0.1)', color: '#ffc107', border: '1px solid rgba(255, 193, 7, 0.2)', borderRadius: '2px', fontSize: '11px' }}>
                                                ⚠️ Hay operadores activos que quedaron con 0 audiencias asignadas (probablemente debido a pocas audiencias generales totales).
                                            </div>
                                        )}
                                        {Object.keys(resultadoSimulacion.conflictos).length > 0 ? (
                                            <div style={{ padding: '8px', background: 'rgba(244, 67, 54, 0.1)', color: '#F44336', border: '1px solid rgba(244, 67, 54, 0.2)', borderRadius: '2px', fontSize: '11px' }}>
                                                ❌ Se detectaron {Object.keys(resultadoSimulacion.conflictos).length} audiencias con posibles conflictos horarias entre jueces distintos.
                                            </div>
                                        ) : (
                                            <div style={{ padding: '8px', background: 'rgba(76, 175, 80, 0.1)', color: '#4CAF50', border: '1px solid rgba(76, 175, 80, 0.2)', borderRadius: '2px', fontSize: '11px' }}>
                                                ✓ Simulación completada sin ningún conflicto horario detectado.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
