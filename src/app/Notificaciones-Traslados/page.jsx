'use client'
import React, { useState, useEffect, useMemo } from 'react';
import getDocument from '@/firebase/firestore/getDocument';
import { addOrUpdateObject } from '@/firebase/firestore/addOrUpdateObject';
import styles from './Notificaciones-Traslados.module.css';

const getNormalizedComisaria = (rawName, comisariasDict) => {
    if (!rawName) return '';
    const cleanRaw = rawName.toString().trim().toUpperCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // strip accents
    
    if (comisariasDict[cleanRaw]) return cleanRaw;
    
    const officialNames = Object.keys(comisariasDict);

    if (/^\d+$/.test(cleanRaw)) {
        const num = parseInt(cleanRaw, 10);
        const targetName = `COMISARIA ${num}`;
        if (officialNames.includes(targetName)) return targetName;
    }

    const numbersInRaw = cleanRaw.match(/\d+/);
    if (numbersInRaw) {
        const num = parseInt(numbersInRaw[0], 10);
        const isSub = cleanRaw.includes('SUB') || cleanRaw.includes('S-CRIA') || cleanRaw.includes('SCRIA');
        if (isSub) {
            const matchedSub = officialNames.find(name => name.includes('SUB') && name.includes(num.toString()));
            if (matchedSub) return matchedSub;
        } else {
            const targetName = `COMISARIA ${num}`;
            if (officialNames.includes(targetName)) return targetName;
        }
    }

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

export default function NotificacionesTrasladosPage() {
    const [trasladosData, setTrasladosData] = useState({});
    const [loading, setLoading] = useState(true);
    const [comisarias, setComisarias] = useState({});
    
    // Filters
    const [showNextTurnoOnly, setShowNextTurnoOnly] = useState(false);
    
    // UI states
    const [wsExpandedRow, setWsExpandedRow] = useState(null);
    const [wsEditingId, setWsEditingId] = useState(null);
    const [wsEditValue, setWsEditValue] = useState('');

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const coms = await getDocument('desplegables', 'comisarias');
                setComisarias(coms || {});
                
                const data = await getDocument('anotificar', 'traslados');
                const { id, createdAt, updatedAt, ...rest } = data || {};
                setTrasladosData(rest);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    const fetchWorkspaceData = async () => {
        setLoading(true);
        try {
            const data = await getDocument('anotificar', 'traslados');
            const { id, createdAt, updatedAt, ...rest } = data || {};
            setTrasladosData(rest);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateField = async (customId, itemData, field, value) => {
        try {
            let updatedItem = { ...itemData, [field]: value };
            if (field === 'comisaria') {
                const normName = getNormalizedComisaria(value, comisarias);
                updatedItem.comisaria = normName;
                updatedItem.departamental = comisarias[normName]?.departamental || '';
            }

            setTrasladosData(prev => ({
                ...prev, [customId]: updatedItem
            }));

            await addOrUpdateObject('anotificar', 'traslados', customId, updatedItem);
        } catch (err) {
            console.error('Error updating field', err);
            fetchWorkspaceData();
        }
    };

    const handleCheckbox = async (customId, itemData, flag) => {
        const currentFlags = itemData.statusFlags || {
            listaParaNotificar: false, notificada: false, comprobante: false, indicadaComoNotificada: false, vcWhatsApp: false
        };
        const newFlags = { ...currentFlags, [flag]: !currentFlags[flag] };
        const updatedItem = { ...itemData, statusFlags: newFlags };

        try {
            setTrasladosData(prev => ({
                ...prev, [customId]: updatedItem
            }));
            await addOrUpdateObject('anotificar', 'traslados', customId, { statusFlags: newFlags });
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
            ? { turno: 'tarde', dayOffset: 0, label: 'TARDE — HOY' }
            : { turno: 'mañana', dayOffset: 1, label: 'MAÑANA — MÑN' };
    };

    const activeWorkspaceData = useMemo(() => {
        const items = Object.entries(trasladosData).map(([id, val]) => ({ customId: id, data: val }));
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
        const afterTomorrow = new Date(today); afterTomorrow.setDate(afterTomorrow.getDate() + 2);
        const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
        
        let filtered = items.filter(item => {
            const d = parseDateWS(item.data.fechaAud || '');
            return d && d >= yesterday && d < afterTomorrow;
        });

        if (showNextTurnoOnly) {
            const { turno, dayOffset } = getNextTurno();
            const targetDay = new Date(today); targetDay.setDate(targetDay.getDate() + dayOffset);
            const targetDayEnd = new Date(targetDay); targetDayEnd.setDate(targetDayEnd.getDate() + 1);
            
            filtered = filtered.filter(item => {
                const isVC = !!item.data.esVideoconferencia;
                const d = parseDateWS(item.data.fechaAud || '');
                if (!d) return false;
                
                if (isVC) {
                    // VC shows up the entire day before
                    const esManana = d >= tomorrow && d < afterTomorrow;
                    return esManana;
                } else {
                    // Normal Traslados use next shift logic
                    const esDia = d >= targetDay && d < targetDayEnd;
                    const esTurno = turno === 'mañana' ? d.getHours() < 14 : d.getHours() >= 14;
                    return esDia && esTurno;
                }
            });
        }
        return filtered.sort((a, b) => (parseDateWS(a.data.fechaAud || '')?.getTime() || 0) - (parseDateWS(b.data.fechaAud || '')?.getTime() || 0));
    }, [trasladosData, showNextTurnoOnly]);

    const getTrasladoMeta = (item) => {
        const d = parseDateWS(item.data.fechaAud || '');
        if (!d) return { dayLabel: '?', turnoLabel: '?', isVC: false, turno: null };
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
        const dayLabel = d < today ? 'AYER' : d < tomorrow ? 'HOY' : 'MÑN';
        const turno = d.getHours() < 14 ? 'mañana' : 'tarde';
        return { dayLabel, turnoLabel: turno === 'mañana' ? 'MAÑANA' : 'TARDE', isVC: !!item.data.esVideoconferencia, turno };
    };

    const handleCopyWhatsAppVC = () => {
        const selectedItems = activeWorkspaceData.filter(item => item.data.esVideoconferencia && item.data.statusFlags?.vcWhatsApp);
        
        if (selectedItems.length === 0) {
            alert('No hay videoconferencias seleccionadas para copiar.');
            return;
        }

        let text = '*AUDIENCIAS POR VIDEOCONFERENCIA*\n\n';
        selectedItems.forEach(item => {
            const { data } = item;
            text += `*Legajo:* ${data.numeroLeg}\n`;
            text += `*Persona a conectar:* ${data.ayp}\n`;
            text += `*Horario:* ${data.fechaAud}\n\n`;
        });

        navigator.clipboard.writeText(text).then(() => {
            alert('Texto para WhatsApp copiado al portapapeles!');
        }).catch(err => {
            console.error('Error copiando texto: ', err);
            alert('Hubo un error copiando el texto.');
        });
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Traslados y Videoconferencias</h1>
                    <p style={{ margin: '8px 0 0 0', color: 'var(--text-muted)', fontSize: '14px' }}>
                        Gestión de traslados físicos de personas y conexiones remotas (VC).
                    </p>
                </div>
            </header>

            <main className={styles.mainContent} style={{ padding: 0, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button onClick={() => setShowNextTurnoOnly(v => !v)} style={{ padding: '5px 12px', fontSize: '12px', fontWeight: 700, borderRadius: '4px', cursor: 'pointer', border: '1px solid', borderColor: showNextTurnoOnly ? 'var(--accent-color)' : 'var(--border-color)', background: showNextTurnoOnly ? 'var(--accent-color)' : 'var(--surface-color)', color: showNextTurnoOnly ? '#fff' : 'var(--text-color)' }}>
                            {showNextTurnoOnly ? `▶ FILTRADO: SIGUIENTE TURNO / DÍA` : 'FILTRAR SIGUIENTE TURNO'}
                        </button>
                        <button onClick={handleCopyWhatsAppVC} className={styles.actionBtn} style={{ background: '#25D366' }}>
                            Copiar VC WhatsApp
                        </button>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button onClick={fetchWorkspaceData} style={{ background: 'var(--surface-color)', border: '1px solid var(--border-color)', color: 'var(--text-color)', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>ACTUALIZAR</button>
                    </div>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                    {loading ? (
                        <div className={styles.loading}>Cargando datos...</div>
                    ) : activeWorkspaceData.length === 0 ? (
                        <div className={styles.emptyState}>{showNextTurnoOnly ? `Sin items para el siguiente turno.` : 'No hay datos para esta vista.'}</div>
                    ) : (
                        <table style={{ tableLayout: 'fixed', width: '100%', borderCollapse: 'collapse', fontSize: '14px', background: 'var(--surface-color)', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid var(--border-color)' }}>
                            <thead style={{ background: 'var(--card-header-bg)', borderBottom: '2px solid var(--border-color)' }}>
                                <tr>
                                    <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '12px', width: '95px' }}>DÍA / HORARIO</th>
                                    <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '12px', width: '95px' }}>TIPO</th>
                                    <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '12px', width: '155px' }}>LEGAJO</th>
                                    <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '12px' }}>CARÁTULA</th>
                                    <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '12px', width: '145px' }}>APELLIDO Y NOMBRE</th>
                                    <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '12px', width: '120px' }}>DIRECCIÓN</th>
                                    <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '12px', width: '180px' }}>COMISARÍA</th>
                                    <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '12px', width: '160px' }}>DEPARTAMENTAL</th>
                                    <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '12px', width: '115px' }}>DOCUMENTOS</th>
                                    <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', width: '55px', borderLeft: '1px solid var(--border-color)' }} title="Seleccionar para WhatsApp">WS.</th>
                                    <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', width: '55px', borderLeft: '1px solid var(--border-color)' }}>LISTA</th>
                                    <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', width: '55px', borderLeft: '1px solid var(--border-color)' }}>NOTIF.</th>
                                    <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', width: '55px', borderLeft: '1px solid var(--border-color)' }}>COMPROB.</th>
                                    <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', width: '55px', borderLeft: '1px solid var(--border-color)' }}>INDICADA</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activeWorkspaceData.map(item => {
                                    const { customId, data: itemData } = item;
                                    const flags = itemData.statusFlags || { listaParaNotificar: false, notificada: false, comprobante: false, indicadaComoNotificada: false, vcWhatsApp: false };
                                    const docsArray = Array.isArray(itemData?.documentos)
                                        ? itemData.documentos
                                        : (itemData?.documentos && typeof itemData.documentos === 'object' ? Object.values(itemData.documentos) : []);
                                    const meta = getTrasladoMeta(item);
                                    const rawComisaria = itemData.comisaria || '';
                                    const normalizedComisaria = getNormalizedComisaria(rawComisaria, comisarias);
                                    const borderColor = meta ? (meta.turno === 'mañana' ? '#3b82f6' : '#f97316') : (itemData.manual ? '#ef4444' : null);
                                    const bgColor = meta ? (meta.turno === 'mañana' ? 'var(--turno-manana-bg)' : 'var(--turno-tarde-bg)') : (itemData.manual ? 'var(--manual-bg)' : null);
                                    const rowStyle = { borderBottom: '1px solid var(--border-color)', ...(borderColor ? { backgroundColor: bgColor, borderLeft: `3px solid ${borderColor}` } : {}) };

                                    return (
                                        <React.Fragment key={customId}>
                                            <tr style={rowStyle}>
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
                                                
                                                <td style={{ padding: '10px 12px' }}>
                                                    <div className={styles.direccionDiv} onClick={() => { setWsEditingId(`${customId}-domicilio`); setWsEditValue(itemData.domicilio || ''); }} title={itemData.domicilio || 'Click para editar'}>
                                                        {wsEditingId === `${customId}-domicilio` ? (
                                                            <input autoFocus value={wsEditValue} onChange={e => setWsEditValue(e.target.value)} onBlur={() => { handleUpdateField(customId, itemData, 'domicilio', wsEditValue); setWsEditingId(null); }} onKeyDown={e => { if (e.key === 'Enter') { handleUpdateField(customId, itemData, 'domicilio', wsEditValue); setWsEditingId(null); }}} style={{ width: '100%', padding: '4px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-color)' }} />
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
                                                                    handleUpdateField(customId, itemData, 'comisaria', val);
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
                                                
                                                <td style={{ padding: 0, textIndent: 0, verticalAlign: 'middle', borderLeft: '1px solid var(--border-color)', width: '55px', minWidth: '55px', background: meta.isVC ? 'rgba(37, 211, 102, 0.1)' : 'transparent' }}>
                                                    {meta.isVC && (
                                                        <label className={styles.checkboxLabel}>
                                                            <input 
                                                                type="checkbox" 
                                                                checked={!!flags['vcWhatsApp']} 
                                                                onChange={() => handleCheckbox(customId, itemData, 'vcWhatsApp')} 
                                                                style={{ width: '22px', height: '22px', cursor: 'pointer', accentColor: '#25D366' }} 
                                                            />
                                                        </label>
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
                                                    <td colSpan={14} style={{ padding: '14px' }}>
                                                        {normalizedComisaria && comisarias[normalizedComisaria] && (
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
            </main>
        </div>
    );
}
