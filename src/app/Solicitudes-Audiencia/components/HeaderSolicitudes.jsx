'use client'
import { useState, useContext } from 'react'
import { DataContext } from '@/context New/DataContext'
import styles from '../SolicitudesAudiencia.module.css'

export default function HeaderSolicitudes() {
    const { solicitudesCompletadas, addSolicitudCompletada } = useContext(DataContext);
    const [syncStatus, setSyncStatus] = useState('');
    const [isSyncing, setIsSyncing] = useState(false);

    const syncSolicitudesHandler = async () => {
        try {
            console.log("[ui] Iniciando sincronización masiva...");
            setIsSyncing(true);
            setSyncStatus('Iniciando...');

            const existingData = Array.isArray(solicitudesCompletadas) ? solicitudesCompletadas : [];

            const response = await fetch('/api/extraer-solicitudes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ existingData }),
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
                                await addSolicitudCompletada(rowKey, item);
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


    return (
        <div className={`${styles.solHeader}`}>
            <span className={`${styles.headerSection}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                        className={`${styles.syncButton}`}
                        title="Sincronizar Solicitudes"
                        onClick={syncSolicitudesHandler}
                        disabled={isSyncing}
                    >
                        <i className={`fa ${isSyncing ? 'fa-spinner fa-spin' : 'fa-refresh'}`}></i>
                        {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
                    </button>
                    {syncStatus && (
                        <span style={{ fontSize: '0.9rem', color: '#555', fontStyle: 'italic', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {syncStatus}
                        </span>
                    )}
                </div>
            </span>

        </div>
    )
}