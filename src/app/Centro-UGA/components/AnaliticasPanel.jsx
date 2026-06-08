import { useEffect, useState } from 'react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import firebase_app from '@/firebase/config';
import styles from '../centroUga.module.css';

const db = getFirestore(firebase_app);

export default function AnaliticasPanel() {
    const [isLoading, setIsLoading] = useState(true);
    const [datosGlobales, setDatosGlobales] = useState(null);
    
    const [periodo, setPeriodo] = useState('mensual');
    const [metrica, setMetrica] = useState('audiencias'); // audiencias, tiempo, fuera_horario
    const [juezFiltro, setJuezFiltro] = useState('');

    useEffect(() => {
        async function fetchData() {
            try {
                const docRef = doc(db, "centro_uga", "datos_globales");
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setDatosGlobales(docSnap.data());
                } else {
                    setDatosGlobales({ estadisticas_operadores: {}, promedios_historicos: {} });
                }
            } catch (e) {
                console.error("Error cargando analíticas:", e);
            }
            setIsLoading(false);
        }
        fetchData();
    }, []);

    // ── Preparar datos para las tablas ──
    let operadoresRows = [];
    let promediosRows = [];
    let juecesDisponibles = new Set();

    if (datosGlobales) {
        const stats = datosGlobales.estadisticas_operadores || {};
        
        // 1. Armar tabla de Operadores
        Object.values(stats).forEach(op => {
            const dataPeriodo = op[periodo] || {};
            let valor = 0;
            let mostrarValor = '-';

            // Extraer jueces para el filtro dinámico
            Object.keys(dataPeriodo.por_juez || {}).forEach(j => juecesDisponibles.add(j));

            if (juezFiltro) {
                // Si hay un juez filtrado, solo podemos mostrar la CANTIDAD de audiencias que le hizo
                valor = (dataPeriodo.por_juez || {})[juezFiltro] || 0;
                mostrarValor = `${valor} audiencias`;
            } else {
                if (metrica === 'audiencias') {
                    valor = (dataPeriodo.debates || 0) + (dataPeriodo.tramites_ejecucion || 0) + (dataPeriodo.generales || 0);
                    mostrarValor = `${valor} audiencias (D:${dataPeriodo.debates || 0})`;
                } else if (metrica === 'tiempo') {
                    valor = dataPeriodo.tiempo_total_minutos || 0;
                    mostrarValor = `${Math.floor(valor / 60)}h ${valor % 60}m`;
                } else if (metrica === 'fuera_horario') {
                    valor = dataPeriodo.minutos_fuera_horario || 0;
                    mostrarValor = `${valor} minutos`;
                }
            }

            operadoresRows.push({
                nombre: op.nombre,
                valorAbsoluto: valor,
                valorTexto: mostrarValor
            });
        });

        // Ordenar de mayor a menor carga (ranking)
        operadoresRows.sort((a, b) => b.valorAbsoluto - a.valorAbsoluto);

        // 2. Armar tabla de Promedios Históricos
        const promedios = datosGlobales.promedios_historicos || {};
        Object.entries(promedios).forEach(([juezKey, tipos]) => {
            Object.entries(tipos).forEach(([tipoKey, datosTipo]) => {
                const nombreLimpio = juezKey.replace(/_/g, ' ');
                const tipoLimpio = tipoKey.replace(/_/g, ' ');
                // Soportar estructura vieja (numero) y nueva (objeto)
                const avg = typeof datosTipo === 'number' ? datosTipo : datosTipo.avg;
                promediosRows.push({
                    juez: nombreLimpio,
                    tipo: tipoLimpio,
                    promedio: `${avg || 0} min`
                });
            });
        });
        
        // Ordenar alfabéticamente por juez
        promediosRows.sort((a, b) => a.juez.localeCompare(b.juez));
    }

    return (
        <div className={styles.panel}>
            <div className={styles.card}>
                <h2 className={styles.title}>Dashboard Analítico Global</h2>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <select className={styles.input} value={periodo} onChange={e => setPeriodo(e.target.value)}>
                        <option value="mensual">Periodo Mensual</option>
                        <option value="trimestral">Periodo Trimestral</option>
                        <option value="anual">Periodo Anual</option>
                    </select>

                    <select 
                        className={styles.input} 
                        value={metrica} 
                        onChange={e => { setMetrica(e.target.value); setJuezFiltro(''); }}
                        disabled={!!juezFiltro}
                        style={{ opacity: juezFiltro ? 0.5 : 1 }}
                    >
                        <option value="audiencias">Cantidad de Audiencias Totales</option>
                        <option value="tiempo">Tiempo Acumulado en Audiencia</option>
                        <option value="fuera_horario">Tiempo Fuera de Horario</option>
                    </select>

                    <select 
                        className={styles.input} 
                        value={juezFiltro} 
                        onChange={e => setJuezFiltro(e.target.value)}
                    >
                        <option value="">Filtro: Todos los Jueces</option>
                        {Array.from(juecesDisponibles).sort().map(j => (
                            <option key={j} value={j}>{j.replace(/_/g, ' ').toUpperCase()}</option>
                        ))}
                    </select>
                </div>
                {juezFiltro && <p className={styles.textMuted} style={{marginTop: '5px'}}>*Al filtrar por juez solo se contabiliza la cantidad de audiencias realizadas.</p>}
            </div>

            <div style={{ display: 'flex', gap: '10px', flex: 1, minHeight: '0' }}>
                <div className={styles.card} style={{ flex: 1, overflowY: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <h3 className={styles.title} style={{ fontSize: '16px' }}>Ranking de Operadores</h3>
                    <div style={{ overflowY: 'auto', flex: 1, paddingRight: '5px' }}>
                        <table className={styles.table}>
                            <thead style={{ position: 'sticky', top: 0, backgroundColor: '#1e1e1e', zIndex: 1 }}>
                                <tr>
                                    <th>Operador</th>
                                    <th>Valor (Carga)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr><td colSpan="2" className={styles.textMuted} style={{textAlign: 'center'}}>Cargando estadísticas...</td></tr>
                                ) : operadoresRows.length === 0 ? (
                                    <tr><td colSpan="2" className={styles.textMuted} style={{textAlign: 'center'}}>No hay datos registrados aún. Presiona "Resuelvo" en una audiencia para comenzar.</td></tr>
                                ) : (
                                    operadoresRows.map((row, i) => (
                                        <tr key={i}>
                                            <td style={{color: '#fff'}}>{row.nombre}</td>
                                            <td style={{color: '#ffc107', fontWeight: 'bold'}}>{row.valorTexto}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className={styles.card} style={{ flex: 1, overflowY: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <h3 className={styles.title} style={{ fontSize: '16px' }}>Inteligencia del Algoritmo (Promedios)</h3>
                    <div style={{ overflowY: 'auto', flex: 1, paddingRight: '5px' }}>
                        <table className={styles.table}>
                            <thead style={{ position: 'sticky', top: 0, backgroundColor: '#1e1e1e', zIndex: 1 }}>
                                <tr>
                                    <th>Juez</th>
                                    <th>Tipo de Audiencia</th>
                                    <th>Duración Promedio</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr><td colSpan="3" className={styles.textMuted} style={{textAlign: 'center'}}>Cargando promedios...</td></tr>
                                ) : promediosRows.length === 0 ? (
                                    <tr><td colSpan="3" className={styles.textMuted} style={{textAlign: 'center'}}>No hay promedios aprendidos aún.</td></tr>
                                ) : (
                                    promediosRows.map((row, i) => (
                                        <tr key={i}>
                                            <td style={{color: '#fff', textTransform: 'capitalize'}}>{row.juez}</td>
                                            <td style={{textTransform: 'capitalize'}}>{row.tipo}</td>
                                            <td style={{color: '#569CD6', fontWeight: 'bold'}}>{row.promedio}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
