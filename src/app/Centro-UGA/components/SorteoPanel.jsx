import { useContext, useEffect, useState } from 'react';
import styles from '../centroUga.module.css';
import { DataContext } from '@/context/DataContext';
import { generarSorteoUGA } from '@/utils/sorteoAlgoritmo';

export default function SorteoPanel() {
    const { bydate: data, updateByDate, desplegables, updateDesplegables } = useContext(DataContext);
    
    // Default a hoy en YYYY-MM-DD para el input
    const [selectedDate, setSelectedDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    });
    
    const [audienciasList, setAudienciasList] = useState([]);
    const [selectedAudiencias, setSelectedAudiencias] = useState({});
    
    const [operadoresDisponibles, setOperadoresDisponibles] = useState([]);
    const [selectedOperadores, setSelectedOperadores] = useState({});
    const [isLoadingSorteo, setIsLoadingSorteo] = useState(false);

    // Cargar listas desplegables al montar
    useEffect(() => {
        if (updateDesplegables) updateDesplegables();
    }, []);

    // Actualizar operadores disponibles cuando cargan
    useEffect(() => {
        if (desplegables?.operador) {
            setOperadoresDisponibles(desplegables.operador);
            // Iniciar sin ninguno seleccionado
            const selOps = {};
            desplegables.operador.forEach(op => {
                const opName = typeof op === 'string' ? op : op.nombre || op.value;
                selOps[opName] = false;
            });
            setSelectedOperadores(selOps);
        }
    }, [desplegables?.operador]);

    // Cuando cambia la data (audiencias de la fecha cargada)
    useEffect(() => {
        if (data && Array.isArray(data)) {
            // Ordenar audiencias por hora
            const sortedData = [...data].sort((a, b) => ((a.hora || '') > (b.hora || '') ? 1 : -1));
            setAudienciasList(sortedData);

            // Auto-check: marcar los que no tienen operador asignado
            const selAuds = {};
            sortedData.forEach(aud => {
                selAuds[aud.id] = !aud.operador || aud.operador.trim() === '';
            });
            setSelectedAudiencias(selAuds);
        } else {
            setAudienciasList([]);
        }
    }, [data]);

    const handleLoadDate = async () => {
        if (!selectedDate) return;
        // Convertir de YYYY-MM-DD a DDMMYYYY que es lo que usa la DB
        const formattedDate = selectedDate.split('-').reverse().join(''); 
        await updateByDate(formattedDate);
    };

    const toggleAud = (id) => {
        setSelectedAudiencias(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleOp = (name) => {
        setSelectedOperadores(prev => ({ ...prev, [name]: !prev[name] }));
    };

    const countSelectedAuds = Object.values(selectedAudiencias).filter(v => v).length;
    const countSelectedOps = Object.values(selectedOperadores).filter(v => v).length;

    const handleAsignar = async () => {
        const audienciasAAsignar = audienciasList.filter(aud => selectedAudiencias[aud.id]);
        const opsAAsignar = Object.keys(selectedOperadores).filter(op => selectedOperadores[op]);

        if (audienciasAAsignar.length === 0 || opsAAsignar.length === 0) return;

        setIsLoadingSorteo(true);
        const formattedDate = selectedDate.split('-').reverse().join(''); 
        const result = await generarSorteoUGA(audienciasAAsignar, opsAAsignar, formattedDate);
        
        if (result && result.success) {
            let resumenTxt = `Sorteo completado con éxito. Se asignaron ${result.asignadas} audiencias.\n\nRESUMEN:\n`;
            resumenTxt += Object.entries(result.resumen).map(([k,v]) => `- ${k}: ${v} audiencias`).join('\n');
            alert(resumenTxt);
            await updateByDate(formattedDate);
        } else {
            alert("Hubo un error al generar el sorteo: " + (result?.error || "Desconocido"));
        }
        setIsLoadingSorteo(false);
    };

    return (
        <div className={styles.panel}>
            <div className={styles.card}>
                <h2 className={styles.title}>Asignación por Bloques</h2>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', alignItems: 'center' }}>
                    <input 
                        type="date" 
                        className={styles.input} 
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                    />
                    <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleLoadDate}>
                        Cargar Audiencias
                    </button>
                </div>
                <p className={styles.textMuted}>Selecciona un día para pre-visualizar y asignar operadores.</p>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', flex: 1, minHeight: '0' }}>
                {/* LISTA DE AUDIENCIAS */}
                <div className={styles.card} style={{ flex: 2, overflowY: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <h3 className={styles.title} style={{ fontSize: '16px' }}>
                        Audiencias del Día ({countSelectedAuds} seleccionadas)
                    </h3>
                    <div style={{ overflowY: 'auto', flex: 1, paddingRight: '5px' }}>
                        <table className={styles.table}>
                            <thead style={{ position: 'sticky', top: 0, backgroundColor: '#1e1e1e', zIndex: 1 }}>
                                <tr>
                                    <th>Sel</th>
                                    <th>Hora</th>
                                    <th>Legajo</th>
                                    <th>Tipo</th>
                                    <th>Juez</th>
                                    <th>Operador Actual</th>
                                </tr>
                            </thead>
                            <tbody>
                                {audienciasList.length === 0 ? (
                                    <tr><td colSpan="6" className={styles.textMuted} style={{textAlign: 'center'}}>No hay datos cargados o no hay audiencias</td></tr>
                                ) : (
                                    audienciasList.map(aud => {
                                        const type = `${aud.tipo || ''} ${aud.tipo2 || ''} ${aud.tipo3 || ''}`.trim();
                                        return (
                                            <tr key={aud.id}>
                                                <td>
                                                    <input 
                                                        type="checkbox" 
                                                        checked={!!selectedAudiencias[aud.id]} 
                                                        onChange={() => toggleAud(aud.id)} 
                                                    />
                                                </td>
                                                <td>{aud.hora || '-'}</td>
                                                <td>{aud.numeroLeg || '-'}</td>
                                                <td>{type}</td>
                                                <td>{aud.juez || '-'}</td>
                                                <td style={{ color: aud.operador ? '#fff' : '#ffc107', fontWeight: aud.operador ? 'normal' : 'bold' }}>
                                                    {aud.operador || 'Sin Asignar'}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* LISTA DE OPERADORES */}
                <div className={styles.card} style={{ flex: 1, overflowY: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <h3 className={styles.title} style={{ fontSize: '16px' }}>
                        Operadores ({countSelectedOps} seleccionados)
                    </h3>
                    <p className={styles.textMuted} style={{ marginBottom: '10px' }}>Seleccione quiénes participarán:</p>
                    
                    <div style={{ overflowY: 'auto', flex: 1, border: '1px solid #2B2B2B', padding: '10px', borderRadius: '4px' }}>
                        {operadoresDisponibles.map((op, idx) => {
                            const opName = typeof op === 'string' ? op : op.nombre || op.value;
                            return (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <input 
                                        type="checkbox" 
                                        checked={!!selectedOperadores[opName]}
                                        onChange={() => toggleOp(opName)}
                                        id={`op-${idx}`}
                                    />
                                    <label htmlFor={`op-${idx}`} style={{ cursor: 'pointer', flex: 1, color: '#d7d7d7' }}>{opName}</label>
                                </div>
                            );
                        })}
                    </div>

                    <button 
                        className={`${styles.btn} ${styles.btnPrimary}`} 
                        style={{ width: '100%', marginTop: '15px', opacity: (countSelectedAuds === 0 || countSelectedOps === 0 || isLoadingSorteo) ? 0.5 : 1 }}
                        disabled={countSelectedAuds === 0 || countSelectedOps === 0 || isLoadingSorteo}
                        onClick={handleAsignar}
                    >
                        {isLoadingSorteo ? 'Asignando...' : 'Generar Bloques y Asignar'}
                    </button>
                </div>
            </div>
        </div>
    );
}
