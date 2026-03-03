'use client'
import { useContext, useState, useEffect, useRef } from "react"
import { DataContext } from "@/context New/DataContext"
import styles from "../SolicitudesAudiencia.module.css"

export default function RowSol({ data, onStatusChange, forceSave }) {
    const { solicitudesData, addSolicitudData } = useContext(DataContext)
    const hasInitialSync = useRef(false)
    const [toSave, setToSave] = useState(false)
    const [doSave, setDoSave] = useState(false)

    const rowKey = `${data.numeroLeg}_${data.fyhcreacion}`

    const savedData = solicitudesData && Array.isArray(solicitudesData)
        ? (solicitudesData.find(item => item.rowKey === rowKey) || {})
        : {}

    // ── Estados editables ────────────────────────────────────────────────────
    const [sitCorporal, setSitCorporal] = useState(savedData.sitCorporal || data.sitCorporal || '')
    const [vencimiento, setVencimiento] = useState(savedData.vencimiento || data.vencimiento || '')
    const [querella, setQuerella] = useState(savedData.querella || (data.intervinientes?.querella?.join(', ') ?? ''))
    const [defensa, setDefensa] = useState(savedData.defensa || (data.intervinientes?.defensor_oficial?.join(', ') || data.intervinientes?.defensor_particular?.join(', ') || ''))
    const [fiscal, setFiscal] = useState(savedData.fiscal || (data.intervinientes?.fiscal?.join(', ') ?? ''))
    const [juez, setJuez] = useState(savedData.juez || (data.intervinientes?.juez?.join(', ') ?? ''))
    const [motivo, setMotivo] = useState(savedData.motivo || (data.intervinientes?.motivo?.join(', ') ?? ''))
    const [fechaAudiencia, setFechaAudiencia] = useState(savedData.fechaAudiencia || (data.intervinientes?.fecha_audiencia?.join(', ') ?? ''))
    const [horaAudiencia, setHoraAudiencia] = useState(savedData.horaAudiencia || (data.intervinientes?.hora_audiencia?.join(', ') ?? ''))
    const [sala, setSala] = useState(savedData.sala || (data.intervinientes?.sala?.join(', ') ?? ''))
    const [juezCausa, setJuezCausa] = useState(savedData.juezCausa || (data.intervinientes?.juez_causa?.join(', ') ?? ''))
    const [comentario, setComentario] = useState(savedData.comentario || (data.intervinientes?.comentario?.join(', ') ?? ''))

    // ── Estados de validación ────────────────────────────────────────────────
    const [sitCorporalT, setSitCorporalT] = useState(true)
    const [vencimientoT, setVencimientoT] = useState(true)
    const [querellaT, setQuerellaT] = useState(true)
    const [defensaT, setDefensaT] = useState(true)
    const [fiscalT, setFiscalT] = useState(true)
    const [juezT, setJuezT] = useState(true)
    const [motivoT, setMotivoT] = useState(true)
    const [fechaAudienciaT, setFechaAudienciaT] = useState(true)
    const [horaAudienciaT, setHoraAudienciaT] = useState(true)
    const [salaT, setSalaT] = useState(true)
    const [juezCausaT, setJuezCausaT] = useState(true)

    // ── Notificar estado al padre ────────────────────────────────────────────
    useEffect(() => {
        if (onStatusChange) onStatusChange(rowKey, toSave)
    }, [toSave, rowKey])

    useEffect(() => {
        if (forceSave && toSave) setDoSave(true)
    }, [forceSave, toSave])

    // ── Validación ───────────────────────────────────────────────────────────
    const checkForDiff = () => {
        setSitCorporalT(sitCorporal !== '')
        setVencimientoT(vencimiento !== '')
        setQuerellaT(querella !== '')
        setDefensaT(defensa !== '')
        setFiscalT(fiscal !== '')
        setJuezT(juez !== '')
        setMotivoT(motivo !== '')
        setFechaAudienciaT(fechaAudiencia !== '')
        setHoraAudienciaT(horaAudiencia !== '')
        setSalaT(sala !== '')
        setJuezCausaT(juezCausa !== '')
    }

    const checkChanges = () => {
        const hasChanges = (
            sitCorporal !== (savedData.sitCorporal || '') ||
            vencimiento !== (savedData.vencimiento || '') ||
            querella !== (savedData.querella || '') ||
            defensa !== (savedData.defensa || '') ||
            fiscal !== (savedData.fiscal || '') ||
            juez !== (savedData.juez || '') ||
            motivo !== (savedData.motivo || '') ||
            fechaAudiencia !== (savedData.fechaAudiencia || '') ||
            horaAudiencia !== (savedData.horaAudiencia || '') ||
            sala !== (savedData.sala || '') ||
            juezCausa !== (savedData.juezCausa || '') ||
            comentario !== (savedData.comentario || '')
        )
        if (hasInitialSync.current) setToSave(hasChanges)
    }

    // ── Sync inicial con savedData ───────────────────────────────────────────
    useEffect(() => {
        if (savedData && Object.keys(savedData).length > 0) {
            setSitCorporal(savedData.sitCorporal || '')
            setVencimiento(savedData.vencimiento || '')
            setQuerella(savedData.querella || '')
            setDefensa(savedData.defensa || '')
            setFiscal(savedData.fiscal || '')
            setJuez(savedData.juez || '')
            setMotivo(savedData.motivo || '')
            setFechaAudiencia(savedData.fechaAudiencia || '')
            setHoraAudiencia(savedData.horaAudiencia || '')
            setSala(savedData.sala || '')
            setJuezCausa(savedData.juezCausa || '')
            setComentario(savedData.comentario || '')
            hasInitialSync.current = true
        } else if (solicitudesData && Array.isArray(solicitudesData)) {
            hasInitialSync.current = true
        }
    }, [savedData, solicitudesData])

    useEffect(() => {
        checkForDiff()
    }, [sitCorporal, vencimiento, querella, defensa, fiscal, juez, motivo, fechaAudiencia, horaAudiencia, sala, juezCausa])

    useEffect(() => {
        checkChanges()
    }, [sitCorporal, vencimiento, querella, defensa, fiscal, juez, motivo, fechaAudiencia, horaAudiencia, sala, juezCausa, comentario, savedData])

    // ── Guardado en Firestore ─────────────────────────────────────────────────
    useEffect(() => {
        const saveRow = async () => {
            if (doSave) {
                await addSolicitudData(rowKey, {
                    rowKey,
                    numeroLeg: data.numeroLeg,
                    fyhcreacion: data.fyhcreacion,
                    sitCorporal, vencimiento, querella, defensa, fiscal,
                    juez, motivo, fechaAudiencia, horaAudiencia, sala, juezCausa, comentario
                })
                setDoSave(false)
                setToSave(false)
            }
        }
        saveRow()
    }, [doSave])

    const cell = (ok) => ok
        ? `${styles.cellBodyFixed} ${styles.cellBodyOk}`
        : `${styles.cellBodyFixed} ${styles.cellBodyError}`

    return (
        <tr>
            {/* Solo lectura */}
            <td>{data.numeroLeg}</td>
            <td>{data.fyhcreacion}</td>
            <td>{data.solicitante}</td>
            <td>{data.tipo}</td>
            <td>{data.intervinientes?.imputado?.length ?? 0}</td>
            <td>{data.intervinientes?.imputado?.map((imp, i) => (
                <div key={i}>{imp.nombre}{imp.dni ? ` (${imp.dni})` : ''}</div>
            ))}</td>

            {/* Editables */}
            <td className={cell(sitCorporalT)}>
                <textarea className={styles.inputCell} value={sitCorporal} onChange={e => setSitCorporal(e.target.value)} />
            </td>
            <td className={cell(vencimientoT)}>
                <textarea className={styles.inputCell} value={vencimiento} onChange={e => setVencimiento(e.target.value)} />
            </td>
            <td className={cell(querellaT)}>
                <textarea className={styles.inputCell} value={querella} onChange={e => setQuerella(e.target.value)} />
            </td>
            <td className={cell(defensaT)}>
                <textarea className={styles.inputCell} value={defensa} onChange={e => setDefensa(e.target.value)} />
            </td>
            <td>{data.ufi}</td>
            <td className={cell(fiscalT)}>
                <textarea className={styles.inputCell} value={fiscal} onChange={e => setFiscal(e.target.value)} />
            </td>
            <td className={cell(juezT)}>
                <textarea className={styles.inputCell} value={juez} onChange={e => setJuez(e.target.value)} />
            </td>
            <td className={cell(motivoT)}>
                <textarea className={styles.inputCell} value={motivo} onChange={e => setMotivo(e.target.value)} />
            </td>
            <td className={cell(fechaAudienciaT)}>
                <textarea className={styles.inputCell} value={fechaAudiencia} onChange={e => setFechaAudiencia(e.target.value)} />
            </td>
            <td className={cell(horaAudienciaT)}>
                <textarea className={styles.inputCell} value={horaAudiencia} onChange={e => setHoraAudiencia(e.target.value)} />
            </td>
            <td className={cell(salaT)}>
                <textarea className={styles.inputCell} value={sala} onChange={e => setSala(e.target.value)} />
            </td>
            <td className={cell(juezCausaT)}>
                <textarea className={styles.inputCell} value={juezCausa} onChange={e => setJuezCausa(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyOk}`}>
                <textarea className={styles.inputCell} value={comentario} onChange={e => setComentario(e.target.value)} />
            </td>

            {/* Guardar */}
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyOk}`} style={{ textAlign: 'center' }}>
                <button
                    onClick={() => setDoSave(true)}
                    disabled={!toSave}
                    style={{ cursor: toSave ? 'pointer' : 'default', opacity: toSave ? 1 : 0.4, padding: '4px 10px' }}
                >
                    💾
                </button>
            </td>
        </tr>
    )
}