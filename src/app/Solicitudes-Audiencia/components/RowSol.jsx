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
    const [defensa, setDefensa] = useState(savedData.defensa || (data.intervinientes?.defensor_oficial?.map(x => x.nombre || x).join(', ') || data.intervinientes?.defensor_particular?.map(x => x.nombre || x).join(', ') || ''))
    const [fiscal, setFiscal] = useState(savedData.fiscal || (data.intervinientes?.fiscal?.map(x => x.nombre || x).join(', ') ?? ''))
    const [juez, setJuez] = useState(savedData.juez || (data.intervinientes?.juez?.map(x => x.nombre || x).join(', ') ?? ''))
    const [motivo, setMotivo] = useState(savedData.motivo || (data.intervinientes?.motivo?.map(x => x.nombre || x).join(', ') ?? ''))
    const [fechaAudiencia, setFechaAudiencia] = useState(savedData.fechaAudiencia || (data.intervinientes?.fecha_audiencia?.map(x => x.nombre || x).join(', ') ?? ''))
    const [horaAudiencia, setHoraAudiencia] = useState(savedData.horaAudiencia || (data.intervinientes?.hora_audiencia?.map(x => x.nombre || x).join(', ') ?? ''))
    const [sala, setSala] = useState(savedData.sala || (data.intervinientes?.sala?.map(x => x.nombre || x).join(', ') ?? ''))
    const [juezCausa, setJuezCausa] = useState(savedData.juezCausa || (data.intervinientes?.juez_causa?.map(x => x.nombre || x).join(', ') ?? ''))
    const [comentario, setComentario] = useState(savedData.comentario || (data.intervinientes?.comentario?.map(x => x.nombre || x).join(', ') ?? ''))
    const [caratulaMod, setCaratulaMod] = useState(savedData.caratulaMod || data.caratula || '')
    const [imputados, setImputados] = useState(() => {
        const list = savedData.imputados || data.intervinientes?.imputado || [];
        return list.map(item => {
            if (typeof item === 'string') return { nombre: item, dni: '' };
            return { nombre: item.nombre || '', dni: item.dni || '', representadoPor: item.representadoPor || [] };
        });
    })
    const [newNombre, setNewNombre] = useState('')
    const [newDni, setNewDni] = useState('')
    const [showAddTipo, setShowAddTipo] = useState(false)
    const [showAddImputado, setShowAddImputado] = useState(false)
    const [filterPartes, setFilterPartes] = useState('')
    const [filterPartesSol, setFilterPartesSol] = useState('')
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
        return list
    }, [partesLegajo, data.partesLegajo])
    const [agendar, setAgendar] = useState(savedData.agendar ?? false)
    const [revisado, setRevisado] = useState(savedData.revisado ?? false)
    const [marcarBorrar, setMarcarBorrar] = useState(savedData.marcarBorrar ?? false)
    const [reprogramar, setReprogramar] = useState(savedData.reprogramar ?? false)
    const [cancelar, setCancelar] = useState(savedData.cancelar ?? false)
    const [tiposOriginales, setTiposOriginales] = useState(savedData.tiposOriginales || null)
    const [reconversionMotivo, setReconversionMotivo] = useState(savedData.reconversionMotivo || '')
    const [showReconversionModal, setShowReconversionModal] = useState(false)
    const [pendingReconversionTipos, setPendingReconversionTipos] = useState(null)
    const [convertirJurisdiccional, setConvertirJurisdiccional] = useState(savedData.convertirJurisdiccional ?? false)
    const [convertirJurisdiccionalTipo, setConvertirJurisdiccionalTipo] = useState(savedData.convertirJurisdiccionalTipo || '')
    const [showConvertirModal, setShowConvertirModal] = useState(false)
    const [convertirJurisdiccionalMotivo, setConvertirJurisdiccionalMotivo] = useState(savedData.convertirJurisdiccionalMotivo || '')
    const [newConvertirTipo, setNewConvertirTipo] = useState('')
    const [tipoT, setTipoT] = useState(true)
    const [sitCorporalT, setSitCorporalT] = useState(true)
    const [vencimientoT, setVencimientoT] = useState(true)
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
        } else {
            if (notificaciones.some(n => n.notificada)) {
                setNotificaciones(prev => prev.map(n => ({ ...n, notificada: false })));
            }
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
        const getBaseValue = (field, scraperValue, isArray = false) => {
            if (savedData && savedData[field] !== undefined) return savedData[field];
            return isArray ? (scraperValue || []) : (scraperValue || '');
        };

        const getTiposBase = () => {
            if (savedData && savedData.tipos) return savedData.tipos;
            if (savedData && savedData.tipo) return [savedData.tipo];
            if (data.tipo) return [data.tipo];
            return [];
        }

        const getNames = (arr) => arr ? arr.map(x => (typeof x === 'object' ? x.nombre : x)).filter(Boolean).join(', ') : '';
        const normalizePartesLegajo = (sourcePartes) => {
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
                    situacionDetalle: p.situacionDetalle || '',
                    enSolicitud: p.enSolicitud || false,
                    agregadaEnPuppeteer: p.agregadaEnPuppeteer || false,
                    agregadaOriginalmente: p.agregadaOriginalmente !== undefined ? p.agregadaOriginalmente : true
                }))
            }
            if (sourcePartes && typeof sourcePartes === 'object') {
                const converted = []
                Object.keys(sourcePartes).forEach(roleKey => {
                    const roleName = roleKey.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
                    const persons = sourcePartes[roleKey]
                    if (Array.isArray(persons)) {
                        persons.forEach(person => converted.push({
                            nombre: person, rol: roleName,
                            direccion: '', localidad: '', telefono: '', dni: '', alias: '',
                            situacionCorporal: '', situacionDetalle: '',
                            enSolicitud: false, agregadaEnPuppeteer: false, agregadaOriginalmente: true
                        }))
                    }
                })
                return converted
            }
            return []
        }

        const hasChanges = (
            JSON.stringify(tipos) !== JSON.stringify(getTiposBase()) ||
            (sitCorporal || '') !== getBaseValue('sitCorporal', data.sitCorporal) ||
            (vencimiento || '') !== getBaseValue('vencimiento', data.vencimiento) ||
            (defensa || '') !== getBaseValue('defensa', getNames(data.intervinientes?.defensor_oficial) || getNames(data.intervinientes?.defensor_particular)) ||
            (fiscal || '') !== getBaseValue('fiscal', getNames(data.intervinientes?.fiscal)) ||
            (juez || '') !== getBaseValue('juez', getNames(data.intervinientes?.juez)) ||
            (motivo || '') !== getBaseValue('motivo', getNames(data.intervinientes?.motivo)) ||
            (fechaAudiencia || '') !== getBaseValue('fechaAudiencia', getNames(data.intervinientes?.fecha_audiencia)) ||
            (horaAudiencia || '') !== getBaseValue('horaAudiencia', getNames(data.intervinientes?.hora_audiencia)) ||
            (sala || '') !== getBaseValue('sala', getNames(data.intervinientes?.sala)) ||
            (juezCausa || '') !== getBaseValue('juezCausa', getNames(data.intervinientes?.juez_causa)) ||
            (comentario || '') !== getBaseValue('comentario', getNames(data.intervinientes?.comentario)) ||
            (caratulaMod || '') !== getBaseValue('caratulaMod', data.caratula) ||
            JSON.stringify(imputados) !== JSON.stringify((() => {
                const list = savedData.imputados || data.intervinientes?.imputado || [];
                return list.map(item => typeof item === 'string' ? { nombre: item, dni: '' } : { nombre: item.nombre || '', dni: item.dni || '' });
            })()) ||
            JSON.stringify(partesLegajo) !== JSON.stringify(normalizePartesLegajo(savedData?.partesLegajo || data.partesLegajo)) ||

            JSON.stringify(notificaciones) !== JSON.stringify(getBaseValue('notificaciones', [], true)) ||
            agendar !== (savedData.agendar ?? false) ||
            revisado !== (savedData.revisado ?? false) ||
            marcarBorrar !== (savedData.marcarBorrar ?? false) ||
            reprogramar !== (savedData.reprogramar ?? false) ||
            cancelar !== (savedData.cancelar ?? false) ||
            motivRepro !== (savedData.motivRepro || '') ||
            obsRepro !== (savedData.obsRepro || '') ||
            horaFinAudiencia !== (savedData.horaFinAudiencia || (data.intervinientes?.hora_fin_audiencia?.join(', ') ?? '')) ||
            motivCancel !== (savedData.motivCancel || '') ||
            obsCancel !== (savedData.obsCancel || '') ||
            JSON.stringify(tiposOriginales) !== JSON.stringify(savedData.tiposOriginales || null) ||
            reconversionMotivo !== (savedData.reconversionMotivo || '') ||
            convertirJurisdiccional !== (savedData.convertirJurisdiccional ?? false) ||
            convertirJurisdiccionalTipo !== (savedData.convertirJurisdiccionalTipo || '') ||
            convertirJurisdiccionalMotivo !== (savedData.convertirJurisdiccionalMotivo || '')
        )
        setToSave(hasChanges)
    }

    useEffect(() => {
        if (hasInitialSync.current) return;

        if (solicitudesPendientes && Array.isArray(solicitudesPendientes)) {
            const saved = solicitudesPendientes.find(item => item.rowKey === rowKey) || {}

            const syncField = (savedVal, scraperVal) => {
                return savedVal !== undefined ? savedVal : (scraperVal || '');
            };

            setTipos(saved.tipos !== undefined ? saved.tipos : (saved.tipo ? [saved.tipo] : (data.tipo ? [data.tipo] : [])))
            setSitCorporal(syncField(saved.sitCorporal, data.sitCorporal))
            setVencimiento(syncField(saved.vencimiento, data.vencimiento))
            const getNames = (arr) => arr ? arr.map(x => (typeof x === 'object' ? x.nombre : x)).filter(Boolean).join(', ') : '';

            setDefensa(syncField(saved.defensa, getNames(data.intervinientes?.defensor_oficial) || getNames(data.intervinientes?.defensor_particular)))
            setFiscal(syncField(saved.fiscal, getNames(data.intervinientes?.fiscal)))
            setJuez(syncField(saved.juez, getNames(data.intervinientes?.juez)))
            setMotivo(syncField(saved.motivo, getNames(data.intervinientes?.motivo)))
            setFechaAudiencia(syncField(saved.fechaAudiencia, getNames(data.intervinientes?.fecha_audiencia)))
            setHoraAudiencia(syncField(saved.horaAudiencia, getNames(data.intervinientes?.hora_audiencia)))
            setSala(syncField(saved.sala, getNames(data.intervinientes?.sala)))
            setJuezCausa(syncField(saved.juezCausa, getNames(data.intervinientes?.juez_causa)))
            setComentario(syncField(saved.comentario, getNames(data.intervinientes?.comentario)))
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
                    situacionDetalle: p.situacionDetalle || '',
                    enSolicitud: p.enSolicitud || false,
                    agregadaEnPuppeteer: p.agregadaEnPuppeteer || false,
                    agregadaOriginalmente: p.agregadaOriginalmente !== undefined ? p.agregadaOriginalmente : true
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

            setNotificaciones(saved.notificaciones || [])
            setMotivRepro(saved.motivRepro || '')
            setObsRepro(saved.obsRepro || '')
            setHoraFinAudiencia(saved.horaFinAudiencia || (data.intervinientes?.hora_fin_audiencia?.join(', ') ?? ''))
            setMotivCancel(saved.motivCancel || '')
            setObsCancel(saved.obsCancel || '')
            setTiposOriginales(saved.tiposOriginales || null)
            setReconversionMotivo(saved.reconversionMotivo || '')
            setConvertirJurisdiccional(saved.convertirJurisdiccional ?? false)
            setConvertirJurisdiccionalTipo(saved.convertirJurisdiccionalTipo || '')
            setConvertirJurisdiccionalMotivo(saved.convertirJurisdiccionalMotivo || '')
            setTimeout(() => {
                hasInitialSync.current = true
            }, 800)
        }
    }, [solicitudesPendientes, data])

    useEffect(() => {
        checkForDiff()
    }, [tipos, sitCorporal, vencimiento, defensa, fiscal, juez, motivo, fechaAudiencia, horaAudiencia, sala, juezCausa])

    useEffect(() => {
        checkChanges()
    }, [tipos, sitCorporal, vencimiento, defensa, fiscal, juez, motivo, fechaAudiencia, horaAudiencia, sala, juezCausa, comentario, imputados, partesLegajo, notificaciones, agendar, revisado, marcarBorrar, reprogramar, cancelar, savedData, motivRepro, obsRepro, horaFinAudiencia, motivCancel, obsCancel, tiposOriginales, reconversionMotivo, convertirJurisdiccional, convertirJurisdiccionalTipo, convertirJurisdiccionalMotivo])

    useEffect(() => {
        const saveRow = async () => {
            if (doSave) {
                if (marcarBorrar) {
                    await removeSolicitudPendiente(rowKey)
                } else {
                    const newTiposOriginales = tiposOriginales || (tipos.length > 0 ? [...tipos] : null)
                    if (!tiposOriginales && tipos.length > 0) setTiposOriginales(newTiposOriginales)

                    await addSolicitudData(rowKey, {
                        ...data,
                        rowKey,
                        numeroLeg: data.numeroLeg,
                        fyhcreacion: data.fyhcreacion,
                        tipos, sitCorporal, vencimiento, defensa, fiscal,
                        juez, motivo, fechaAudiencia, horaAudiencia, sala, juezCausa, comentario, caratulaMod,
                        imputados, partesLegajo, notificaciones, agendar, revisado, marcarBorrar, reprogramar, cancelar,
                        motivRepro, obsRepro, horaFinAudiencia, motivCancel, obsCancel,
                        tiposOriginales: newTiposOriginales,
                        reconversionMotivo,
                        convertirJurisdiccional, convertirJurisdiccionalTipo, convertirJurisdiccionalMotivo,
                        ...(reprogramar ? { documentosSubidos: false } : {})
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
            '--sticky-col-override': 'linear-gradient(rgba(239, 68, 68, 0.12), rgba(239, 68, 68, 0.12)), var(--sticky-col)',
            background: 'rgba(239, 68, 68, 0.12)',
        }
        if (savedData.agendada) return {
            '--row-input-tint': 'rgba(16, 185, 129, 0.1)',
            '--sticky-col-override': 'linear-gradient(rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.15)), var(--sticky-col)',
            background: 'rgba(16, 185, 129, 0.15)',
            borderLeft: '4px solid #10b981'
        }
        if (cancelar) return {
            '--row-input-tint': 'rgba(251, 146, 60, 0.08)',
            '--sticky-col-override': 'linear-gradient(rgba(251, 146, 60, 0.10), rgba(251, 146, 60, 0.10)), var(--sticky-col)',
            background: 'rgba(251, 146, 60, 0.10)',
        }
        if (reprogramar) return {
            '--row-input-tint': 'rgba(168, 85, 247, 0.07)',
            '--sticky-col-override': 'linear-gradient(rgba(168, 85, 247, 0.08), rgba(168, 85, 247, 0.08)), var(--sticky-col)',
            background: 'rgba(168, 85, 247, 0.08)',
        }
        if (marcarBorrar) return {
            '--row-input-tint': 'rgba(220, 38, 38, 0.10)',
            '--sticky-col-override': 'linear-gradient(rgba(220, 38, 38, 0.20), rgba(220, 38, 38, 0.20)), var(--sticky-col)',
            background: 'rgba(220, 38, 38, 0.20)',
        }
        if (revisado) return {
            '--row-input-tint': 'rgba(59, 130, 246, 0.07)',
            '--sticky-col-override': 'linear-gradient(rgba(59, 130, 246, 0.08), rgba(59, 130, 246, 0.08)), var(--sticky-col)',
            background: 'rgba(59, 130, 246, 0.08)',
        }
        if (agendar) return {
            '--row-input-tint': 'rgba(34, 197, 94, 0.08)',
            '--sticky-col-override': 'linear-gradient(rgba(34, 197, 94, 0.10), rgba(34, 197, 94, 0.10)), var(--sticky-col)',
            background: 'rgba(34, 197, 94, 0.10)',
        }
        return {}
    })()

    return (
        <tr className={styles.tableRow} style={rowStyle} title={savedData.agendadaError ? `Error de agendamiento: ${savedData.agendadaError}` : (savedData.agendada ? '¡Audiencia Agendada con Éxito!' : '')}>
            <td className={`${styles.cellBodyFixed}${data.urgente ? ` ${styles.urgenteCell}` : ''}`}>
                {data.urgente && <span className={styles.urgenteLabel}>⚠ Urgente</span>}
                {savedData.agendada && <span className={styles.agendadaSuccessDot} title="Agendada en PUMA"></span>}
                {savedData.agendadaError && <span className={styles.agendadaErrorDot} title="Error en PUMA"></span>}
                {data.numeroLeg}
            </td>
            <td className={`${styles.cellBodyFixed}`}><div className={styles.scrollCell}>{data.fyhcreacion}</div></td>
            <td className={`${styles.cellBodyFixed}`}><div className={styles.scrollCell}>{data.solicitante}</div></td>
            <td className={`${styles.cellBodyFixed}`} style={{ position: 'relative' }}>
                <div className={styles.scrollCellTargetRelative}>
                    {tiposOriginales && tipos.length > 0 && JSON.stringify(tiposOriginales) !== JSON.stringify(tipos) && (
                        <div className={styles.reconversionBubbleWrapper}>
                            <span
                                className={styles.reconversionBubbleSpin}
                                title={`Reconversión - ${tiposOriginales.join(', ')}`}
                            >
                                ↻
                            </span>
                        </div>
                    )}
                    {tipos.map((t, i) => (
                        <div key={i} className={`${styles.listPill} ${styles.pillTipo}`}>
                            <div className={styles.listPillInfo}>
                                <span className={styles.listNombre}>{t}</span>
                            </div>
                            <button
                                className={styles.listDeleteBtn}
                                onClick={() => {
                                    const updated = tipos.filter((_, idx) => idx !== i)
                                    const esTipoOriginal = tiposOriginales && tiposOriginales.includes(t)
                                    if (esTipoOriginal && updated.length >= 0) {
                                        setPendingReconversionTipos(updated)
                                        if (!reconversionMotivo) {
                                            setShowReconversionModal(true)
                                        } else {
                                            setTipos(updated)
                                            setToSave(true)
                                        }
                                    } else {
                                        setTipos(updated)
                                        setToSave(true)
                                    }
                                }}
                                title="Eliminar"
                            >✕</button>
                        </div>
                    ))}
                    {showAddTipo ? (
                        <div style={{ position: 'absolute', left: '0px', right: '0px', bottom: '0px', background: 'var(--surface)', zIndex: 20, display: 'flex', flexDirection: 'row', alignItems: 'center', padding: '4px', borderTop: '1px solid var(--border)', boxShadow: '0 -2px 6px rgba(0,0,0,0.1)', gap: '4px', paddingRight: '26px' }}>
                            <input
                                list={`tipos-datalist-${rowKey}`}
                                className={styles.listAddInput}
                                placeholder="Nuevo Tipo..."
                                value={newTipo}
                                onChange={e => setNewTipo(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        if (!newTipo.trim()) { setShowAddTipo(false); return; }
                                        setTipos(prev => [...prev, newTipo.trim()]);
                                        setNewTipo(''); setToSave(true); setShowAddTipo(false);
                                    }
                                }}
                                style={{ flex: 1, minHeight: '22px', margin: 0 }}
                                autoFocus
                            />
                            <button
                                className={styles.listAddBtn}
                                style={{ width: 'auto', padding: '0 8px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', height: '22px', display: 'flex', alignItems: 'center' }}
                                onClick={() => {
                                    if (!newTipo.trim()) { setShowAddTipo(false); return; }
                                    setTipos(prev => [...prev, newTipo.trim()]);
                                    setNewTipo(''); setToSave(true); setShowAddTipo(false);
                                }}
                            >Agregar</button>
                            <button
                                onClick={() => setShowAddTipo(false)}
                                style={{ position: 'absolute', bottom: '2px', right: '2px', width: '20px', height: '20px', padding: '0', borderRadius: '50%', background: '#ef4444', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', cursor: 'pointer', zIndex: 30 }}
                                title="Cerrar"
                            >&times;</button>
                        </div>
                    ) : (
                        <button
                            className={styles.listAddBtn}
                            style={{ position: 'absolute', bottom: '2px', right: '2px', width: '20px', height: '20px', padding: '0', borderRadius: '50%', opacity: 0.6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', zIndex: 1 }}
                            onClick={() => setShowAddTipo(true)}
                            title="Agregar Tipo"
                        >+</button>
                    )}
                    <datalist id={`tipos-datalist-${rowKey}`}>
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
            <td className={`${styles.cellBodyFixed}`} style={{ position: 'relative' }}>
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
                    {showAddImputado ? (
                        <div style={{ position: 'absolute', left: '0px', right: '0px', bottom: '0px', background: 'var(--surface)', zIndex: 20, display: 'flex', flexDirection: 'row', alignItems: 'center', padding: '4px', borderTop: '1px solid var(--border)', boxShadow: '0 -2px 6px rgba(0,0,0,0.1)', gap: '4px', paddingRight: '26px' }}>
                            <select
                                className={styles.listAddInput}
                                value={`${newNombre}|${newDni}`}
                                onChange={e => {
                                    if (e.target.value === '|') {
                                        setNewNombre(''); setNewDni('');
                                    } else {
                                        const [nombre, dni] = e.target.value.split('|');
                                        setNewNombre(nombre); setNewDni(dni);
                                    }
                                }}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        if (!newNombre.trim()) { setShowAddImputado(false); return; }
                                        setImputados(prev => [...prev, { nombre: newNombre.trim(), dni: newDni.trim() || null }]);
                                        setNewNombre(''); setNewDni(''); setToSave(true); setShowAddImputado(false);
                                    }
                                }}
                                style={{ flex: 1, minWidth: '0', minHeight: '22px', margin: 0, paddingLeft: '4px' }}
                                autoFocus
                            >
                                <option value="|">Seleccionar imputado...</option>
                                {availablePartsList
                                    .filter(p => p.rol && p.rol.toLowerCase().includes('imputado'))
                                    .filter(p => !imputados.some(imp => imp.nombre === p.nombre))
                                    .map((p, idx) => (
                                        <option key={idx} value={`${p.nombre}|${p.dni || ''}`}>{p.nombre} {p.dni ? `(${p.dni})` : ''}</option>
                                    ))}
                            </select>
                            <button
                                className={styles.listAddBtn}
                                style={{ width: 'auto', padding: '0 8px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', height: '22px', display: 'flex', alignItems: 'center' }}
                                onClick={() => {
                                    if (!newNombre.trim()) { setShowAddImputado(false); return; }
                                    setImputados(prev => [...prev, { nombre: newNombre.trim(), dni: newDni.trim() || null }]);
                                    setNewNombre(''); setNewDni(''); setToSave(true); setShowAddImputado(false);
                                }}
                            >Agregar</button>
                            <button
                                onClick={() => setShowAddImputado(false)}
                                style={{ position: 'absolute', bottom: '2px', right: '2px', width: '20px', height: '20px', padding: '0', borderRadius: '50%', background: '#ef4444', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', cursor: 'pointer', zIndex: 30 }}
                                title="Cerrar"
                            >&times;</button>
                        </div>
                    ) : (
                        <button
                            className={styles.listAddBtn}
                            style={{ position: 'absolute', bottom: '2px', right: '2px', width: '20px', height: '20px', padding: '0', borderRadius: '50%', opacity: 0.6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', zIndex: 1 }}
                            onClick={() => setShowAddImputado(true)}
                            title="Agregar Imputado"
                        >+</button>
                    )}
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
                        <div className={`${styles.modalNotificarContent} ${styles.partesOverlayContent}`} onClick={e => e.stopPropagation()}>
                            <div className={`${styles.modalTitle} ${styles.modalTitleFlex}`}>
                                <span>Gestión de Partes</span>
                                <button
                                    className={`${styles.modalBtnClose} ${styles.modalBtnCloseNoBorder}`}
                                    style={{ fontSize: '24px', lineHeight: '1', padding: '0 8px', borderRadius: '4px' }}
                                    onClick={onClosePartesLegajo}
                                    title="Cerrar"
                                >
                                    &times;
                                </button>
                            </div>

                            <div className={styles.partesFlexWrapper}>
                                <div className={`${styles.modalSection} ${styles.partesPanel}`}>
                                    <div className={styles.partesHeader}>
                                        <h4 className={styles.modalSectionTitle} style={{ margin: 0, border: 'none' }}>Partes del Legajo</h4>
                                        <input
                                            className={`${styles.modalInput} ${styles.partesSearchInput}`}
                                            placeholder="Buscar en legajo..."
                                            value={filterPartes}
                                            onChange={e => setFilterPartes(e.target.value)}
                                        />
                                    </div>
                                    <div className={styles.partesListWrapper}>
                                        {(!Array.isArray(partesLegajo) || partesLegajo.length === 0) && <p className={styles.partesEmpty}>No hay partes extraídas.</p>}
                                        {(Array.isArray(partesLegajo) ? partesLegajo : [])
                                            .filter(p => {
                                                const lower = filterPartes.toLowerCase();
                                                return p.nombre.toLowerCase().includes(lower) || p.rol.toLowerCase().includes(lower);
                                            })
                                            .map((parte, idx) => {
                                                const originalIdx = partesLegajo.findIndex(orig => orig === parte);
                                                const isInSolicitud = parte.enSolicitud;

                                                return (
                                                    <div key={idx} className={styles.parteCard}>
                                                        <div className={styles.parteCardHeader}>
                                                            <div>
                                                                <strong className={styles.parteName}>{parte.nombre}</strong>
                                                                <span className={styles.parteRolPill}>{parte.rol}</span>
                                                            </div>
                                                            <div className={styles.parteStatusFlex}>
                                                                {parte.agregadaOriginalmente === false ? (
                                                                    <span className={styles.parteStatusOrange} title={parte.agregadaEnPuppeteer ? 'Agregado en PUMA' : 'Pendiente de agregar en PUMA'}>
                                                                        {parte.agregadaEnPuppeteer ? '✓ PUMA' : 'Cargada Manual'}
                                                                    </span>
                                                                ) : (
                                                                    <span className={styles.parteStatusGray}>Original de Legajo</span>
                                                                )}
                                                                <button
                                                                    className={`${styles.parteAddBtn} ${isInSolicitud ? styles.parteAddBtnDisabled : styles.parteAddBtnActive}`}
                                                                    disabled={isInSolicitud}
                                                                    onClick={() => {
                                                                        const updated = [...partesLegajo];
                                                                        updated[originalIdx] = { ...parte, enSolicitud: true };
                                                                        setPartesLegajo(updated);
                                                                        setToSave(true);
                                                                    }}
                                                                >
                                                                    {isInSolicitud ? 'En Solicitud' : 'Añadir a Solic →'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                        {/* Restante de detalles igual... */}
                                                        <div className={styles.parteFieldsGrid}>
                                                            <div className={styles.parteFieldCol}>
                                                                <label className={styles.parteFieldLabel}>DNI:</label>
                                                                <input className={`${styles.modalInput} ${styles.parteFieldInput}`} value={parte.dni || ''} onChange={e => { const updated = [...partesLegajo]; updated[originalIdx] = { ...parte, dni: e.target.value }; setPartesLegajo(updated); setToSave(true); }} placeholder="DNI..." />
                                                            </div>
                                                            <div className={styles.parteFieldCol}>
                                                                <label className={styles.parteFieldLabel}>Teléfono:</label>
                                                                <input className={`${styles.modalInput} ${styles.parteFieldInput}`} value={parte.telefono || ''} onChange={e => { const updated = [...partesLegajo]; updated[originalIdx] = { ...parte, telefono: e.target.value }; setPartesLegajo(updated); setToSave(true); }} placeholder="Teléfono..." />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                    </div>
                                    <div className={styles.partesNewBlock}>
                                        <h5 className={styles.partesNewTitle}>+ Nueva Parte al Legajo</h5>
                                        <div className={styles.partesNewFlex}>
                                            <input className={`${styles.modalInput} ${styles.parteNewInputName}`} placeholder="Nombre" value={notifNewName} onChange={e => setNotifNewName(e.target.value)} />
                                            <input list={`motivos-datalist-${rowKey}`} className={`${styles.modalInput} ${styles.parteNewInputRole}`} placeholder="Rol" value={notifNewRole} onChange={e => setNotifNewRole(e.target.value)} />
                                            <button className={`${styles.modalBtn} ${styles.parteNewBtn}`} onClick={() => {
                                                if (!notifNewName.trim() || !notifNewRole.trim()) return;
                                                setPartesLegajo(prev => [...prev, { nombre: notifNewName.trim(), rol: notifNewRole.trim(), agregadaOriginalmente: false }]);
                                                setNotifNewName(''); setNotifNewRole(''); setToSave(true);
                                            }}>+ Ag</button>
                                        </div>
                                    </div>
                                </div>

                                {/* PANEL DERECHO: SOLICITUD */}
                                <div className={`${styles.modalSection} ${styles.partesPanel}`}>
                                    <div className={styles.partesHeader}>
                                        <h4 className={styles.modalSectionTitle} style={{ margin: 0, border: 'none' }}>Partes de la Solicitud</h4>
                                        <input
                                            className={`${styles.modalInput} ${styles.partesSearchInput}`}
                                            placeholder="Buscar en solicitud..."
                                            value={filterPartesSol}
                                            onChange={e => setFilterPartesSol(e.target.value)}
                                        />
                                    </div>
                                    <p className={styles.partesSubtext}>Estas partes serán tomadas en cuenta para el agendamiento y notificaciones.</p>

                                    <div className={styles.partesListWrapper}>
                                        {partesLegajo.filter(p => p.enSolicitud).length === 0 && <p className={styles.partesEmpty}>No se han agregado partes a la solicitud aún.</p>}
                                        {partesLegajo
                                            .filter(p => p.enSolicitud)
                                            .filter(p => {
                                                const lower = filterPartesSol.toLowerCase();
                                                return p.nombre.toLowerCase().includes(lower) || p.rol.toLowerCase().includes(lower);
                                            })
                                            .map((parteSol, idx) => {
                                                const originalIdx = partesLegajo.findIndex(orig => orig === parteSol);
                                                return (
                                                    <div key={idx} className={styles.parteSolCard}>
                                                        <div className={styles.parteSolHeader}>
                                                            <div>
                                                                <strong className={styles.parteSolName}>{parteSol.nombre}</strong>
                                                                <span className={styles.parteSolRolPill}>{parteSol.rol}</span>
                                                            </div>
                                                            <div className={styles.parteStatusFlex}>
                                                                {parteSol.agregadaOriginalmente === false ? (
                                                                    <span className={styles.parteStatusOrange}>Agregada Manual</span>
                                                                ) : (
                                                                    <span className={styles.parteStatusGray}>Extraída Automática</span>
                                                                )}
                                                                <button
                                                                    className={styles.parteSolRemoveBtn}
                                                                    onClick={() => {
                                                                        const updated = [...partesLegajo];
                                                                        updated[originalIdx] = { ...parteSol, enSolicitud: false };
                                                                        setPartesLegajo(updated);
                                                                        setToSave(true);
                                                                    }}
                                                                    title="Quitar de Solicitud"
                                                                >✕</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>

                                </div>
                            </div>

                            <div className={`${styles.modalButtonGroup} ${styles.partesFooter}`}>
                                <button className={styles.modalBtn} onClick={onClosePartesLegajo}>
                                    Listo
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </td>
            <td className={cell(sitCorporalT)}>
                <textarea className={styles.inputCell} value={sitCorporal} onChange={e => setSitCorporal(e.target.value)} />
            </td>

            <td className={cell(vencimientoT)}>
                <input type="datetime-local" className={styles.inputCell} value={vencimiento} onChange={e => { setVencimiento(e.target.value); setToSave(true) }} />
            </td>
            <td className={`${cell(defensaT)} ${styles.cellBodyActions}`} style={{ position: 'relative' }}>
                <SelectorDropdown
                    title="Defensores"
                    options={[...new Set(availablePartsList
                        .filter(p => p.rol && p.rol.toLowerCase().includes('defens'))
                        .map(p => p.nombre))]}
                    onSelect={(val) => {
                        setDefensa(prev => prev ? prev + ', ' + val : val);
                        setToSave(true);
                    }}
                />
                <textarea className={styles.inputCell} value={defensa} onChange={e => setDefensa(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed}`}><div className={styles.scrollCell}>{data.ufi}</div></td>
            <td className={`${cell(fiscalT)} ${styles.cellBodyActions}`} style={{ position: 'relative' }}>
                <SelectorDropdown
                    title="Fiscales"
                    options={[...new Set(availablePartsList
                        .filter(p => p.rol && p.rol.toLowerCase().includes('fiscal'))
                        .map(p => p.nombre))]}
                    onSelect={(val) => {
                        setFiscal(prev => prev ? prev + ', ' + val : val);
                        setToSave(true);
                    }}
                />
                <textarea className={styles.inputCell} value={fiscal} onChange={e => setFiscal(e.target.value)} />
            </td>
            <td className={`${cell(juezT)} ${styles.cellBodyActions}`} style={{ position: 'relative' }}>
                <SelectorDropdown
                    title="Jueces"
                    options={data.jueces || []}
                    onSelect={(val) => setJuez(val)}
                />
                <input
                    list={`jueces-datalist-${rowKey}`}
                    className={styles.inputCell}
                    value={juez}
                    onChange={e => { setJuez(e.target.value); setToSave(true) }}
                    placeholder="Buscar juez..."
                    autoComplete="off"
                />
                <datalist id={`jueces-datalist-${rowKey}`}>
                    {(Array.isArray(desplegables?.juecesPuma) ? desplegables.juecesPuma : []).map((j, idx) => (
                        <option key={idx} value={j} />
                    ))}
                </datalist>
            </td>
            <td className={cell(motivoT)}>
                <textarea className={styles.inputCell} value={motivo} onChange={e => setMotivo(e.target.value)} />
            </td>
            <td className={cell(fechaAudienciaT)}>
                <input type="date" className={styles.inputCell} value={fechaAudiencia} onChange={e => { setFechaAudiencia(e.target.value); setToSave(true) }} />
            </td>
            <td className={cell(horaAudienciaT)}>
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <input type="time" className={styles.inputCell} style={{ height: '50%' }} value={horaAudiencia} onChange={e => { setHoraAudiencia(e.target.value); setToSave(true) }} placeholder="Inicio" />
                    <input type="time" className={styles.inputCell} style={{ height: '50%', borderTop: '1px solid var(--border)' }} value={horaFinAudiencia} onChange={e => { setHoraFinAudiencia(e.target.value); setToSave(true) }} placeholder="Fin" />
                </div>
            </td>
            <td className={cell(salaT)}>
                <select className={styles.inputCell} value={sala} onChange={e => { setSala(e.target.value); setToSave(true) }}>
                    <option value="">(Sin Sala)</option>
                    {(Array.isArray(desplegables?.salas) ? desplegables.salas : []).map((s, idx) => (
                        <option key={idx} value={s}>{s}</option>
                    ))}
                    {sala && !(Array.isArray(desplegables?.salas) ? desplegables.salas : []).includes(sala) && (
                        <option value={sala}>{sala}</option>
                    )}
                </select>
            </td>
            <td className={cell(juezCausaT)}>
                <select className={styles.inputCell} value={juezCausa} onChange={e => { setJuezCausa(e.target.value); setToSave(true) }}>
                    <option value="">(Sin Juez de Causa)</option>
                    {(Array.isArray(desplegables?.juecesPuma) ? desplegables.juecesPuma : []).map((j, idx) => (
                        <option key={idx} value={j}>{j}</option>
                    ))}
                    {juezCausa && !(Array.isArray(desplegables?.juecesPuma) ? desplegables.juecesPuma : []).includes(juezCausa) && (
                        <option value={juezCausa}>{juezCausa}</option>
                    )}
                </select>
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
                            {notificaciones.filter(n => n.notificada).length > 0 && notificaciones.filter(n => !n.notificada).length === 0 && (
                                <span title="Notificadas" style={{
                                    background: 'var(--green)',
                                    color: '#fff',
                                    borderRadius: '4px',
                                    padding: '1px 4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '9px',
                                    fontWeight: 'bold',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                    textTransform: 'uppercase'
                                }}>
                                    Notificada
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
                                        {(Array.isArray(desplegables?.plantillasPuma) ? desplegables.plantillasPuma : []).map((t, idx) => (
                                            <option key={idx} value={t} />
                                        ))}
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
                                                    {n.notificada && <span style={{ background: 'var(--green)', color: '#fff', fontSize: '9px', padding: '1px 4px', borderRadius: '3px', marginLeft: '8px', fontWeight: 'bold' }}>NOTIFICADA</span>}
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

                                            while (!done) {
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
                                    if (savedData.agendada) {
                                        return alert("Esta solicitud ya se encuentra agendada en PUMA.");
                                    }
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
                                if (val) {
                                    if (!savedData.agendada) {
                                        return alert("No se puede cancelar una audiencia que no ha sido programada");
                                    }
                                    const esJurisdiccional = tipos.some(t => t.toLowerCase().includes('jurisdiccional')) || convertirJurisdiccional;
                                    if (esJurisdiccional) {
                                        return alert("No se puede cancelar una solicitud jurisdiccional por este medio.");
                                    }
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
                                const val = e.target.checked;
                                if (val) {
                                    if (agendar || cancelar || reprogramar || convertirJurisdiccional || savedData.agendada) {
                                        return alert("No podés borrar si ya realizaste o marcaste alguna acción (Agendar, Cancelar, Reprogramar o Jurisdiccional).");
                                    }
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
            {/* Convertir a Jurisdiccional */}
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyOk}`} style={{ textAlign: 'center', verticalAlign: 'middle', padding: '0 4px', minWidth: '80px' }}>
                {convertirJurisdiccional ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center', padding: '4px' }}>
                        <span style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: '600', textAlign: 'center' }}>
                            {convertirJurisdiccionalTipo || 'Pendiente tipo'}
                        </span>
                        <button
                            style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: 'var(--red)', borderRadius: '4px', fontSize: '10px', padding: '2px 6px', cursor: 'pointer' }}
                            onClick={() => {
                                const conf = window.confirm('¿Cancelar la conversión a Jurisdiccional?')
                                if (conf) {
                                    setConvertirJurisdiccional(false)
                                    setConvertirJurisdiccionalTipo('')
                                    setConvertirJurisdiccionalMotivo('')
                                    setToSave(true)
                                }
                            }}
                        >✕ Cancelar</button>
                    </div>
                ) : (
                    <button
                        className={styles.flagBtn}
                        style={{ background: 'var(--surface2)', fontSize: '10px', height: '70%', margin: '0 auto', padding: '0 6px' }}
                        onClick={() => {
                            if (savedData.agendada) {
                                return alert("No se puede reconvertir a jurisdiccional una solicitud que ya está agendada.");
                            }
                            setShowConvertirModal(true);
                        }}
                        title="Convertir esta solicitud a Jurisdiccional"
                    >
                        ⚖ Jurisdic.
                    </button>
                )}
            </td>
            {(showReproModal || showCancelModal) && (
                <div className={styles.modalNotificarOverlay} onClick={() => { if (showReproModal) handleCloseRepro(); else handleCloseCancel(); }}>
                    <div className={styles.modalNotificarContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalTitle}>
                            <span>{showReproModal ? 'Detalles de Reprogramación' : 'Detalles de Cancelación'}</span>
                            <button
                                className={`${styles.modalBtnClose} ${styles.modalBtnCloseNoBorder}`}
                                onClick={() => { if (showReproModal) handleCloseRepro(); else handleCloseCancel(); }}
                            >
                                &times;
                            </button>
                        </div>
                        <div className={styles.modalSection}>
                            <label className={styles.modalLabel}>
                                {showReproModal ? 'Motivo de Reprogramación' : 'Motivo de Cancelación'}
                            </label>
                            {showReproModal ? (
                                <select
                                    className={styles.modalSelect}
                                    value={motivRepro}
                                    onChange={e => { setMotivRepro(e.target.value); setToSave(true); }}
                                >
                                    {(Array.isArray(desplegables?.motivRepro) ? desplegables.motivRepro : []).map((t, idx) => (
                                        <option key={idx} value={t} />
                                    ))}
                                </select>
                            ) : (
                                <select
                                    className={styles.modalSelect}
                                    value={motivCancel}
                                    onChange={e => { setMotivCancel(e.target.value); setToSave(true); }}
                                >
                                    {(Array.isArray(desplegables?.motivCancel) ? desplegables.motivCancel : []).map((t, idx) => (
                                        <option key={idx} value={t} />
                                    ))}
                                </select>
                            )}

                            <label className={styles.modalLabelMt}>Observaciones</label>
                            <textarea
                                className={`${styles.modalInput} ${styles.modalTextareaLg}`}
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
            {/* Modal de Reconversión */}
            {showReconversionModal && (
                <div className={styles.modalNotificarOverlay} onClick={() => setShowReconversionModal(false)}>
                    <div className={styles.modalNotificarContent} onClick={e => e.stopPropagation()}>
                        <div className={`${styles.modalTitle} ${styles.modalTitleFlex}`}>
                            <span>⚠️ Reconversión de Audiencia</span>
                            <button className={`${styles.modalBtnClose} ${styles.modalBtnCloseNoBorder}`} onClick={() => setShowReconversionModal(false)}>&times;</button>
                        </div>
                        <div className={styles.modalSection}>
                            <div className={styles.reconversionWarningBox}>
                                <strong>Tipo original:</strong> {tiposOriginales?.join(', ')}<br />
                                <span className={styles.warningTextSmall}>
                                    Al cambiar el tipo de audiencia original se realizará una <strong>reconversión</strong> de la solicitud en PUMA.
                                </span>
                            </div>
                            <label className={styles.modalLabel}>
                                Motivo de Transformación (opcional)
                            </label>
                            <textarea
                                className={`${styles.modalInput} ${styles.modalTextareaMd}`}
                                value={reconversionMotivo}
                                onChange={e => setReconversionMotivo(e.target.value)}
                                placeholder="Ej: Cambio de tipo por modificación del objeto procesal..."
                            />
                        </div>
                        <div className={styles.modalButtonGroup}>
                            <button
                                className={styles.modalBtn}
                                onClick={() => {
                                    if (pendingReconversionTipos !== null) {
                                        setTipos(pendingReconversionTipos)
                                        setPendingReconversionTipos(null)
                                        setToSave(true)
                                    }
                                    setShowReconversionModal(false)
                                }}
                            >Confirmar Reconversión</button>
                            <button
                                className={`${styles.modalBtn} ${styles.modalBtnClose} ${styles.modalBtnCloseNoBorder}`}
                                onClick={() => {
                                    setPendingReconversionTipos(null)
                                    setShowReconversionModal(false)
                                }}
                            >Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
            {/* Modal Convertir a Jurisdiccional */}
            {showConvertirModal && (
                <div className={styles.modalNotificarOverlay} onClick={() => setShowConvertirModal(false)}>
                    <div className={styles.modalNotificarContent} onClick={e => e.stopPropagation()}>
                        <div className={`${styles.modalTitle} ${styles.modalTitleFlex}`}>
                            <span>⚖ Convertir a Solicitud Jurisdiccional</span>
                            <button className={`${styles.modalBtnClose} ${styles.modalBtnCloseNoBorder}`} onClick={() => setShowConvertirModal(false)}>&times;</button>
                        </div>
                        <div className={styles.modalSection}>
                            <div className={styles.jurisdiccionalWarningBox}>
                                Esta acción convertirá la solicitud de audiencia en una <strong>Solicitud Jurisdiccional</strong>.
                                Se ejecutará en PUMA al procesar.
                            </div>
                            <label className={styles.modalLabel}>
                                Tipo de Solicitud Jurisdiccional
                            </label>
                            <input
                                className={styles.modalInput}
                                placeholder="Buscar tipo jurisdiccional..."
                                value={newConvertirTipo}
                                onChange={e => setNewConvertirTipo(e.target.value)}
                            />
                            <div className={styles.jurisdiccionalList}>
                                {desplegables?.tiposJurisdiccional
                                    .filter(t => !newConvertirTipo || t.toLowerCase().includes(newConvertirTipo.toLowerCase()))
                                    .map((t, idx) => (
                                        <div
                                            key={idx}
                                            className={styles.jurisdiccionalListItem}
                                            style={{
                                                background: convertirJurisdiccionalTipo === t ? 'rgba(99,102,241,0.15)' : 'transparent',
                                                color: convertirJurisdiccionalTipo === t ? 'var(--accent)' : 'var(--text)',
                                                fontWeight: convertirJurisdiccionalTipo === t ? '600' : 'normal'
                                            }}
                                            onClick={() => setConvertirJurisdiccionalTipo(t)}
                                            onMouseOver={e => { if (convertirJurisdiccionalTipo !== t) e.currentTarget.style.background = 'var(--surface2)' }}
                                            onMouseOut={e => { if (convertirJurisdiccionalTipo !== t) e.currentTarget.style.background = 'transparent' }}
                                        >
                                            {t}
                                        </div>
                                    ))
                                }
                            </div>
                            {convertirJurisdiccionalTipo && (
                                <div className={styles.jurisdiccionalMotivoBox}>
                                    ✓ Seleccionado: <strong>{convertirJurisdiccionalTipo}</strong>
                                </div>
                            )}
                            <label className={styles.modalLabelMt}>
                                Motivo de Transformación (opcional)
                            </label>
                            <textarea
                                className={`${styles.modalInput} ${styles.modalTextareaSm}`}
                                value={convertirJurisdiccionalMotivo}
                                onChange={e => setConvertirJurisdiccionalMotivo(e.target.value)}
                                placeholder="Motivo de la conversión a jurisdiccional..."
                            />
                        </div>
                        <div className={styles.modalButtonGroup}>
                            <button
                                className={styles.modalBtn}
                                disabled={!convertirJurisdiccionalTipo}
                                style={{ opacity: !convertirJurisdiccionalTipo ? 0.5 : 1 }}
                                onClick={() => {
                                    if (!convertirJurisdiccionalTipo) return alert('Seleccione un tipo jurisdiccional.')
                                    setConvertirJurisdiccional(true)
                                    setNewConvertirTipo('')
                                    setToSave(true)
                                    setShowConvertirModal(false)
                                }}
                            >Confirmar</button>
                            <button
                                className={`${styles.modalBtn} ${styles.modalBtnClose} ${styles.modalBtnCloseNoBorder}`}
                                onClick={() => setShowConvertirModal(false)}
                            >Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </tr>
    )
}