'use client'
import React, { useState, useEffect, useMemo } from 'react';
import getDocument from '@/firebase/firestore/getDocument';
import { addOrUpdateObject } from '@/firebase/firestore/addOrUpdateObject';
import { removeObject } from '@/firebase/firestore/removeObject';
import getCollection from '@/firebase/firestore/getCollection';
import replaceDocument from '@/firebase/firestore/replaceDocument';
import styles from './Notificaciones.module.css';
import TrasladosTab from './components/TrasladosTab';
import TraduccionesManager from '../Traducciones-Notificaciones/components/TraduccionesManager';
import { AuthContextProvider } from "@/context/AuthContext";
import { DataContextProvider } from "@/context/DataContext";

export default function NotificacionesPage() {
    // Shared states
    const [activeTab, setActiveTab] = useState('citaciones'); // 'citaciones' | 'oficios' | 'traslados' | 'traducciones' | 'comisarias'
    const [searchTerm, setSearchTerm] = useState('');
    
    // Workspace states (Mails)
    const [workspaceData, setWorkspaceData] = useState({});
    const [workspaceLoading, setWorkspaceLoading] = useState(true);
    const [wsExpandedRow, setWsExpandedRow] = useState(null);
    const [wsEditingId, setWsEditingId] = useState(null);
    const [wsEditValue, setWsEditValue] = useState('');
    const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'

    // Reenvíos states
    const [resendModalItem, setResendModalItem] = useState(null);
    const [resendEmailInput, setResendEmailInput] = useState('');
    const [resendError, setResendError] = useState('');
    const [resendSaving, setResendSaving] = useState(false);

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
        if (activeTab === 'citaciones' || activeTab === 'oficios') {
            fetchWorkspaceData();
        }
        if (activeTab === 'verificacion') {
            fetchVerificacionData();
        }
    }, [activeTab]);

    // Verificación states
    const [verificacionData, setVerificacionData] = useState(null);
    const [verificacionLoading, setVerificacionLoading] = useState(true);

    // Revisión manual de fallas: por cada notificación (link) con fallas, el operador
    // marca si el hallazgo está bien indicado (true) o mal indicado / falso positivo
    // (false), con un comentario opcional. Se guarda EN VIVO (por ítem, no con un botón
    // de "guardar todo") en `revisionesVerificacion/{fecha}` — una colección separada de
    // `notificaciones/verificacionGenerales`, así que sobrevive aunque esta última se
    // resetee al cambiar de fecha o rehacer la verificación.
    // Forma en memoria: { [claveNotificacion]: { correcto, comentario, guardando, ... } }
    const [revisiones, setRevisiones] = useState({});
    // Cartel de confirmación antes de cambiar de fecha o rehacer si quedan notificaciones
    // sin marcar — para no perder revisión sin que el usuario lo haya decidido a propósito.
    const [confirmDialog, setConfirmDialog] = useState(null); // { tipo: 'fecha'|'rehacer', nuevaFecha?, mensaje }

    // Consulta de revisiones guardadas (pestaña "Revisiones"): elegís una fecha y trae lo
    // que se guardó ese día, sin depender de que la verificación de esa fecha siga cargada.
    const [revisionesConsultaFecha, setRevisionesConsultaFecha] = useState('');
    const [revisionesConsultaData, setRevisionesConsultaData] = useState(null);
    const [revisionesConsultaLoading, setRevisionesConsultaLoading] = useState(false);

    /**
     * Clave estable de una notificación para agrupar su revisión: el link de Puma (que
     * identifica la notificación real) o, si no hay link (verificaciones guardadas antes
     * de que se empezara a mandar el link), legajo+"sin-link" como respaldo.
     */
    const claveNotificacion = (notif) => notif.link || `${notif.numeroLeg}::sin-link`;

    const fetchRevisionesDelDia = async (fecha) => {
        if (!fecha) { setRevisiones({}); return; }
        try {
            const data = await getDocument('revisionesVerificacion', fecha);
            setRevisiones((data && data.revisiones) || {});
        } catch (error) {
            console.error("Error fetching revisiones del día:", error);
            setRevisiones({});
        }
    };

    const fetchVerificacionData = async () => {
        setVerificacionLoading(true);
        try {
            const data = await getDocument('notificaciones', 'verificacionGenerales');
            const finalData = data || { fecha: '', completado: false, fallos: [] };
            setVerificacionData(finalData);
            await fetchRevisionesDelDia(finalData.fecha);
        } catch (error) {
            console.error("Error fetching verificacion:", error);
            setVerificacionData({ fecha: '', completado: false, fallos: [] });
            setRevisiones({});
        } finally {
            setVerificacionLoading(false);
        }
    };

    /**
     * true si hay al menos una notificación con fallas todavía sin marcar (ni bien ni mal
     * indicada). Se usa para decidir si hace falta el cartel de confirmación antes de
     * cambiar de fecha o rehacer — si ya está todo revisado (y por lo tanto ya guardado),
     * no hay nada que se pueda perder y no hace falta preguntar.
     */
    const hayRevisionesPendientes = () => {
        const notifs = agruparNotificacionesConFallas(verificacionData);
        return notifs.some(notif => {
            const rev = revisiones[claveNotificacion(notif)];
            return !rev || rev.correcto !== true && rev.correcto !== false;
        });
    };

    const handleVerificacionFechaChangeConfirmado = async (nuevaFecha) => {
        const data = { fecha: nuevaFecha, completado: false, fallos: [], completadoEn: null };
        setVerificacionData(data);
        setRevisiones({});
        try {
            await replaceDocument('notificaciones', 'verificacionGenerales', data);
        } catch (error) {
            console.error("Error guardando fecha de verificacion:", error);
            alert("Error al guardar la fecha de verificación.");
        }
        if (nuevaFecha) fetchRevisionesDelDia(nuevaFecha);
    };

    const handleVerificacionFechaChange = (nuevaFecha) => {
        if (hayRevisionesPendientes()) {
            setConfirmDialog({
                tipo: 'fecha',
                nuevaFecha,
                mensaje: 'Hay notificaciones con fallas sin marcar (ni como bien ni como mal indicadas) en la fecha actual. Si cambiás de fecha ahora, esas quedan sin revisar y se pierden. ¿Querés cambiar de fecha igual?'
            });
            return;
        }
        handleVerificacionFechaChangeConfirmado(nuevaFecha);
    };

    /**
     * Guarda (o actualiza) la revisión de UNA notificación. Se guarda de inmediato en
     * `revisionesVerificacion/{fecha}` con `addOrUpdateObject`, que solo toca esa clave del
     * documento del día — así revisar una notificación nunca pisa la revisión de otra.
     */
    const guardarRevision = async (notif, cambios) => {
        const fecha = verificacionData?.fecha;
        if (!fecha) return;
        const key = claveNotificacion(notif);
        const anterior = revisiones[key] || {};

        const nuevo = {
            numeroLeg: notif.numeroLeg || '',
            link: notif.link || '',
            emailsFaltantes: notif.emailsFaltantes || [],
            documentosFaltantes: notif.documentosFaltantes || [],
            correcto: anterior.correcto ?? null,
            comentario: anterior.comentario ?? '',
            ...cambios,
            revisadoEn: new Date().toISOString()
        };

        setRevisiones(prev => ({ ...prev, [key]: { ...nuevo, guardando: true } }));
        try {
            await addOrUpdateObject('revisionesVerificacion', fecha, key, nuevo);
            setRevisiones(prev => ({ ...prev, [key]: { ...nuevo, guardando: false } }));
        } catch (error) {
            console.error("Error guardando revisión:", error);
            setRevisiones(prev => ({ ...prev, [key]: { ...anterior, guardando: false } }));
            alert("No se pudo guardar la revisión. Probá de nuevo.");
        }
    };

    // El comentario se guarda al salir del campo (blur), no en cada tecla — evita una
    // escritura a Firestore por letra tipeada. El valor mientras se escribe vive solo en
    // el estado local (marcado con `_dirty`) hasta que se confirma el guardado.
    const handleComentarioChange = (notif, value) => {
        const key = claveNotificacion(notif);
        setRevisiones(prev => ({
            ...prev,
            [key]: { ...(prev[key] || {}), comentario: value, _dirty: true }
        }));
    };

    const handleComentarioBlur = (notif) => {
        const key = claveNotificacion(notif);
        const actual = revisiones[key];
        if (!actual || !actual._dirty) return;
        guardarRevision(notif, { comentario: actual.comentario || '' });
    };

    const handleBuscarRevisionesGuardadas = async (fecha) => {
        setRevisionesConsultaFecha(fecha);
        if (!fecha) { setRevisionesConsultaData(null); return; }
        setRevisionesConsultaLoading(true);
        try {
            const data = await getDocument('revisionesVerificacion', fecha);
            setRevisionesConsultaData(data || { revisiones: {} });
        } catch (error) {
            console.error("Error buscando revisiones guardadas:", error);
            setRevisionesConsultaData({ revisiones: {} });
        } finally {
            setRevisionesConsultaLoading(false);
        }
    };

    /**
     * Arma la lista de notificaciones con fallas AGRUPADA POR LINK.
     *
     * Una notificación puede tener varios destinatarios sin notificar; el link tiene que
     * aparecer UNA sola vez con todos sus mails al lado, no repetido por cada mail. Y un
     * legajo puede tener varias notificaciones, cada una con su propio link. Por eso las
     * tres cantidades (legajos, notificaciones/links y mails) son distintas entre sí.
     *
     * C.O.N.O. ya envía esto listo en `notificacionesConFallas`. El agrupado a mano desde
     * `fallos` es solo para documentos viejos, guardados antes de que la verificación
     * empezara a mandar el link — sin esto, esos resultados se verían vacíos.
     */
    const agruparNotificacionesConFallas = (data) => {
        if (!data) return [];
        if (Array.isArray(data.notificacionesConFallas) && data.notificacionesConFallas.length > 0) {
            return data.notificacionesConFallas;
        }
        const porLink = new Map();
        for (const fallo of (data.fallos || [])) {
            const clave = fallo.link || `${fallo.numeroLeg}::sin-link`;
            if (!porLink.has(clave)) {
                porLink.set(clave, {
                    numeroLeg: fallo.numeroLeg,
                    link: fallo.link || '',
                    emailsFaltantes: [],
                    documentosFaltantes: []
                });
            }
            const grupo = porLink.get(clave);
            if (fallo.motivo === 'falta_email') {
                if (!grupo.emailsFaltantes.includes(fallo.email)) grupo.emailsFaltantes.push(fallo.email);
            } else if (fallo.documento) {
                grupo.documentosFaltantes.push({ email: fallo.email, documento: fallo.documento });
            }
        }
        return Array.from(porLink.values());
    };

    const handleForzarReverificacionConfirmado = async () => {
        if (!verificacionData) return;
        const data = { ...verificacionData, completado: false };
        setVerificacionData(data);
        try {
            await replaceDocument('notificaciones', 'verificacionGenerales', data);
        } catch (error) {
            console.error("Error forzando re-verificacion:", error);
            alert("Error al forzar la re-verificación.");
        }
    };

    const handleForzarReverificacion = () => {
        if (hayRevisionesPendientes()) {
            setConfirmDialog({
                tipo: 'rehacer',
                mensaje: 'Hay notificaciones con fallas sin marcar (ni como bien ni como mal indicadas). Al rehacer la verificación, esa lista se va a reemplazar y lo no revisado se pierde. ¿Querés rehacer igual?'
            });
            return;
        }
        handleForzarReverificacionConfirmado();
    };

    const fetchWorkspaceData = async () => {
        setWorkspaceLoading(true);
        try {
            // Fetch citaciones, oficios and mails
            const citacionesData = await getDocument('anotificar', 'citaciones');
            const oficiosData = await getDocument('anotificar', 'oficios');
            const mailsData = await getDocument('anotificar', 'mails');

            const processData = (d, source) => {
                const { id, createdAt, updatedAt, ...rest } = d || {};
                const result = {};
                Object.keys(rest).forEach(k => {
                    if (rest[k] && typeof rest[k] === 'object') {
                        result[k] = { ...rest[k], _sourceDoc: source };
                    }
                });
                return result;
            };

            setWorkspaceData({
                citaciones: processData(citacionesData, 'citaciones'),
                oficios: processData(oficiosData, 'oficios'),
                mails: processData(mailsData, 'mails')
            });
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

            const sourceDoc = itemData._sourceDoc || (activeTab === 'oficios' ? 'oficios' : 'citaciones');
            const { _sourceDoc, ...dataToSave } = updatedItem;

            setWorkspaceData(prev => ({
                ...prev,
                [sourceDoc]: {
                    ...(prev[sourceDoc] || {}),
                    [customId]: updatedItem
                }
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
        
        const sourceDoc = itemData._sourceDoc || (activeTab === 'oficios' ? 'oficios' : 'citaciones');

        try {
            setWorkspaceData(prev => ({
                ...prev,
                [sourceDoc]: {
                    ...(prev[sourceDoc] || {}),
                    [customId]: updatedItem
                }
            }));
            await addOrUpdateObject('anotificar', sourceDoc, customId, { statusFlags: newFlags });
        } catch (err) {
            console.error('Error updating checkbox', err);
            fetchWorkspaceData();
        }
    };

    const handleClearAll = async () => {
        const firstConfirm = window.confirm("⚠️ ADVERTENCIA: Estás a punto de ELIMINAR TODOS los documentos (citaciones, oficios y mails). ¿Deseas continuar?");
        if (!firstConfirm) return;
        
        const secondConfirm = window.confirm("🚨 SEGUNDA VERIFICACIÓN: Esta acción NO se puede deshacer. ¿Estás absolutamente seguro de que quieres BORRAR TODO?");
        if (!secondConfirm) return;
        
        setWorkspaceLoading(true);
        try {
            await replaceDocument('anotificar', 'citaciones', {});
            await replaceDocument('anotificar', 'oficios', {});
            await replaceDocument('anotificar', 'mails', {});
            alert("✅ Todos los documentos han sido eliminados correctamente.");
            fetchWorkspaceData();
        } catch (error) {
            console.error("Error al limpiar documentos:", error);
            alert("❌ Ocurrió un error al intentar eliminar los documentos.");
            setWorkspaceLoading(false);
        }
    };

    const parseEmails = (input) => {
        if (!input) return [];
        const parts = input.split(/[,;\s\n]+/);
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const valid = parts
            .map(p => p.trim().toLowerCase())
            .filter(p => p && emailRegex.test(p));
        return Array.from(new Set(valid));
    };

    const handleSaveResend = async (e) => {
        e.preventDefault();
        if (!resendModalItem) return;

        const { customId, itemData } = resendModalItem;
        const parsedEmails = parseEmails(resendEmailInput);

        if (parsedEmails.length === 0) {
            setResendError('Debes ingresar al menos un email válido.');
            return;
        }

        setResendSaving(true);
        setResendError('');

        try {
            const existingNumbers = Object.keys(itemData || {})
                .filter(key => /^resend\d+$/.test(key))
                .map(key => parseInt(key.replace('resend', ''), 10))
                .filter(num => !isNaN(num));

            const nextNum = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
            const newResendKey = `resend${nextNum}`;

            const newResendData = {
                emails: parsedEmails,
                notificada: false,
                comprobante: false
            };

            const sourceDoc = itemData._sourceDoc || (activeTab === 'oficios' ? 'oficios' : 'citaciones');

            await addOrUpdateObject('anotificar', sourceDoc, customId, { [newResendKey]: newResendData });

            setWorkspaceData(prev => {
                const group = prev[sourceDoc] || {};
                const currentItem = group[customId] || itemData;
                return {
                    ...prev,
                    [sourceDoc]: {
                        ...group,
                        [customId]: {
                            ...currentItem,
                            [newResendKey]: newResendData
                        }
                    }
                };
            });

            setResendModalItem(null);
            setResendEmailInput('');
        } catch (err) {
            console.error('Error al guardar reenvío:', err);
            setResendError('Ocurrió un error al guardar el reenvío.');
        } finally {
            setResendSaving(false);
        }
    };


    const activeWorkspaceData = useMemo(() => {
        if (activeTab === 'citaciones' || activeTab === 'oficios') {
            let sourceItems = {};
            if (activeTab === 'citaciones') {
                sourceItems = {
                    ...(workspaceData.mails || {}),
                    ...(workspaceData.citaciones || {})
                };
            } else if (activeTab === 'oficios') {
                sourceItems = workspaceData.oficios || {};
            }

            let items = Object.entries(sourceItems).map(([id, val]) => ({ customId: id, data: val }));

            if (searchTerm.trim()) {
                const term = searchTerm.toLowerCase().trim();
                items = items.filter(item => {
                    const leg = (item.data.numeroLeg || '').toLowerCase();
                    const caratula = (item.data.caratula || '').toLowerCase();
                    const ayp = (item.data.ayp || '').toLowerCase();
                    const emails = Array.isArray(item.data.emails) ? item.data.emails.join(' ').toLowerCase() : '';
                    return leg.includes(term) || caratula.includes(term) || ayp.includes(term) || emails.includes(term);
                });
            }
            
            return items.sort((a, b) => {
                const legA = a.data?.numeroLeg || '';
                const legB = b.data?.numeroLeg || '';
                
                // Agrupar por legajo (orden alfabético/numérico)
                if (legA !== legB) {
                    const comp = legA.localeCompare(legB, undefined, { numeric: true, sensitivity: 'base' });
                    return sortOrder === 'asc' ? comp : -comp;
                }
                
                // Dentro del mismo legajo, ordenar por fecha (descendente)
                const dateA = a.data?.fechaAudiencia || a.data?.fecha || '';
                const dateB = b.data?.fechaAudiencia || b.data?.fecha || '';
                return dateB.localeCompare(dateA);
            });
        }
        return [];
    }, [workspaceData, activeTab, sortOrder, searchTerm]);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Sistema de Notificaciones</h1>
                <div className={styles.tabsContainer} style={{ flexWrap: 'wrap', gap: '8px' }}>
                    <button className={`${styles.tabBtn} ${activeTab === 'citaciones' ? styles.activeTab : ''}`} onClick={() => { setActiveTab('citaciones'); setSearchTerm(''); }}>Citaciones</button>
                    <button className={`${styles.tabBtn} ${activeTab === 'oficios' ? styles.activeTab : ''}`} onClick={() => { setActiveTab('oficios'); setSearchTerm(''); }}>Oficios</button>
                    <button className={`${styles.tabBtn} ${activeTab === 'traslados' ? styles.activeTab : ''}`} onClick={() => { setActiveTab('traslados'); setSearchTerm(''); }}>Traslados y Videoconferencias</button>
                    <button className={`${styles.tabBtn} ${activeTab === 'traducciones' ? styles.activeTab : ''}`} onClick={() => { setActiveTab('traducciones'); setSearchTerm(''); }}>Traducciones</button>
                    <button className={`${styles.tabBtn} ${activeTab === 'comisarias' ? styles.activeTab : ''}`} onClick={() => { setActiveTab('comisarias'); setSearchTerm(''); }}>Comisarías</button>
                    <button className={`${styles.tabBtn} ${activeTab === 'verificacion' ? styles.activeTab : ''}`} onClick={() => { setActiveTab('verificacion'); setSearchTerm(''); }}>Verificación</button>
                    <button className={`${styles.tabBtn} ${activeTab === 'revisiones' ? styles.activeTab : ''}`} onClick={() => { setActiveTab('revisiones'); setSearchTerm(''); }}>Revisiones</button>
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

                {(activeTab === 'citaciones' || activeTab === 'oficios') && (
                    <div className={styles.tabContent} style={{ padding: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                <h2 className={styles.sectionTitle} style={{ margin: 0, color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span>{activeTab === 'citaciones' ? 'Citaciones' : 'Oficios'}</span>
                                    <span style={{ fontSize: '13px', background: 'var(--surface-color)', padding: '2px 8px', borderRadius: '12px', border: '1px solid var(--border-color)', fontWeight: 600 }}>
                                        {activeWorkspaceData.length}
                                    </span>
                                </h2>
                                <input 
                                    type="text" 
                                    placeholder="Buscar legajo, carátula o email..." 
                                    value={searchTerm} 
                                    onChange={e => setSearchTerm(e.target.value)} 
                                    style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid var(--input-border)', fontSize: '13px', minWidth: '240px', background: 'var(--input-bg)', color: 'var(--text-color)' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <button onClick={handleClearAll} style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#ef4444', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>LIMPIAR TODO</button>
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
                                            <th 
                                                 onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')} 
                                                 style={{ 
                                                     padding: '10px 12px', 
                                                     textAlign: 'left', 
                                                     color: 'var(--text-muted)', 
                                                     fontSize: '12px', 
                                                     width: '155px',
                                                     cursor: 'pointer',
                                                     userSelect: 'none'
                                                 }}
                                                 title="Clic para cambiar el orden por legajo"
                                             >
                                                 LEGAJO {sortOrder === 'asc' ? '▲' : '▼'}
                                             </th>
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

                                            const resendKeys = Object.keys(itemData || {})
                                                .filter(key => /^resend\d+$/.test(key))
                                                .sort((a, b) => {
                                                    const numA = parseInt(a.replace('resend', ''), 10);
                                                    const numB = parseInt(b.replace('resend', ''), 10);
                                                    return numA - numB;
                                                });

                                            return (
                                                <React.Fragment key={customId}>
                                                    <tr style={rowStyle}>
                                                        <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-color)' }}>
                                                            {itemData.numeroLeg}
                                                            <div style={{ fontSize: '13px', color: 'var(--accent-color)', fontWeight: 600, marginTop: '5px', cursor: 'pointer' }} onClick={() => setWsExpandedRow(wsExpandedRow === customId ? null : customId)}>
                                                                {wsExpandedRow === customId ? '▲ Ocultar' : '▼ Ver Detalle'}
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
                                                            {resendKeys.length > 0 && (
                                                                <div style={{ marginTop: '6px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                                                    {resendKeys.map(rKey => {
                                                                        const num = rKey.replace('resend', '');
                                                                        const rObj = itemData[rKey] || {};
                                                                        const isDone = rObj.notificada && rObj.comprobante;
                                                                        return (
                                                                            <span 
                                                                                key={rKey} 
                                                                                style={{
                                                                                    fontSize: '10px',
                                                                                    fontWeight: 700,
                                                                                    padding: '1px 5px',
                                                                                    borderRadius: '3px',
                                                                                    background: isDone ? '#e5e7eb' : '#fef3c7',
                                                                                    color: isDone ? '#374151' : '#92400e',
                                                                                    border: '1px solid var(--border-color)',
                                                                                    cursor: 'pointer'
                                                                                }}
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setWsExpandedRow(customId);
                                                                                }}
                                                                                title={`Reenvío #${num}: ${rObj.emails?.join(', ') || ''}`}
                                                                            >
                                                                                🔄 R{num} {rObj.notificada ? '✓' : '⏳'}
                                                                            </span>
                                                                        );
                                                                    })}
                                                                </div>
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
                                                            <td colSpan={9} style={{ padding: '16px' }}>
                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                                                    {/* Texto del documento */}
                                                                    <div>
                                                                        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                                            Texto de la Notificación
                                                                        </div>
                                                                        <div style={{ fontSize: '13px', fontFamily: 'monospace', color: 'var(--text-color)', whiteSpace: 'pre-wrap', maxHeight: '220px', overflowY: 'auto', padding: '10px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                                                                            {itemData.text || 'Sin texto de documento.'}
                                                                        </div>
                                                                    </div>

                                                                    {/* Sección de Reenvíos */}
                                                                    <div style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '14px' }}>
                                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                                                            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                                <span>🔄 Reenvíos</span>
                                                                                {resendKeys.length > 0 && (
                                                                                    <span style={{ fontSize: '11px', background: 'var(--surface-color)', padding: '2px 8px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                                                                                        {resendKeys.length}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                            <button
                                                                                onClick={() => {
                                                                                    setResendModalItem({ customId, itemData });
                                                                                    setResendEmailInput('');
                                                                                    setResendError('');
                                                                                }}
                                                                                style={{
                                                                                    padding: '6px 12px',
                                                                                    fontSize: '12px',
                                                                                    fontWeight: 700,
                                                                                    background: 'var(--accent-color)',
                                                                                    color: '#fff',
                                                                                    border: 'none',
                                                                                    borderRadius: '4px',
                                                                                    cursor: 'pointer'
                                                                                }}
                                                                            >
                                                                                + Agregar reenvío
                                                                            </button>
                                                                        </div>

                                                                        {resendKeys.length === 0 ? (
                                                                            <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic', padding: '4px 0' }}>
                                                                                No hay reenvíos cargados para esta notificación.
                                                                            </div>
                                                                        ) : (
                                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                                                {resendKeys.map(rKey => {
                                                                                    const rObj = itemData[rKey] || {};
                                                                                    const num = rKey.replace('resend', '');
                                                                                    const emails = Array.isArray(rObj.emails) ? rObj.emails : [];

                                                                                    return (
                                                                                        <div key={rKey} style={{ padding: '10px 14px', background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                                                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                                                                                                <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-color)' }}>
                                                                                                    Reenvío #{num}
                                                                                                </div>
                                                                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                                                                    {/* Indicador Notificada */}
                                                                                                    <span style={{
                                                                                                        fontSize: '11px',
                                                                                                        fontWeight: 600,
                                                                                                        padding: '2px 8px',
                                                                                                        borderRadius: '4px',
                                                                                                        background: rObj.notificada ? '#dcfce7' : '#f3f4f6',
                                                                                                        color: rObj.notificada ? '#166534' : '#4b5563',
                                                                                                        border: rObj.notificada ? '1px solid #86efac' : '1px solid #d1d5db',
                                                                                                        display: 'inline-flex',
                                                                                                        alignItems: 'center',
                                                                                                        gap: '4px'
                                                                                                    }}>
                                                                                                        {rObj.notificada ? '✓ Enviado' : '⏳ Pendiente Envío'}
                                                                                                    </span>
                                                                                                    {/* Indicador Comprobante */}
                                                                                                    <span style={{
                                                                                                        fontSize: '11px',
                                                                                                        fontWeight: 600,
                                                                                                        padding: '2px 8px',
                                                                                                        borderRadius: '4px',
                                                                                                        background: rObj.comprobante ? '#dbeafe' : '#f3f4f6',
                                                                                                        color: rObj.comprobante ? '#1e40af' : '#4b5563',
                                                                                                        border: rObj.comprobante ? '1px solid #93c5fd' : '1px solid #d1d5db',
                                                                                                        display: 'inline-flex',
                                                                                                        alignItems: 'center',
                                                                                                        gap: '4px'
                                                                                                    }}>
                                                                                                        {rObj.comprobante ? '✓ Comprobante' : '⏳ Pendiente Comprobante'}
                                                                                                    </span>
                                                                                                </div>
                                                                                            </div>
                                                                                            <div style={{ fontSize: '13px', color: 'var(--text-color)' }}>
                                                                                                <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Destinatarios: </span>
                                                                                                {emails.length > 0 ? emails.join(', ') : <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>Sin destinatarios</span>}
                                                                                            </div>
                                                                                        </div>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        )}
                                                                    </div>
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

                {activeTab === 'verificacion' && (
                    <div className={styles.tabContent} style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {verificacionLoading || !verificacionData ? (
                            <div className={styles.loading}>Cargando datos...</div>
                        ) : (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Fecha a verificar</label>
                                        <input
                                            type="date"
                                            value={verificacionData.fecha || ''}
                                            onChange={e => handleVerificacionFechaChange(e.target.value)}
                                            style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--input-border)', fontSize: '14px', background: 'var(--input-bg)', color: 'var(--text-color)' }}
                                        />
                                    </div>

                                    <span style={{
                                        fontSize: '13px',
                                        fontWeight: 700,
                                        padding: '6px 14px',
                                        borderRadius: '6px',
                                        background: verificacionData.completado ? '#dcfce7' : '#fef9c3',
                                        color: verificacionData.completado ? '#166534' : '#854d0e',
                                        border: verificacionData.completado ? '1px solid #86efac' : '1px solid #fde047',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}>
                                        {verificacionData.completado ? '✅ Revisado' : '⏳ Pendiente'}
                                    </span>

                                    {verificacionData.completado && (
                                        <button
                                            onClick={handleForzarReverificacion}
                                            style={{ background: 'var(--surface-color)', border: '1px solid var(--border-color)', color: 'var(--text-color)', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                                        >
                                            FORZAR RE-VERIFICACIÓN
                                        </button>
                                    )}

                                    <button
                                        onClick={fetchVerificacionData}
                                        style={{ background: 'var(--surface-color)', border: '1px solid var(--border-color)', color: 'var(--text-color)', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                                    >
                                        ACTUALIZAR
                                    </button>
                                </div>

                                {!verificacionData.fecha ? (
                                    <div className={styles.emptyState}>Elegí una fecha para ejecutar la verificación.</div>
                                ) : !verificacionData.completado ? (
                                    <div className={styles.emptyState}>Verificación pendiente de ejecutarse para {verificacionData.fecha}.</div>
                                ) : (Array.isArray(verificacionData.fallos) && verificacionData.fallos.length === 0) ? (
                                    // El verde solo es "todo limpio" si además NO quedaron legajos sin
                                    // verificar; si los hay, decir "no se encontraron fallos" a secas
                                    // daría por notificado algo que en realidad no se pudo comprobar.
                                    (Array.isArray(verificacionData.legajosNoVerificables) && verificacionData.legajosNoVerificables.length > 0) ? (
                                        <div style={{ padding: '16px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#334155', fontSize: '14px', fontWeight: 600 }}>
                                            No se encontraron fallas en lo que sí se pudo verificar del {verificacionData.fecha}, pero quedaron legajos sin comprobar (abajo).
                                        </div>
                                    ) : (
                                        <div style={{ padding: '16px', background: '#dcfce7', border: '1px solid #86efac', borderRadius: '6px', color: '#166534', fontSize: '14px', fontWeight: 600 }}>
                                            ✅ No se encontraron fallos para {verificacionData.fecha}.
                                        </div>
                                    )
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {Object.entries(
                                            agruparNotificacionesConFallas(verificacionData).reduce((acc, notif) => {
                                                const key = notif.numeroLeg || 'Sin legajo';
                                                if (!acc[key]) acc[key] = [];
                                                acc[key].push(notif);
                                                return acc;
                                            }, {})
                                        ).map(([numeroLeg, notificaciones]) => (
                                            <div key={numeroLeg} style={{ background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '12px 16px' }}>
                                                <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-color)', marginBottom: '8px' }}>
                                                    {numeroLeg}
                                                    {notificaciones.length > 1 && (
                                                        <span style={{ fontWeight: 500, fontSize: '12px', color: 'var(--text-muted, #6b7280)', marginLeft: '8px' }}>
                                                            {notificaciones.length} notificaciones
                                                        </span>
                                                    )}
                                                </div>

                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                    {notificaciones.map((notif, nIdx) => (
                                                        <div
                                                            key={notif.link || nIdx}
                                                            style={{
                                                                borderLeft: '3px solid #fca5a5',
                                                                paddingLeft: '10px',
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                gap: '4px'
                                                            }}
                                                        >
                                                            {/* El link va UNA vez por notificación, no por cada mail faltante. */}
                                                            {notif.link ? (
                                                                <a
                                                                    href={notif.link}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    style={{ fontSize: '13px', fontWeight: 600, color: '#2563eb', textDecoration: 'none' }}
                                                                >
                                                                    🔗 Abrir notificación
                                                                </a>
                                                            ) : (
                                                                <span style={{ fontSize: '12px', color: 'var(--text-muted, #6b7280)' }}>
                                                                    (sin link — verificación anterior al guardado de links)
                                                                </span>
                                                            )}

                                                            {(notif.emailsFaltantes || []).map((email, i) => (
                                                                <div key={`e${i}`} style={{ fontSize: '13px', color: '#ef4444', display: 'flex', gap: '6px' }}>
                                                                    <span>⚠️</span>
                                                                    <span>Falta notificar a: {email}</span>
                                                                </div>
                                                            ))}

                                                            {(notif.documentosFaltantes || []).map((d, i) => (
                                                                <div key={`d${i}`} style={{ fontSize: '13px', color: '#ef4444', display: 'flex', gap: '6px' }}>
                                                                    <span>⚠️</span>
                                                                    <span>A {d.email} le falta el documento: {d.documento || '(desconocido)'}</span>
                                                                </div>
                                                            ))}

                                                            {/* Revisión manual: ¿este hallazgo está bien indicado o es un falso
                                                                positivo? Se guarda solo, sin botón de "guardar" — ver guardarRevision. */}
                                                            {(() => {
                                                                const rev = revisiones[claveNotificacion(notif)] || {};
                                                                return (
                                                                    <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed var(--border-color)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                                            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                                                                                ¿Está bien indicado?
                                                                            </span>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => guardarRevision(notif, { correcto: true })}
                                                                                style={{
                                                                                    padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                                                                                    border: rev.correcto === true ? '1px solid #16a34a' : '1px solid var(--border-color)',
                                                                                    background: rev.correcto === true ? '#dcfce7' : 'var(--surface-color)',
                                                                                    color: rev.correcto === true ? '#166534' : 'var(--text-color)'
                                                                                }}
                                                                            >
                                                                                ✔️ Sí, está bien
                                                                            </button>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => guardarRevision(notif, { correcto: false })}
                                                                                style={{
                                                                                    padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                                                                                    border: rev.correcto === false ? '1px solid #dc2626' : '1px solid var(--border-color)',
                                                                                    background: rev.correcto === false ? '#fee2e2' : 'var(--surface-color)',
                                                                                    color: rev.correcto === false ? '#991b1b' : 'var(--text-color)'
                                                                                }}
                                                                            >
                                                                                ✖️ No, está mal
                                                                            </button>
                                                                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                                                                {rev.guardando
                                                                                    ? 'Guardando…'
                                                                                    : (rev.correcto === true || rev.correcto === false)
                                                                                        ? '✓ Guardado'
                                                                                        : 'Sin revisar'}
                                                                            </span>
                                                                        </div>
                                                                        <textarea
                                                                            rows={2}
                                                                            placeholder="Comentario (opcional) — por qué está bien o mal indicado"
                                                                            value={rev.comentario || ''}
                                                                            onChange={e => handleComentarioChange(notif, e.target.value)}
                                                                            onBlur={() => handleComentarioBlur(notif)}
                                                                            style={{
                                                                                padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--input-border)',
                                                                                background: 'var(--input-bg)', color: 'var(--text-color)', fontSize: '12px',
                                                                                fontFamily: 'inherit', resize: 'vertical', maxWidth: '520px'
                                                                            }}
                                                                        />
                                                                    </div>
                                                                );
                                                            })()}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Legajos que NO se pudieron verificar. Van aparte y NO cuentan como
                                    "sin problemas": la verificación no logró comprobar nada de ellos,
                                    así que hay que volver a correrla para cubrirlos. Mostrarlos como
                                    limpios sería exactamente el error que se quiso evitar. */}
                                {Array.isArray(verificacionData.legajosNoVerificables) && verificacionData.legajosNoVerificables.length > 0 && (
                                    <div style={{ marginTop: '16px', padding: '12px 16px', background: '#fef9c3', border: '1px solid #fde047', borderRadius: '6px' }}>
                                        <div style={{ fontWeight: 700, fontSize: '13px', color: '#854d0e', marginBottom: '6px' }}>
                                            ❔ {verificacionData.legajosNoVerificables.length} legajo(s) sin verificar
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#854d0e', marginBottom: '8px' }}>
                                            No se pudo comprobar si fueron notificados. No están libres de fallas: hay que volver a correr la verificación.
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#854d0e', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                            {verificacionData.legajosNoVerificables.map((leg, i) => (
                                                <span key={i} style={{ background: '#fef3c7', border: '1px solid #fde047', borderRadius: '4px', padding: '2px 6px' }}>{leg}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {activeTab === 'revisiones' && (
                    <div className={styles.tabContent} style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Fecha a consultar</label>
                                <input
                                    type="date"
                                    value={revisionesConsultaFecha}
                                    onChange={e => handleBuscarRevisionesGuardadas(e.target.value)}
                                    style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--input-border)', fontSize: '14px', background: 'var(--input-bg)', color: 'var(--text-color)' }}
                                />
                            </div>
                        </div>

                        {revisionesConsultaLoading ? (
                            <div className={styles.loading}>Cargando revisiones...</div>
                        ) : !revisionesConsultaFecha ? (
                            <div className={styles.emptyState}>Elegí una fecha para ver las revisiones guardadas ese día.</div>
                        ) : (() => {
                            const lista = Object.entries((revisionesConsultaData && revisionesConsultaData.revisiones) || {})
                                .map(([key, rev]) => ({ key, ...rev }))
                                .sort((a, b) => (a.numeroLeg || '').localeCompare(b.numeroLeg || ''));

                            if (lista.length === 0) {
                                return <div className={styles.emptyState}>No hay revisiones guardadas para el {revisionesConsultaFecha}.</div>;
                            }

                            const correctas = lista.filter(r => r.correcto === true).length;
                            const incorrectas = lista.filter(r => r.correcto === false).length;

                            return (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                        {lista.length} notificación(es) revisada(s) — ✔️ {correctas} bien indicada(s), ✖️ {incorrectas} mal indicada(s)
                                    </div>
                                    {lista.map(rev => (
                                        <div key={rev.key} style={{ background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                                <strong style={{ fontSize: '14px', color: 'var(--text-color)' }}>{rev.numeroLeg || 'Sin legajo'}</strong>
                                                <span style={{
                                                    fontSize: '12px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px',
                                                    background: rev.correcto === true ? '#dcfce7' : '#fee2e2',
                                                    color: rev.correcto === true ? '#166534' : '#991b1b'
                                                }}>
                                                    {rev.correcto === true ? '✔️ Bien indicado' : '✖️ Mal indicado'}
                                                </span>
                                                {rev.link && (
                                                    <a href={rev.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>
                                                        🔗 Abrir notificación
                                                    </a>
                                                )}
                                            </div>

                                            {(rev.emailsFaltantes || []).length > 0 && (
                                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                                    Faltaba notificar a: {rev.emailsFaltantes.join(', ')}
                                                </div>
                                            )}
                                            {(rev.documentosFaltantes || []).length > 0 && (
                                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                                    Documentos faltantes: {rev.documentosFaltantes.map(d => `${d.email} → ${d.documento}`).join(' · ')}
                                                </div>
                                            )}
                                            {rev.comentario && (
                                                <div style={{ fontSize: '13px', color: 'var(--text-color)', background: 'var(--input-bg)', borderRadius: '4px', padding: '8px', border: '1px solid var(--border-color)' }}>
                                                    💬 {rev.comentario}
                                                </div>
                                            )}
                                            {rev.revisadoEn && (
                                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                                    Revisado el {new Date(rev.revisadoEn).toLocaleString('es-AR')}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}
                    </div>
                )}
            </main>

            {/* Cartel de confirmación antes de cambiar de fecha o rehacer con revisiones sin marcar */}
            {confirmDialog && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', zIndex: 1000, padding: '16px'
                }}>
                    <div style={{
                        background: 'var(--surface-color)', border: '1px solid var(--border-color)',
                        borderRadius: '8px', width: '100%', maxWidth: '440px', padding: '24px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)', color: 'var(--text-color)'
                    }}>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 700 }}>
                            ⚠️ Revisiones sin marcar
                        </h3>
                        <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                            {confirmDialog.mensaje}
                        </p>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                onClick={() => setConfirmDialog(null)}
                                style={{
                                    padding: '8px 16px', background: 'var(--surface-color)', border: '1px solid var(--border-color)',
                                    borderRadius: '4px', color: 'var(--text-color)', fontSize: '13px', fontWeight: 600, cursor: 'pointer'
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    const dialogo = confirmDialog;
                                    setConfirmDialog(null);
                                    if (dialogo.tipo === 'fecha') {
                                        handleVerificacionFechaChangeConfirmado(dialogo.nuevaFecha);
                                    } else {
                                        handleForzarReverificacionConfirmado();
                                    }
                                }}
                                style={{
                                    padding: '8px 16px', background: '#ef4444', border: 'none',
                                    borderRadius: '4px', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer'
                                }}
                            >
                                Sí, continuar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal para Agregar Reenvío */}
            {resendModalItem && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '16px'
                }}>
                    <div style={{
                        background: 'var(--surface-color)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        width: '100%',
                        maxWidth: '480px',
                        padding: '24px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        color: 'var(--text-color)'
                    }}>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 700 }}>
                            Agregar Reenvío
                        </h3>
                        <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                            Legajo: <strong>{resendModalItem.itemData.numeroLeg || '—'}</strong> — {resendModalItem.itemData.ayp || resendModalItem.itemData.caratula || ''}
                        </p>

                        <form onSubmit={handleSaveResend}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                                    Emails de los nuevos destinatarios
                                </label>
                                <textarea
                                    rows={4}
                                    autoFocus
                                    placeholder="Ej. destinatario1@dominio.com, destinatario2@dominio.com"
                                    value={resendEmailInput}
                                    onChange={e => {
                                        setResendEmailInput(e.target.value);
                                        if (resendError) setResendError('');
                                    }}
                                    style={{
                                        padding: '10px',
                                        borderRadius: '4px',
                                        border: '1px solid var(--input-border)',
                                        background: 'var(--input-bg)',
                                        color: 'var(--text-color)',
                                        fontSize: '14px',
                                        fontFamily: 'inherit',
                                        resize: 'vertical'
                                    }}
                                />
                                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                    Separá los emails por coma, espacio o salto de línea.
                                </span>
                            </div>

                            {resendError && (
                                <div style={{ color: '#ef4444', fontSize: '12px', marginBottom: '12px', fontWeight: 600 }}>
                                    ⚠️ {resendError}
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    disabled={resendSaving}
                                    onClick={() => setResendModalItem(null)}
                                    style={{
                                        padding: '8px 16px',
                                        background: 'var(--surface-color)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '4px',
                                        color: 'var(--text-color)',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={resendSaving}
                                    style={{
                                        padding: '8px 16px',
                                        background: 'var(--accent-color)',
                                        border: 'none',
                                        borderRadius: '4px',
                                        color: '#fff',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        cursor: resendSaving ? 'wait' : 'pointer'
                                    }}
                                >
                                    {resendSaving ? 'Guardando...' : 'Guardar Reenvío'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}