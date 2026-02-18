'use client'
import styles from '../Pumba.module.css'
import { useState, useContext, useEffect } from 'react'
import { DataContext } from '@/context New/DataContext'
import TableRow from './TableRow';

export default function BodyPumba({ dateToUse }) {
    const { updateByDate, updateDesplegables, pumaData } = useContext(DataContext);

    useEffect(() => {
        updateByDate(dateToUse);
    }, [dateToUse]);
    useEffect(() => {
        console.log(pumaData);
    }, [pumaData]);
    useEffect(() => {
        updateDesplegables()
    }, [])
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

                    </tr>
                </thead>
                <tbody>
                    {pumaData && pumaData.filter(item => item.estado !== "CANCELADA"
                        && item.tipo !== "ANIVI" && item.tipo !== "DEBATE DEL JUICIO ORAL"
                        && item.tipo !== "PRESENTACIÓN"
                        && item.tipo !== "FINALIZACIÓN").sort((a, b) => parseInt(a.inicioProgramada.split(':')[0]) * 60 + parseInt(a.inicioProgramada.split(':')[1]) - (parseInt(b.inicioProgramada.split(':')[0]) * 60 + parseInt(b.inicioProgramada.split(':')[1]))).map((item, index) => (
                            <TableRow key={index} audData={item} dateToUse={dateToUse} index={index} />
                        ))}
                </tbody>
            </table>
        </div></>
    )
}