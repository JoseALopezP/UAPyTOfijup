'use client'
import { useContext, useState, useEffect, useRef } from "react"
import { DataContext } from "@/context New/DataContext"
import styles from "../SolicitudesAudiencia.module.css"
import ExpandContent from "./ExpandContent"

export default function RowSol({ data, onStatusChange, forceSave }) {
    const { solicitudesData, addSolicitudData } = useContext(DataContext)
    const hasInitialSync = useRef(false)
    const [toSave, setToSave] = useState(false)
    const [doSave, setDoSave] = useState(false)

    const rowKey = data.linkSol
        ? data.linkSol.replace(/[^a-zA-Z0-9]/g, '_')
        : `${data.numeroLeg}_${data.fyhcreacion}`

    const savedData = solicitudesData && Array.isArray(solicitudesData)
        ? (solicitudesData.find(item => item.rowKey === rowKey) || {})
        : {}

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

    useEffect(() => {
        if (onStatusChange) onStatusChange(rowKey, toSave)
    }, [toSave, rowKey])

    useEffect(() => {
        if (forceSave && toSave) setDoSave(true)
    }, [forceSave, toSave])

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
        if (!hasInitialSync.current) return;

        // Debemos comparar contra lo mismo que usamos para inicializar
        const getBaseValue = (field, scraperValue) => {
            if (savedData && savedData[field] !== undefined) return savedData[field];
            return scraperValue || '';
        };

        const hasChanges = (
            (sitCorporal || '') !== getBaseValue('sitCorporal', data.sitCorporal) ||
            (vencimiento || '') !== getBaseValue('vencimiento', data.vencimiento) ||
            (querella || '') !== getBaseValue('querella', data.intervinientes?.querella?.join(', ')) ||
            (defensa || '') !== getBaseValue('defensa', data.intervinientes?.defensor_oficial?.join(', ') || data.intervinientes?.defensor_particular?.join(', ')) ||
            (fiscal || '') !== getBaseValue('fiscal', data.intervinientes?.fiscal?.join(', ')) ||
            (juez || '') !== getBaseValue('juez', data.intervinientes?.juez?.join(', ')) ||
            (motivo || '') !== getBaseValue('motivo', data.intervinientes?.motivo?.join(', ')) ||
            (fechaAudiencia || '') !== getBaseValue('fechaAudiencia', data.intervinientes?.fecha_audiencia?.join(', ')) ||
            (horaAudiencia || '') !== getBaseValue('horaAudiencia', data.intervinientes?.hora_audiencia?.join(', ')) ||
            (sala || '') !== getBaseValue('sala', data.intervinientes?.sala?.join(', ')) ||
            (juezCausa || '') !== getBaseValue('juezCausa', data.intervinientes?.juez_causa?.join(', ')) ||
            (comentario || '') !== getBaseValue('comentario', data.intervinientes?.comentario?.join(', '))
        )
        setToSave(hasChanges)
    }

    useEffect(() => {
        if (solicitudesData && Array.isArray(solicitudesData)) {
            // Buscamos si hay datos guardados
            const saved = solicitudesData.find(item => item.rowKey === rowKey) || {}

            const syncField = (savedVal, scraperVal) => {
                return savedVal !== undefined ? savedVal : (scraperVal || '');
            };

            setSitCorporal(syncField(saved.sitCorporal, data.sitCorporal))
            setVencimiento(syncField(saved.vencimiento, data.vencimiento))
            setQuerella(syncField(saved.querella, data.intervinientes?.querella?.join(', ')))
            setDefensa(syncField(saved.defensa, data.intervinientes?.defensor_oficial?.join(', ') || data.intervinientes?.defensor_particular?.join(', ')))
            setFiscal(syncField(saved.fiscal, data.intervinientes?.fiscal?.join(', ')))
            setJuez(syncField(saved.juez, data.intervinientes?.juez?.join(', ')))
            setMotivo(syncField(saved.motivo, data.intervinientes?.motivo?.join(', ')))
            setFechaAudiencia(syncField(saved.fechaAudiencia, data.intervinientes?.fecha_audiencia?.join(', ')))
            setHoraAudiencia(syncField(saved.horaAudiencia, data.intervinientes?.hora_audiencia?.join(', ')))
            setSala(syncField(saved.sala, data.intervinientes?.sala?.join(', ')))
            setJuezCausa(syncField(saved.juezCausa, data.intervinientes?.juez_causa?.join(', ')))
            setComentario(syncField(saved.comentario, data.intervinientes?.comentario?.join(', ')))

            // Retrasamos la sincronización inicial para permitir que los estados se asienten
            setTimeout(() => {
                hasInitialSync.current = true
            }, 800)
        }
    }, [solicitudesData, data])

    useEffect(() => {
        checkForDiff()
    }, [sitCorporal, vencimiento, querella, defensa, fiscal, juez, motivo, fechaAudiencia, horaAudiencia, sala, juezCausa])

    useEffect(() => {
        checkChanges()
    }, [sitCorporal, vencimiento, querella, defensa, fiscal, juez, motivo, fechaAudiencia, horaAudiencia, sala, juezCausa, comentario, savedData])

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
        <tr className={styles.tableRow}>
            <td className={`${styles.cellBodyFixed}`}>{data.numeroLeg}</td>
            <td className={`${styles.cellBodyFixed}`}>{data.fyhcreacion}</td>
            <td className={`${styles.cellBodyFixed}`}>{data.solicitante}</td>
            <td className={`${styles.cellBodyFixed}`}>{data.tipo}</td>
            <td className={`${styles.cellBodyFixed}`}>{data.intervinientes?.imputado?.length ?? 0}</td>
            <td className={`${styles.cellBodyFixed}`}>{data.intervinientes?.imputado?.map((imp, i) => (
                <div key={i}>{imp.nombre}{imp.dni ? ` (${imp.dni})` : ''}</div>
            ))}</td>
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
            <td className={`${styles.cellBodyFixed}`}>{data.ufi}</td>
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
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyOk}`} style={{ textAlign: 'center' }}>
                <button
                    onClick={() => setDoSave(true)}
                    disabled={!toSave}
                    style={{ cursor: toSave ? 'pointer' : 'default', opacity: toSave ? 1 : 0.4, padding: '4px 10px' }}
                >
                    💾
                </button>
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyDocuments}`}>
                <ExpandContent label="Docs">
                    {data.documentos?.map((el, idx) => (
                        <a key={idx} href={el.link} target="_blank" rel="noopener noreferrer">
                            📄 {el.nombre}
                        </a>
                    ))}
                    {(!data.documentos || data.documentos.length === 0) && (
                        <span style={{ fontSize: '11px', color: '#999' }}>No hay docs</span>
                    )}
                </ExpandContent>
            </td>
        </tr>
    )
}