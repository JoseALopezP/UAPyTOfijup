'use client'
import React, { useState, useEffect } from 'react';
import getDocument from '@/firebase/firestore/getDocument';
import { addOrUpdateObject } from '@/firebase/firestore/addOrUpdateObject';
import { removeObject } from '@/firebase/firestore/removeObject';
import styles from './Notificaciones.module.css';

export default function NotificacionesPage() {
    const [activeTab, setActiveTab] = useState('pendientes'); // 'pendientes' | 'historial'
    const [ticketsPendientes, setTicketsPendientes] = useState({});
    const [ticketsHistorial, setTicketsHistorial] = useState({});
    const [expandedTicket, setExpandedTicket] = useState(null);
    
    // Selectors for Historial
    const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [updatingIds, setUpdatingIds] = useState(new Set());
    const [reviewingId, setReviewingId] = useState(null);
    const [reviewStatus, setReviewStatus] = useState('');

    useEffect(() => {
        fetchPendientes();
    }, []);

    useEffect(() => {
        if (activeTab === 'historial') {
            fetchHistorial();
        }
    }, [activeTab, selectedMonth, selectedYear]);

    const fetchPendientes = async () => {
        setLoading(true);
        try {
            const data = await getDocument('notificaciones', 'anotificar');
            if (data) {
                setTicketsPendientes(data);
            } else {
                setTicketsPendientes({});
            }
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
            if (data) {
                setTicketsHistorial(data);
            } else {
                setTicketsHistorial({});
            }
        } catch (error) {
            console.error("Error fetching historial:", error);
        }
        setLoading(false);
    };

    const toggleExpand = (ticketId) => {
        if (expandedTicket === ticketId) {
            setExpandedTicket(null);
        } else {
            setExpandedTicket(ticketId);
        }
    };

    const countPendingNotifications = (notificacionesArray) => {
        if (!notificacionesArray || !Array.isArray(notificacionesArray)) return 0;
        return notificacionesArray.filter(n => n.anotificar === true).length;
    };

    const handleMarkAsNotified = async (ticketId, ticket, personaIndex) => {
        const itemKey = `${ticketId}-${personaIndex}`;
        setUpdatingIds(prev => {
            const next = new Set(prev);
            next.add(itemKey);
            return next;
        });

        try {
            const updatedTicket = { ...ticket };
            updatedTicket.notificaciones = [...ticket.notificaciones];
            
            const now = new Date();
            const fechaString = now.toLocaleString('es-AR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            // Set this specific person to not-pending and store when it happened
            updatedTicket.notificaciones[personaIndex] = {
                ...updatedTicket.notificaciones[personaIndex],
                anotificar: false,
                fechaNotificado: fechaString
            };

            // Check if there are still pending notifications for this ticket
            const stillPending = updatedTicket.notificaciones.some(p => p.anotificar === true);

            if (stillPending) {
                // Keep it in pending and update current state
                await addOrUpdateObject('notificaciones', 'anotificar', ticketId, updatedTicket);
                setTicketsPendientes(prev => ({
                    ...prev,
                    [ticketId]: updatedTicket
                }));
            } else {
                // If everything is notified, archive the ticket in the history document (MMYYYY)
                const month = (now.getMonth() + 1).toString().padStart(2, '0');
                const year = now.getFullYear().toString();
                const archiveDocId = `${month}${year}`;

                // Add to history
                await addOrUpdateObject('notificaciones', archiveDocId, ticketId, {
                    ...updatedTicket,
                    fechaFinalizado: fechaString
                });

                // Remove from pending
                await removeObject('notificaciones', 'anotificar', ticketId);

                // Update local state by removing the ticket
                setTicketsPendientes(prev => {
                    const next = { ...prev };
                    delete next[ticketId];
                    return next;
                });

                // Refresh history list if we are currently viewing the target month
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
                    if (parsed.type === 'progress') {
                        setReviewStatus(parsed.message);
                    }
                });

                const bodyData = { linkSolicitud };
                const result = await window.electronAPI.invoke('revisar-notificacion', bodyData);
                
                if (result && result.success) {
                    setReviewStatus('Revisión completada.');
                } else {
                    console.error("Error al revisar la notificación:", result?.error || 'Sin respuesta');
                    alert(`Error al revisar: ${result?.error || 'Sin respuesta'}`);
                }
            } else {
                console.error("electronAPI no está disponible.");
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

    const renderTicket = (ticketId, ticket, isHistorial = false) => {
        const isExpanded = expandedTicket === ticketId;
        const pendingCount = countPendingNotifications(ticket.notificaciones);
        const tipoClase = ticket.tipo === 'oficio' ? styles.tipoOficio : styles.tipoAgendamiento;

        return (
            <div key={ticketId} className={`${styles.ticketCard} ${isExpanded ? styles.expanded : ''}`}>
                <div className={styles.ticketHeader} onClick={() => toggleExpand(ticketId)}>
                    <div className={styles.ticketInfo}>
                        <span className={`${styles.badge} ${tipoClase}`}>
                            {ticket.tipo ? ticket.tipo.toUpperCase() : 'TAREA'}
                        </span>
                        <span className={styles.legajo}>Legajo: {ticket.nroLegajo}</span>
                        <span className={styles.fecha}>Fecha: {ticket.fecha}</span>
                    </div>
                    <div className={styles.ticketActions}>
                        {!isHistorial && pendingCount > 0 && (
                            <div className={styles.pendingCircle}>{pendingCount}</div>
                        )}
                        <span className={styles.expandIcon}>{isExpanded ? '▲' : '▼'}</span>
                    </div>
                </div>
                
                {isExpanded && (
                    <div className={styles.ticketBody}>
                        <div className={styles.ticketDetailRow}>
                            <span className={styles.detailLabel}>Generada:</span> 
                            <span>{ticket.fechaGenerada}</span>
                        </div>
                        
                        {ticket.fechaFinalizado && (
                            <div className={styles.ticketDetailRow}>
                                <span className={styles.detailLabel}>Finalizada:</span> 
                                <span>{ticket.fechaFinalizado}</span>
                            </div>
                        )}
                        
                        {ticket.cuerpo && (
                            <div className={styles.ticketDetailRow}>
                                <span className={styles.detailLabel}>Cuerpo:</span>
                                <p className={styles.cuerpoText}>{ticket.cuerpo}</p>
                            </div>
                        )}

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
                                                    {persona.fechaNotificado && (
                                                        <span style={{ display: 'block', fontSize: '12px', marginTop: '4px', opacity: 0.8 }}>
                                                            Notificado el: {persona.fechaNotificado}
                                                        </span>
                                                    )}
                                                    {reviewingId === itemKey && (
                                                        <span className={styles.reviewStatusText}>
                                                            ⏳ {reviewStatus}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className={styles.personaLinks}>
                                                    {persona.linkSolicitud && (
                                                        <a href={persona.linkSolicitud} target="_blank" rel="noreferrer" className={styles.linkBtn}>
                                                            Ver Solicitud
                                                        </a>
                                                    )}
                                                    {persona.linkSolicitud && (
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleReviewNotification(ticketId, ticket, index, persona.linkSolicitud);
                                                            }}
                                                            disabled={reviewingId !== null}
                                                            className={styles.reviewBtn}
                                                        >
                                                            {reviewingId === itemKey ? 'Revisando...' : 'Revisar'}
                                                        </button>
                                                    )}
                                                    {isPending ? (
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleMarkAsNotified(ticketId, ticket, index);
                                                            }}
                                                            disabled={isUpdating}
                                                            className={styles.actionBtn}
                                                        >
                                                            {isUpdating ? 'Guardando...' : 'Marcar Notificado'}
                                                        </button>
                                                    ) : (
                                                        <span className={styles.doneTag}>Notificado</span>
                                                    )}
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : (
                                <p className={styles.noData}>No hay personas asignadas a este ticket.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const filteredTickets = activeTab === 'pendientes' ? filterTickets(ticketsPendientes) : filterTickets(ticketsHistorial);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Notificaciones</h1>
                <div className={styles.tabsContainer}>
                    <button 
                        className={`${styles.tabBtn} ${activeTab === 'pendientes' ? styles.activeTab : ''}`}
                        onClick={() => {
                            setActiveTab('pendientes');
                            setSearchTerm('');
                        }}
                    >
                        A Notificar
                    </button>
                    <button 
                        className={`${styles.tabBtn} ${activeTab === 'historial' ? styles.activeTab : ''}`}
                        onClick={() => {
                            setActiveTab('historial');
                            setSearchTerm('');
                        }}
                    >
                        Notificadas
                    </button>
                </div>
            </header>

            <main className={styles.mainContent}>
                {activeTab === 'pendientes' && (
                    <div className={styles.tabContent}>
                        <h2 className={styles.sectionTitle}>Dashboard General - Tareas Pendientes</h2>
                        
                        <div className={styles.searchContainer}>
                            <input
                                type="text"
                                placeholder="Buscar por legajo, persona o DNI..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={styles.searchInput}
                            />
                        </div>

                        {loading ? (
                            <div className={styles.loading}>Cargando tickets...</div>
                        ) : filteredTickets.length > 0 ? (
                            <div className={styles.ticketList}>
                                {filteredTickets.map(([id, ticket]) => renderTicket(id, ticket, false))}
                            </div>
                        ) : (
                            <div className={styles.emptyState}>
                                {searchTerm ? 'No se encontraron resultados para su búsqueda.' : 'No hay notificaciones pendientes.'}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'historial' && (
                    <div className={styles.tabContent}>
                        <h2 className={styles.sectionTitle}>Historial de Notificadas</h2>
                        
                        <div className={styles.filters}>
                            <select 
                                value={selectedMonth} 
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className={styles.selectFilter}
                            >
                                {['01','02','03','04','05','06','07','08','09','10','11','12'].map(m => (
                                    <option key={m} value={m}>Mes {m}</option>
                                ))}
                            </select>
                            <select 
                                value={selectedYear} 
                                onChange={(e) => setSelectedYear(e.target.value)}
                                className={styles.selectFilter}
                            >
                                {[2024, 2025, 2026, 2027].map(y => (
                                    <option key={y} value={y.toString()}>{y}</option>
                                ))}
                            </select>
                            <button className={styles.refreshBtn} onClick={fetchHistorial}>Buscar</button>
                            
                            <input
                                type="text"
                                placeholder="Filtrar por legajo, persona o DNI..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={styles.searchInput}
                                style={{ marginLeft: 'auto', marginBottom: 0 }}
                            />
                        </div>
                        
                        {loading ? (
                            <div className={styles.loading}>Buscando historial...</div>
                        ) : filteredTickets.length > 0 ? (
                            <div className={styles.ticketList}>
                                {filteredTickets.map(([id, ticket]) => renderTicket(id, ticket, true))}
                            </div>
                        ) : (
                            <div className={styles.emptyState}>
                                {searchTerm ? 'No se encontraron resultados para su búsqueda.' : `No se encontraron registros para ${selectedMonth}/${selectedYear}.`}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
