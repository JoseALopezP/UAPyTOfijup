'use client'
import React, { useState, useEffect, useMemo } from 'react';
import getDocument from '@/firebase/firestore/getDocument';
import { addOrUpdateObject } from '@/firebase/firestore/addOrUpdateObject';
import { removeObject } from '@/firebase/firestore/removeObject';
import getCollection from '@/firebase/firestore/getCollection';
import styles from './Notificaciones.module.css';

const getNormalizedComisaria = (rawName, comisariasDict) => {
    if (!rawName) return '';
    const cleanRaw = rawName.toString().trim().toUpperCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // strip accents
    
    if (comisariasDict[cleanRaw]) return cleanRaw;
    
    const officialNames = Object.keys(comisariasDict);

    // 1. Check if the rawName is just a number
    if (/^\d+$/.test(cleanRaw)) {
        const num = parseInt(cleanRaw, 10);
        const targetName = `COMISARIA ${num}`;
        if (officialNames.includes(targetName)) {
            return targetName;
        }
    }

    // 2. Check common patterns with numbers (e.g. CRIA 5, C5, COMISARIA 5)
    const numbersInRaw = cleanRaw.match(/\d+/);
    if (numbersInRaw) {
        const num = parseInt(numbersInRaw[0], 10);
        const isSub = cleanRaw.includes('SUB') || cleanRaw.includes('S-CRIA') || cleanRaw.includes('SCRIA');
        if (isSub) {
            const matchedSub = officialNames.find(name => name.includes('SUB') && name.includes(num.toString()));
            if (matchedSub) return matchedSub;
        } else {
            const targetName = `COMISARIA ${num}`;
            if (officialNames.includes(targetName)) {
                return targetName;
            }
        }
    }

    // 3. Substring matching
    const ignoreWords = ['COMISARIA', 'SUB', 'CRIA', 'DE', 'LA', 'EL', 'LOS', 'LAS', 'DEL', 'UNIDAD', 'OPERATIVA', 'BRIGADA'];
    const tokens = cleanRaw.split(/[\s.\-_]+/).filter(t => t.length > 2 && !ignoreWords.includes(t));
    
    if (tokens.length > 0) {
        for (const token of tokens) {
            const matched = officialNames.find(name => name.includes(token));
            if (matched) return matched;
        }
    }

    const foundFuzzy = officialNames.find(name => 
        name.includes(cleanRaw) || cleanRaw.includes(name)
    );
    if (foundFuzzy) return foundFuzzy;

    return rawName;
};

export default function NotificacionesPage() {
    // Shared states
    const [activeTab, setActiveTab] = useState('traslados');
    const [mailSubTab, setMailSubTab] = useState('citaciones'); // 'citaciones' | 'general'
    const [showNextTurnoOnly, setShowNextTurnoOnly] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Legacy states (Pendientes / Historial)
    const [ticketsPendientes, setTicketsPendientes] = useState({});
    const [ticketsHistorial, setTicketsHistorial] = useState({});
    const [expandedTicket, setExpandedTicket] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
    const [loading, setLoading] = useState(true);
    const [updatingIds, setUpdatingIds] = useState(new Set());
    const [reviewingId, setReviewingId] = useState(null);
    const [reviewStatus, setReviewStatus] = useState('');

    // Workspace states (Citaciones / Mails / Telefonos / Traslados)
    const [workspaceData, setWorkspaceData] = useState({});
    const [workspaceLoading, setWorkspaceLoading] = useState(true);
    const [wsExpandedRow, setWsExpandedRow] = useState(null);
    const [wsEditingId, setWsEditingId] = useState(null);
    const [wsEditValue, setWsEditValue] = useState('');

    // Comisarías states
    const [comisarias, setComisarias] = useState({});
    const [newComisaria, setNewComisaria] = useState({ nombre: '', departamental: '', mailComisaria: '', mailDepartamental: '' });
    const [isEditingComisaria, setIsEditingComisaria] = useState(false);
    const [editingComisariaId, setEditingComisariaId] = useState(null);
    const [searchComisaria, setSearchComisaria] = useState('');

    const fetchComisarias = async () => {
        try {
            const data = await getDocument('desplegables', 'comisarias');
            setComisarias(data || {});
        } catch (error) {
            console.error("Error fetching comisarias:", error);
        }
    };

    useEffect(() => {
        fetchComisarias();
    }, []);

    const handleSaveComisaria = async (e) => {
        e.preventDefault();
        const nombreClean = newComisaria.nombre.trim();
        if (!nombreClean) {
            alert("El nombre de la comisaría es obligatorio.");
            return;
        }
        try {
            if (isEditingComisaria && editingComisariaId && editingComisariaId !== nombreClean) {
                await removeObject('desplegables', 'comisarias', editingComisariaId);
            }
            const data = {
                nombre: nombreClean,
                departamental: newComisaria.departamental.trim(),
                mailComisaria: newComisaria.mailComisaria.trim(),
                mailDepartamental: newComisaria.mailDepartamental.trim()
            };
            await addOrUpdateObject('desplegables', 'comisarias', nombreClean, data);
            setNewComisaria({ nombre: '', departamental: '', mailComisaria: '', mailDepartamental: '' });
            setIsEditingComisaria(false);
            setEditingComisariaId(null);
            fetchComisarias();
        } catch (error) {
            console.error("Error saving comisaria:", error);
            alert("Error al guardar la comisaría.");
        }
    };

    const handleDeleteComisaria = async (id) => {
        if (confirm(`¿Estás seguro de eliminar la comisaría "${id}"?`)) {
            try {
                await removeObject('desplegables', 'comisarias', id);
                fetchComisarias();
            } catch (error) {
                console.error("Error deleting comisaria:", error);
                alert("Error al eliminar la comisaría.");
            }
        }
    };

    useEffect(() => {
        if (activeTab === 'pendientes') {
            fetchPendientes();
        } else if (activeTab === 'historial') {
            fetchHistorial();
        } else if (activeTab !== 'comisarias') {
            fetchWorkspaceData();
        }
    }, [activeTab, selectedMonth, selectedYear]);

    // --- LEGACY FUNCTIONS ---
    const fetchPendientes = async () => {
        setLoading(true);
        try {
            const data = await getDocument('notificaciones', 'anotificar');
            setTicketsPendientes(data || {});
        } catch (error) {
            console.error("Error fetching pendientes:", error);
        }
        setLoading(false);
    };

    const fetchHistorial = async () => {
        setLoading(true);
        try {
            const docId = `${selectedMonth}${selectedYear}`;
            const data = await getDocument('notificaciones', docId);
            setTicketsHistorial(data || {});
        } catch (error) {
            console.error("Error fetching historial:", error);
        }
        setLoading(false);
    };

    const toggleExpand = (ticketId) => {
        setExpandedTicket(expandedTicket === ticketId ? null : ticketId);
    };

    const countPendingNotifications = (notificacionesArray) => {
        if (!notificacionesArray || !Array.isArray(notificacionesArray)) return 0;
        return notificacionesArray.filter(n => n.anotificar === true).length;
    };

    const handleMarkAsNotified = async (ticketId, ticket, personaIndex) => {
        const itemKey = `${ticketId}-${personaIndex}`;
        setUpdatingIds(prev => new Set(prev).add(itemKey));

        try {
            const updatedTicket = { ...ticket };
            updatedTicket.notificaciones = [...ticket.notificaciones];
            const now = new Date();
            const fechaString = now.toLocaleString('es-AR', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });

            updatedTicket.notificaciones[personaIndex] = {
                ...updatedTicket.notificaciones[personaIndex],
                anotificar: false,
                fechaNotificado: fechaString
            };

            const stillPending = updatedTicket.notificaciones.some(p => p.anotificar === true);

            if (stillPending) {
                await addOrUpdateObject('notificaciones', 'anotificar', ticketId, updatedTicket);
                setTicketsPendientes(prev => ({ ...prev, [ticketId]: updatedTicket }));
            } else {
                const month = (now.getMonth() + 1).toString().padStart(2, '0');
                const year = now.getFullYear().toString();
                const archiveDocId = `${month}${year}`;

                await addOrUpdateObject('notificaciones', archiveDocId, ticketId, {
                    ...updatedTicket, fechaFinalizado: fechaString
                });
                await removeObject('notificaciones', 'anotificar', ticketId);

                setTicketsPendientes(prev => {
                    const next = { ...prev };
                    delete next[ticketId];
                    return next;
                });

                if (activeTab === 'historial' && selectedMonth === month && selectedYear === year) {
                    fetchHistorial();
                }
            }
        } catch (error) {
            console.error("Error updating notification status:", error);
        } finally {
            setUpdatingIds(prev => {
                const next = new Set(prev);
                next.delete(itemKey);
                return next;
            });
        }
    };

    const handleReviewNotification = async (ticketId, ticket, index, linkSolicitud) => {
        const itemKey = `${ticketId}-${index}`;
        setReviewingId(itemKey);
        setReviewStatus('Inicializando...');

        try {
            if (typeof window !== 'undefined' && window.electronAPI) {
                window.electronAPI.removeAllListeners('revisar-notificacion-progress');
                window.electronAPI.on('revisar-notificacion-progress', (event, parsed) => {
                    if (parsed.type === 'progress') setReviewStatus(parsed.message);
                });

                const result = await window.electronAPI.invoke('revisar-notificacion', { linkSolicitud });
                if (result && result.success) setReviewStatus('Revisión completada.');
                else {
                    console.error("Error al revisar:", result?.error);
                    alert(`Error al revisar: ${result?.error || 'Sin respuesta'}`);
                }
            } else {
                alert("La automatización no está disponible en este entorno.");
            }
        } catch (err) {
            console.error("Error en handleReviewNotification:", err);
            alert(`Error al revisar: ${err.message}`);
        } finally {
            setTimeout(() => {
                setReviewingId(null);
                setReviewStatus('');
            }, 2500);
        }
    };

    const filterTickets = (ticketsMap) => {
        if (!ticketsMap) return [];
        const term = searchTerm.toLowerCase().trim();
        const entries = Object.entries(ticketsMap);
        if (!term) return entries;
        return entries.filter(([id, ticket]) => {
            const legajoMatch = ticket.nroLegajo && ticket.nroLegajo.toString().toLowerCase().includes(term);
            const cuerpoMatch = ticket.cuerpo && ticket.cuerpo.toLowerCase().includes(term);
            const personasMatch = ticket.notificaciones && ticket.notificaciones.some(p => 
                (p.nombre && p.nombre.toLowerCase().includes(term)) ||
                (p.dni && p.dni.toString().toLowerCase().includes(term))
            );
            return legajoMatch || cuerpoMatch || personasMatch;
        });
    };

    // --- WORKSPACE FUNCTIONS ---
    const fetchWorkspaceData = async () => {
        setWorkspaceLoading(true);
        try {
            const docs = await getCollection('anotificar');
            const newData = {};
            docs.forEach(d => {
                const { id, createdAt, updatedAt, ...rest } = d;
                newData[id] = rest;
            });
            setWorkspaceData(newData);
        } catch (err) {
            console.error(err);
        } finally {
            setWorkspaceLoading(false);
        }
    };

    const handleUpdateField = async (docType, customId, itemData, field, value) => {
        try {
            let updatedItem = { ...itemData, [field]: value };
            if (field === 'comisaria') {
                const normName = getNormalizedComisaria(value, comisarias);
                updatedItem.comisaria = normName;
                updatedItem.departamental = comisarias[normName]?.departamental || '';
            }
            if (field === 'emails' && itemData.manual) updatedItem.manual = false;

            setWorkspaceData(prev => ({
                ...prev, [docType]: { ...prev[docType], [customId]: updatedItem }
            }));

            await addOrUpdateObject('anotificar', docType, customId, updatedItem);
        } catch (err) {
            console.error('Error updating field', err);
            fetchWorkspaceData();
        }
    };

    const handleCheckbox = async (docType, customId, itemData, flag) => {
        const currentFlags = itemData.statusFlags || {
            listaParaNotificar: false, notificada: false, comprobante: false, indicadaComoNotificada: false
        };
        const newFlags = { ...currentFlags, [flag]: !currentFlags[flag] };
        const updatedItem = { ...itemData, statusFlags: newFlags };

        try {
            setWorkspaceData(prev => ({
                ...prev, [docType]: { ...prev[docType], [customId]: updatedItem }
            }));
            await addOrUpdateObject('anotificar', docType, customId, { statusFlags: newFlags });
        } catch (err) {
            console.error('Error updating checkbox', err);
            fetchWorkspaceData();
        }
    };

    const parseDateWS = (str) => {
        if (!str) return null;
        const match = str.match(/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})/);
        if (!match) return null;
        return new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]), parseInt(match[4]), parseInt(match[5]));
    };

    const getNextTurno = () => {
        const hour = new Date().getHours();
        return hour < 14
            ? { turno: 'tarde', dayOffset: 0, label: 'TARDE â€” HOY' }
            : { turno: 'maÃ±ana', dayOffset: 1, label: 'MAÃ‘ANA â€” MÃ‘N' };
    };

    const activeWorkspaceData = useMemo(() => {
        if (activeTab === 'traslados') {
            const itemsRaw = workspaceData['traslados'] || {};
            const items = Object.entries(itemsRaw).map(([id, val]) => ({ customId: id, data: val, docType: 'traslados' }));
            const today = new Date(); today.setHours(0, 0, 0, 0);
            const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
            const afterTomorrow = new Date(today); afterTomorrow.setDate(afterTomorrow.getDate() + 2);
            let filtered = items.filter(item => {
                const d = parseDateWS(item.data.fechaAud || '');
                return d && d >= yesterday && d < afterTomorrow;
            });
            if (showNextTurnoOnly) {
                const { turno, dayOffset } = getNextTurno();
                const targetDay = new Date(today); targetDay.setDate(targetDay.getDate() + dayOffset);
                const targetDayEnd = new Date(targetDay); targetDayEnd.setDate(targetDayEnd.getDate() + 1);
                filtered = filtered.filter(item => {
                    const d = parseDateWS(item.data.fechaAud || '');
                    if (!d) return false;
                    const esDia = d >= targetDay && d < targetDayEnd;
                    const esTurno = turno === 'mañana' ? d.getHours() < 14 : d.getHours() >= 14;
                    return esDia && esTurno;
                });
            }
            return filtered.sort((a, b) => (parseDateWS(a.data.fechaAud || '')?.getTime() || 0) - (parseDateWS(b.data.fechaAud || '')?.getTime() || 0));
        }
        if (activeTab === 'mails') {
            const key = mailSubTab === 'general' ? 'oficios' : 'mails';
            const itemsRaw = workspaceData[key] || {};
            return Object.entries(itemsRaw).map(([id, val]) => ({ customId: id, data: val, docType: key }));
        }
        if (activeTab === 'telefonos') {
            const itemsRaw = workspaceData['telefonos'] || {};
            return Object.entries(itemsRaw).map(([id, val]) => ({ customId: id, data: val, docType: 'telefonos' }));
        }
        return [];
    }, [workspaceData, activeTab, mailSubTab, showNextTurnoOnly]);

    const getTrasladoMeta = (item) => {
        const d = parseDateWS(item.data.fechaAud || '');
        if (!d) return { dayLabel: '?', turnoLabel: '?', isVC: false, turno: null };
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
        const dayLabel = d < today ? 'AYER' : d < tomorrow ? 'HOY' : 'MÑN';
        const turno = d.getHours() < 14 ? 'mañana' : 'tarde';
        return { dayLabel, turnoLabel: turno === 'mañana' ? 'MAÑANA' : 'TARDE', isVC: !!item.data.esVideoconferencia, turno };
    };

    // --- RENDER HELPERS ---
    const renderTicket = (ticketId, ticket, isHistorial = false) => {
        const isExpanded = expandedTicket === ticketId;
        const pendingCount = countPendingNotifications(ticket.notificaciones);
        const tipoClase = ticket.tipo === 'oficio' ? styles.tipoOficio : styles.tipoAgendamiento;

        return (
            <div key={ticketId} className={`${styles.ticketCard} ${isExpanded ? styles.expanded : ''}`}>
                <div className={styles.ticketHeader} onClick={() => toggleExpand(ticketId)}>
                    <div className={styles.ticketInfo}>
                        <span className={`${styles.badge} ${tipoClase}`}>{ticket.tipo ? ticket.tipo.toUpperCase() : 'TAREA'}</span>
                        <span className={styles.legajo}>Legajo: {ticket.nroLegajo}</span>
                        <span className={styles.fecha}>Fecha: {ticket.fecha}</span>
                    </div>
                    <div className={styles.ticketActions}>
                        {!isHistorial && pendingCount > 0 && <div className={styles.pendingCircle}>{pendingCount}</div>}
                        <span className={styles.expandIcon}>{isExpanded ? '▲' : '▼'}</span>
                    </div>
                </div>
                {isExpanded && (
                    <div className={styles.ticketBody}>
                        <div className={styles.ticketDetailRow}><span className={styles.detailLabel}>Generada:</span> <span>{ticket.fechaGenerada}</span></div>
                        {ticket.fechaFinalizado && <div className={styles.ticketDetailRow}><span className={styles.detailLabel}>Finalizada:</span> <span>{ticket.fechaFinalizado}</span></div>}
                        {ticket.cuerpo && <div className={styles.ticketDetailRow}><span className={styles.detailLabel}>Cuerpo:</span><p className={styles.cuerpoText}>{ticket.cuerpo}</p></div>}
                        <div className={styles.notificacionesList}>
                            <h4 className={styles.notificacionesTitle}>Personas a notificar:</h4>
                            {ticket.notificaciones && ticket.notificaciones.length > 0 ? (
                                <ul className={styles.personasUl}>
                                    {ticket.notificaciones.map((persona, index) => {
                                        const isPending = persona.anotificar && !isHistorial;
                                        const itemKey = `${ticketId}-${index}`;
                                        const isUpdating = updatingIds.has(itemKey);
                                        return (
                                            <li key={index} className={`${styles.personaLi} ${isPending ? styles.personaPending : styles.personaDone}`}>
                                                <div className={styles.personaInfo}>
                                                    <strong>{persona.nombre}</strong> (DNI: {persona.dni})
                                                    {persona.fechaNotificado && <span style={{ display: 'block', fontSize: '12px', marginTop: '4px', opacity: 0.8 }}>Notificado el: {persona.fechaNotificado}</span>}
                                                    {reviewingId === itemKey && <span className={styles.reviewStatusText}>⏳ {reviewStatus}</span>}
                                                </div>
                                                <div className={styles.personaLinks}>
                                                    {persona.linkSolicitud && <a href={persona.linkSolicitud} target="_blank" rel="noreferrer" className={styles.linkBtn}>Ver Solicitud</a>}
                                                    {persona.linkSolicitud && <button onClick={(e) => { e.stopPropagation(); handleReviewNotification(ticketId, ticket, index, persona.linkSolicitud); }} disabled={reviewingId !== null} className={styles.reviewBtn}>{reviewingId === itemKey ? 'Revisando...' : 'Revisar'}</button>}
                                                    {isPending ? <button onClick={(e) => { e.stopPropagation(); handleMarkAsNotified(ticketId, ticket, index); }} disabled={isUpdating} className={styles.actionBtn}>{isUpdating ? 'Guardando...' : 'Marcar Notificado'}</button> : <span className={styles.doneTag}>Notificado</span>}
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : <p className={styles.noData}>No hay personas asignadas a este ticket.</p>}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const filteredTickets = activeTab === 'pendientes' ? filterTickets(ticketsPendientes) : filterTickets(ticketsHistorial);
    const isWorkspaceTab = ['traslados', 'mails', 'telefonos'].includes(activeTab);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Notificaciones</h1>
                <div className={styles.tabsContainer} style={{ flexWrap: 'wrap', gap: '8px' }}>
                    <button className={`${styles.tabBtn} ${activeTab === 'traslados' ? styles.activeTab : ''}`} onClick={() => { setActiveTab('traslados'); setShowNextTurnoOnly(false); setSearchTerm(''); }}>Traslados y VC</button>
                    <button className={`${styles.tabBtn} ${activeTab === 'mails' ? styles.activeTab : ''}`} onClick={() => { setActiveTab('mails'); setSearchTerm(''); }}>Mails</button>
                    <button className={`${styles.tabBtn} ${activeTab === 'telefonos' ? styles.activeTab : ''}`} onClick={() => { setActiveTab('telefonos'); setSearchTerm(''); }}>Teléfonos</button>
                    <button className={`${styles.tabBtn} ${activeTab === 'comisarias' ? styles.activeTab : ''}`} onClick={() => { setActiveTab('comisarias'); setSearchTerm(''); }}>Comisarías</button>
                    <div style={{ width: '2px', background: 'var(--border-color)', margin: '0 8px' }}></div>
                    <button className={`${styles.tabBtn} ${activeTab === 'pendientes' ? styles.activeTab : ''}`} onClick={() => { setActiveTab('pendientes'); setSearchTerm(''); }}>Antiguas (Pendientes)</button>
                    <button className={`${styles.tabBtn} ${activeTab === 'historial' ? styles.activeTab : ''}`} onClick={() => { setActiveTab('historial'); setSearchTerm(''); }}>Antiguas (Historial)</button>
                </div>
            </header>

            <main className={styles.mainContent}>
                {!isWorkspaceTab && activeTab === 'pendientes' && (
                    <div className={styles.tabContent}>
                        <h2 className={styles.sectionTitle}>Tickets Antiguos Pendientes</h2>
                        <div className={styles.searchContainer}>
                            <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={styles.searchInput} />
                        </div>
                        {loading ? <div className={styles.loading}>Cargando tickets...</div> : filteredTickets.length > 0 ? <div className={styles.ticketList}>{filteredTickets.map(([id, ticket]) => renderTicket(id, ticket, false))}</div> : <div className={styles.emptyState}>No hay notificaciones pendientes.</div>}
                    </div>
                )}

                {!isWorkspaceTab && activeTab === 'historial' && (
                    <div className={styles.tabContent}>
                        <h2 className={styles.sectionTitle}>Historial de Notificadas</h2>
                        <div className={styles.filters}>
                            <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className={styles.selectFilter}>{['01','02','03','04','05','06','07','08','09','10','11','12'].map(m => <option key={m} value={m}>Mes {m}</option>)}</select>
                            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className={styles.selectFilter}>{[2024, 2025, 2026, 2027].map(y => <option key={y} value={y.toString()}>{y}</option>)}</select>
                            <button className={styles.refreshBtn} onClick={fetchHistorial}>Buscar</button>
                            <input type="text" placeholder="Filtrar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={styles.searchInput} style={{ marginLeft: 'auto', marginBottom: 0 }} />
                        </div>
                        {loading ? <div className={styles.loading}>Buscando historial...</div> : filteredTickets.length > 0 ? <div className={styles.ticketList}>{filteredTickets.map(([id, ticket]) => renderTicket(id, ticket, true))}</div> : <div className={styles.emptyState}>No se encontraron registros.</div>}
                    </div>
                )}

                {!isWorkspaceTab && activeTab === 'comisarias' && (
                    <div className={styles.tabContent}>
                        <div style={{ display: 'flex', gap: '24px', flexDirection: 'row', flexWrap: 'wrap' }}>
                            {/* Formulario de Agregar / Editar */}
                            <div style={{ flex: '1 1 300px', background: 'var(--surface-color)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', color: 'var(--text-color)' }}>
                                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700, color: 'var(--text-color)' }}>
                                    {isEditingComisaria ? 'Editar Comisaría' : 'Agregar Nueva Comisaría'}
                                </h3>
                                <form onSubmit={handleSaveComisaria} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Nombre de Comisaría</label>
                                        <input 
                                            type="text" 
                                            required 
                                            placeholder="Ej. Comisaría 1ra" 
                                            value={newComisaria.nombre} 
                                            onChange={e => setNewComisaria({...newComisaria, nombre: e.target.value})} 
                                            style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--input-border)', fontSize: '14px', background: 'var(--input-bg)', color: 'var(--text-color)' }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Departamental correspondiente</label>
                                        <input 
                                            type="text" 
                                            placeholder="Ej. Capital" 
                                            value={newComisaria.departamental} 
                                            onChange={e => setNewComisaria({...newComisaria, departamental: e.target.value})} 
                                            style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--input-border)', fontSize: '14px', background: 'var(--input-bg)', color: 'var(--text-color)' }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Mail de la Comisaría</label>
                                        <input 
                                            type="email" 
                                            placeholder="Ej. comisaria1@sanjuan.gov.ar" 
                                            value={newComisaria.mailComisaria} 
                                            onChange={e => setNewComisaria({...newComisaria, mailComisaria: e.target.value})} 
                                            style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--input-border)', fontSize: '14px', background: 'var(--input-bg)', color: 'var(--text-color)' }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Mail de la Departamental</label>
                                        <input 
                                            type="email" 
                                            placeholder="Ej. departamental@sanjuan.gov.ar" 
                                            value={newComisaria.mailDepartamental} 
                                            onChange={e => setNewComisaria({...newComisaria, mailDepartamental: e.target.value})} 
                                            style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--input-border)', fontSize: '14px', background: 'var(--input-bg)', color: 'var(--text-color)' }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                        <button type="submit" style={{ flex: 1, padding: '8px 16px', background: 'var(--accent-color)', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}>
                                            Guardar
                                        </button>
                                        {isEditingComisaria && (
                                            <button 
                                                type="button" 
                                                onClick={() => {
                                                    setIsEditingComisaria(false);
                                                    setEditingComisariaId(null);
                                                    setNewComisaria({ nombre: '', departamental: '', mailComisaria: '', mailDepartamental: '' });
                                                }} 
                                                style={{ padding: '8px 16px', background: 'var(--surface-color)', color: 'var(--text-color)', border: '1px solid var(--border-color)', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}
                                            >
                                                Cancelar
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>

                            {/* Listado y Búsqueda */}
                            <div style={{ flex: '2 1 500px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <input 
                                    type="text" 
                                    placeholder="Buscar comisaría, departamental o email..." 
                                    value={searchComisaria} 
                                    onChange={e => setSearchComisaria(e.target.value)} 
                                    style={{ padding: '10px 14px', borderRadius: '4px', border: '1px solid var(--input-border)', fontSize: '14px', width: '100%', maxWidth: '400px', background: 'var(--input-bg)', color: 'var(--text-color)' }}
                                    className={styles.searchInput}
                                />
                                
                                <div style={{ overflowX: 'auto', background: 'var(--surface-color)', borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                        <thead style={{ background: 'var(--card-header-bg)', borderBottom: '2px solid var(--border-color)' }}>
                                            <tr>
                                                <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '12px' }}>COMISARÍA</th>
                                                <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '12px' }}>DEPARTAMENTAL</th>
                                                <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '12px' }}>EMAIL COMISARÍA</th>
                                                <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '12px' }}>EMAIL DEPARTAMENTAL</th>
                                                <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', width: '140px' }}>ACCIONES</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.values(comisarias)
                                                .filter(c => {
                                                    const term = searchComisaria.toLowerCase().trim();
                                                    if (!term) return true;
                                                    return (c.nombre || '').toLowerCase().includes(term) ||
                                                           (c.departamental || '').toLowerCase().includes(term) ||
                                                           (c.mailComisaria || '').toLowerCase().includes(term) ||
                                                           (c.mailDepartamental || '').toLowerCase().includes(term);
                                                })
                                                .sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''))
                                                .map(c => (
                                                    <tr key={c.nombre} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                        <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-color)' }}>{c.nombre}</td>
                                                        <td style={{ padding: '10px 12px', color: 'var(--text-color)' }}>{c.departamental || '—'}</td>
                                                        <td style={{ padding: '10px 12px', color: 'var(--accent-color)' }}>{c.mailComisaria || '—'}</td>
                                                        <td style={{ padding: '10px 12px', color: 'var(--accent-color)' }}>{c.mailDepartamental || '—'}</td>
                                                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                                 <button 
                                                                    onClick={() => {
                                                                        setNewComisaria({
                                                                            nombre: c.nombre,
                                                                            departamental: c.departamental || '',
                                                                            mailComisaria: c.mailComisaria || '',
                                                                            mailDepartamental: c.mailDepartamental || ''
                                                                        });
                                                                        setIsEditingComisaria(true);
                                                                        setEditingComisariaId(c.nombre);
                                                                    }}
                                                                    style={{ padding: '4px 8px', fontSize: '12px', background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '3px', cursor: 'pointer', color: 'var(--text-color)' }}
                                                                >
                                                                    Editar
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleDeleteComisaria(c.nombre)}
                                                                    style={{ padding: '4px 8px', fontSize: '12px', background: '#fef2f2', color: '#ef4444', border: '1px solid #fca5a5', borderRadius: '3px', cursor: 'pointer' }}
                                                                >
                                                                    Eliminar
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            {Object.keys(comisarias).length === 0 && (
                                                <tr>
                                                    <td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                                        No hay comisarías cargadas en la base de datos.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {isWorkspaceTab && (
                    <div className={styles.tabContent} style={{ padding: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <h2 className={styles.sectionTitle} style={{ margin: 0, color: 'var(--text-color)' }}>
                                    {activeTab === 'traslados' ? 'Traslados y Videoconferencias' : activeTab === 'mails' ? 'Mails' : 'Teléfonos'}
                                </h2>
                                {/* Sub-filtro para MAILS */}
                                {activeTab === 'mails' && (
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        {[{id:'citaciones',label:'CITACIÓN'},{id:'general',label:'GENERAL'}].map(s => (
                                            <button key={s.id} onClick={() => setMailSubTab(s.id)} style={{ padding: '3px 10px', fontSize: '11px', fontWeight: 700, borderRadius: '3px', cursor: 'pointer', border: '1px solid', borderColor: mailSubTab === s.id ? 'var(--accent-color)' : 'var(--border-color)', background: mailSubTab === s.id ? 'var(--accent-color)' : 'var(--surface-color)', color: mailSubTab === s.id ? '#fff' : 'var(--text-muted)' }}>
                                                {s.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                {/* Botón siguiente turno para TRASLADOS */}
                                {activeTab === 'traslados' && (
                                    <button onClick={() => setShowNextTurnoOnly(v => !v)} style={{ padding: '5px 12px', fontSize: '12px', fontWeight: 700, borderRadius: '4px', cursor: 'pointer', border: '1px solid', borderColor: showNextTurnoOnly ? 'var(--accent-color)' : 'var(--border-color)', background: showNextTurnoOnly ? 'var(--accent-color)' : 'var(--surface-color)', color: showNextTurnoOnly ? '#fff' : 'var(--text-color)' }}>
                                        {showNextTurnoOnly ? `▶ ${getNextTurno().label}` : 'SIGUIENTE TURNO'}
                                    </button>
                                )}
                                <button onClick={fetchWorkspaceData} style={{ background: 'var(--surface-color)', border: '1px solid var(--border-color)', color: 'var(--text-color)', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>ACTUALIZAR</button>
                            </div>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                            {workspaceLoading ? (
                                <div className={styles.loading}>Cargando datos...</div>
                            ) : activeWorkspaceData.length === 0 ? (
                                <div className={styles.emptyState}>{showNextTurnoOnly ? `Sin items para el siguiente turno (${getNextTurno().label}).` : 'No hay datos para esta vista.'}</div>
                            ) : (
                                <table style={{ tableLayout: 'fixed', width: '100%', borderCollapse: 'collapse', fontSize: '14px', background: 'var(--surface-color)', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid var(--border-color)' }}>
                                    <thead style={{ background: 'var(--card-header-bg)', borderBottom: '2px solid var(--border-color)' }}>
                                        <tr>
                                            {activeTab === 'traslados' && <>
                                                <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '12px', width: '95px' }}>DÍA / HORARIO</th>
                                                <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '12px', width: '95px' }}>TIPO</th>
                                            </>}
                                            <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '12px', width: '155px' }}>LEGAJO</th>
                                            <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '12px' }}>CARÁTULA</th>
                                            <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '12px', width: '145px' }}>APELLIDO Y NOMBRE</th>
                                            {activeTab === 'traslados' && <>
                                                <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '12px', width: '120px' }}>DIRECCIÓN</th>
                                                <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '12px', width: '180px' }}>COMISARÍA</th>
                                                <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '12px', width: '160px' }}>DEPARTAMENTAL</th>
                                            </>}
                                            {activeTab !== 'traslados' && <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '12px', width: activeTab === 'mails' ? '220px' : '150px' }}>DESTINO</th>}
                                            <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '12px', width: '115px' }}>DOCUMENTOS</th>
                                            <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', width: '55px', borderLeft: '1px solid var(--border-color)' }}>LISTA</th>
                                            <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', width: '55px', borderLeft: '1px solid var(--border-color)' }}>NOTIF.</th>
                                            <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', width: '55px', borderLeft: '1px solid var(--border-color)' }}>COMPROB.</th>
                                            <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', width: '55px', borderLeft: '1px solid var(--border-color)' }}>INDICADA</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {activeWorkspaceData.map(item => {
                                            const { customId, data: itemData, docType } = item;
                                            const flags = itemData.statusFlags || { listaParaNotificar: false, notificada: false, comprobante: false, indicadaComoNotificada: false };
                                             const docsArray = Array.isArray(itemData?.documentos)
                                                 ? itemData.documentos
                                                 : (itemData?.documentos && typeof itemData.documentos === 'object' ? Object.values(itemData.documentos) : []);
                                            const meta = activeTab === 'traslados' ? getTrasladoMeta(item) : null;
                                            const rawComisaria = itemData.comisaria || '';
                                            const normalizedComisaria = getNormalizedComisaria(rawComisaria, comisarias);
                                            const borderColor = meta ? (meta.turno === 'mañana' ? '#3b82f6' : '#f97316') : (itemData.manual ? '#ef4444' : null);
                                            const bgColor = meta ? (meta.turno === 'mañana' ? 'var(--turno-manana-bg)' : 'var(--turno-tarde-bg)') : (itemData.manual ? 'var(--manual-bg)' : null);
                                            const rowStyle = { borderBottom: '1px solid var(--border-color)', ...(borderColor ? { backgroundColor: bgColor, borderLeft: `3px solid ${borderColor}` } : {}) };

                                            return (
                                                <React.Fragment key={customId}>
                                                    <tr style={rowStyle}>
                                                        {/* Columnas específicas de TRASLADOS */}
                                                        {activeTab === 'traslados' && <>
                                                            <td style={{ padding: '10px 12px' }}>
                                                                <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--text-color)' }}>{meta.dayLabel}</div>
                                                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{itemData.fechaAud?.split(' ')[1] || ''}</div>
                                                                <div style={{ fontSize: '10px', fontWeight: 700, color: meta.turno === 'mañana' ? '#3b82f6' : '#f97316' }}>{meta.turnoLabel}</div>
                                                            </td>
                                                            <td style={{ padding: '10px 12px' }}>
                                                                <span style={{ padding: '3px 8px', borderRadius: '3px', fontSize: '10px', fontWeight: 700, background: meta.isVC ? 'rgba(139,92,246,0.12)' : 'var(--surface-color)', color: meta.isVC ? '#8b5cf6' : 'var(--text-color)', border: `1px solid ${meta.isVC ? 'rgba(139,92,246,0.3)' : 'var(--border-color)'}` }}>
                                                                    {meta.isVC ? 'VIDEOCONF.' : 'TRASLADO'}
                                                                </span>
                                                            </td>
                                                        </>}
                                                        <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-color)' }}>
                                                            {itemData.numeroLeg}
                                                            <div style={{ fontSize: '13px', color: 'var(--accent-color)', fontWeight: 600, marginTop: '5px', cursor: 'pointer' }} onClick={() => setWsExpandedRow(wsExpandedRow === customId ? null : customId)}>
                                                                {wsExpandedRow === customId ? '▲ Ocultar' : '▼ Ver Texto'}
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '10px 12px', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-color)' }}>
                                                            {itemData.caratula}
                                                            {itemData.tipoNotificacion && <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>{itemData.tipoNotificacion}</div>}
                                                        </td>
                                                        <td style={{ padding: '10px 12px', color: 'var(--text-color)' }}>{itemData.ayp}</td>
                                                        
                                                        {/* Columnas DIRECCIÓN, COMISARÍA y DEPARTAMENTAL para traslados */}
                                                        {activeTab === 'traslados' && (
                                                            <>
                                                                <td style={{ padding: '10px 12px' }}>
                                                                    <div className={styles.direccionDiv} onClick={() => { setWsEditingId(`${customId}-domicilio`); setWsEditValue(itemData.domicilio || ''); }} title={itemData.domicilio || 'Click para editar'}>
                                                                        {wsEditingId === `${customId}-domicilio` ? (
                                                                            <input autoFocus value={wsEditValue} onChange={e => setWsEditValue(e.target.value)} onBlur={() => { handleUpdateField(docType, customId, itemData, 'domicilio', wsEditValue); setWsEditingId(null); }} onKeyDown={e => { if (e.key === 'Enter') { handleUpdateField(docType, customId, itemData, 'domicilio', wsEditValue); setWsEditingId(null); }}} style={{ width: '100%', padding: '4px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-color)' }} />
                                                                        ) : (itemData.domicilio || 'Sin dirección')}
                                                                    </div>
                                                                </td>
                                                                <td style={{ padding: '10px 12px' }}>
                                                                    <div 
                                                                        onClick={(e) => { 
                                                                            if (wsEditingId !== `${customId}-comisaria`) {
                                                                                setWsEditingId(`${customId}-comisaria`); 
                                                                                setWsEditValue(rawComisaria); 
                                                                            }
                                                                        }} 
                                                                        style={{ cursor: 'pointer', color: 'var(--accent-color)' }} 
                                                                        title="Click para cambiar comisaría"
                                                                    >
                                                                        {wsEditingId === `${customId}-comisaria` ? (
                                                                            <select 
                                                                                autoFocus
                                                                                value={wsEditValue} 
                                                                                onChange={e => {
                                                                                    const val = e.target.value;
                                                                                    handleUpdateField(docType, customId, itemData, 'comisaria', val);
                                                                                    setWsEditingId(null);
                                                                                }} 
                                                                                onBlur={() => setWsEditingId(null)}
                                                                                style={{ width: '100%', padding: '4px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-color)', fontSize: '13px' }}
                                                                            >
                                                                                <option value="">-- Sin comisaría --</option>
                                                                                {Object.keys(comisarias).sort().map(name => (
                                                                                    <option key={name} value={name}>{name}</option>
                                                                                ))}
                                                                            </select>
                                                                        ) : (
                                                                            <>
                                                                                <div style={{ fontWeight: 600 }}>{normalizedComisaria || 'Sin comisaría'}</div>
                                                                                {normalizedComisaria && (
                                                                                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', borderTop: '1px dashed var(--border-color)', paddingTop: '4px' }}>
                                                                                        <strong style={{ display: 'block', marginBottom: '2px' }}>Mails de envío:</strong>
                                                                                        {comisarias[normalizedComisaria]?.mailComisaria && <div style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={comisarias[normalizedComisaria].mailComisaria}>📧 {comisarias[normalizedComisaria].mailComisaria}</div>}
                                                                                        {comisarias[normalizedComisaria]?.mailDepartamental && <div style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={comisarias[normalizedComisaria].mailDepartamental}>📧 {comisarias[normalizedComisaria].mailDepartamental}</div>}
                                                                                        {!comisarias[normalizedComisaria]?.mailComisaria && !comisarias[normalizedComisaria]?.mailDepartamental && <div style={{ color: 'var(--text-muted)' }}>Sin mails registrados</div>}
                                                                                    </div>
                                                                                )}
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td style={{ padding: '10px 12px', color: 'var(--text-color)' }}>
                                                                    {normalizedComisaria && comisarias[normalizedComisaria] ? (
                                                                        comisarias[normalizedComisaria].departamental || '—'
                                                                    ) : (
                                                                        itemData.departamental || '—'
                                                                    )}
                                                                </td>
                                                            </>
                                                        )}

                                                        {/* Columna DESTINO solo para mails y telefonos */}
                                                        {activeTab === 'mails' && (
                                                            <td style={{ padding: '10px 12px', minWidth: '180px' }}>
                                                                <div onClick={() => { setWsEditingId(customId); setWsEditValue(itemData.emails?.join(', ') || ''); }} style={{ cursor: 'pointer', color: itemData.manual ? '#ef4444' : 'var(--accent-color)' }} title="Click para editar">
                                                                    {wsEditingId === customId ? (
                                                                        <input autoFocus value={wsEditValue} onChange={e => setWsEditValue(e.target.value)} onBlur={() => { handleUpdateField(docType, customId, itemData, 'emails', wsEditValue.split(',').map(s=>s.trim()).filter(Boolean)); setWsEditingId(null); }} onKeyDown={e => { if (e.key === 'Enter') { handleUpdateField(docType, customId, itemData, 'emails', wsEditValue.split(',').map(s=>s.trim()).filter(Boolean)); setWsEditingId(null); }}} style={{ width: '100%', padding: '4px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-color)' }} />
                                                                    ) : (itemData.emails?.length ? itemData.emails.join(', ') : 'Sin mail')}
                                                                </div>
                                                            </td>
                                                        )}
                                                        {activeTab === 'telefonos' && (
                                                            <td style={{ padding: '10px 12px', minWidth: '140px' }}>
                                                                <div onClick={() => { setWsEditingId(customId); setWsEditValue(itemData.telefonos || ''); }} style={{ cursor: 'pointer', color: 'var(--accent-color)', fontWeight: 600 }} title="Click para editar">
                                                                    {wsEditingId === customId ? (
                                                                        <input autoFocus value={wsEditValue} onChange={e => setWsEditValue(e.target.value)} onBlur={() => { handleUpdateField(docType, customId, itemData, 'telefonos', wsEditValue); setWsEditingId(null); }} onKeyDown={e => { if (e.key === 'Enter') { handleUpdateField(docType, customId, itemData, 'telefonos', wsEditValue); setWsEditingId(null); }}} style={{ width: '100%', padding: '4px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-color)' }} />
                                                                    ) : (itemData.telefonos || 'Sin teléfono')}
                                                                </div>
                                                            </td>
                                                        )}

                                                        {/* Columna DOCUMENTOS */}
                                                        <td style={{ padding: '10px 12px', fontSize: '12px' }}>
                                                            {docsArray.length > 0 ? (
                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                                    {docsArray.map((doc, idx) => (
                                                                        <a 
                                                                            key={idx} 
                                                                            href={doc?.link} 
                                                                            target="_blank" 
                                                                            rel="noopener noreferrer" 
                                                                            style={{ color: 'var(--accent-color)', textDecoration: 'none', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                                                            title={doc?.nombre}
                                                                        >
                                                                            📄 {doc?.nombre || 'Documento'}
                                                                        </a>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <span style={{ color: 'var(--text-muted)' }}>—</span>
                                                            )}
                                                        </td>

                                                        {[{key:'listaParaNotificar', width: '55px'},{key:'notificada', width: '55px'},{key:'comprobante', width: '55px'},{key:'indicadaComoNotificada', width: '55px'}].map(({key, width}) => (
                                                            <td key={key} style={{ padding: 0, textIndent: 0, verticalAlign: 'middle', borderLeft: '1px solid var(--border-color)', width, minWidth: width }}>
                                                                <label className={styles.checkboxLabel}>
                                                                    <input 
                                                                        type="checkbox" 
                                                                        checked={!!flags[key]} 
                                                                        onChange={() => handleCheckbox(docType, customId, itemData, key)} 
                                                                        style={{ width: '22px', height: '22px', cursor: 'pointer', accentColor: 'var(--accent-color)' }} 
                                                                    />
                                                                </label>
                                                            </td>
                                                        ))}
                                                    </tr>
                                                    {wsExpandedRow === customId && (
                                                        <tr style={{ background: 'var(--card-header-bg)' }}>
                                                            <td colSpan={activeTab === 'traslados' ? 13 : 9} style={{ padding: '14px' }}>
                                                                {activeTab === 'traslados' && normalizedComisaria && comisarias[normalizedComisaria] && (
                                                                    <div style={{ marginBottom: '12px', padding: '12px', background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '13px', color: 'var(--text-color)' }}>
                                                                        <strong style={{ color: 'var(--text-color)' }}>Contacto Comisaría:</strong>
                                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '6px' }}>
                                                                            <div><strong>Departamental:</strong> {comisarias[normalizedComisaria].departamental || '—'}</div>
                                                                            <div><strong>Email Comisaría:</strong> {comisarias[normalizedComisaria].mailComisaria ? <a href={`mailto:${comisarias[normalizedComisaria].mailComisaria}`} style={{ color: 'var(--accent-color)', textDecoration: 'underline' }}>{comisarias[normalizedComisaria].mailComisaria}</a> : '—'}</div>
                                                                            <div><strong>Email Departamental:</strong> {comisarias[normalizedComisaria].mailDepartamental ? <a href={`mailto:${comisarias[normalizedComisaria].mailDepartamental}`} style={{ color: 'var(--accent-color)', textDecoration: 'underline' }}>{comisarias[normalizedComisaria].mailDepartamental}</a> : '—'}</div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                <div style={{ fontSize: '13px', fontFamily: 'monospace', color: 'var(--text-color)', whiteSpace: 'pre-wrap', maxHeight: '280px', overflowY: 'auto', padding: '10px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                                                                    {itemData.text || 'Sin texto de documento.'}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}