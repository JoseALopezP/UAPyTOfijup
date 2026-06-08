'use client'
import React, { useState, useEffect } from 'react';
import getDocument from '@/firebase/firestore/getDocument';
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
                        
                        {!isHistorial && ticket.cuerpo && (
                            <div className={styles.ticketDetailRow}>
                                <span className={styles.detailLabel}>Cuerpo:</span>
                                <p className={styles.cuerpoText}>{ticket.cuerpo}</p>
                            </div>
                        )}

                        <div className={styles.notificacionesList}>
                            <h4 className={styles.notificacionesTitle}>Personas a notificar:</h4>
                            {ticket.notificaciones && ticket.notificaciones.length > 0 ? (
                                <ul className={styles.personasUl}>
                                    {ticket.notificaciones.map((persona, index) => (
                                        <li key={index} className={`${styles.personaLi} ${persona.anotificar && !isHistorial ? styles.personaPending : styles.personaDone}`}>
                                            <div className={styles.personaInfo}>
                                                <strong>{persona.nombre}</strong> (DNI: {persona.dni})
                                            </div>
                                            <div className={styles.personaLinks}>
                                                {persona.linkSolicitud && (
                                                    <a href={persona.linkSolicitud} target="_blank" rel="noreferrer" className={styles.linkBtn}>
                                                        Ver Solicitud
                                                    </a>
                                                )}
                                                {!isHistorial && persona.anotificar && (
                                                    <span className={styles.pendingTag}>Pendiente</span>
                                                )}
                                            </div>
                                        </li>
                                    ))}
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

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Notificaciones</h1>
                <div className={styles.tabsContainer}>
                    <button 
                        className={`${styles.tabBtn} ${activeTab === 'pendientes' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('pendientes')}
                    >
                        A Notificar
                    </button>
                    <button 
                        className={`${styles.tabBtn} ${activeTab === 'historial' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('historial')}
                    >
                        Notificadas
                    </button>
                </div>
            </header>

            <main className={styles.mainContent}>
                {activeTab === 'pendientes' && (
                    <div className={styles.tabContent}>
                        <h2 className={styles.sectionTitle}>Dashboard General - Tareas Pendientes</h2>
                        {loading ? (
                            <div className={styles.loading}>Cargando tickets...</div>
                        ) : Object.keys(ticketsPendientes).length > 0 ? (
                            <div className={styles.ticketList}>
                                {Object.entries(ticketsPendientes).map(([id, ticket]) => renderTicket(id, ticket, false))}
                            </div>
                        ) : (
                            <div className={styles.emptyState}>No hay notificaciones pendientes.</div>
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
                        </div>
                        
                        {loading ? (
                            <div className={styles.loading}>Buscando historial...</div>
                        ) : Object.keys(ticketsHistorial).length > 0 ? (
                            <div className={styles.ticketList}>
                                {Object.entries(ticketsHistorial).map(([id, ticket]) => renderTicket(id, ticket, true))}
                            </div>
                        ) : (
                            <div className={styles.emptyState}>No se encontraron registros para {selectedMonth}/{selectedYear}.</div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
