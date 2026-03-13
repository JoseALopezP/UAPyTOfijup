'use client'
import { useState, useContext, useEffect } from 'react'
import { DataContext } from '@/context New/DataContext'
import styles from '../SolicitudesAudiencia.module.css'

const STORAGE_KEY = 'app-theme'

export default function HeaderSolicitudes() {
    const { solicitudesPendientes, addSolicitudData } = useContext(DataContext);
    const [syncStatus, setSyncStatus] = useState('');
    const [isSyncing, setIsSyncing] = useState(false);
    const [isLight, setIsLight] = useState(false);

    // Cargar preferencia guardada al montar
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved === 'light') {
            setIsLight(true)
            document.body.classList.add('light-mode')
        }
    }, [])

    const toggleTheme = () => {
        const next = !isLight
        setIsLight(next)
        if (next) {
            document.body.classList.add('light-mode')
            localStorage.setItem(STORAGE_KEY, 'light')
        } else {
            document.body.classList.remove('light-mode')
            localStorage.setItem(STORAGE_KEY, 'dark')
        }
    }

    const syncSolicitudesHandler = async () => {
        try {
            console.log("[ui] Iniciando sincronización masiva...");
            setIsSyncing(true);
            setSyncStatus('Iniciando...');

            const existingData = Array.isArray(solicitudesPendientes) ? solicitudesPendientes : [];

            const response = await fetch('/api/extraer-solicitudes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ existingData, tiposAudiencia: desplegables?.tiposPuma || [] }),
            });

            if (!response.body) throw new Error("No readable stream");

            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let buffer = '';

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop();

                for (const line of lines) {
                    if (!line.trim()) continue;
                    try {
                        const parsed = JSON.parse(line);
                        if (parsed.type === 'progress') {
                            setSyncStatus(parsed.message);
                        } else if (parsed.type === 'done') {
                            const newItems = parsed.data || [];
                            console.log(`[ui] Guardando ${newItems.length} solicitudes nuevas en Firestore...`);
                            setSyncStatus(`Guardando ${newItems.length} solicitudes...`);
                            for (const item of newItems) {
                                const rowKey = item.linkSol
                                    ? item.linkSol.replace(/[^a-zA-Z0-9]/g, '_')
                                    : `${item.numeroLeg}_${item.fyhcreacion}`;
                                await addSolicitudData(rowKey, item);
                            }
                            setSyncStatus(`✓ ${newItems.length} solicitudes guardadas.`);
                            console.log("[ui] Guardado completo.");
                        } else if (parsed.type === 'error') {
                            setSyncStatus(`Error: ${parsed.error}`);
                        }
                    } catch (e) {
                        console.error("Error parseando chunk JSON:", e, line);
                    }
                }
            }
        } catch (error) {
            console.error("Error de red:", error);
            setSyncStatus(`Error de red: ${error.message}`);
        } finally {
            setIsSyncing(false);
        }
    }

    const statusColor = syncStatus.startsWith('✓') ? '#4ade80'
        : syncStatus.startsWith('Error') ? '#f87171'
            : '#6b7280'

    return (
        <div className={styles.solHeader}>
            <span className={styles.headerSection}>
                {/* Botón sincronizar */}
                <button
                    className={styles.syncButton}
                    title="Sincronizar Solicitudes"
                    onClick={syncSolicitudesHandler}
                    disabled={isSyncing}
                >
                    <i className={`fa ${isSyncing ? 'fa-spinner fa-spin' : 'fa-refresh'}`}></i>
                    {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
                </button>

                {/* Status */}
                {syncStatus && (
                    <span style={{
                        fontSize: '12px',
                        color: statusColor,
                        background: 'rgba(128,128,128,0.08)',
                        border: '1px solid rgba(128,128,128,0.15)',
                        borderRadius: '5px',
                        padding: '2px 10px',
                        maxWidth: '340px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        fontFamily: 'monospace',
                    }}>
                        {syncStatus}
                    </span>
                )}
            </span>

            {/* Botón tema — empujado al extremo derecho */}
            <button
                className={styles.themeButton}
                onClick={toggleTheme}
                title={isLight ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
            >
                <span>{isLight ? '🌙' : '☀️'}</span>
                <span className={styles.themeLabel}>{isLight ? 'Oscuro' : 'Claro'}</span>
            </button>
        </div>
    )
}