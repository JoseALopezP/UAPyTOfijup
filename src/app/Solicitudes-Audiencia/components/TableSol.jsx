'use client'
import { useContext, useEffect, useState, useCallback } from "react"
import { DataContext } from "@/context New/DataContext"
import styles from "../SolicitudesAudiencia.module.css"
import RowSol from "./RowSol"
import { compareFyH } from "@/utils/compareFecha"
import { addOrUpdateObject } from "@/firebase new/firestore/addOrUpdateObject"

// sortKey  → campo en el objeto solicitud para ordenar (null = no sorteable)
// filterKey → campo(s) en el objeto para filtrar (string o array de strings)
const COLUMNS = [
    { label: 'LEGAJO', sortKey: 'numeroLeg', filterKey: 'numeroLeg' },
    { label: 'FyH SOLICITUD', sortKey: 'fyhcreacion', filterKey: 'fyhcreacion' },
    { label: 'SOLICITANTE', sortKey: 'solicitante', filterKey: 'solicitante' },
    { label: 'TIPO', sortKey: 'tipo', filterKey: 'tipo', wide: true },
    { label: 'CARÁTULA MOD', sortKey: 'caratulaMod', filterKey: 'caratulaMod', wide: true },
    { label: 'IMPUTADOS', sortKey: null, filterKey: null },
    { label: 'IMPUTADOS LIST', sortKey: null, filterKey: null, wide: true },
    { label: 'PARTES LEGAJO', sortKey: null, filterKey: null },
    { label: 'SIT. CORPORAL', sortKey: 'sitCorporal', filterKey: 'sitCorporal' },
    { label: 'VENCIMIENTO', sortKey: 'vencimiento', filterKey: 'vencimiento' },
    { label: 'DEFENSOR', sortKey: 'defensa', filterKey: 'defensa' },
    { label: 'UFI', sortKey: 'ufi', filterKey: 'ufi' },
    { label: 'FISCAL', sortKey: 'fiscal', filterKey: 'fiscal' },
    { label: 'JUEZ', sortKey: 'juez', filterKey: 'juez' },
    { label: 'MOTIVO', sortKey: 'motivo', filterKey: 'motivo' },
    { label: 'FECHA AUDIENCIA', sortKey: 'fechaAudiencia', filterKey: 'fechaAudiencia' },
    { label: 'HORA AUDIENCIA', sortKey: 'horaAudiencia', filterKey: 'horaAudiencia' },
    { label: 'SALA', sortKey: 'sala', filterKey: 'sala' },
    { label: 'JUEZ DE LA CAUSA', sortKey: 'juezCausa', filterKey: 'juezCausa' },
    { label: 'COMENTARIO', sortKey: 'comentario', filterKey: 'comentario' },
    { label: 'NOTIFICAR', sortKey: null, filterKey: null },
    { label: 'REVISADO', sortKey: 'revisado', filterKey: 'revisado', narrower: true },
    { label: 'ACCIONES', sortKey: null, filterKey: null },
    { label: 'DOCUMENTOS', sortKey: null, filterKey: null, narrow: true },
    { label: 'CONV. JURISD.', sortKey: null, filterKey: null, narrow: true },
]

function getFieldValue(sol, key) {
    if (!key) return ''
    if (key === 'tipo' || key === 'tipos') {
        if (sol.tipos && Array.isArray(sol.tipos)) return sol.tipos.join(', ')
        return String(sol.tipo ?? '')
    }
    if (key in sol) return String(sol[key] ?? '')
    return ''
}
export default function TableSol() {
    const { solicitudesPendientes, updateSolicitudesPendientes, desplegables, updateDesplegables } = useContext(DataContext)
    const [pendingRows, setPendingRows] = useState({})
    const [forceSave, setForceSave] = useState(false)
    const [sortKey, setSortKey] = useState('fyhcreacion')
    const [sortDir, setSortDir] = useState('asc')
    const [filters, setFilters] = useState({})
    const [isSaving, setIsSaving] = useState(false)
    const [activeNotificarRow, setActiveNotificarRow] = useState(null)
    const [activePartesRow, setActivePartesRow] = useState(null)
    useEffect(() => {
        updateSolicitudesPendientes()
        // Cargamos los desplegables generales
        updateDesplegables()
    }, [])



    const onStatusChange = useCallback((rowKey, hasChanges) => {
        setPendingRows(prev => {
            const updated = { ...prev }
            if (hasChanges) updated[rowKey] = true
            else delete updated[rowKey]
            return updated
        })
    }, [])

    useEffect(() => {
        if (isSaving && Object.keys(pendingRows).length === 0) {
            setIsSaving(false)
        }
    }, [pendingRows, isSaving])

    const handleSaveAll = () => {
        setIsSaving(true)
        setForceSave(true)
        setTimeout(() => setForceSave(false), 100)
    }

    const handleSortClick = (col) => {
        if (!col.sortKey) return
        if (sortKey === col.sortKey) {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc')
        } else {
            setSortKey(col.sortKey)
            setSortDir('asc')
        }
    }

    const handleFilter = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }))
    }

    // Filtrar y ordenar
    const processed = (() => {
        if (!solicitudesPendientes || !Array.isArray(solicitudesPendientes)) return []

        // Filtrar
        let rows = solicitudesPendientes.filter(sol => {
            return Object.entries(filters).every(([key, val]) => {
                if (!val) return true
                const fieldVal = getFieldValue(sol, key).toLowerCase()
                return fieldVal.includes(val.toLowerCase())
            })
        })

        // Ordenar: reprogramar o cancelar = true siempre primero (ya procesadas), luego por sortKey
        rows = [...rows].sort((a, b) => {
            const aImp = !!(a.reprogramar || a.cancelar)
            const bImp = !!(b.reprogramar || b.cancelar)
            if (aImp !== bImp) return aImp ? -1 : 1   // reprogramar/cancelar primero

            if (sortKey === 'fyhcreacion') {
                const cmp = compareFyH(a.fyhcreacion, b.fyhcreacion)
                return sortDir === 'asc' ? cmp : -cmp
            }
            const aVal = getFieldValue(a, sortKey).toLowerCase()
            const bVal = getFieldValue(b, sortKey).toLowerCase()
            const cmp = aVal.localeCompare(bVal)
            return sortDir === 'asc' ? cmp : -cmp
        })

        return rows
    })()

    const pendingCount = Object.keys(pendingRows).length

    return (
        <div className={styles.tableWrapper}>
            {pendingCount > 0 && (
                <button
                    className={`${styles.saveAllButton} ${isSaving ? styles.saveAllButtonSaving : ''}`}
                    onClick={handleSaveAll}
                    disabled={isSaving}
                    title={isSaving ? 'Guardando en la base de datos...' : `Guardar ${pendingCount} fila${pendingCount > 1 ? 's' : ''} con cambios`}
                >
                    {isSaving ? (
                        <>
                            <span className={styles.spinner}>↻</span> Guardando... ({pendingCount})
                        </>
                    ) : (
                        <>💾 Guardar todo ({pendingCount})</>
                    )}
                </button>
            )}
            <table className={`${styles.tableSol}`}>
                <thead>
                    <tr>
                        {COLUMNS.map((col, idx) => (
                            <th
                                key={idx}
                                className={`${styles.tableHeaderTh}${col.narrow ? ` ${styles.headerThNarrow}` : ''}${col.narrower ? ` ${styles.headerThNarrower}` : ''}${col.wide ? ` ${styles.headerThWide}` : ''}${col.sortKey ? ` ${styles.thSortable}` : ''}`}
                                onClick={() => handleSortClick(col)}
                            >
                                <div className={styles.thContent}>
                                    <span className={styles.thLabel}>
                                        {col.label}
                                        {col.sortKey && sortKey === col.sortKey && (
                                            <span className={styles.sortArrow}>{sortDir === 'asc' ? ' ↑' : ' ↓'}</span>
                                        )}
                                    </span>
                                    {col.filterKey && (
                                        <input
                                            className={styles.thFilterInput}
                                            placeholder="filtrar..."
                                            value={filters[col.filterKey] || ''}
                                            onClick={e => e.stopPropagation()}
                                            onChange={e => handleFilter(col.filterKey, e.target.value)}
                                        />
                                    )}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {processed.map((solicitud, index) => {
                        const rowKey = solicitud.rowKey || index;
                        return (
                            <RowSol
                                key={rowKey}
                                data={solicitud}
                                onStatusChange={onStatusChange}
                                forceSave={forceSave}
                                showNotificar={activeNotificarRow === rowKey}
                                onToggleNotificar={() => setActiveNotificarRow(prev => prev === rowKey ? null : rowKey)}
                                onCloseNotificar={() => setActiveNotificarRow(null)}
                                showPartesLegajo={activePartesRow === rowKey}
                                onTogglePartesLegajo={() => setActivePartesRow(prev => prev === rowKey ? null : rowKey)}
                                onClosePartesLegajo={() => setActivePartesRow(null)}
                            />
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}
