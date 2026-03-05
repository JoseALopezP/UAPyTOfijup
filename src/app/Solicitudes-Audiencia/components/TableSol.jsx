'use client'
import { useContext, useEffect, useState, useCallback } from "react"
import { DataContext } from "@/context New/DataContext"
import styles from "../SolicitudesAudiencia.module.css"
import RowSol from "./RowSol"
import { compareFyH } from "@/utils/compareFecha"

export default function TableSol() {
    const { solicitudesCompletadas, updateSolicitudesCompletadas, updateSolicitudesData } = useContext(DataContext)
    const [pendingRows, setPendingRows] = useState({})
    const [forceSave, setForceSave] = useState(false)

    useEffect(() => {
        updateSolicitudesCompletadas()
        updateSolicitudesData()
    }, [])

    // Cada RowSol llama esto cuando cambia su estado de "tiene cambios"
    const onStatusChange = useCallback((rowKey, hasChanges) => {
        setPendingRows(prev => {
            const updated = { ...prev }
            if (hasChanges) {
                updated[rowKey] = true
            } else {
                delete updated[rowKey]
            }
            return updated
        })
    }, [])

    const handleSaveAll = () => {
        setForceSave(true)
        // Reseteamos forceSave en el siguiente tick para que pueda volver a dispararse
        setTimeout(() => setForceSave(false), 100)
    }

    const pendingCount = Object.keys(pendingRows).length

    return (
        <div className={styles.tableWrapper}>
            {pendingCount > 0 && (
                <button
                    className={styles.saveAllButton}
                    onClick={handleSaveAll}
                    title={`Guardar ${pendingCount} fila${pendingCount > 1 ? 's' : ''} con cambios`}
                >
                    💾 Guardar todo ({pendingCount})
                </button>
            )}
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
                        <th className={`${styles.tableHeaderTh} ${styles.headerThNarrow}`}>DOCUMENTOS</th>
                    </tr>
                </thead>
                <tbody>
                    {solicitudesCompletadas && solicitudesCompletadas.sort((a, b) => compareFyH(a.fyhcreacion, b.fyhcreacion)).map((solicitud, index) => (
                        <RowSol d
                            key={index}
                            data={solicitud}
                            onStatusChange={onStatusChange}
                            forceSave={forceSave}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    )
}
