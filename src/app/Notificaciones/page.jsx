'use client'
import React, { useState, useEffect, useMemo } from 'react';
import getDocument from '@/firebase/firestore/getDocument';
import { addOrUpdateObject } from '@/firebase/firestore/addOrUpdateObject';
import { removeObject } from '@/firebase/firestore/removeObject';
import getCollection from '@/firebase/firestore/getCollection';
import styles from './Notificaciones.module.css';
import TrasladosTab from './components/TrasladosTab';
import TraduccionesManager from '../Traducciones-Notificaciones/components/TraduccionesManager';
import { AuthContextProvider } from "@/context/AuthContext";
import { DataContextProvider } from "@/context/DataContext";

export default function NotificacionesPage() {
    // Shared states
    const [activeTab, setActiveTab] = useState('citaciones'); // 'citaciones' | 'traslados' | 'traducciones' | 'comisarias'
    const [searchTerm, setSearchTerm] = useState('');
    
    // Workspace states (Mails)
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
        if (activeTab === 'citaciones') {
            fetchWorkspaceData();
        }
    }, [activeTab]);

    const fetchWorkspaceData = async () => {
        setWorkspaceLoading(true);
        try {
            // Fetch citaciones, oficios and mails
            const citacionesData = await getDocument('anotificar', 'citaciones');
            const oficiosData = await getDocument('anotificar', 'oficios');
            const mailsData = await getDocument('anotificar', 'mails');

            const processData = (d, source) => {
                const { id, createdAt, updatedAt, ...rest } = d || {};
                Object.keys(rest).forEach(k => {
                    if (rest[k] && typeof rest[k] === 'object') {
                        rest[k]._sourceDoc = source;
                    }
                });
                return rest;
            };

            const combined = {
                ...processData(mailsData, 'mails'),
                ...processData(citacionesData, 'citaciones'),
                ...processData(oficiosData, 'oficios')
            };

            setWorkspaceData(combined);
        } catch (err) {
            console.error(err);
        } finally {
            setWorkspaceLoading(false);
        }
    };

    const handleUpdateField = async (customId, itemData, field, value) => {
        try {
            let updatedItem = { ...itemData, [field]: value };
            if (field === 'emails' && itemData.manual) updatedItem.manual = false;

            const sourceDoc = itemData._sourceDoc || 'mails';
            const { _sourceDoc, ...dataToSave } = updatedItem;

            setWorkspaceData(prev => ({
                ...prev, [customId]: updatedItem
            }));

            await addOrUpdateObject('anotificar', sourceDoc, customId, dataToSave);
        } catch (err) {
            console.error('Error updating field', err);
            fetchWorkspaceData();
        }
    };

    const handleCheckbox = async (customId, itemData, flag) => {
        const currentFlags = itemData.statusFlags || {
            listaParaNotificar: false, notificada: false, comprobante: false, indicadaComoNotificada: false
        };
        const newFlags = { ...currentFlags, [flag]: !currentFlags[flag] };
        const updatedItem = { ...itemData, statusFlags: newFlags };
        
        const sourceDoc = itemData._sourceDoc || 'mails';

        try {
            setWorkspaceData(prev => ({
                ...prev, [customId]: updatedItem
            }));
            await addOrUpdateObject('anotificar', sourceDoc, customId, { statusFlags: newFlags });
        } catch (err) {
            console.error('Error updating checkbox', err);
            fetchWorkspaceData();
        }
    };

    const activeWorkspaceData = useMemo(() => {
        if (activeTab === 'citaciones') {
            const itemsRaw = workspaceData || {};
            const items = Object.entries(itemsRaw).map(([id, val]) => ({ customId: id, data: val }));
            
            return items.sort((a, b) => {
                const legA = a.data?.numeroLeg || '';
                const legB = b.data?.numeroLeg || '';
                
                // Agrupar por legajo (orden alfabético)
                if (legA !== legB) {
                    return legA.localeCompare(legB);
                }
                
                // Dentro del mismo legajo, ordenar por fecha (descendente)
                const dateA = a.data?.fechaAudiencia || a.data?.fecha || '';
                const dateB = b.data?.fechaAudiencia || b.data?.fecha || '';
                return dateB.localeCompare(dateA);
            });
        }
        return [];
    }, [workspaceData, activeTab]);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Sistema de Notificaciones</h1>
                <div className={styles.tabsContainer} style={{ flexWrap: 'wrap', gap: '8px' }}>
                    <button className={`${styles.tabBtn} ${activeTab === 'citaciones' ? styles.activeTab : ''}`} onClick={() => { setActiveTab('citaciones'); setSearchTerm(''); }}>Citaciones y Oficios</button>
                    <button className={`${styles.tabBtn} ${activeTab === 'traslados' ? styles.activeTab : ''}`} onClick={() => { setActiveTab('traslados'); setSearchTerm(''); }}>Traslados y Videoconferencias</button>
                    <button className={`${styles.tabBtn} ${activeTab === 'traducciones' ? styles.activeTab : ''}`} onClick={() => { setActiveTab('traducciones'); setSearchTerm(''); }}>Traducciones</button>
                    <button className={`${styles.tabBtn} ${activeTab === 'comisarias' ? styles.activeTab : ''}`} onClick={() => { setActiveTab('comisarias'); setSearchTerm(''); }}>Comisarías</button>
                </div>
            </header>

            <main className={styles.mainContent}>
                {activeTab === 'comisarias' && (
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

                {activeTab === 'traslados' && (
                    <div className={styles.tabContent} style={{ padding: 0, height: '100%' }}>
                        <TrasladosTab />
                    </div>
                )}

                {activeTab === 'traducciones' && (
                    <div className={styles.tabContent} style={{ padding: 0, height: '100%' }}>
                        <AuthContextProvider>
                            <DataContextProvider>
                                <TraduccionesManager />
                            </DataContextProvider>
                        </AuthContextProvider>
                    </div>
                )}

                {activeTab === 'citaciones' && (
                    <div className={styles.tabContent} style={{ padding: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <h2 className={styles.sectionTitle} style={{ margin: 0, color: 'var(--text-color)' }}>
                                    Mails de Citaciones y Oficios
                                </h2>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <button onClick={fetchWorkspaceData} style={{ background: 'var(--surface-color)', border: '1px solid var(--border-color)', color: 'var(--text-color)', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>ACTUALIZAR</button>
                            </div>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                            {workspaceLoading ? (
                                <div className={styles.loading}>Cargando datos...</div>
                            ) : activeWorkspaceData.length === 0 ? (
                                <div className={styles.emptyState}>No hay datos para esta vista.</div>
                            ) : (
                                <table style={{ tableLayout: 'fixed', width: '100%', borderCollapse: 'collapse', fontSize: '14px', background: 'var(--surface-color)', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid var(--border-color)' }}>
                                    <thead style={{ background: 'var(--card-header-bg)', borderBottom: '2px solid var(--border-color)' }}>
                                        <tr>
                                            <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '12px', width: '155px' }}>LEGAJO</th>
                                            <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '12px' }}>CARÁTULA</th>
                                            <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '12px', width: '145px' }}>APELLIDO Y NOMBRE</th>
                                            <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '12px', width: '220px' }}>DESTINO</th>
                                            <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '12px', width: '115px' }}>DOCUMENTOS</th>
                                            <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', width: '55px', borderLeft: '1px solid var(--border-color)' }}>LISTA</th>
                                            <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', width: '55px', borderLeft: '1px solid var(--border-color)' }}>NOTIF.</th>
                                            <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', width: '55px', borderLeft: '1px solid var(--border-color)' }}>COMPROB.</th>
                                            <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', width: '55px', borderLeft: '1px solid var(--border-color)' }}>INDICADA</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {activeWorkspaceData.map(item => {
                                            const { customId, data: itemData } = item;
                                            const flags = itemData.statusFlags || { listaParaNotificar: false, notificada: false, comprobante: false, indicadaComoNotificada: false };
                                             const docsArray = Array.isArray(itemData?.documentos)
                                                 ? itemData.documentos
                                                 : (itemData?.documentos && typeof itemData.documentos === 'object' ? Object.values(itemData.documentos) : []);
                                            const borderColor = itemData.manual ? '#ef4444' : null;
                                            const bgColor = itemData.manual ? 'var(--manual-bg)' : null;
                                            const rowStyle = { borderBottom: '1px solid var(--border-color)', ...(borderColor ? { backgroundColor: bgColor, borderLeft: `3px solid ${borderColor}` } : {}) };

                                            return (
                                                <React.Fragment key={customId}>
                                                    <tr style={rowStyle}>
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
                                                        
                                                        <td style={{ padding: '10px 12px', minWidth: '180px' }}>
                                                            <div onClick={() => { setWsEditingId(customId); setWsEditValue(itemData.emails?.join(', ') || ''); }} style={{ cursor: 'pointer', color: itemData.manual ? '#ef4444' : 'var(--accent-color)' }} title="Click para editar">
                                                                {wsEditingId === customId ? (
                                                                    <input autoFocus value={wsEditValue} onChange={e => setWsEditValue(e.target.value)} onBlur={() => { handleUpdateField(customId, itemData, 'emails', wsEditValue.split(',').map(s=>s.trim()).filter(Boolean)); setWsEditingId(null); }} onKeyDown={e => { if (e.key === 'Enter') { handleUpdateField(customId, itemData, 'emails', wsEditValue.split(',').map(s=>s.trim()).filter(Boolean)); setWsEditingId(null); }}} style={{ width: '100%', padding: '4px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-color)' }} />
                                                                ) : (itemData.emails?.length ? itemData.emails.join(', ') : 'Sin mail')}
                                                            </div>
                                                        </td>

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
                                                                        onChange={() => handleCheckbox(customId, itemData, key)} 
                                                                        style={{ width: '22px', height: '22px', cursor: 'pointer', accentColor: 'var(--accent-color)' }} 
                                                                    />
                                                                </label>
                                                            </td>
                                                        ))}
                                                    </tr>
                                                    {wsExpandedRow === customId && (
                                                        <tr style={{ background: 'var(--card-header-bg)' }}>
                                                            <td colSpan={9} style={{ padding: '14px' }}>
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