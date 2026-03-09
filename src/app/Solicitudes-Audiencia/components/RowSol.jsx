'use client'
import { useContext, useState, useEffect, useRef, useMemo } from "react"
import { DataContext } from "@/context New/DataContext"
import styles from "../SolicitudesAudiencia.module.css"
import ExpandContent from "./ExpandContent"
import SelectorDropdown from "./SelectorDropdown"

export default function RowSol({ data, onStatusChange, forceSave }) {
    const { solicitudesPendientes, addSolicitudData, removeSolicitudPendiente, desplegables } = useContext(DataContext)
    const hasInitialSync = useRef(false)
    const [toSave, setToSave] = useState(false)
    const [doSave, setDoSave] = useState(false)

    const rowKey = data.linkSol
        ? data.linkSol.replace(/[^a-zA-Z0-9]/g, '_')
        : `${data.numeroLeg}_${data.fyhcreacion}`

    const savedData = useMemo(() => {
        if (!solicitudesPendientes || !Array.isArray(solicitudesPendientes)) return {}
        return solicitudesPendientes.find(item => item.rowKey === rowKey) || {}
    }, [solicitudesPendientes, rowKey])

    const initialTipos = () => {
        if (savedData.tipos) return savedData.tipos;
        if (savedData.tipo) return [savedData.tipo];
        if (data.tipo) return [data.tipo];
        return [];
    }

    const [tipos, setTipos] = useState(initialTipos())
    const [newTipo, setNewTipo] = useState('')
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
    const [partesAgregar, setPartesAgregar] = useState(savedData.partesAgregar || [])
    const [newNombre, setNewNombre] = useState('')
    const [newDni, setNewDni] = useState('')
    const [newMotivoParte, setNewMotivoParte] = useState('')
    const [newNombreParte, setNewNombreParte] = useState('')

    const [agendar, setAgendar] = useState(savedData.agendar ?? false)
    const [revisado, setRevisado] = useState(savedData.revisado ?? false)
    const [marcarBorrar, setMarcarBorrar] = useState(savedData.marcarBorrar ?? false)
    const [reprogramar, setReprogramar] = useState(savedData.reprogramar ?? false)

    const [tipoT, setTipoT] = useState(true)
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
        setTipoT(tipos.length > 0)
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

        const getTiposBase = () => {
            if (savedData && savedData.tipos) return savedData.tipos;
            if (savedData && savedData.tipo) return [savedData.tipo];
            if (data.tipo) return [data.tipo];
            return [];
        }

        const hasChanges = (
            JSON.stringify(tipos) !== JSON.stringify(getTiposBase()) ||
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
            (comentario || '') !== getBaseValue('comentario', data.intervinientes?.comentario?.join(', ')) ||
            JSON.stringify(partesAgregar) !== JSON.stringify(getBaseValue('partesAgregar', [])) ||
            agendar !== (savedData.agendar ?? false) ||
            revisado !== (savedData.revisado ?? false) ||
            marcarBorrar !== (savedData.marcarBorrar ?? false) ||
            reprogramar !== (savedData.reprogramar ?? false)
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

            setTipos(saved.tipos !== undefined ? saved.tipos : (saved.tipo ? [saved.tipo] : (data.tipo ? [data.tipo] : [])))
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
            setPartesAgregar(saved.partesAgregar || [])

            // Retrasamos la sincronización inicial para permitir que los estados se asienten
            setTimeout(() => {
                hasInitialSync.current = true
            }, 800)
        }
    }, [solicitudesPendientes, data])

    useEffect(() => {
        checkForDiff()
    }, [tipos, sitCorporal, vencimiento, querella, defensa, fiscal, juez, motivo, fechaAudiencia, horaAudiencia, sala, juezCausa])

    useEffect(() => {
        checkChanges()
    }, [tipos, sitCorporal, vencimiento, querella, defensa, fiscal, juez, motivo, fechaAudiencia, horaAudiencia, sala, juezCausa, comentario, partesAgregar, agendar, revisado, marcarBorrar, reprogramar, savedData])

    useEffect(() => {
        const saveRow = async () => {
            if (doSave) {
                if (marcarBorrar) {
                    await removeSolicitudPendiente(rowKey)
                } else {
                    await addSolicitudData(rowKey, {
                        rowKey,
                        numeroLeg: data.numeroLeg,
                        fyhcreacion: data.fyhcreacion,
                        tipos, sitCorporal, vencimiento, querella, defensa, fiscal,
                        juez, motivo, fechaAudiencia, horaAudiencia, sala, juezCausa, comentario,
                        imputados, partesAgregar, agendar, revisado, marcarBorrar, reprogramar
                    })
                }
                setDoSave(false)
                setToSave(false)
            }
        }
        saveRow()
    }, [doSave])

    const cell = (ok) => ok
        ? `${styles.cellBodyFixed} ${styles.cellBodyOk}`
        : `${styles.cellBodyFixed} ${styles.cellBodyError}`

    // Color de fila y sticky según estado — vars CSS heredadas por inputs y primera columna
    // ⚠️ NUNCA usar opacity ni outline en rowStyle:
    //    - opacity: se hereda a hijos y no se puede anular (stacking context)
    //    - outline: en <tr> se pinta sobre todos los <td> incluida la col sticky
    //    La primera columna no se tiñe: usa siempre var(--sticky-col) sin override.
    const rowStyle = (() => {
        if (reprogramar) return {
            '--row-input-tint': 'rgba(168, 85, 247, 0.07)',
            background: 'rgba(168, 85, 247, 0.08)',
        }
        if (marcarBorrar) return {
            '--row-input-tint': 'rgba(220, 38, 38, 0.10)',
            background: 'rgba(220, 38, 38, 0.20)',
        }
        if (revisado) return {
            '--row-input-tint': 'rgba(59, 130, 246, 0.07)',
            background: 'rgba(59, 130, 246, 0.08)',
        }
        if (agendar) return {
            '--row-input-tint': 'rgba(34, 197, 94, 0.08)',
            background: 'rgba(34, 197, 94, 0.10)',
        }
        return {}
    })()

    return (
        <tr className={styles.tableRow} style={rowStyle}>
            <td className={`${styles.cellBodyFixed}${data.urgente ? ` ${styles.urgenteCell}` : ''}`}>
                {data.urgente && <span className={styles.urgenteLabel}>⚠ Urgente</span>}
                {data.numeroLeg}
            </td>
            <td className={`${styles.cellBodyFixed}`}><div className={styles.scrollCell}>{data.fyhcreacion}</div></td>
            <td className={`${styles.cellBodyFixed}`}><div className={styles.scrollCell}>{data.solicitante}</div></td>
            <td className={`${styles.cellBodyFixed}`}>
                <div className={styles.scrollCell}>
                    {tipos.map((t, i) => (
                        <div key={i} className={`${styles.listPill} ${styles.pillTipo}`}>
                            <div className={styles.listPillInfo}>
                                <span className={styles.listNombre}>{t}</span>
                            </div>
                            <button
                                className={styles.listDeleteBtn}
                                onClick={() => {
                                    const updated = tipos.filter((_, idx) => idx !== i)
                                    setTipos(updated)
                                    setToSave(true)
                                }}
                                title="Eliminar"
                            >✕</button>
                        </div>
                    ))}
                    <div className={styles.listAddContainer}>
                        <input
                            list="tipos-datalist"
                            className={styles.listAddInput}
                            placeholder="Agregar Tipo..."
                            value={newTipo}
                            onChange={e => setNewTipo(e.target.value)}
                        />
                        <button
                            className={styles.listAddBtn}
                            onClick={() => {
                                if (!newTipo.trim()) return
                                setTipos(prev => [...prev, newTipo.trim()])
                                setNewTipo('')
                                setToSave(true)
                            }}
                        >+</button>
                    </div>
                    <datalist id="tipos-datalist">
                        {(Array.isArray(desplegables?.tiposPuma) ? desplegables.tiposPuma : []).map((t, idx) => (
                            <option key={idx} value={t} />
                        ))}
                    </datalist>
                </div>
            </td>
            <td className={`${styles.cellBodyFixed}`}>{data.intervinientes?.imputado?.length ?? 0}</td>
            <td className={`${styles.cellBodyFixed}`}>
                <div className={styles.scrollCell}>
                    {imputados.map((imp, i) => (
                        <div key={i} className={`${styles.listPill} ${styles.pillImputado}`}>
                            <div className={styles.listPillInfo}>
                                <span className={styles.listNombre}>{imp.nombre}</span>
                                {imp.dni && <span className={styles.listDni}>{imp.dni}</span>}
                            </div>
                            <button
                                className={styles.listDeleteBtn}
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
                    <div className={styles.listAddContainer}>
                        <input
                            className={styles.listAddInput}
                            placeholder="Nombre..."
                            value={newNombre}
                            onChange={e => setNewNombre(e.target.value)}
                        />
                        <input
                            className={styles.listAddInput}
                            placeholder="DNI..."
                            value={newDni}
                            onChange={e => setNewDni(e.target.value)}
                        />
                        <button
                            className={styles.listAddBtn}
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
            <td className={`${styles.cellBodyFixed}`}>
                <div className={styles.scrollCell}>
                    {partesAgregar.map((parte, i) => (
                        <div key={i} className={`${styles.listPill} ${styles.pillMotivo}`}>
                            <div className={styles.listPillInfo}>
                                <span className={styles.listNombre}>{parte.nombre}</span>
                                {parte.motivo && <span className={styles.listDni}>{parte.motivo}</span>}
                            </div>
                            <button
                                className={styles.listDeleteBtn}
                                onClick={() => {
                                    const updated = partesAgregar.filter((_, idx) => idx !== i)
                                    setPartesAgregar(updated)
                                    setToSave(true)
                                }}
                                title="Eliminar"
                            >✕</button>
                        </div>
                    ))}
                    {/* Agregar nueva parte */}
                    <div className={styles.listAddContainer}>
                        <SelectorDropdown
                            title="Motivo"
                            options={[
                                "ABOGADO QUERELLANTE - APODERADO", "ABOGADO QUERELLANTE - PATROCINANTE",
                                "DAMNIFICADO", "DEFENSOR DE MENORES", "DEFENSOR GENERAL", "DEFENSOR OFICIAL",
                                "DEFENSOR PARTICULAR", "DENUNCIANTE", "ENLACE DE LA DEFENSA", "EXHORTO ORGANISMO EXTERNO",
                                "FISCAL", "FISCAL GENERAL", "IMPUTADO", "INSTRUCTOR DEL LEGAJO", "LETRADO",
                                "ORGANISMO AUXILIAR", "PERITO", "PSICÓLOGO/A DE CÁMARA GESELL", "QUERELLA",
                                "TESTIGO", "VICTIMA"
                            ]}
                            onSelect={(val) => setNewMotivoParte(val)}
                        />
                        <input
                            className={styles.listAddInput}
                            placeholder="Motivo..."
                            value={newMotivoParte}
                            onChange={e => setNewMotivoParte(e.target.value)}
                        />
                        <input
                            list="enlaces-datalist"
                            className={styles.listAddInput}
                            placeholder="Nombre/DNI..."
                            value={newNombreParte}
                            onChange={e => setNewNombreParte(e.target.value)}
                        />
                        <button
                            className={styles.listAddBtn}
                            onClick={() => {
                                if (!newNombreParte.trim() || !newMotivoParte.trim()) return
                                setPartesAgregar(prev => [...prev, { nombre: newNombreParte.trim(), motivo: newMotivoParte.trim() }])
                                setNewNombreParte('')
                                setNewMotivoParte('')
                                setToSave(true)
                            }}
                        >+</button>
                    </div>
                </div>
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
            <td className={`${cell(juezT)} ${styles.cellBodyActions}`} style={{ position: 'relative' }}>
                <SelectorDropdown
                    title="Jueces"
                    options={data.jueces || []}
                    onSelect={(val) => setJuez(val)}
                />
                <input
                    list="jueces-datalist"
                    className={styles.inputCell}
                    value={juez}
                    onChange={e => { setJuez(e.target.value); setToSave(true) }}
                    placeholder="Buscar juez..."
                    autoComplete="off"
                />
                <datalist id="jueces-datalist">
                    {(Array.isArray(desplegables?.juecesPuma) ? desplegables.juecesPuma : []).map((j, idx) => (
                        <option key={idx} value={j} />
                    ))}
                </datalist>
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
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyOk}`} style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                <div className={styles.accionesCell}>

                    {/* Agendar — verde */}
                    <label className={`${styles.flagBtn}${agendar ? ` ${styles.agendarActive}` : ''}`}>
                        <input type="checkbox" className={styles.agendarCheckbox} checked={agendar}
                            onChange={(e) => { setAgendar(e.target.checked); setToSave(true) }} />
                        Agendar
                    </label>

                    {/* Revisado — azul */}
                    <label className={`${styles.flagBtn}${revisado ? ` ${styles.revisadoActive}` : ''}`}>
                        <input type="checkbox" className={styles.agendarCheckbox} checked={revisado}
                            onChange={(e) => { setRevisado(e.target.checked); setToSave(true) }} />
                        Revisado
                    </label>

                    {/* Borrar — rojo */}
                    <label className={`${styles.flagBtn}${marcarBorrar ? ` ${styles.borrarActive}` : ''}`}>
                        <input type="checkbox" className={styles.agendarCheckbox} checked={marcarBorrar}
                            onChange={(e) => {
                                const val = e.target.checked
                                if (val) {
                                    const hora = horaAudiencia || data.intervinientes?.hora_audiencia?.join(', ') || 'sin hora'
                                    const confirmado = window.confirm(
                                        `¿Estás seguro que querés borrar la solicitud del legajo ${data.numeroLeg || 'sin legajo'}, de tipo "${data.tipo || 'sin tipo'}", a las ${hora}?\n\nEsta acción se ejecutará al presionar "Guardar todo".`
                                    )
                                    if (!confirmado) return
                                }
                                setMarcarBorrar(val); setToSave(true)
                            }} />
                        Borrar
                    </label>

                    {/* Reprogramar — violeta, mueve arriba con opacity 0.5 */}
                    <label className={`${styles.flagBtn}${reprogramar ? ` ${styles.agendadoActive}` : ''}`}>
                        <input type="checkbox" className={styles.agendarCheckbox} checked={reprogramar}
                            onChange={(e) => { setReprogramar(e.target.checked); setToSave(true) }} />
                        Reprogramar
                    </label>

                </div>
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyDocuments} ${styles.cellBodyActions}`}>
                <div className={styles.cellActionWrapper}>
                    <ExpandContent label="Docs" empty={!data.documentos || data.documentos.length === 0}>
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