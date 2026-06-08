import firebase_app from "@/firebase/config";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

const db = getFirestore(firebase_app);

// Calcula la diferencia en minutos entre "HH:mm" y "HH:mm"
function diffMinutes(start, end) {
    if (!start || !end) return 0;
    const [h1, m1] = start.split(':').map(Number);
    const [h2, m2] = end.split(':').map(Number);
    let min1 = h1 * 60 + m1;
    let min2 = h2 * 60 + m2;
    if (min2 < min1) min2 += 24 * 60; // Pasa la medianoche
    return min2 - min1;
}

export async function registrarEstadisticasResuelvo(aud, horaFin) {
    if (!aud || !aud.operador) return false;

    // Solo registrar si no ha sido computado antes
    if (aud.estadisticasComputadas) return true;

    try {
        const docRef = doc(db, "centro_uga", "datos_globales");
        const docSnap = await getDoc(docRef);

        let datos = docSnap.exists() ? docSnap.data() : {
            configuracion: {
                turnos: {
                    manana: { inicio: "08:00", fin: "14:00" },
                    tarde: { inicio: "14:00", fin: "20:00" }
                },
                pesos: { peso_debate: 10, peso_fuera_horario: 5 }
            },
            promedios_historicos: {},
            estadisticas_operadores: {}
        };

        // 1. Calcular Duración
        let horaInicio = aud.hora; 
        if (aud.hitos && aud.hitos.length > 0) {
            const hito = aud.hitos[0].split(' | ')[0];
            if (hito) horaInicio = hito;
        }

        let duracion = diffMinutes(horaInicio, horaFin);
        if (duracion < 0 || isNaN(duracion)) duracion = 0;

        // 2. Calcular Tiempo Fuera de Horario
        let turnoConfig = datos.configuracion?.turnos?.manana || { inicio: "08:00", fin: "14:00" };
        if (horaInicio) {
            const hStart = Number(horaInicio.split(':')[0]);
            if (hStart >= 14) {
                turnoConfig = datos.configuracion?.turnos?.tarde || { inicio: "14:00", fin: "20:00" };
            }
        }

        let minutosFueraHorario = 0;
        const finTurno = turnoConfig.fin;
        if (finTurno && horaFin) {
            const [hf, mf] = horaFin.split(':').map(Number);
            const [ht, mt] = finTurno.split(':').map(Number);
            if ((hf * 60 + mf) > (ht * 60 + mt)) {
                minutosFueraHorario = diffMinutes(finTurno, horaFin);
            }
        }

        // 3. Determinar el Tipo de Audiencia Base
        let tipoBase = 'audiencia_general';
        const tipoStr = (aud.tipo + ' ' + (aud.tipo2 || '') + ' ' + (aud.tipo3 || '')).toLowerCase();
        if (tipoStr.includes('debate') || tipoStr.includes('juicio')) {
            tipoBase = 'debate';
        } else if (tipoStr.includes('ejecuci') || tipoStr.includes('ejecucion')) {
            tipoBase = 'tramites_ejecucion';
        }

        // Preparar la estructura del operador si no existe
        const uid_op = aud.operador.trim().toLowerCase().replace(/\s+/g, '_');
        if (!datos.estadisticas_operadores) datos.estadisticas_operadores = {};
        
        if (!datos.estadisticas_operadores[uid_op]) {
            datos.estadisticas_operadores[uid_op] = {
                nombre: aud.operador,
                mensual: { debates: 0, tramites_ejecucion: 0, generales: 0, tiempo_total_minutos: 0, minutos_fuera_horario: 0, por_juez: {} },
                trimestral: { debates: 0, tramites_ejecucion: 0, generales: 0, tiempo_total_minutos: 0, minutos_fuera_horario: 0, por_juez: {} },
                anual: { debates: 0, tramites_ejecucion: 0, generales: 0, tiempo_total_minutos: 0, minutos_fuera_horario: 0, por_juez: {} }
            };
        }

        const opStats = datos.estadisticas_operadores[uid_op];
        const juezFormat = aud.juez ? aud.juez.toLowerCase().replace(/\s+/g, '_') : 'sin_juez';

        // Actualizar contadores del operador
        ['mensual', 'trimestral', 'anual'].forEach(periodo => {
            if (!opStats[periodo]) {
                opStats[periodo] = { debates: 0, tramites_ejecucion: 0, generales: 0, tiempo_total_minutos: 0, minutos_fuera_horario: 0, por_juez: {} };
            }
            if (tipoBase === 'debate') opStats[periodo].debates += 1;
            else if (tipoBase === 'tramites_ejecucion') opStats[periodo].tramites_ejecucion += 1;
            else opStats[periodo].generales += 1;

            opStats[periodo].tiempo_total_minutos += duracion;
            opStats[periodo].minutos_fuera_horario += minutosFueraHorario;

            if (!opStats[periodo].por_juez[juezFormat]) opStats[periodo].por_juez[juezFormat] = 0;
            opStats[periodo].por_juez[juezFormat] += 1;
        });
        opStats.fecha_ultima_actualizacion = new Date().toISOString();

        // 4. Actualizar Promedio del Juez
        if (!datos.promedios_historicos) datos.promedios_historicos = {};
        if (!datos.promedios_historicos[juezFormat]) {
            datos.promedios_historicos[juezFormat] = { debate: { sum: 0, count: 0, avg: 120 }, tramites_ejecucion: { sum: 0, count: 0, avg: 15 }, audiencia_general: { sum: 0, count: 0, avg: 45 } };
        }
        
        let juezPromedios = datos.promedios_historicos[juezFormat];
        if (!juezPromedios[tipoBase]) {
            juezPromedios[tipoBase] = { sum: 0, count: 0, avg: 45 };
        }
        
        if (typeof juezPromedios[tipoBase] === 'number') {
            juezPromedios[tipoBase] = { sum: juezPromedios[tipoBase], count: 1, avg: juezPromedios[tipoBase] };
        }
        
        juezPromedios[tipoBase].sum += duracion;
        juezPromedios[tipoBase].count += 1;
        
        if (juezPromedios[tipoBase].count <= 1) {
            juezPromedios[tipoBase].avg = duracion;
        } else {
            const alpha = datos.configuracion?.tasa_aprendizaje ?? 0.20;
            const avgAnterior = juezPromedios[tipoBase].avg || duracion || 45;
            juezPromedios[tipoBase].avg = Math.round(alpha * duracion + (1 - alpha) * avgAnterior);
        }

        // Guardar todo en Firebase (1 único Write para toda la app)
        await setDoc(docRef, datos);

        return true; // Éxito
    } catch (e) {
        console.error("Error al registrar estadísticas UGA: ", e);
        return false;
    }
}
