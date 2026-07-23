'use client';

import { useContext, useEffect, useState, useMemo } from 'react';
import { DataContext } from '@/context/DataContext';
import styles from './Traducciones.module.css';

export default function TraduccionesManager() {
    const {
        traducciones,
        updateTraducciones,
        addTraduccion,
        updateTraduccionData,
        deleteTraduccion,
        traduccionesJueces,
        updateTraduccionesJueces,
        addTraduccionJuez,
        updateTraduccionJuezData,
        deleteTraduccionJuez
    } = useContext(DataContext);

    const [tab, setTab] = useState('generales'); // 'generales' | 'jueces'
    const [search, setSearch] = useState('');
    const [selectedId, setSelectedId] = useState(null);
    const [showNuevo, setShowNuevo] = useState(false);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    // Formulario de edición/creación
    const [form, setForm] = useState({ nombre: '', emails: [] });
    const [newEmail, setNewEmail] = useState('');

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([
                updateTraducciones(),
                updateTraduccionesJueces()
            ]);
            setLoading(false);
        };
        loadData();
    }, []);

    const showToast = (msg, error = false) => {
        setToast({ msg, error });
        setTimeout(() => setToast(null), 3000);
    };

    // Conmutadores dinámicos según la pestaña activa
    const activeList = tab === 'generales' ? traducciones : traduccionesJueces;
    const addFunc = tab === 'generales' ? addTraduccion : addTraduccionJuez;
    const updateFunc = tab === 'generales' ? updateTraduccionData : updateTraduccionJuezData;
    const deleteFunc = tab === 'generales' ? deleteTraduccion : deleteTraduccionJuez;

    // Cambiar de pestaña limpiando la selección actual
    const handleTabChange = (newTab) => {
        setTab(newTab);
        setSelectedId(null);
        setShowNuevo(false);
        setForm({ nombre: '', emails: [] });
        setNewEmail('');
    };

    // Filtrar lista activa de traducciones según búsqueda
    const filteredList = useMemo(() => {
        const q = search.toLowerCase().trim();
        if (!activeList) return [];
        return activeList.filter(t => {
            const matchName = t.nombre?.toLowerCase().includes(q);
            const matchEmails = t.emails?.some(email => email.toLowerCase().includes(q));
            return matchName || matchEmails;
        });
    }, [activeList, search]);

    // Cuando se selecciona una traducción, cargarla en el formulario
    const handleSelect = (item) => {
        setSelectedId(item.id);
        setShowNuevo(false);
        setForm({ ...item });
        setNewEmail('');
    };

    // Iniciar creación de nueva traducción
    const handleNuevoClick = () => {
        setSelectedId(null);
        setShowNuevo(true);
        setForm({ nombre: '', emails: [] });
        setNewEmail('');
    };

    // Agregar email al listado del formulario actual
    const handleAddEmail = () => {
        const trimmed = newEmail.trim().toLowerCase();
        if (!trimmed) return;
        
        // Validación simple de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmed)) {
            showToast('Formato de correo electrónico no válido.', true);
            return;
        }

        if (form.emails.includes(trimmed)) {
            showToast('El correo electrónico ya existe en la lista.', true);
            return;
        }

        setForm(prev => ({
            ...prev,
            emails: [...prev.emails, trimmed]
        }));
        setNewEmail('');
    };

    // Remover email del formulario actual
    const handleRemoveEmail = (emailToRemove) => {
        setForm(prev => ({
            ...prev,
            emails: prev.emails.filter(e => e !== emailToRemove)
        }));
    };

    // Guardar (crear o actualizar)
    const handleSave = async () => {
        const nameTrimmed = form.nombre.trim();
        if (!nameTrimmed) {
            showToast('El nombre es obligatorio.', true);
            return;
        }

        if (form.emails.length === 0) {
            showToast('Debe agregar al menos un correo electrónico.', true);
            return;
        }

        try {
            if (showNuevo) {
                // Crear
                const newItem = {
                    id: Date.now().toString(),
                    nombre: nameTrimmed,
                    emails: form.emails
                };
                await addFunc(newItem);
                showToast('Regla agregada correctamente.');
                setShowNuevo(false);
                setSelectedId(newItem.id);
            } else {
                // Actualizar
                const updatedItem = {
                    ...form,
                    nombre: nameTrimmed
                };
                await updateFunc(updatedItem);
                showToast('Regla actualizada correctamente.');
            }
        } catch (e) {
            showToast('Error al guardar: ' + e.message, true);
        }
    };

    // Eliminar registro
    const handleDelete = async (id) => {
        if (!confirm('¿Está seguro de eliminar esta regla de traducción?')) return;
        try {
            await deleteFunc(id);
            showToast('Regla eliminada.');
            setSelectedId(null);
            setForm({ nombre: '', emails: [] });
        } catch (e) {
            showToast('Error al eliminar: ' + e.message, true);
        }
    };

    return (
        <div className={styles.container}>
            {/* PANEL IZQUIERDO: Búsqueda y listado */}
            <div className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <p className={styles.sidebarTitle}>Traducciones de Nombres</p>
                </div>
                
                {/* Selector de Pestañas */}
                <div className={styles.tabsContainer}>
                    <button
                        className={`${styles.tabButton} ${tab === 'generales' ? styles.tabButtonActive : ''}`}
                        onClick={() => handleTabChange('generales')}
                    >
                        Generales
                    </button>
                    <button
                        className={`${styles.tabButton} ${tab === 'jueces' ? styles.tabButtonActive : ''}`}
                        onClick={() => handleTabChange('jueces')}
                    >
                        Jueces
                    </button>
                </div>

                <div className={styles.searchContainer}>
                    <input
                        className={styles.searchInput}
                        placeholder={tab === 'generales' ? "Buscar por coincidencia o mail..." : "Buscar por juez o mail..."}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                
                <div className={styles.traduccionesList}>
                    {loading ? (
                        <div className={styles.emptyList}>Cargando...</div>
                    ) : filteredList.length === 0 ? (
                        <div className={styles.emptyList}>No se encontraron traducciones.</div>
                    ) : (
                        filteredList.map(item => (
                            <div
                                key={item.id}
                                className={`${styles.traduccionItem} ${selectedId === item.id ? styles.traduccionItemActive : ''}`}
                                onClick={() => handleSelect(item)}
                            >
                                <p className={styles.traduccionItemName}>{item.nombre}</p>
                                <p className={styles.traduccionItemSub}>
                                    {item.emails?.join(', ') || 'Sin correos'}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* PANEL DERECHO: Detalle / Edición / Creación */}
            <div className={styles.main}>
                <div className={styles.toolbar}>
                    <span className={styles.toolbarTitle}>
                        {tab === 'generales' ? 'Administración de Reglas Generales' : 'Administración de Reglas de Jueces'}
                        <span className={styles.toolbarSubtitle}>
                            {activeList?.length || 0} reglas configuradas
                        </span>
                    </span>
                    <button className={styles.btnPrimary} onClick={handleNuevoClick}>
                        + Nueva Regla
                    </button>
                </div>

                <div className={styles.detailContainer}>
                    {showNuevo || selectedId ? (
                        <div className={styles.detailCard}>
                            <div className={styles.detailHeader}>
                                <div>
                                    <h3 className={styles.detailTitle}>
                                        {showNuevo 
                                            ? (tab === 'generales' ? 'Crear Nueva Regla General' : 'Crear Nueva Regla de Juez')
                                            : (tab === 'generales' ? 'Editar Regla General' : 'Editar Regla de Juez')
                                        }
                                    </h3>
                                    <p className={styles.detailSubtitle}>
                                        {showNuevo
                                            ? 'Configure el nombre de coincidencia y los correos destinatarios correspondientes.'
                                            : `ID: ${form.id}`}
                                    </p>
                                </div>
                                {!showNuevo && (
                                    <button
                                        className={styles.btnDanger}
                                        style={{ padding: '6px 12px', fontSize: '11px' }}
                                        onClick={() => handleDelete(form.id)}
                                    >
                                        Eliminar Regla
                                    </button>
                                )}
                            </div>

                            {/* Campo Nombre */}
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>
                                    {tab === 'generales' ? 'Nombre a Traducir / Coincidencia' : 'Nombre del Juez / Coincidencia'}
                                </label>
                                <input
                                    className={styles.formInput}
                                    placeholder={tab === 'generales' ? "Ej. José López o López José" : "Ej. Juez Perez"}
                                    value={form.nombre}
                                    onChange={e => setForm(prev => ({ ...prev, nombre: e.target.value }))}
                                />
                                <span className={styles.formHelp}>
                                    {tab === 'generales' 
                                        ? 'El scraper buscará coincidencias sin importar el orden de las palabras, mayúsculas, minúsculas o acentos.'
                                        : 'El scraper detectará el nombre del juez y sustituirá el correo por los indicados a continuación.'
                                    }
                                </span>
                            </div>

                            {/* Campo Agregar Email */}
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Destinatarios de Correo (Notificaciones)</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input
                                        className={styles.formInput}
                                        placeholder="ejemplo@jussanjuan.gov.ar"
                                        value={newEmail}
                                        onChange={e => setNewEmail(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddEmail();
                                            }
                                        }}
                                    />
                                    <button
                                        className={styles.btnPrimary}
                                        style={{ padding: '8px 16px' }}
                                        onClick={handleAddEmail}
                                    >
                                        Agregar
                                    </button>
                                </div>
                                <span className={styles.formHelp}>
                                    Escriba el correo y haga clic en Agregar o presione Enter.
                                </span>

                                {/* Visualización de Emails Agregados */}
                                <div className={styles.chipContainer}>
                                    {form.emails.length === 0 ? (
                                        <span style={{ fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
                                            No hay correos agregados todavía.
                                        </span>
                                    ) : (
                                        form.emails.map(email => (
                                            <span key={email} className={styles.emailChip}>
                                                {email}
                                                <button
                                                    className={styles.emailChipDelete}
                                                    onClick={() => handleRemoveEmail(email)}
                                                    title="Eliminar"
                                                >
                                                    ✕
                                                </button>
                                            </span>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Botones de acción del formulario */}
                            <div className={styles.actionButtons}>
                                <button className={styles.btnPrimary} onClick={handleSave}>
                                    Guardar Cambios
                                </button>
                                <button
                                    className={styles.btnSecondary}
                                    onClick={() => {
                                        setShowNuevo(false);
                                        setSelectedId(null);
                                    }}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.emptyState}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" transform="translate(-1.5, -2) scale(0.85)" />
                                <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z" transform="translate(10, 10) scale(0.55)" />
                            </svg>
                            <p className={styles.emptyStateTitle}>Ninguna regla seleccionada</p>
                            <p className={styles.emptyStateText}>
                                {tab === 'generales'
                                    ? 'Seleccione una regla general del panel izquierdo para ver o modificar su configuración, o cree una nueva.'
                                    : 'Seleccione una regla de juez del panel izquierdo para ver o modificar su configuración, o cree una nueva.'
                                }
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {toast && (
                <div className={`${styles.toast} ${toast.error ? styles.toastError : ''}`}>
                    {toast.msg}
                </div>
            )}
        </div>
    );
}
