'use client'
import { useContext, useState, useEffect, useRef, useMemo } from "react"
import { DataContext } from "@/context New/DataContext"
import styles from "../SolicitudesAudiencia.module.css"
import ExpandContent from "./ExpandContent"
import SelectorDropdown from "./SelectorDropdown"
import { descargarPdfNotificacion } from "@/utils/notificacionesAgendamiento";

export default function RowSol({ data, onStatusChange, forceSave, showNotificar, onToggleNotificar, onCloseNotificar, showPartesLegajo, onTogglePartesLegajo, onClosePartesLegajo }) {
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
    const [caratulaMod, setCaratulaMod] = useState(savedData.caratulaMod || data.caratula || '')
    const [imputados, setImputados] = useState(() => {
        const list = savedData.imputados || data.intervinientes?.imputado || [];
        return list.map(item => typeof item === 'string' ? { nombre: item, dni: '' } : { nombre: item.nombre || '', dni: item.dni || '' });
    })
    const [partesAgregar, setPartesAgregar] = useState(savedData.partesAgregar || [])
    const [newNombre, setNewNombre] = useState('')
    const [newDni, setNewDni] = useState('')
    const [newMotivoParte, setNewMotivoParte] = useState('')
    const [newNombreParte, setNewNombreParte] = useState('')
    const [filterPartes, setFilterPartes] = useState('')
    const [partesLegajo, setPartesLegajo] = useState([])

    const [notificaciones, setNotificaciones] = useState(savedData.notificaciones || [])
    const [notifOption, setNotifOption] = useState('cancelarAudienciaImputadoEnLibertad')
    const [selectedPartsToNotify, setSelectedPartsToNotify] = useState([])
    const [notifNewName, setNotifNewName] = useState('')
    const [notifNewRole, setNotifNewRole] = useState('')
    const [isNotificando, setIsNotificando] = useState(false)
    const [notifStatus, setNotifStatus] = useState('')

    const availablePartsList = useMemo(() => {
        let list = []
        // Manejar tanto array nuevo como objeto viejo
        if (Array.isArray(partesLegajo) && partesLegajo.length > 0) {
            partesLegajo.forEach(p => {
                list.push({
                    key: `${p.nombre}-${p.rol}`,
                    nombre: p.nombre,
                    rol: p.rol,
                    isNew: false,
                    direccion: p.direccion,
                    localidad: p.localidad,
                    telefono: p.telefono,
                    alias: p.alias || '',
                    dni: p.dni || '',
                    situacionCorporal: p.situacionCorporal || '',
                    situacionDetalle: p.situacionDetalle || ''
                })
            })
        } else if (data.partesLegajo && typeof data.partesLegajo === 'object') {
            Object.keys(data.partesLegajo).forEach(roleKey => {
                const roleName = roleKey.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
                const persons = data.partesLegajo[roleKey]
                if (Array.isArray(persons)) {
                    persons.forEach(person => list.push({ key: `${person}-${roleName}`, nombre: person, rol: roleName, isNew: false, alias: '', dni: '' }))
                }
            })
        }
        partesAgregar.forEach(p => {
            if (p.nombre && p.motivo) {
                list.push({ key: `${p.nombre}-${p.motivo}`, nombre: p.nombre, rol: p.motivo, isNew: true, alias: '', dni: '' })
            }
        })
        return list
    }, [partesLegajo, data.partesLegajo, partesAgregar])

    const [agendar, setAgendar] = useState(savedData.agendar ?? false)
    const [revisado, setRevisado] = useState(savedData.revisado ?? false)
    const [marcarBorrar, setMarcarBorrar] = useState(savedData.marcarBorrar ?? false)
    const [reprogramar, setReprogramar] = useState(savedData.reprogramar ?? false)
    const [cancelar, setCancelar] = useState(savedData.cancelar ?? false)

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
    const [motivRepro, setMotivRepro] = useState(savedData.motivRepro || '')
    const [obsRepro, setObsRepro] = useState(savedData.obsRepro || '')
    const [horaFinAudiencia, setHoraFinAudiencia] = useState(savedData.horaFinAudiencia || (data.intervinientes?.hora_fin_audiencia?.join(', ') ?? ''))
    const [motivCancel, setMotivCancel] = useState(savedData.motivCancel || '')
    const [obsCancel, setObsCancel] = useState(savedData.obsCancel || '')

    const [showReproModal, setShowReproModal] = useState(false)
    const [showCancelModal, setShowCancelModal] = useState(false)

    const handleCloseRepro = () => {
        if (!motivRepro || !obsRepro) {
            setReprogramar(false);
            setMotivRepro('');
            setObsRepro('');
        }
        setShowReproModal(false);
    }

    const handleCloseCancel = () => {
        if (!motivCancel || !obsCancel) {
            setCancelar(false);
            setMotivCancel('');
            setObsCancel('');
        }
        setShowCancelModal(false);
    }

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
            (caratulaMod || '') !== getBaseValue('caratulaMod', data.caratula) ||
            JSON.stringify(imputados) !== JSON.stringify((() => {
                const list = savedData.imputados || data.intervinientes?.imputado || [];
                return list.map(item => typeof item === 'string' ? { nombre: item, dni: '' } : { nombre: item.nombre || '', dni: item.dni || '' });
            })()) ||
            JSON.stringify(partesLegajo) !== JSON.stringify((() => {
                const sourcePartes = savedData?.partesLegajo || data.partesLegajo;
                if (Array.isArray(sourcePartes)) {
                    return sourcePartes.map(p => ({
                        nombre: p.nombre || '',
                        rol: p.rol || '',
                        direccion: p.direccion || '',
                        localidad: p.localidad || '',
                        telefono: p.telefono || '',
                        dni: p.dni || '',
                        alias: p.alias || '',
                        situacionCorporal: p.situacionCorporal || '',
                        situacionDetalle: p.situacionDetalle || ''
                    }));
                }
                if (sourcePartes && typeof sourcePartes === 'object') {
                    const converted = [];
                    Object.keys(sourcePartes).forEach(roleKey => {
                        const roleName = roleKey.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                        const persons = sourcePartes[roleKey];
                        if (Array.isArray(persons)) {
                            persons.forEach(person => converted.push({ nombre: person, rol: roleName, direccion: '', localidad: '', telefono: '', dni: '', alias: '', situacionCorporal: '', situacionDetalle: '' }));
                        }
                    });
                    return converted;
                }
                return [];
            })()) ||
            JSON.stringify(partesAgregar) !== JSON.stringify(getBaseValue('partesAgregar', [])) ||
            JSON.stringify(notificaciones) !== JSON.stringify(getBaseValue('notificaciones', [])) ||
            agendar !== (savedData.agendar ?? false) ||
            revisado !== (savedData.revisado ?? false) ||
            marcarBorrar !== (savedData.marcarBorrar ?? false) ||
            reprogramar !== (savedData.reprogramar ?? false) ||
            cancelar !== (savedData.cancelar ?? false) ||
            motivRepro !== (savedData.motivRepro || '') ||
            obsRepro !== (savedData.obsRepro || '') ||
            horaFinAudiencia !== (savedData.horaFinAudiencia || (data.intervinientes?.hora_fin_audiencia?.join(', ') ?? '')) ||
            motivCancel !== (savedData.motivCancel || '') ||
            obsCancel !== (savedData.obsCancel || '')
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
            setCaratulaMod(syncField(saved.caratulaMod, data.caratula))
            setImputados((saved.imputados || data.intervinientes?.imputado || []).map(item => {
                if (typeof item === 'string') return { nombre: item, dni: '' };
                return { nombre: item.nombre || '', dni: item.dni || '' };
            }))

            let initialPartes = []
            const sourcePartes = saved.partesLegajo || data.partesLegajo;

            if (Array.isArray(sourcePartes)) {
                initialPartes = sourcePartes.map(p => ({
                    nombre: p.nombre || '',
                    rol: p.rol || '',
                    direccion: p.direccion || '',
                    localidad: p.localidad || '',
                    telefono: p.telefono || '',
                    dni: p.dni || '',
                    alias: p.alias || '',
                    situacionCorporal: p.situacionCorporal || '',
                    situacionDetalle: p.situacionDetalle || ''
                }))
            } else if (sourcePartes && typeof sourcePartes === 'object') {
                Object.keys(sourcePartes).forEach(roleKey => {
                    const roleName = roleKey.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
                    const persons = sourcePartes[roleKey]
                    if (Array.isArray(persons)) {
                        persons.forEach(person => initialPartes.push({
                            nombre: person,
                            rol: roleName,
                            direccion: '',
                            localidad: '',
                            telefono: '',
                            dni: '',
                            alias: '',
                            situacionCorporal: '',
                            situacionDetalle: ''
                        }))
                    }
                })
            }
            setPartesLegajo(initialPartes)

            setPartesAgregar(saved.partesAgregar || [])
            setNotificaciones(saved.notificaciones || [])

            setMotivRepro(saved.motivRepro || '')
            setObsRepro(saved.obsRepro || '')
            setHoraFinAudiencia(saved.horaFinAudiencia || (data.intervinientes?.hora_fin_audiencia?.join(', ') ?? ''))
            setMotivCancel(saved.motivCancel || '')
            setObsCancel(saved.obsCancel || '')

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
    }, [tipos, sitCorporal, vencimiento, querella, defensa, fiscal, juez, motivo, fechaAudiencia, horaAudiencia, sala, juezCausa, comentario, imputados, partesLegajo, partesAgregar, notificaciones, agendar, revisado, marcarBorrar, reprogramar, cancelar, savedData, motivRepro, obsRepro, horaFinAudiencia, motivCancel, obsCancel])

    useEffect(() => {
        const saveRow = async () => {
            if (doSave) {
                if (marcarBorrar) {
                    await removeSolicitudPendiente(rowKey)
                } else {
                    await addSolicitudData(rowKey, {
                        ...data,
                        rowKey,
                        numeroLeg: data.numeroLeg,
                        fyhcreacion: data.fyhcreacion,
                        tipos, sitCorporal, vencimiento, querella, defensa, fiscal,
                        juez, motivo, fechaAudiencia, horaAudiencia, sala, juezCausa, comentario, caratulaMod,
                        imputados, partesLegajo, partesAgregar, notificaciones, agendar, revisado, marcarBorrar, reprogramar, cancelar,
                        motivRepro, obsRepro, horaFinAudiencia, motivCancel, obsCancel
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
    const rowStyle = (() => {
        if (savedData.agendadaError) return {
            '--row-input-tint': 'rgba(239, 68, 68, 0.1)',
            '--sticky-col-override': 'rgba(239, 68, 68, 0.12)',
            background: 'rgba(239, 68, 68, 0.12)',
        }
        if (savedData.agendada) return {
            '--row-input-tint': 'rgba(16, 185, 129, 0.1)',
            '--sticky-col-override': 'rgba(16, 185, 129, 0.15)',
            background: 'rgba(16, 185, 129, 0.15)',
            borderLeft: '4px solid #10b981'
        }
        if (cancelar) return {
            '--row-input-tint': 'rgba(251, 146, 60, 0.08)',
            '--sticky-col-override': 'rgba(251, 146, 60, 0.10)',
            background: 'rgba(251, 146, 60, 0.10)',
        }
        if (reprogramar) return {
            '--row-input-tint': 'rgba(168, 85, 247, 0.07)',
            '--sticky-col-override': 'rgba(168, 85, 247, 0.08)',
            background: 'rgba(168, 85, 247, 0.08)',
        }
        if (marcarBorrar) return {
            '--row-input-tint': 'rgba(220, 38, 38, 0.10)',
            '--sticky-col-override': 'rgba(220, 38, 38, 0.20)',
            background: 'rgba(220, 38, 38, 0.20)',
        }
        if (revisado) return {
            '--row-input-tint': 'rgba(59, 130, 246, 0.07)',
            '--sticky-col-override': 'rgba(59, 130, 246, 0.08)',
            background: 'rgba(59, 130, 246, 0.08)',
        }
        if (agendar) return {
            '--row-input-tint': 'rgba(34, 197, 94, 0.08)',
            '--sticky-col-override': 'rgba(34, 197, 94, 0.10)',
            background: 'rgba(34, 197, 94, 0.10)',
        }
        return {}
    })()

    return (
        <tr className={styles.tableRow} style={rowStyle} title={savedData.agendadaError ? `Error de agendamiento: ${savedData.agendadaError}` : (savedData.agendada ? '¡Audiencia Agendada con Éxito!' : '')}>
            <td className={`${styles.cellBodyFixed}${data.urgente ? ` ${styles.urgenteCell}` : ''}`}>
                {data.urgente && <span className={styles.urgenteLabel}>⚠ Urgente</span>}
                {savedData.agendada && <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', marginRight: '6px' }} title="Agendada en PUMA"></span>}
                {savedData.agendadaError && <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', marginRight: '6px' }} title="Error en PUMA"></span>}
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
            <td className={`${styles.cellBodyFixed}`}>
                <div className={styles.scrollCell}>
                    {tipos.some(t => String(t || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().includes('formalizacion')) ? (
                        <textarea
                            className={styles.inputCell}
                            value={caratulaMod}
                            onChange={e => { setCaratulaMod(e.target.value); setToSave(true); }}
                        />
                    ) : '-'}
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
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyOk}`} style={{ textAlign: 'center', verticalAlign: 'middle', padding: '0 4px', zIndex: showPartesLegajo ? 4000 : 'auto' }}>
                <button
                    className={styles.flagBtn}
                    style={{
                        background: showPartesLegajo ? 'var(--accent)' : 'var(--surface2)',
                        color: showPartesLegajo ? '#fff' : undefined,
                        borderColor: showPartesLegajo ? 'var(--accent)' : undefined,
                        height: '70%', margin: '0 auto', fontSize: '10px', position: 'relative'
                    }}
                    onClick={onTogglePartesLegajo}
                >
                    Partes ({partesLegajo.length})
                </button>
                {showPartesLegajo && (
                    <div className={styles.modalNotificarOverlay} onClick={onClosePartesLegajo}>
                        <div className={styles.modalNotificarContent} onClick={e => e.stopPropagation()}>
                            <div className={styles.modalTitle} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>Partes del Legajo</span>
                                <button
                                    className={styles.modalBtnClose}
                                    style={{ border: 'none', fontSize: '24px', lineHeight: '1', padding: '0 8px', borderRadius: '4px' }}
                                    onClick={onClosePartesLegajo}
                                    title="Cerrar"
                                >
                                    &times;
                                </button>
                            </div>

                            <div className={styles.modalSection} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <h4 className={styles.modalSectionTitle} style={{ margin: 0, border: 'none' }}>Lista de Partes</h4>
                                    <input
                                        className={styles.modalInput}
                                        style={{ width: '200px', height: '30px', padding: '4px 10px', fontSize: '12px' }}
                                        placeholder="Buscar por nombre o rol..."
                                        value={filterPartes}
                                        onChange={e => setFilterPartes(e.target.value)}
                                    />
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '12px', overflowY: 'auto' }}>
                                    {(!Array.isArray(partesLegajo) || partesLegajo.length === 0) && <p style={{ fontStyle: 'italic', color: 'var(--text3)' }}>No hay partes extraídas.</p>}
                                    {(Array.isArray(partesLegajo) ? partesLegajo : [])
                                        .filter(p => {
                                            const lower = filterPartes.toLowerCase();
                                            return p.nombre.toLowerCase().includes(lower) || p.rol.toLowerCase().includes(lower);
                                        })
                                        .map((parte, idx) => {
                                            // Encontrar el índice original para que el guardado funcione correctamente al filtrar
                                            const originalIdx = partesLegajo.findIndex(orig => orig === parte);

                                            const getRoleStyle = (rol) => {
                                                const r = (rol || '').toUpperCase();
                                                if (r.includes('IMPUTADO')) return { bg: 'rgba(239, 68, 68, 0.1)', color: 'var(--red)', border: 'rgba(239, 68, 68, 0.3)' };
                                                if (r.includes('VICTIMA') || r.includes('DAMNIFICADO')) return { bg: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', border: 'rgba(168, 85, 247, 0.3)' };
                                                if (r.includes('DEFENSOR')) return { bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', border: 'rgba(34, 197, 94, 0.3)' };
                                                if (r.includes('FISCAL')) return { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: 'rgba(59, 130, 246, 0.3)' };
                                                if (r.includes('QUERELLA')) return { bg: 'rgba(249, 115, 22, 0.1)', color: '#f97316', border: 'rgba(249, 115, 22, 0.3)' };
                                                if (r.includes('TESTIGO')) return { bg: 'rgba(234, 179, 8, 0.1)', color: '#eab308', border: 'rgba(234, 179, 8, 0.3)' };
                                                return { bg: 'var(--surface)', color: 'var(--text3)', border: 'var(--border)' };
                                            };
                                            const roleStyle = getRoleStyle(parte.rol);

                                            return (
                                                <div key={idx} style={{ background: 'var(--surface2)', padding: '12px', borderRadius: '8px', border: `1px solid ${roleStyle.border}` }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                        <strong style={{ color: 'var(--accent)' }}>{parte.nombre}</strong>
                                                        <span style={{ fontSize: '11px', color: roleStyle.color, background: roleStyle.bg, padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>{parte.rol}</span>
                                                    </div>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                            <label style={{ fontSize: '11px', color: 'var(--text3)' }}>Dirección / Domicilio:</label>
                                                            <input
                                                                className={styles.modalInput}
                                                                value={parte.direccion || ''}
                                                                onChange={e => {
                                                                    const updated = [...partesLegajo]
                                                                    updated[originalIdx] = { ...parte, direccion: e.target.value }
                                                                    setPartesLegajo(updated)
                                                                    setToSave(true)
                                                                }}
                                                                placeholder="Ingrese domicilio..."
                                                            />
                                                        </div>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                            <label style={{ fontSize: '11px', color: 'var(--text3)' }}>Localidad:</label>
                                                            <input
                                                                className={styles.modalInput}
                                                                value={parte.localidad || ''}
                                                                onChange={e => {
                                                                    const updated = [...partesLegajo]
                                                                    updated[originalIdx] = { ...parte, localidad: e.target.value }
                                                                    setPartesLegajo(updated)
                                                                    setToSave(true)
                                                                }}
                                                                placeholder="Ingrese localidad..."
                                                            />
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                            <label style={{ fontSize: '11px', color: 'var(--text3)' }}>Teléfono:</label>
                                                            <input
                                                                className={styles.modalInput}
                                                                value={parte.telefono || ''}
                                                                onChange={e => {
                                                                    const updated = [...partesLegajo]
                                                                    updated[originalIdx] = { ...parte, telefono: e.target.value }
                                                                    setPartesLegajo(updated)
                                                                    setToSave(true)
                                                                }}
                                                                placeholder="Móvil/Fijo..."
                                                            />
                                                        </div>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                            <label style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: '600' }}>Alias / Nombre notificación:</label>
                                                            <input
                                                                className={styles.modalInput}
                                                                style={{ borderColor: 'var(--accent)' }}
                                                                value={parte.alias || ''}
                                                                onChange={e => {
                                                                    const updated = [...partesLegajo]
                                                                    updated[originalIdx] = { ...parte, alias: e.target.value }
                                                                    setPartesLegajo(updated)
                                                                    setToSave(true)
                                                                }}
                                                                placeholder="Ej: Sra. CORIA VEDIA..."
                                                            />
                                                        </div>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                            <label style={{ fontSize: '11px', color: 'var(--text3)' }}>DNI:</label>
                                                            <input
                                                                className={styles.modalInput}
                                                                value={parte.dni || ''}
                                                                onChange={e => {
                                                                    const updated = [...partesLegajo]
                                                                    updated[originalIdx] = { ...parte, dni: e.target.value }
                                                                    setPartesLegajo(updated)
                                                                    setToSave(true)
                                                                }}
                                                                placeholder="Ingrese DNI..."
                                                            />
                                                        </div>
                                                    </div>
                                                    {parte.rol && parte.rol.toUpperCase().includes('IMPUTADO') && (
                                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px', background: 'rgba(239, 68, 68, 0.05)', padding: '8px', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                                <label style={{ fontSize: '11px', color: 'var(--red)', fontWeight: '600' }}>Situación Corporal:</label>
                                                                <select
                                                                    className={styles.modalSelect}
                                                                    style={{ borderColor: 'var(--red)', padding: '4px 8px', minHeight: '32px' }}
                                                                    value={parte.situacionCorporal || ''}
                                                                    onChange={e => {
                                                                        const updated = [...partesLegajo]
                                                                        updated[originalIdx] = { ...parte, situacionCorporal: e.target.value }
                                                                        setPartesLegajo(updated)
                                                                        setToSave(true)
                                                                    }}
                                                                >
                                                                    <option value="">Seleccione...</option>
                                                                    <option value="Libertad">Libertad</option>
                                                                    <option value="Detenido">Detenido</option>
                                                                </select>
                                                            </div>
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                                <label style={{ fontSize: '11px', color: 'var(--text3)' }}>Detalle Situación:</label>
                                                                <input
                                                                    className={styles.modalInput}
                                                                    style={{ borderColor: parte.situacionCorporal === 'Detenido' ? 'var(--red)' : '' }}
                                                                    value={parte.situacionDetalle || ''}
                                                                    onChange={e => {
                                                                        const updated = [...partesLegajo]
                                                                        updated[originalIdx] = { ...parte, situacionDetalle: e.target.value }
                                                                        setPartesLegajo(updated)
                                                                        setToSave(true)
                                                                    }}
                                                                    placeholder="Ej: SPP, Comisaría..."
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                </div>
                            </div>
                            <div className={styles.modalSection}>
                                <h4 className={styles.modalSectionTitle}>Agregar Nueva Parte al Legajo</h4>
                                <div className={styles.addPartRow}>
                                    <input
                                        className={styles.modalInput}
                                        placeholder="Nombre..."
                                        value={notifNewName}
                                        onChange={e => setNotifNewName(e.target.value)}
                                    />
                                    <input
                                        list="motivos-datalist"
                                        className={styles.modalInput}
                                        placeholder="Rol (Motivo)..."
                                        value={notifNewRole}
                                        onChange={e => setNotifNewRole(e.target.value)}
                                    />
                                    <button
                                        className={styles.modalBtn}
                                        onClick={() => {
                                            if (!notifNewName.trim() || !notifNewRole.trim()) return;
                                            const newPart = {
                                                nombre: notifNewName.trim(),
                                                rol: notifNewRole.trim(),
                                                direccion: '',
                                                localidad: '',
                                                telefono: '',
                                                dni: '',
                                                alias: '',
                                                situacionCorporal: '',
                                                situacionDetalle: ''
                                            };
                                            setPartesLegajo(prev => [...prev, newPart]);
                                            setNotifNewName('');
                                            setNotifNewRole('');
                                            setToSave(true);
                                        }}
                                    >
                                        Agregar +
                                    </button>
                                </div>
                            </div>

                            <div className={styles.modalButtonGroup}>
                                <button className={styles.modalBtn} onClick={onClosePartesLegajo}>
                                    Aceptar
                                </button>
                                <button className={`${styles.modalBtn} ${styles.modalBtnClose}`} onClick={onClosePartesLegajo}>
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
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
                        <input
                            list="motivos-datalist"
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
                    <datalist id="motivos-datalist">
                        {[
                            "ABOGADO QUERELLANTE - APODERADO", "ABOGADO QUERELLANTE - PATROCINANTE",
                            "DAMNIFICADO", "DEFENSOR DE MENORES", "DEFENSOR GENERAL", "DEFENSOR OFICIAL",
                            "DEFENSOR PARTICULAR", "DENUNCIANTE", "ENLACE DE LA DEFENSA", "EXHORTO ORGANISMO EXTERNO",
                            "FISCAL", "FISCAL GENERAL", "IMPUTADO", "INSTRUCTOR DEL LEGAJO", "LETRADO",
                            "ORGANISMO AUXILIAR", "PERITO", "PSICÓLOGO/A DE CÁMARA GESELL", "QUERELLA",
                            "TESTIGO", "VICTIMA"
                        ].map(opt => <option key={opt} value={opt} />)}
                    </datalist>
                    <datalist id="enlaces-datalist">
                        <option value="ENLACE DE LA DEFENSA" />
                    </datalist>
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
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <textarea className={styles.inputCell} style={{ height: '50%' }} value={horaAudiencia} onChange={e => setHoraAudiencia(e.target.value)} placeholder="Inicio" />
                    <textarea className={styles.inputCell} style={{ height: '50%', borderTop: '1px solid var(--border)' }} value={horaFinAudiencia} onChange={e => setHoraFinAudiencia(e.target.value)} placeholder="Fin" />
                </div>
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
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyOk}`} style={{ textAlign: 'center', verticalAlign: 'middle', padding: '0 4px', zIndex: showNotificar ? 4000 : 'auto' }}>
                <button
                    className={styles.flagBtn}
                    style={{
                        background: showNotificar ? 'var(--accent)' : 'var(--surface2)',
                        color: showNotificar ? '#fff' : undefined,
                        borderColor: showNotificar ? 'var(--accent)' : undefined,
                        height: '70%', margin: '0 auto', fontSize: '10px', position: 'relative'
                    }}
                    onClick={onToggleNotificar}
                >
                    Notificar
                    {notificaciones.length > 0 && (
                        <div style={{ position: 'absolute', top: '-6px', right: '-4px', display: 'flex', gap: '2px', alignItems: 'center' }}>
                            {notificaciones.filter(n => !n.notificada).length > 0 && (
                                <span title="Notificaciones" style={{
                                    background: 'var(--accent)',
                                    color: '#fff',
                                    borderRadius: '50%',
                                    width: '18px',
                                    height: '18px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '10px',
                                    fontWeight: 'bold',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                                }}>
                                    {notificaciones.filter(n => !n.notificada).length}
                                </span>
                            )}
                            {notificaciones.filter(n => n.notificada).length > 0 && (
                                <span title="Notificadas" style={{
                                    background: '#888', // Gris
                                    color: '#fff',
                                    borderRadius: '50%',
                                    width: '18px',
                                    height: '18px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '10px',
                                    fontWeight: 'bold',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                                }}>
                                    {notificaciones.filter(n => n.notificada).length}
                                </span>
                            )}
                        </div>
                    )}
                </button>
                {showNotificar && (
                    <div className={styles.modalNotificarOverlay} onClick={onCloseNotificar}>
                        <div className={styles.modalNotificarContent} onClick={e => e.stopPropagation()}>
                            <div className={styles.modalTitle} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>Generar Notificaciones</span>
                                <button
                                    className={styles.modalBtnClose}
                                    style={{ border: 'none', fontSize: '24px', lineHeight: '1', padding: '0 8px', borderRadius: '4px' }}
                                    onClick={onCloseNotificar}
                                    title="Cerrar"
                                >
                                    &times;
                                </button>
                            </div>

                            <div className={styles.modalSection}>
                                <h4 className={styles.modalSectionTitle}>1. Crear Notificación</h4>
                                <select
                                    className={styles.modalSelect}
                                    value={notifOption}
                                    onChange={e => setNotifOption(e.target.value)}
                                >
                                    <option value="">Seleccione tipo...</option>
                                    <optgroup label="Oficios/Cédulas (con PDF)">
                                        <option value="cancelarAudienciaImputadoEnLibertad">Cancelar Audiencia Imputado Libre</option>
                                        <option value="citacionDenunciante">Citación Denunciante</option>
                                        <option value="citacionImputadoLibertadVideoconferencia">Citación Imputado Video</option>
                                        <option value="citacionPersonalPolicial">Citación Personal Policial</option>
                                        <option value="citacionImputadoCedulaPenalEnLibertad">Citación Imputado Cédula</option>
                                        <option value="citacionConvenio">Citación por Convenio</option>
                                    </optgroup>
                                    <optgroup label="Plantillas PUMA (Sin PDF)">
                                        <option value="AUDIENCIA  CITACION FISCAL DEFENSA">AUDIENCIA CITACION FISCAL DEFENSA</option>
                                        <option value="AUDIENCIA OFICIO POLICÍA TRASLADO DETENIDO">AUDIENCIA OFICIO POLICÍA TRASLADO DETENIDO</option>
                                        <option value="AUDIENCIA OFICIO POLICÍA TRASLADO PRISION DOMICILIARIA">AUDIENCIA OFICIO POLICÍA TRASLADO PRISION DOMICILIARIA</option>
                                        <option value="CANCELACION AUDIENCIA FISCAL DEFENSA">CANCELACION AUDIENCIA FISCAL DEFENSA</option>
                                        <option value="CITACION IMPUTADO DETENIDO PARA AUDIENCIA">CITACION IMPUTADO DETENIDO PARA AUDIENCIA</option>
                                        <option value="Citación IMPUTADO IMPUGNACIÓN CONEXIÓN">Citación IMPUTADO IMPUGNACIÓN CONEXIÓN</option>
                                        <option value="CONEXIÓN DE ZOOM IMPUTADOS PARA ANIVI">CONEXIÓN DE ZOOM IMPUTADOS PARA ANIVI</option>
                                        <option value="Ejecución CITACIÓN FISCAL DEFENSA">Ejecución CITACIÓN FISCAL DEFENSA</option>
                                        <option value="Ejecución CITACIÓN IMPUTADO ZOOM">Ejecución CITACIÓN IMPUTADO ZOOM</option>
                                        <option value="MODELO">MODELO (Sin PDF)</option>
                                        <option value="NOTIFICACIÓN ASESORÍAS PARA VIDEOGRABADA ANIVI">NOTIFICACIÓN ASESORÍAS PARA VIDEOGRABADA ANIVI</option>
                                        <option value="NOTIFICACION DE ANIVI PARA SAP">NOTIFICACION DE ANIVI PARA SAP</option>
                                    </optgroup>
                                </select>

                                <div style={{ marginTop: '12px' }}>
                                    <span style={{ fontSize: '12px', color: 'var(--text2)', fontWeight: '600' }}>Agregadas a esta notificación:</span>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px', minHeight: '38px', border: '1px dashed var(--border2)', borderRadius: '6px', padding: '8px' }}>
                                        {selectedPartsToNotify.length === 0 && <span style={{ fontSize: '12px', color: 'var(--text3)', fontStyle: 'italic', display: 'flex', alignItems: 'center' }}>Vacío... Haga clic abajo para agregar.</span>}
                                        {selectedPartsToNotify.map(partKey => {
                                            const p = availablePartsList.find(x => x.key === partKey) || { nombre: partKey, rol: '' };
                                            return (
                                                <div key={partKey} className={styles.listPill} style={p.isNew ? { borderColor: 'rgba(239, 68, 68, 0.5)' } : {}}>
                                                    <div className={styles.listPillInfo}>
                                                        <span className={styles.listNombre} style={p.isNew ? { color: '#f87171' } : {}}>{p.nombre}</span>
                                                        <span className={styles.listDni}>{p.rol}</span>
                                                    </div>
                                                    <button className={styles.listDeleteBtn} onClick={() => setSelectedPartsToNotify(prev => prev.filter(k => k !== partKey))}>✕</button>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div style={{ marginTop: '12px' }}>
                                    <span style={{ fontSize: '12px', color: 'var(--text2)', fontWeight: '600' }}>Click para agregar (Disponibles):</span>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px', maxHeight: '140px', overflowY: 'auto' }}>
                                        {availablePartsList.filter(p => !selectedPartsToNotify.includes(p.key)).map(part => (
                                            <div
                                                key={part.key}
                                                className={styles.listPill}
                                                style={{ cursor: 'pointer', transition: 'transform 0.1s', ...(part.isNew ? { borderColor: 'rgba(239, 68, 68, 0.4)' } : {}) }}
                                                onClick={() => setSelectedPartsToNotify(prev => [...prev, part.key])}
                                                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                                                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                            >
                                                <div className={styles.listPillInfo}>
                                                    <span className={styles.listNombre} style={part.isNew ? { color: '#f87171' } : {}}>{part.nombre}</span>
                                                    <span className={styles.listDni}>{part.rol}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    className={styles.modalBtn}
                                    style={{ marginTop: '14px', alignSelf: 'flex-start' }}
                                    onClick={() => {
                                        if (selectedPartsToNotify.length === 0) return alert("Seleccione al menos una parte para agregar.");
                                        setNotificaciones(prev => [...prev, { id: Date.now(), option: notifOption, parts: selectedPartsToNotify, notificada: false }]);
                                        setSelectedPartsToNotify([]);
                                        setToSave(true);
                                    }}
                                >
                                    Guardar Configuración
                                </button>
                            </div>

                            {notificaciones.length > 0 && (
                                <div className={styles.modalSection}>
                                    <h4 className={styles.modalSectionTitle}>2. Notificaciones Listas ({notificaciones.length})</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {notificaciones.map(n => (
                                            <div key={n.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface2)', padding: '10px 14px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                                                <div>
                                                    <strong style={{ color: 'var(--accent)', fontSize: '13px' }}>{n.option}</strong>
                                                    <span style={{ fontSize: '12px', color: 'var(--text2)', marginLeft: '8px' }}>└ {n.parts.length} partes asignadas</span>
                                                    {n.notificada && <span style={{ background: '#4ade80', color: '#fff', fontSize: '9px', padding: '1px 4px', borderRadius: '3px', marginLeft: '8px', fontWeight: 'bold' }}>ENVIADA</span>}
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                    <button
                                                        style={{ background: 'var(--accent)', border: 'none', color: '#fff', cursor: 'pointer', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const selectedPartsWithInfo = n.parts.map(pKey => availablePartsList.find(x => x.key === pKey) || { nombre: pKey, rol: '', direccion: '', localidad: '', telefono: '' });
                                                            const firstPart = selectedPartsWithInfo.find(p => p.direccion || p.localidad || p.telefono) || {};
                                                            const datosList = {
                                                                destinatarioNombre: selectedPartsWithInfo.map(p => p.nombre).join(', '),
                                                                destinatarioDomicilio: firstPart.direccion || '[DOMICILIO A COMPLETAR]',
                                                                destinatarioLocalidad: firstPart.localidad || '[LOCALIDAD A COMPLETAR]',
                                                                destinatarioTelefono: firstPart.telefono || '',
                                                                legajoFiscal: data.numeroLeg || '[LEGAJO]',
                                                                caratula: (tipos.some(t => String(t || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().includes('formalizacion')) && caratulaMod) ? caratulaMod : (data.caratula || '[CARATULA]'),
                                                                tipoAudiencia: tipos.join(' - ') || '[TIPO]',
                                                                fechaAudiencia: fechaAudiencia || '[FECHA]',
                                                                horaAudiencia: horaAudiencia || '[HORA]',
                                                                juez: juez || '[JUEZ]',
                                                                personasACitar: n.parts.map(pKey => {
                                                                    const pInfo = availablePartsList.find(x => x.key === pKey) || { nombre: pKey, rol: '', dni: '' };
                                                                    return {
                                                                        nombre: (pInfo.alias || pInfo.nombre) + (pInfo.rol ? ` (${pInfo.rol})` : ''),
                                                                        dni: pInfo.dni || '',
                                                                        telefono: pInfo.telefono || '',
                                                                        fecha: fechaAudiencia || '[FECHA]',
                                                                        hora: horaAudiencia || '[HORA]'
                                                                    }
                                                                })
                                                            };
                                                            descargarPdfNotificacion(n.option, datosList);
                                                        }}
                                                        title="Descargar esta notificación"
                                                    >
                                                        💾 PDF
                                                    </button>
                                                    <button style={{ background: 'transparent', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center' }} onClick={() => { setNotificaciones(prev => prev.filter(x => x.id !== n.id)); setToSave(true); }} title="Quitar">✕</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}



                            <div className={styles.modalButtonGroup}>
                                {(() => {
                                    if (notificaciones.length === 0) return null;

                                    const handleNotificarManual = async () => {
                                        if (!savedData.agendada) {
                                            return alert("No se puede notificar si la audiencia no ha sido agendada en PUMA.");
                                        }

                                        const pendientes = notificaciones.filter(n => !n.notificada);
                                        if (pendientes.length === 0) {
                                            return alert("No hay notificaciones pendientes de envío.");
                                        }

                                        try {
                                            setIsNotificando(true);
                                            setNotifStatus('Iniciando proceso de notificación...');

                                            let documentosBase64 = [];
                                            const TEMPLATES_NO_PDF = [
                                                "AUDIENCIA  CITACION FISCAL DEFENSA",
                                                "AUDIENCIA OFICIO POLICÍA TRASLADO DETENIDO",
                                                "AUDIENCIA OFICIO POLICÍA TRASLADO PRISION DOMICILIARIA",
                                                "CANCELACION AUDIENCIA FISCAL DEFENSA",
                                                "CITACION IMPUTADO DETENIDO PARA AUDIENCIA",
                                                "Citación IMPUTADO IMPUGNACIÓN CONEXIÓN",
                                                "CONEXIÓN DE ZOOM IMPUTADOS PARA ANIVI",
                                                "Ejecución CITACIÓN FISCAL DEFENSA",
                                                "Ejecución CITACIÓN IMPUTADO ZOOM",
                                                "MODELO",
                                                "NOTIFICACIÓN ASESORÍAS PARA VIDEOGRABADA ANIVI",
                                                "NOTIFICACION DE ANIVI PARA SAP"
                                            ];

                                            for (const notif of pendientes) {
                                                const selectedPartsWithInfo = notif.parts.map(pKey => availablePartsList.find(x => x.key === pKey) || { nombre: pKey, rol: '', direccion: '', localidad: '', telefono: '', alias: '' });
                                                
                                                if (TEMPLATES_NO_PDF.includes(notif.option)) {
                                                    documentosBase64.push({
                                                        isTemplateOnly: true,
                                                        templateName: notif.option,
                                                        personasAnotificar: selectedPartsWithInfo.map(p => p.alias || p.nombre),
                                                        descripcion: notif.option,
                                                        fechaAudiencia: fechaAudiencia,
                                                        horaAudiencia: horaAudiencia,
                                                        localKey: notif.parts.join('|') + notif.option // para identificarla luego
                                                    });
                                                    continue;
                                                }

                                                // Generar PDF
                                                const firstPart = selectedPartsWithInfo.find(p => p.direccion || p.localidad || p.telefono) || {};
                                                const tiposStr = tipos.join(' - ') || '[TIPO]';
                                                const caratulaModStr = (tipos.some(t => String(t || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().includes('formalizacion')) && caratulaMod) ? caratulaMod : (data.caratula || '[CARATULA]');
                                                
                                                const datosList = {
                                                    destinatarioNombre: selectedPartsWithInfo.map(p => p.alias || p.nombre).join(', '),
                                                    destinatarioDomicilio: firstPart.direccion || '[DOMICILIO A COMPLETAR]',
                                                    destinatarioLocalidad: firstPart.localidad || '[LOCALIDAD A COMPLETAR]',
                                                    destinatarioTelefono: firstPart.telefono || '',
                                                    legajoFiscal: data.numeroLeg || '[LEGAJO]',
                                                    caratula: caratulaModStr,
                                                    tipoAudiencia: tiposStr,
                                                    fechaAudiencia: fechaAudiencia || '[FECHA]',
                                                    horaAudiencia: horaAudiencia || '[HORA]',
                                                    horaFinAudiencia: savedData.horaFinAudiencia || '[HORA FIN]',
                                                    juez: juez || '[JUEZ]',
                                                    personasACitar: notif.parts.map(pKey => {
                                                        const pInfo = availablePartsList.find(x => x.key === pKey) || { nombre: pKey, rol: '', dni: '' };
                                                        return {
                                                            nombre: pInfo.nombre + (pInfo.rol ? ` (${pInfo.rol})` : ''),
                                                            dni: pInfo.dni || '',
                                                            telefono: pInfo.telefono || '',
                                                            fecha: fechaAudiencia || '[FECHA]',
                                                            hora: horaAudiencia || '[HORA]',
                                                            horaFin: savedData.horaFinAudiencia || '[HORA FIN]'
                                                        }
                                                    })
                                                };

                                                const { buffer, textoPlano } = await descargarPdfNotificacion(notif.option, datosList, true);
                                                const bytes = new Uint8Array(buffer);
                                                let binary = '';
                                                for (let j = 0; j < bytes.byteLength; j++) { binary += String.fromCharCode(bytes[j]); }
                                                const base64Str = btoa(binary);

                                                documentosBase64.push({
                                                    nombreArchivo: `Notificacion_${notif.option}_${Date.now()}.pdf`,
                                                    base64: base64Str,
                                                    descripcion: `${data.numeroLeg} NOTIFICACION ${notif.option}`.toUpperCase(),
                                                    personasAnotificar: selectedPartsWithInfo.map(p => p.alias || p.nombre),
                                                    textoPlano: textoPlano,
                                                    localKey: notif.parts.join('|') + notif.option
                                                });
                                            }

                                            const res = await fetch('/api/agendar-puppeteer', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({
                                                    solicitud: { ...data, ...savedData },
                                                    documentosBase64: documentosBase64,
                                                    action: 'notificar-solo'
                                                })
                                            });

                                            if (!res.body) throw new Error("No response body");
                                            const reader = res.body.getReader();
                                            const decoder = new TextDecoder();
                                            let done = false;

                                            while(!done) {
                                                const { value, done: doneRead } = await reader.read();
                                                done = doneRead;
                                                const chunk = decoder.decode(value);
                                                const lines = chunk.split('\n');
                                                for (const line of lines) {
                                                    if (line.startsWith('data: ')) {
                                                        const parsed = JSON.parse(line.substring(6));
                                                        if (parsed.type === 'progress') setNotifStatus(parsed.message);
                                                        if (parsed.type === 'error') throw new Error(parsed.error);
                                                        if (parsed.type === 'done') {
                                                            setNotifStatus('✓ Notificaciones enviadas con éxito.');
                                                            const nuevasNotifs = notificaciones.map(n => {
                                                                const key = n.parts.join('|') + n.option;
                                                                // Si fue enviada en este lote, marcar como notificada
                                                                if (documentosBase64.some(d => d.localKey === key)) {
                                                                    return { ...n, notificada: true };
                                                                }
                                                                return n;
                                                            });
                                                            setNotificaciones(nuevasNotifs);
                                                            await addSolicitudData(rowKey, { ...data, ...savedData, notificaciones: nuevasNotifs });
                                                        }
                                                    }
                                                }
                                            }
                                            
                                        } catch (err) {
                                            console.error(err);
                                            setNotifStatus(`Error: ${err.message}`);
                                            alert(`Error al notificar: ${err.message}`);
                                        } finally {
                                            setIsNotificando(false);
                                        }
                                    };

                                    return (
                                        <button 
                                            className={`${styles.modalBtn} ${styles.modalBtnSave}`} 
                                            onClick={handleNotificarManual}
                                            disabled={isNotificando || !savedData.agendada}
                                            style={{
                                                opacity: (isNotificando || !savedData.agendada) ? 0.5 : 1,
                                                cursor: (isNotificando || !savedData.agendada) ? 'not-allowed' : 'pointer'
                                            }}
                                            title={!savedData.agendada ? "La audiencia debe estar agendada primero" : ""}
                                        >
                                            {isNotificando ? <><i className="fa fa-spinner fa-spin"></i> Notificando...</> : 'Notificar'}
                                        </button>
                                    );
                                })()}
                                <button className={`${styles.modalBtn} ${styles.modalBtnClose}`} onClick={onCloseNotificar}>
                                    Cerrar
                                </button>
                            </div>

                            {notifStatus && (
                                <div style={{ marginTop: '10px', fontSize: '11px', color: '#666', fontFamily: 'monospace', background: '#f5f5f5', padding: '5px', borderRadius: '4px' }}>
                                    {notifStatus}
                                </div>
                            )}

                            {/* Mostrar lista de ya notificadas */}
                            {notificaciones.some(n => n.notificada) && (
                                <div style={{ marginTop: '15px', borderTop: '1px solid #ddd', paddingTop: '10px' }}>
                                    <h5 style={{ fontSize: '12px', marginBottom: '5px', color: 'var(--green)' }}>Notificadas con éxito:</h5>
                                    <ul style={{ listStyle: 'none', padding: 0, fontSize: '11px' }}>
                                        {notificaciones.filter(n => n.notificada).map((n, idx) => (
                                            <li key={idx} style={{ marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <i className="fa fa-check-circle" style={{ color: 'var(--green)' }}></i>
                                                <span><b>{n.option}:</b> {n.parts.join(', ')}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyOk}`} style={{ textAlign: 'center', verticalAlign: 'middle', padding: '0 4px', width: '54px', minWidth: '54px' }}>
                <label className={`${styles.flagBtn}${revisado ? ` ${styles.revisadoActive}` : ''}`} style={{ height: '32px', width: '32px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                    <input type="checkbox" className={styles.revisadoCheckbox} checked={revisado}
                        onChange={(e) => { setRevisado(e.target.checked); setToSave(true) }} />
                </label>
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyOk}`} style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                <div className={styles.accionesCell}>

                    {/* Agendar — verde */}
                    <label className={`${styles.flagBtn}${agendar ? ` ${styles.agendarActive}` : ''}`}>
                        <input type="checkbox" className={styles.agendarCheckbox} checked={agendar}
                            onChange={(e) => {
                                const val = e.target.checked;
                                if (val) {
                                    if (!fechaAudiencia) return alert("Falta ingresar la fecha de la audiencia para poder agendar.");
                                    if (!sala) return alert("Falta ingresar la sala de la audiencia para poder agendar.");
                                    if (!juez) return alert("Falta ingresar el juez de la audiencia para poder agendar.");

                                    const partsImputados = availablePartsList.filter(p => (p.rol || '').toUpperCase().includes('IMPUTADO'));
                                    const activeImputados = partsImputados.length > 0 ? partsImputados : imputados;

                                    if (activeImputados.length > 0) {
                                        const algunoConSituacion = activeImputados.some(imp => imp.situacionCorporal);
                                        if (!algunoConSituacion) {
                                            return alert("¡No podés agendar! Al menos un imputado debe tener cargada la situación corporal (Libertad/Detenido).");
                                        }
                                    }
                                }
                                setAgendar(val);
                                setToSave(true);
                            }} />
                        Agendar
                    </label>

                    {/* Cancelar — naranja */}
                    <label className={`${styles.flagBtn}${cancelar ? ` ${styles.cancelarActive}` : ''}`}>
                        <input type="checkbox" className={styles.cancelarCheckbox} checked={cancelar}
                            onChange={(e) => {
                                const val = e.target.checked;
                                if (val && !savedData.agendada) {
                                    return alert("No se puede cancelar una audiencia que no ha sido programada");
                                }
                                setCancelar(val);
                                if (val) setShowCancelModal(true);
                                setToSave(true);
                            }} />
                        Cancelar
                    </label>

                    {/* Borrar — rojo */}
                    <label className={`${styles.flagBtn}${marcarBorrar ? ` ${styles.borrarActive}` : ''}`}>
                        <input type="checkbox" className={styles.borrarCheckbox} checked={marcarBorrar}
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

                    {/* Reprogramar — violeta */}
                    <label className={`${styles.flagBtn}${reprogramar ? ` ${styles.agendadoActive}` : ''}`}>
                        <input type="checkbox" className={styles.reprogramarCheckbox} checked={reprogramar}
                            onChange={(e) => {
                                const val = e.target.checked;
                                if (val && !savedData.agendada) {
                                    return alert("Audiencia sin agendar");
                                }
                                setReprogramar(val);
                                if (val) setShowReproModal(true);
                                setToSave(true);
                            }} />
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
                    {data.linkSol && savedData.urlAgendamiento ? (
                        <ExpandContent
                            label="Links"
                            empty={false}
                            btnStyle={{ background: 'var(--blue)', color: 'white', border: '1px solid var(--blue)' }}
                        >
                            <a href={data.linkSol} target="_blank" rel="noopener noreferrer">
                                🔗 Link Solicitud
                            </a>
                            <a href={savedData.urlAgendamiento} target="_blank" rel="noopener noreferrer">
                                🔗 Link Audiencia
                            </a>
                        </ExpandContent>
                    ) : (
                        <a className={`${styles.linkSolATag}`} href={savedData.urlAgendamiento || data.linkSol} target="_blank" rel="noopener noreferrer">
                            <p className={`${styles.linkSolATagText}`}>Link</p>
                        </a>
                    )}
                </div>
            </td>
            {(showReproModal || showCancelModal) && (
                <div className={styles.modalNotificarOverlay} onClick={() => { if (showReproModal) handleCloseRepro(); else handleCloseCancel(); }}>
                    <div className={styles.modalNotificarContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalTitle}>
                            <span>{showReproModal ? 'Detalles de Reprogramación' : 'Detalles de Cancelación'}</span>
                            <button 
                                className={styles.modalBtnClose} 
                                style={{ border: 'none', background: 'transparent' }} 
                                onClick={() => { if (showReproModal) handleCloseRepro(); else handleCloseCancel(); }}
                            >
                                &times;
                            </button>
                        </div>
                        <div className={styles.modalSection}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }}>
                                {showReproModal ? 'Motivo de Reprogramación' : 'Motivo de Cancelación'}
                            </label>
                            {showReproModal ? (
                                <select
                                    className={styles.modalSelect}
                                    value={motivRepro}
                                    onChange={e => { setMotivRepro(e.target.value); setToSave(true); }}
                                >
                                    <option value="">Seleccione...</option>
                                    <option value="DEMORA POR AUDIENCIA ANTERIOR">DEMORA POR AUDIENCIA ANTERIOR</option>
                                    <option value="POR ERROR DE NOTIFICACIÓN DE LA OFICINA JUDICIAL">POR ERROR DE NOTIFICACIÓN DE LA OFICINA JUDICIAL</option>
                                    <option value="POR INASISTENCIA DE PARTE">POR INASISTENCIA DE PARTE</option>
                                    <option value="POR PEDIDO DEL DEFENSOR PÚBLICO">POR PEDIDO DEL DEFENSOR PÚBLICO</option>
                                    <option value="POR PEDIDO DEL JUEZ">POR PEDIDO DEL JUEZ</option>
                                    <option value="POR PEDIDO DEL MINISTERIO PUBLICO FISCAL">POR PEDIDO DEL MINISTERIO PUBLICO FISCAL</option>
                                    <option value="POR PEDIDO DEL QUERELLANTE">POR PEDIDO DEL QUERELLANTE</option>
                                    <option value="PROBLEMA TECNICO">PROBLEMA TECNICO</option>
                                    <option value="SUPERPOSICION CON OTRA AUDIENCIA">SUPERPOSICION CON OTRA AUDIENCIA</option>
                                </select>
                            ) : (
                                <select
                                    className={styles.modalSelect}
                                    value={motivCancel}
                                    onChange={e => { setMotivCancel(e.target.value); setToSave(true); }}
                                >
                                    <option value="">Seleccione un Motivo ...</option>
                                    <option value="AMENAZA DE BOMBA">AMENAZA DE BOMBA</option>
                                    <option value="FISCALIA - DEFENSOR (DESISTE DEL PLANTEO POR ART. 228)">FISCALIA - DEFENSOR (DESISTE DEL PLANTEO POR ART. 228)</option>
                                    <option value="JUEZ - DEFENSA - FISCAL POR SUPERPOSICIÓN DE AUDIENCIA">JUEZ - DEFENSA - FISCAL POR SUPERPOSICIÓN DE AUDIENCIA</option>
                                    <option value="MENOR SE NIEGA A DECLARAR">MENOR SE NIEGA A DECLARAR</option>
                                    <option value="OFICINA JUDICIAL SIN SISTEMA / PROBLEMAS TÉCNICOS">OFICINA JUDICIAL SIN SISTEMA / PROBLEMAS TÉCNICOS</option>
                                    <option value="POR ACUERDO DE PARTES">POR ACUERDO DE PARTES</option>
                                    <option value="POR AUSENCIA DE LA VÍCTIMA">POR AUSENCIA DE LA VÍCTIMA</option>
                                    <option value="POR AUSENCIA DE MENOR TESTIGO / VICTIMA">POR AUSENCIA DE MENOR TESTIGO / VICTIMA</option>
                                    <option value="POR AUSENCIA DE RECONOCIENTE">POR AUSENCIA DE RECONOCIENTE</option>
                                    <option value="POR AUSENCIA DEL DEFENSOR PARTICULAR">POR AUSENCIA DEL DEFENSOR PARTICULAR</option>
                                    <option value="POR AUSENCIA DEL DEFENSOR PÚBLICO">POR AUSENCIA DEL DEFENSOR PÚBLICO</option>
                                    <option value="POR AUSENCIA DEL FISCAL">POR AUSENCIA DEL FISCAL</option>
                                    <option value="POR AUSENCIA DEL IMPUTADO EN LIBERTAD">POR AUSENCIA DEL IMPUTADO EN LIBERTAD</option>
                                    <option value="POR AUSENCIA DEL IMPUTADO EN PRISIÓN PREVENTIVA">POR AUSENCIA DEL IMPUTADO EN PRISIÓN PREVENTIVA</option>
                                    <option value="POR AUSENCIA DEL JUEZ / JUECES">POR AUSENCIA DEL JUEZ / JUECES</option>
                                    <option value="POR AUSENCIA DEL QUERELLANTE">POR AUSENCIA DEL QUERELLANTE</option>
                                    <option value="POR DECISIÓN DE LA OFICINA JUDICIAL">POR DECISIÓN DE LA OFICINA JUDICIAL</option>
                                    <option value="POR ERROR DE CARGA LEGAJO">POR ERROR DE CARGA LEGAJO</option>
                                    <option value="POR ERROR DE NOTIFICACIÓN DE LA OFICINA JUDICIAL">POR ERROR DE NOTIFICACIÓN DE LA OFICINA JUDICIAL</option>
                                    <option value="POR ERROR DE PROGRAMACION">POR ERROR DE PROGRAMACION</option>
                                    <option value="POR PEDIDO DE LA DEFENSA">POR PEDIDO DE LA DEFENSA</option>
                                    <option value="POR PEDIDO DEL DEFENSOR PÚBLICO">POR PEDIDO DEL DEFENSOR PÚBLICO</option>
                                    <option value="POR PEDIDO DEL JUEZ">POR PEDIDO DEL JUEZ</option>
                                    <option value="POR PEDIDO DEL MINISTERIO PUBLICO FISCAL">POR PEDIDO DEL MINISTERIO PUBLICO FISCAL</option>
                                    <option value="POR PEDIDO DEL QUERELLANTE">POR PEDIDO DEL QUERELLANTE</option>
                                    <option value="POR PETICIÓN DE LAS PARTES">POR PETICIÓN DE LAS PARTES</option>
                                </select>
                            )}

                            <label style={{ display: 'block', marginTop: '16px', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }}>Observaciones</label>
                            <textarea
                                className={styles.modalInput}
                                style={{ height: '100px', resize: 'vertical' }}
                                value={showReproModal ? obsRepro : obsCancel}
                                onChange={e => {
                                    if (showReproModal) setObsRepro(e.target.value);
                                    else setObsCancel(e.target.value);
                                    setToSave(true);
                                }}
                                placeholder="Ingrese observaciones..."
                            />
                        </div>
                        <div className={styles.modalButtonGroup}>
                            <button className={styles.modalBtn} onClick={() => { if (showReproModal) handleCloseRepro(); else handleCloseCancel(); }}>Aceptar</button>
                        </div>
                    </div>
                </div>
            )}
        </tr>
    )
}