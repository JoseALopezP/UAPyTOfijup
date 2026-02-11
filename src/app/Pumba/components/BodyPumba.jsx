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
            <table className={styles.pumbaTable}>
                <thead className={styles.tableHeader}>
                    <tr>
                        <th className={styles.tableHeaderTh}>LEGAJO</th>
                        <th className={styles.tableHeaderTh}>tipos (Puma)</th>
                        <th className={styles.tableHeaderTh}>tipos (tablero)</th>
                        <th className={styles.tableHeaderTh}>TIPO DE AUDIENCIA</th>
                        <th className={styles.tableHeaderTh}>UFI (Puma)</th>
                        <th className={styles.tableHeaderTh}>UFI (tablero)</th>
                        <th className={styles.tableHeaderTh}>UFI DE AUDIENCIA</th>
                        <th className={styles.tableHeaderTh}>Solicitud (Puma)</th>
                        <th className={styles.tableHeaderTh}>DÍA Y HORA SOLICITUD DE AUDIENCIA</th>
                        <th className={styles.tableHeaderTh}>Agendamiento (Puma)</th>
                        <th className={styles.tableHeaderTh}>DÍA Y HORA AGENDAMIENTO DE AUDIENCIA</th>
                        <th className={styles.tableHeaderTh}>Notificación (Puma)</th>
                        <th className={styles.tableHeaderTh}>DÍA Y HORA DE NOTIFICACIÓN AUDIENCIA</th>
                        <th className={styles.tableHeaderTh}>Programada (Puma)</th>
                        <th className={styles.tableHeaderTh}>Programada (tablero)</th>
                        <th className={styles.tableHeaderTh}>DÍA Y HORA PROGRAMADA DE AUDIENCIA</th>
                        <th className={styles.tableHeaderTh}>Inicio (Puma)</th>
                        <th className={styles.tableHeaderTh}>Inicio (tablero)</th>
                        <th className={styles.tableHeaderTh}>DÍA Y HORA INICIO REAL DE AUDIENCIA</th>
                        <th className={styles.tableHeaderTh}>Demora (Puma)</th>
                        <th className={styles.tableHeaderTh}>Demora (tablero)</th>
                        <th className={styles.tableHeaderTh}>DEMORA (TIEMPO EN MINUTOS)</th>
                        <th className={styles.tableHeaderTh}>Motivo (Puma)</th>
                        <th className={styles.tableHeaderTh}>Motivo (tablero)</th>
                        <th className={styles.tableHeaderTh}>MOTIVO DEMORA</th>
                        <th className={styles.tableHeaderTh}>OBSERVACIONES DEMORA OFIJUP</th>
                        <th className={styles.tableHeaderTh}>Duración Programada (Puma)</th>
                        <th className={styles.tableHeaderTh}>Duración Programada (tablero)</th>
                        <th className={styles.tableHeaderTh}>DURACIÓN PROGRAMADA DE AUDIENCIA</th>
                        <th className={styles.tableHeaderTh}>Duración (Puma)</th>
                        <th className={styles.tableHeaderTh}>Duración (tablero)</th>
                        <th className={styles.tableHeaderTh}>DURACIÓN REAL DE AUDIENCIA</th>
                        <th className={styles.tableHeaderTh}>1/4 pedido (tablero)</th>
                        <th className={styles.tableHeaderTh}>CUARTO INTERMEDIO TEORICO (EN TIEMPO)</th>
                        <th className={styles.tableHeaderTh}>1/4 real (tablero)</th>
                        <th className={styles.tableHeaderTh}>CUARTO INTERMEDIO REAL (EN TIEMPO)</th>
                        <th className={styles.tableHeaderTh}>1/4 otras partes (tablero)</th>
                        <th className={styles.tableHeaderTh}>CUARTO INTERMEDIO REAL OTRAS PARTES (EN TIEMPO)</th>
                        <th className={styles.tableHeaderTh}>Finalización (Puma)</th>
                        <th className={styles.tableHeaderTh}>Finalización (tablero)</th>
                        <th className={styles.tableHeaderTh}>DÍA Y HORA FINALIZACIÓN DE AUDIENCIA</th>
                        <th className={styles.tableHeaderTh}>Resuelvo (tablero)</th>
                        <th className={styles.tableHeaderTh}>HORARIO ENTREGA RESUELVO</th>
                        <th className={styles.tableHeaderTh}>Minuta (Puma)</th>
                        <th className={styles.tableHeaderTh}>Minuta (tablero)</th>
                        <th className={styles.tableHeaderTh}>HORARIO ENTREGA DE MINUTA</th>
                        <th className={styles.tableHeaderTh}>Cant. imputados (tablero)</th>
                        <th className={styles.tableHeaderTh}>Cant. imputados (Puma)</th>
                        <th className={styles.tableHeaderTh}>CANTIDAD DE IMPORTADOS</th>
                        <th className={styles.tableHeaderTh}>TIPO DE VÍCTIMA</th>
                        <th className={styles.tableHeaderTh}>SALA (Puma)</th>
                        <th className={styles.tableHeaderTh}>SALA (tablero)</th>
                        <th className={styles.tableHeaderTh}>SALA</th>
                        <th className={styles.tableHeaderTh}>Operador (Puma)</th>
                        <th className={styles.tableHeaderTh}>Operador (tablero)</th>
                        <th className={styles.tableHeaderTh}>OPERADOR</th>
                        <th className={styles.tableHeaderTh}>Fiscal (Puma)</th>
                        <th className={styles.tableHeaderTh}>Fiscal (tablero)</th>
                        <th className={styles.tableHeaderTh}>FISCAL INTERVINIENTE</th>
                        <th className={styles.tableHeaderTh}>Defensor (Puma)</th>
                        <th className={styles.tableHeaderTh}>Defensor (tablero)</th>
                        <th className={styles.tableHeaderTh}>DEFENSOR INTERVINIENTE</th>
                        <th className={styles.tableHeaderTh}>Juez (Puma)</th>
                        <th className={styles.tableHeaderTh}>Juez (tablero)</th>
                        <th className={styles.tableHeaderTh}>JUEZ</th>
                        <th className={styles.tableHeaderTh}>FIN DE AUDIENCIA</th>
                        <th className={styles.tableHeaderTh}>RESOLUCIÓN</th>
                        <th className={styles.tableHeaderTh}>RESULTADOS DE AUDIENCIA CONTROL DE ACUSACIÓN</th>
                        <th className={styles.tableHeaderTh}>INDICADOR UGA</th>
                        <th className={styles.tableHeaderTh}>COMENTARIO</th>

                    </tr>
                </thead>
                <tbody>
                    {pumaData && pumaData.map((item, index) => (
                        <TableRow key={index} audData={item} dateToUse={dateToUse} index={index} />
                    ))}
                </tbody>
            </table>
        </div></>
    )
}