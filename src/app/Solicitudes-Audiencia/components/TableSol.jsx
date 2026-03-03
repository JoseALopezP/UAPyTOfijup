'use client'
import { useContext } from "react"
import { DataContext } from "@/context New/DataContext"
import styles from "../SolicitudesAudiencia.module.css"

export default function TableSol() {
    const { solicitudesCompletadas } = useContext(DataContext)
    return (
        <div className={styles.tableWrapper}>
            <table className={`${styles.tableSol}`}>
                <thead>
                    <tr>
                        <th className={`${styles.tableHeaderTh}`}>LEGAJO</th>
                        <th className={`${styles.tableHeaderTh}`}>FyH SOLICITUD</th>
                        <th className={`${styles.tableHeaderTh}`}>SOLICITANTE</th>
                        <th className={`${styles.tableHeaderTh}`}>TIPO</th>
                        <th className={`${styles.tableHeaderTh}`}>IMPUTADOS</th>
                        <th className={`${styles.tableHeaderTh}`}>IMPUTADOS LIST</th>
                        <th className={`${styles.tableHeaderTh}`}>SIT. CORPORAL</th>
                        <th className={`${styles.tableHeaderTh}`}>VENCIMIENTO</th>
                        <th className={`${styles.tableHeaderTh}`}>QUERELLANTE</th>
                        <th className={`${styles.tableHeaderTh}`}>DEFENSOR</th>
                        <th className={`${styles.tableHeaderTh}`}>UFI</th>
                        <th className={`${styles.tableHeaderTh}`}>FISCAL</th>
                        <th className={`${styles.tableHeaderTh}`}>JUEZ</th>
                        <th className={`${styles.tableHeaderTh}`}>MOTIVO</th>
                        <th className={`${styles.tableHeaderTh}`}>FECHA AUDIENCIA</th>
                        <th className={`${styles.tableHeaderTh}`}>HORA AUDIENCIA</th>
                        <th className={`${styles.tableHeaderTh}`}>SALA</th>
                        <th className={`${styles.tableHeaderTh}`}>JUEZ DE LA CAUSA</th>
                        <th className={`${styles.tableHeaderTh}`}>COMENTARIO</th>
                        <th className={`${styles.tableHeaderTh}`}>ACCIONES</th>
                    </tr>
                </thead>
                <tbody>
                    {solicitudesCompletadas && solicitudesCompletadas.map((solicitud, index) => (
                        <RowSol key={index} data={solicitud} />
                    ))}
                </tbody>
            </table>
        </div>
    )
}