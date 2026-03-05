'use client'
import { useContext, useState, useEffect, useRef } from "react"
import { DataContext } from "@/context New/DataContext"
import styles from "../SolicitudesAudiencia.module.css"
import ExpandContent from "./ExpandContent"
import SelectorDropdown from "./SelectorDropdown"

export default function RowSol({ data, onStatusChange, forceSave }) {
    const { solicitudesPendientes, addSolicitudData } = useContext(DataContext)
    const hasInitialSync = useRef(false)
    const [toSave, setToSave] = useState(false)
    const [doSave, setDoSave] = useState(false)

    const rowKey = data.linkSol
        ? data.linkSol.replace(/[^a-zA-Z0-9]/g, '_')
        : `${data.numeroLeg}_${data.fyhcreacion}`

    const savedData = solicitudesPendientes && Array.isArray(solicitudesPendientes)
        ? (solicitudesPendientes.find(item => item.rowKey === rowKey) || {})
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
    const [imputados, setImputados] = useState(savedData.imputados || data.intervinientes?.imputado || [])
    const [newNombre, setNewNombre] = useState('')
    const [newDni, setNewDni] = useState('')
    const [agendar, setAgendar] = useState(savedData.agendar ?? false)

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
        if (solicitudesPendientes && Array.isArray(solicitudesPendientes)) {
            // Buscamos si hay datos guardados
            const saved = solicitudesPendientes.find(item => item.rowKey === rowKey) || {}

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
            setImputados(saved.imputados || data.intervinientes?.imputado || [])

            // Retrasamos la sincronización inicial para permitir que los estados se asienten
            setTimeout(() => {
                hasInitialSync.current = true
            }, 800)
        }
    }, [solicitudesPendientes, data])

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
                    juez, motivo, fechaAudiencia, horaAudiencia, sala, juezCausa, comentario,
                    imputados, agendar
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
            <td className={`${styles.cellBodyFixed}`}><div className={styles.scrollCell}>{data.fyhcreacion}</div></td>
            <td className={`${styles.cellBodyFixed}`}><div className={styles.scrollCell}>{data.solicitante}</div></td>
            <td className={`${styles.cellBodyFixed}`}><div className={styles.scrollCell}>{data.tipo}</div></td>
            <td className={`${styles.cellBodyFixed}`}>{data.intervinientes?.imputado?.length ?? 0}</td>
            <td className={`${styles.cellBodyFixed}`}>
                <div className={styles.scrollCell}>
                    {imputados.map((imp, i) => (
                        <div key={i} className={styles.imputadoPill}>
                            <div className={styles.imputadoPillInfo}>
                                <span className={styles.imputadoNombre}>{imp.nombre}</span>
                                {imp.dni && <span className={styles.imputadoDni}>{imp.dni}</span>}
                            </div>
                            <button
                                className={styles.imputadoDeleteBtn}
                                onClick={() => {
                                    const updated = imputados.filter((_, idx) => idx !== i)
                                    setImputados(updated)
                                    setToSave(true)
                                }}
                                title="Eliminar"
                            >✕</button>
                        </div>
                    ))}
                    {/* Agregar nuevo imputado */}
                    <div className={styles.imputadoAddPill}>
                        <input
                            className={styles.imputadoAddInput}
                            placeholder="Nombre"
                            value={newNombre}
                            onChange={e => setNewNombre(e.target.value)}
                        />
                        <input
                            className={styles.imputadoAddInput}
                            placeholder="DNI"
                            value={newDni}
                            onChange={e => setNewDni(e.target.value)}
                        />
                        <button
                            className={styles.imputadoAddBtn}
                            onClick={() => {
                                if (!newNombre.trim()) return
                                setImputados(prev => [...prev, { nombre: newNombre.trim(), dni: newDni.trim() || null }])
                                setNewNombre('')
                                setNewDni('')
                                setToSave(true)
                            }}
                        >+</button>
                    </div>
                </div>
            </td>
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
            <td className={`${styles.cellBodyFixed}`}><div className={styles.scrollCell}>{data.ufi}</div></td>
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
            <td className={`${cell(juezCausaT)} ${styles.cellBodyActions}`} style={{ position: 'relative' }}>
                <SelectorDropdown
                    title="Jueces"
                    options={data.jueces || []}
                    onSelect={(val) => setJuezCausa(val)}
                />
                <textarea className={styles.inputCell} value={juezCausa} onChange={e => setJuezCausa(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyOk}`}>
                <textarea className={styles.inputCell} value={comentario} onChange={e => setComentario(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyOk}`} style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                <div className={styles.accionesCell}>
                    <button
                        onClick={() => setDoSave(true)}
                        disabled={!toSave}
                        style={{ cursor: toSave ? 'pointer' : 'default', opacity: toSave ? 1 : 0.4, padding: '4px 10px' }}
                    >
                        💾
                    </button>
                    <label className={`${styles.agendarLabel}${agendar ? ` ${styles.agendarActive}` : ''}`}>
                        <input
                            type="checkbox"
                            className={styles.agendarCheckbox}
                            checked={agendar}
                            onChange={async (e) => {
                                const val = e.target.checked
                                setAgendar(val)
                                await addSolicitudData(rowKey, {
                                    rowKey,
                                    numeroLeg: data.numeroLeg,
                                    fyhcreacion: data.fyhcreacion,
                                    sitCorporal, vencimiento, querella, defensa, fiscal,
                                    juez, motivo, fechaAudiencia, horaAudiencia, sala, juezCausa, comentario,
                                    imputados, agendar: val
                                })
                            }}
                        />
                        Agendar
                    </label>
                </div>
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyDocuments} ${styles.cellBodyActions}`}>
                <div className={styles.cellActionWrapper}>
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
                    <a className={`${styles.linkSolATag}`} href={data.linkSol} target="_blank" rel="noopener noreferrer">
                        <p className={`${styles.linkSolATagText}`}>Link</p>
                    </a>
                </div>
            </td>
        </tr>
    )
}