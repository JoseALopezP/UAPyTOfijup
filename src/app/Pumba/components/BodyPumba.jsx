'use client'
import styles from '../Pumba.module.css'
import { useContext, useEffect, useState } from 'react'
import { DataContext } from '@/context New/DataContext'
import TableRow from './TableRow';
import { calculateCuartos, calculateCuartosOtros } from '@/utils/calculators';

export default function BodyPumba({ dateToUse }) {
    const { updateByDate, updateDesplegables, updatePumaData, updateUALData, pumaData, UALData, bydate } = useContext(DataContext);
    const [rowsToSave, setRowsToSave] = useState({});
    const [forceSave, setForceSave] = useState(false);
    useEffect(() => {
        updateByDate(dateToUse);
        updatePumaData(dateToUse);
        updateUALData(dateToUse);
        setRowsToSave({});
    }, [dateToUse]);
    useEffect(() => {
        updateDesplegables()
    }, [])
    const handleStatusChange = (rowKey, needsSaving) => {
        setRowsToSave(prev => {
            if (prev[rowKey] === needsSaving) return prev;
            const newState = { ...prev };
            if (needsSaving) {
                newState[rowKey] = true;
            } else {
                delete newState[rowKey];
            }
            return newState;
        });
    };

    const handleCopyAll = () => {
        if (!pumaData || !bydate) return;

        const sortedRows = [...pumaData]
            .filter(item => item.estado !== "CANCELADA"
                && item.tipo !== "ANIVI" && item.tipo !== "DEBATE DEL JUICIO ORAL"
                && item.tipo !== "PRESENTACIÓN"
                && item.tipo !== "FINALIZACIÓN")
            .sort((a, b) => {
                const timeA = a.inicioProgramada.split(':');
                const timeB = b.inicioProgramada.split(':');
                return (parseInt(timeA[0]) * 60 + parseInt(timeA[1])) - (parseInt(timeB[0]) * 60 + parseInt(timeB[1]));
            });

        const rowsText = sortedRows.map(audData => {
            const saved = UALData?.find(item => item.numeroLeg === audData.numeroLeg && item.inicioProgramada === audData.inicioProgramada) || {};
            const tabItem = bydate?.find(item => item.numeroLeg === audData.numeroLeg && item.hora === audData.inicioProgramada) || {};

            const calculateDiffHHMMSS = (s, a) => {
                if (!s || !a) return '';
                try {
                    const parse = (str) => {
                        const [d, t] = str.split(' ');
                        const [day, mon, yr] = d.split('/');
                        const [hr, min] = t.split(':');
                        const fullYear = yr.length === 2 ? `20${yr}` : yr;
                        return new Date(fullYear, mon - 1, day, hr, min, 0);
                    }
                    const start = parse(s);
                    const end = parse(a);
                    const diffMs = end - start;
                    if (isNaN(diffMs) || diffMs < 0) return '';
                    const totalSecs = Math.floor(diffMs / 1000);
                    const h = Math.floor(totalSecs / 3600);
                    const m = Math.floor((totalSecs % 3600) / 60);
                    const s_ = totalSecs % 60;
                    return [h, m, s_].map(v => v.toString().padStart(2, '0')).join(':');
                } catch (e) { return ''; }
            };

            const fields = [
                saved.legajo || audData.numeroLeg || '',
                '',
                saved.audTipo || (audData.tipo + (audData.tipo2 ? ' ' + audData.tipo2 : '') + (audData.tipo3 ? ' ' + audData.tipo3 : '')) || '',
                saved.ufi && saved.ufi || tabItem.ufi || '',
                saved.dyhsolicitud || audData.dyhsolicitud || '',
                saved.dyhagendamiento || audData.dyhagendamiento || '',
                calculateDiffHHMMSS(saved.dyhsolicitud || audData.dyhsolicitud || '', saved.dyhagendamiento || audData.dyhagendamiento || ''),
                saved.dyhnotificacion || audData.fechaNotificacion || '',
                saved.dyhprogramada || (audData.inicioProgramada && (dateToUse.slice(0, 2) + '/' + dateToUse.slice(2, 4) + '/' + dateToUse.slice(6, 8) + ' ' + audData.inicioProgramada)) || '',
                saved.dyhreal || (audData.inicioReal && (dateToUse.slice(0, 2) + '/' + dateToUse.slice(2, 4) + '/' + dateToUse.slice(6, 8) + ' ' + audData.inicioReal)) || '',
                saved.demora ?? (audData.inicioReal && audData.inicioProgramada ? ((parseInt(audData.inicioReal.split(':')[0]) * 60 + parseInt(audData.inicioReal.split(':')[1])) - (parseInt(audData.inicioProgramada.split(':')[0]) * 60 + parseInt(audData.inicioProgramada.split(':')[1]))) : ''),
                saved.motivDemora || audData.motivoDemora || '',
                saved.observDemora || audData.observDemora || '',
                saved.duracionProgramada ?? (audData.inicioProgramada && audData.finProgramada ? ((parseInt(audData.finProgramada.split(':')[0]) * 60 + parseInt(audData.finProgramada.split(':')[1])) - (parseInt(audData.inicioProgramada.split(':')[0]) * 60 + parseInt(audData.inicioProgramada.split(':')[1]))) : ''),
                saved.durReal ?? (audData.finReal && audData.inicioReal ? (parseInt(audData.finReal.split(':')[0]) * 60 + parseInt(audData.finReal.split(':')[1]) - (parseInt(audData.inicioReal.split(':')[0]) * 60 + parseInt(audData.inicioReal.split(':')[1]))) : ''),
                saved.cuartoPedido ?? (tabItem.hitos ? tabItem.hitos.filter(el => el.includes('CUARTO_INTERMEDIO')).reduce((acc, el) => acc + parseInt(el.split(' | ')[2] || 0), 0) : ''),
                saved.cuartoReal ?? (tabItem.hitos ? calculateCuartos(tabItem.hitos) : ''),
                saved.cuartoRealOtros ?? (tabItem.hitos ? calculateCuartosOtros(tabItem.hitos) : ''),
                saved.dyhfinalizacion || (audData.finReal && (dateToUse.slice(0, 2) + '/' + dateToUse.slice(2, 4) + '/' + dateToUse.slice(6, 8) + ' ' + audData.finReal)) || '',
                saved.entregaResuelvo || tabItem.resuelvo || '',
                saved.finalizadaMinuta || (audData.finalizadaMinuta && audData.finalizadaMinuta.split(' ')[0]) || '',
                calculateDiffHHMMSS(saved.dyhfinalizacion || audData.finReal, (dateToUse.slice(0, 2) + '/' + dateToUse.slice(2, 4) + '/' + dateToUse.slice(6, 8) + ' ' + saved.finalizadaMinuta) || audData.finalizadaMinuta),
                saved.cantImputados ?? (audData.intervinientes ? audData.intervinientes.filter(el => el.includes('IMPUTADO')).length : ''),
                saved.tipoVictima || audData.tipoVictima || '',
                saved.sala || audData.sala || '',
                saved.operador || audData.operador || '',
                saved.fiscal || (tabItem.mpf ? tabItem.mpf[0].nombre : ''),
                saved.defensa || (tabItem.defensa && tabItem.defensa.length > 0 ? tabItem.defensa[0].nombre : ''),
                saved.juez || audData.juez || '',
                saved.finAudiencia || audData.finAudiencia || '',
                saved.resolucion || audData.resolucion || '',
                saved.resultadoControl || audData.resultadoControl || '',
                saved.indicadorUga || audData.indicadorUga || '',
                saved.comentario || '',
                saved.completado ? 'SÍ' : 'NO'
            ];

            return fields.join('\t');
        }).join('\n');

        navigator.clipboard.writeText(rowsText);
        alert('Copiado al portapapeles para Excel');
    };

    const handleSaveAll = () => {
        setForceSave(true);
        setTimeout(() => setForceSave(false), 1000);
        setRowsToSave({});
    };

    const hasChanges = Object.keys(rowsToSave).length > 0;
    return (
        <><div className={styles.bodyContainer}>
            <table className={styles.pumbaTable} key={dateToUse}>
                <thead className={styles.tableHeader}>
                    <tr>
                        <th className={`${styles.tableHeaderTh} ${styles.tableHLegajo}`}>LEGAJO</th>
                        <th className={`${styles.tableHeaderTh} ${styles.tableHTiposPuma}`}>tipos (Puma)</th>
                        <th className={`${styles.tableHeaderTh} ${styles.tableHTiposTablero}`}>tipos (tablero)</th>
                        <th className={`${styles.tableHeaderTh} ${styles.tableHTipoAudiencia}`}>TIPO DE AUDIENCIA</th>
                        <th className={`${styles.tableHeaderTh} ${styles.tableHUfiPuma}`}>UFI (Puma)</th>
                        <th className={`${styles.tableHeaderTh} ${styles.tableHUfiTablero}`}>UFI (tablero)</th>
                        <th className={`${styles.tableHeaderTh} ${styles.tableHUfiAudiencia}`}>UFI DE AUDIENCIA</th>
                        <th className={`${styles.tableHeaderTh} ${styles.tableHSolicitudPuma}`}>Solicitud (Puma)</th>
                        <th className={`${styles.tableHeaderTh} ${styles.tableHSolicitudTablero}`}>DÍA Y HORA SOLICITUD DE AUDIENCIA</th>
                        <th className={`${styles.tableHeaderTh} ${styles.tableHAgendamientoPuma}`}>Agendamiento (Puma)</th>
                        <th className={`${styles.tableHeaderTh} ${styles.tableHAgendamientoTablero}`}>DÍA Y HORA AGENDAMIENTO DE AUDIENCIA</th>
                        <th className={`${styles.tableHeaderTh} ${styles.tableHNotificacionPuma}`}>Notificación (Puma)</th>
                        <th className={`${styles.tableHeaderTh} ${styles.tableHNotificacionTablero}`}>DÍA Y HORA DE NOTIFICACIÓN AUDIENCIA</th>
                        <th className={`${styles.tableHeaderTh} ${styles.tableHProgramadaPuma}`}>Programada (Puma)</th>
                        <th className={`${styles.tableHeaderTh} ${styles.tableHProgramadaTablero}`}>Programada (tablero)</th>
                        <th className={`${styles.tableHeaderTh} ${styles.tableHDiaHoraProgramada}`}>DÍA Y HORA PROGRAMADA DE AUDIENCIA</th>
                        <th className={`${styles.tableHeaderTh} ${styles.tableHInicioPuma}`}>Inicio (Puma)</th>
                        <th className={`${styles.tableHeaderTh} ${styles.tableHInicioTablero}`}>Inicio (tablero)</th>
                        <th className={`${styles.tableHeaderTh} ${styles.tableHDiaHoraInicioReal}`}>DÍA Y HORA INICIO REAL DE AUDIENCIA</th>
                        <th className={`${styles.tableHeaderTh} ${styles.tableHDemoraPuma}`}>Demora (Puma)</th>
                        <th className={`${styles.tableHeaderTh} ${styles.tableHDemoraTablero}`}>Demora (tablero)</th>
                        <th className={`${styles.tableHeaderTh} ${styles.tableHDemoraTiempoMinutos}`}>DEMORA (TIEMPO EN MINUTOS)</th>
                        <th className={`${styles.tableHeaderTh} ${styles.tableHMotivoPuma}`}>Motivo (Puma)</th>
                        <th className={`${styles.tableHeaderTh} ${styles.tableHMotivoTablero}`}>Motivo (tablero)</th>
                        <th className={`${styles.tableHeaderTh} ${styles.tableHMotivoDemora}`}>MOTIVO DEMORA</th>
                        <th className={`${styles.tableHeaderTh} ${styles.tableHObservacionesDemoraOfijup}`}>OBSERVACIONES DEMORA OFIJUP</th>
                        <th className={`${styles.tableHeaderTh} ${styles.tableHDuracionProgramadaPuma}`}>Duración Programada (Puma)</th>
                        <th className={`${styles.tableHeaderTh} ${styles.tableHDuracionProgramadaTablero}`}>Duración Programada (tablero)</th>
                        <th className={`${styles.tableHeaderTh} ${styles.tableHDuracionProgramadaAudencia}`}>DURACIÓN PROGRAMADA DE AUDIENCIA</th>
                        <th className={`${styles.tableHeaderTh} ${styles.tableHDuracionPuma}`}>Duración (Puma)</th>
                        <th className={`${styles.tableHeaderTh} ${styles.tableHDuracionTablero}`}>Duración (tablero)</th>
                        <th className={`${styles.tableHeaderTh} ${styles.tableHDuracionRealAudencia}`}>DURACIÓN REAL DE AUDIENCIA</th>
                        <th className={`${styles.tableHeaderTh} ${styles.tableH14PedidoTablero}`}>1/4 pedido (tablero)</th>
                        <th className={`${styles.tableHeaderTh} ${styles.tableH14IntermedioTeorico}`}>CUARTO INTERMEDIO TEORICO (EN TIEMPO)</th>
                        <th className={`${styles.tableHeaderTh} ${styles.tableH14RealTablero}`}>1/4 real (tablero)</th>
                        <th className={`${styles.tableHeaderTh} ${styles.tableH14IntermedioReal}`}>CUARTO INTERMEDIO REAL (EN TIEMPO)</th>
                        <th className={`${styles.tableHeaderTh} ${styles.tableH14OtrasPartesTablero}`}>1/4 otras partes (tablero)</th>
                        <th className={`${styles.tableHeaderTh} ${styles.tableH14IntermedioRealOtrasPartes}`}>CUARTO INTERMEDIO REAL OTRAS PARTES (EN TIEMPO)</th>
                        <th className={`${styles.tableHeaderTh} ${styles.tableHFinalizacionPuma}`}>Finalización (Puma)</th>
                        <th className={`${styles.tableHeaderTh} ${styles.tableHFinalizacionTablero}`}>Finalización (tablero)</th>
                        <th className={`${styles.tableHeaderTh} ${styles.tableHDiaHoraFinalizacionAudencia}`}>DÍA Y HORA FINALIZACIÓN DE AUDIENCIA</th>
                        <th className={`${styles.tableHeaderTh} ${styles.tableHResuelvoTablero}`}>Resuelvo (tablero)</th>
                        <th className={`${styles.tableHeaderTh} ${styles.tableHHorarioEntregaResuelvo}`}>HORARIO ENTREGA RESUELVO</th>
                        <th className={`${styles.tableHeaderTh} ${styles.tableHMinutaPuma}`}>Minuta (Puma)</th>
                        <th className={`${styles.tableHeaderTh} ${styles.tableHHorarioEntregaMinuta}`}>HORARIO ENTREGA DE MINUTA</th>
                        <th className={`${styles.tableHeaderTh} ${styles.tableHCantImputadosTablero}`}>Cant. imputados (tablero)</th>
                        <th className={`${styles.tableHeaderTh} ${styles.tableHCantImputadosPuma}`}>Cant. imputados (Puma)</th>
                        <th className={`${styles.tableHeaderTh} ${styles.tableHCantidadImputados}`}>CANTIDAD DE IMPUTADOS</th>
                        <th className={`${styles.tableHeaderTh} ${styles.tableHTipoVictima}`}>TIPO DE VÍCTIMA</th>
                        <th className={`${styles.tableHeaderTh} ${styles.tableHSalaPuma}`}>SALA (Puma)</th>
                        <th className={`${styles.tableHeaderTh} ${styles.tableHSalaTablero}`}>SALA (tablero)</th>
                        <th className={`${styles.tableHeaderTh} ${styles.tableHSala}`}>SALA</th>
                        <th className={`${styles.tableHeaderTh} ${styles.tableHOperadorPuma}`}>Operador (Puma)</th>
                        <th className={`${styles.tableHeaderTh} ${styles.tableHOperadorTablero}`}>Operador (tablero)</th>
                        <th className={`${styles.tableHeaderTh} ${styles.tableHOperador}`}>OPERADOR</th>
                        <th className={`${styles.tableHeaderTh} ${styles.tableHFiscalPuma}`}>Fiscal (Puma)</th>
                        <th className={`${styles.tableHeaderTh} ${styles.tableHFiscalTablero}`}>Fiscal (tablero)</th>
                        <th className={`${styles.tableHeaderTh} ${styles.tableHFiscalInterviniente}`}>FISCAL INTERVINIENTE</th>
                        <th className={`${styles.tableHeaderTh} ${styles.tableHDefensorPuma}`}>Defensor (Puma)</th>
                        <th className={`${styles.tableHeaderTh} ${styles.tableHDefensorTablero}`}>Defensor (tablero)</th>
                        <th className={`${styles.tableHeaderTh} ${styles.tableHDefensorInterviniente}`}>DEFENSOR INTERVINIENTE</th>
                        <th className={`${styles.tableHeaderTh} ${styles.tableHJuezPuma}`}>Juez (Puma)</th>
                        <th className={`${styles.tableHeaderTh} ${styles.tableHJuezTablero}`}>Juez (tablero)</th>
                        <th className={`${styles.tableHeaderTh} ${styles.tableHJuez}`}>JUEZ</th>
                        <th className={`${styles.tableHeaderTh} ${styles.tableHFinDeAudiencia}`}>FIN DE AUDIENCIA</th>
                        <th className={`${styles.tableHeaderTh} ${styles.tableHResolucion}`}>RESOLUCIÓN</th>
                        <th className={`${styles.tableHeaderTh} ${styles.tableHResultadosDeAudienciaControlDeAcusacion}`}>RESULTADOS DE AUDIENCIA CONTROL DE ACUSACIÓN</th>
                        <th className={`${styles.tableHeaderTh} ${styles.tableHIndicadorUga}`}>INDICADOR UGA</th>
                        <th className={`${styles.tableHeaderTh} ${styles.tableHComentario}`}>COMENTARIO</th>
                        <th className={`${styles.tableHeaderTh}`}>COMPLETADO</th>
                        <th className={`${styles.tableHeaderTh}`}>
                            <button
                                onClick={handleCopyAll}
                                style={{
                                    padding: '5px 10px',
                                    backgroundColor: '#2196F3',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontWeight: 'bold'
                                }}
                            >
                                COPIAR EXCEL
                            </button>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {pumaData && pumaData.filter(item => item.estado !== "CANCELADA"
                        && item.tipo !== "ANIVI" && item.tipo !== "DEBATE DEL JUICIO ORAL"
                        && item.tipo !== "PRESENTACIÓN"
                        && item.tipo !== "FINALIZACIÓN").sort((a, b) => parseInt(a.inicioProgramada.split(':')[0]) * 60 + parseInt(a.inicioProgramada.split(':')[1]) - (parseInt(b.inicioProgramada.split(':')[0]) * 60 + parseInt(b.inicioProgramada.split(':')[1]))).map((item, index) => (
                            <TableRow
                                key={index}
                                audData={item}
                                dateToUse={dateToUse}
                                index={index}
                                onStatusChange={handleStatusChange}
                                forceSave={forceSave}
                            />
                        ))}
                </tbody>
            </table>
        </div>
            {hasChanges && (
                <div className={styles.saveButtonContainer}>
                    <button onClick={handleSaveAll} className={styles.saveButton}>GUARDAR CAMBIOS ({Object.keys(rowsToSave).length})</button>
                </div>
            )}
        </>
    )
}