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
                    dni: p.dni || ''
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
                        alias: p.alias || ''
                    }));
                }
                if (sourcePartes && typeof sourcePartes === 'object') {
                    const converted = [];
                    Object.keys(sourcePartes).forEach(roleKey => {
                        const roleName = roleKey.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                        const persons = sourcePartes[roleKey];
                        if (Array.isArray(persons)) {
                            persons.forEach(person => converted.push({ nombre: person, rol: roleName, direccion: '', localidad: '', telefono: '', dni: '', alias: '' }));
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
                    alias: p.alias || ''
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
                            alias: '' 
                        }))
                    }
                })
            }
            setPartesLegajo(initialPartes)

            setPartesAgregar(saved.partesAgregar || [])
            setNotificaciones(saved.notificaciones || [])

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
    }, [tipos, sitCorporal, vencimiento, querella, defensa, fiscal, juez, motivo, fechaAudiencia, horaAudiencia, sala, juezCausa, comentario, imputados, partesLegajo, partesAgregar, notificaciones, agendar, revisado, marcarBorrar, reprogramar, savedData])

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
                        imputados, partesLegajo, partesAgregar, notificaciones, agendar, revisado, marcarBorrar, reprogramar
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
                                            return (
                                                <div key={idx} style={{ background: 'var(--surface2)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                        <strong style={{ color: 'var(--accent)' }}>{parte.nombre}</strong>
                                                        <span style={{ fontSize: '11px', color: 'var(--text3)', background: 'var(--surface)', padding: '2px 6px', borderRadius: '4px' }}>{parte.rol}</span>
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
                                                alias: ''
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
                        <span style={{
                            position: 'absolute',
                            top: '-6px',
                            right: '-6px',
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
                            {notificaciones.length}
                        </span>
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
                                    <option value="cancelarAudienciaImputadoEnLibertad">Cancelar Audiencia Imputado Libre</option>
                                    <option value="citacionDenunciante">Citación Denunciante</option>
                                    <option value="citacionImputadoLibertadVideoconferencia">Citación Imputado Video</option>
                                    <option value="citacionPersonalPolicial">Citación Personal Policial</option>
                                    <option value="citacionImputadoCedulaPenalEnLibertad">Citación Imputado Cédula</option>
                                    <option value="citacionConvenio">Citación por Convenio</option>
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
                                        setNotificaciones(prev => [...prev, { id: Date.now(), option: notifOption, parts: selectedPartsToNotify }]);
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
                                <button className={styles.modalBtn} style={{ background: 'var(--green)' }} onClick={async () => {
                                    if (notificaciones.length === 0) return alert("No hay notificaciones configuradas.")

                                    try {
                                        for (const notif of notificaciones) {
                                            // Preparamos los datos básicos
                                            const selectedPartsWithInfo = notif.parts.map(pKey => availablePartsList.find(x => x.key === pKey) || { nombre: pKey, rol: '', direccion: '', localidad: '', telefono: '', alias: '' });
                                            const destinatariosStr = selectedPartsWithInfo.map(p => p.alias || p.nombre).join(', ');
                                            const firstPart = selectedPartsWithInfo.find(p => p.direccion || p.localidad || p.telefono) || {};
                                            const firstDireccion = firstPart.direccion || '[DOMICILIO A COMPLETAR]';
                                            const firstLocalidad = firstPart.localidad || '[LOCALIDAD A COMPLETAR]';
                                            const firstTelefono = firstPart.telefono || '';

                                            const datosList = {
                                                destinatarioNombre: destinatariosStr,
                                                destinatarioDomicilio: firstDireccion,
                                                destinatarioLocalidad: firstLocalidad,
                                                destinatarioTelefono: firstTelefono,
                                                legajoFiscal: data.numeroLeg || '[LEGAJO]',
                                                caratula: (tipos.some(t => String(t || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().includes('formalizacion')) && caratulaMod) ? caratulaMod : (data.caratula || '[CARATULA]'),
                                                tipoAudiencia: tipos.join(' - ') || '[TIPO]',
                                                fechaAudiencia: fechaAudiencia || '[FECHA]',
                                                horaAudiencia: horaAudiencia || '[HORA]',
                                                juez: juez || '[JUEZ]',
                                                // Solo para personal policial, lo acomodamos para que mande como lista
                                                personasACitar: notif.parts.map(pKey => {
                                                      const pInfo = availablePartsList.find(x => x.key === pKey) || { nombre: pKey, rol: '', dni: '' };
                                                      return {
                                                          nombre: pInfo.nombre + (pInfo.rol ? ` (${pInfo.rol})` : ''),
                                                          dni: pInfo.dni || '',
                                                          telefono: pInfo.telefono || '',
                                                          fecha: fechaAudiencia || '[FECHA]',
                                                          hora: horaAudiencia || '[HORA]'
                                                      }
                                                  })
                                            };

                                            // Llamamos a la herramienta del PDF
                                            await descargarPdfNotificacion(notif.option, datosList);
                                        }
                                        alert(`Se generaron ${notificaciones.length} archivos PDF!`);
                                        onCloseNotificar();
                                    } catch (err) {
                                        console.error('Error generando PDF de notificaciones:', err);
                                        alert('Hubo un error al generar las notificaciones PDF.');
                                    }
                                }}>
                                    Generar Seleccionadas
                                </button>
                                <button className={`${styles.modalBtn} ${styles.modalBtnClose}`} onClick={onCloseNotificar}>
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
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