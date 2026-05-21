import React, { useState } from 'react';
import { getFirestore, collection, doc, writeBatch, getDocs } from 'firebase/firestore';
import firebase_app from '@/firebase/config';

const db = getFirestore(firebase_app);

/**
 * Campos que se sincronizan entre audiencias (subcolección) y audienciasView (documento espejo).
 * Estas son TODAS las propiedades que las funciones updateData, updateDataDeep y pushToAudienciaArray
 * escriben en ambas colecciones simultáneamente.
 */
const SYNCED_FIELDS = [
    // Estado y hitos del cronómetro
    'estado', 'hitos', 'resuelvo', 'horaResuelvo',
    // Identificación
    'caratula', 'saeNum', 'sala', 'operador',
    // Partes
    'mpf', 'ufi', 'defensa', 'imputado', 'partes',
    // Tipo y reconversión
    'tipo', 'tipo2', 'tipo3', 'reconvertida',
    // Situación corporal
    'situacion',
    // Otros
    'razonDemora',
];

const formatDateStr = (dateStr) => {
    // dateStr viene como "YYYY-MM-DD" del input date
    const [year, month, day] = dateStr.split('-');
    return `${day}${month}${year}`; // → DDMMYYYY
};

const formatDisplay = (ddmmyyyy) =>
    ddmmyyyy.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');

const SyncPanel = () => {
    const [selectedDate, setSelectedDate] = useState('');
    const [isSyncing, setIsSyncing] = useState(false);
    const [logs, setLogs] = useState([]);

    const addLog = (message, type = 'info') => {
        const prefix = type === 'error' ? '❌' : type === 'warn' ? '⚠️' : type === 'ok' ? '✅' : 'ℹ️';
        setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} ${prefix} ${message}`]);
    };

    const handleSync = async () => {
        if (!selectedDate) {
            alert('Por favor, seleccioná una fecha.');
            return;
        }

        const dateStr = formatDateStr(selectedDate);
        setIsSyncing(true);
        setLogs([]);
        addLog(`Iniciando sincronización forzada para ${formatDisplay(dateStr)}...`);

        try {
            // 1. Leer todas las audiencias del día (fuente de verdad)
            const colRef = collection(db, 'audiencias', dateStr, 'audiencias');
            const snap = await getDocs(colRef);

            if (snap.empty) {
                addLog(`No se encontraron audiencias para la fecha ${formatDisplay(dateStr)}.`, 'warn');
                setIsSyncing(false);
                return;
            }

            addLog(`Se encontraron ${snap.docs.length} audiencias. Construyendo objeto espejo...`);

            // 2. Construir el objeto que irá a audienciasView
            //    Solo incluimos los campos sincronizados, más los de identificación necesarios para la vista
            const viewObj = {};

            for (const docSnap of snap.docs) {
                const data = docSnap.data();
                const audId = data.id || docSnap.id;

                // Extraer solo los campos sincronizados que existen en el documento
                const syncedData = { id: audId };

                // Campos de identificación de la vista (siempre presentes)
                const VIEW_IDENTITY_FIELDS = ['id', 'numeroLeg', 'hora', 'juez', 'aId'];
                for (const field of VIEW_IDENTITY_FIELDS) {
                    if (data[field] !== undefined) syncedData[field] = data[field];
                }

                // Campos de datos sincronizables
                for (const field of SYNCED_FIELDS) {
                    if (data[field] !== undefined) syncedData[field] = data[field];
                }

                viewObj[audId] = syncedData;
                addLog(`  → ${audId.slice(0, 8)}... (${data.numeroLeg || '?'} ${data.hora || '?'}) — ${Object.keys(syncedData).length} campos`, 'info');
            }

            // 3. Sobrescribir audienciasView con merge: false para forzar consistencia
            //    Usamos un batch para atomicidad
            const batch = writeBatch(db);
            const viewDocRef = doc(db, 'audienciasView', dateStr);

            // set con merge:false reemplaza el documento entero — garantiza consistencia total
            batch.set(viewDocRef, viewObj);

            await batch.commit();

            addLog(`Sincronización completada: ${snap.docs.length} audiencias escritas en audienciasView/${dateStr}.`, 'ok');
        } catch (error) {
            addLog(`ERROR: ${error.message}`, 'error');
            console.error('SyncPanel error:', error);
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div style={{
            padding: '20px',
            width: '100%',
            background: '#111115',
            borderRadius: '12px',
            color: '#e2e8f0',
            border: '1px solid #2B2B2B',
            boxSizing: 'border-box',
            fontFamily: 'Inter, system-ui, sans-serif'
        }}>
            <h2 style={{ margin: '0 0 6px 0', color: '#ffffff', fontSize: '18px', fontWeight: 600 }}>
                🔄 Forzar Sincronización <code style={{ fontSize: '12px', background: '#1c1c24', color: '#60a5fa', padding: '2px 6px', borderRadius: '4px' }}>audiencias → audienciasView</code>
            </h2>
            <p style={{ color: '#88889a', fontSize: '12px', marginBottom: '16px', lineHeight: '1.5' }}>
                Lee los datos de <strong style={{ color: '#ffffff' }}>audiencias</strong> y sobreescribe el espejo <strong style={{ color: '#ffffff' }}>audienciasView</strong> para el día seleccionado para garantizar consistencia total.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end', marginBottom: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '140px' }}>
                    <label style={{ fontWeight: '600', fontSize: '12px', color: '#88889a' }}>Fecha a sincronizar:</label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        disabled={isSyncing}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '1px solid #2B2B2B',
                            background: '#1c1c24',
                            color: '#ffffff',
                            fontSize: '14px',
                            outline: 'none',
                            cursor: isSyncing ? 'not-allowed' : 'text'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={handleSync}
                        disabled={isSyncing || !selectedDate}
                        style={{
                            padding: '8px 16px',
                            background: isSyncing ? '#2B2B2B' : '#1d4ed8',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: (isSyncing || !selectedDate) ? 'not-allowed' : 'pointer',
                            fontWeight: '600',
                            fontSize: '14px',
                            transition: 'background 0.2s',
                            whiteSpace: 'nowrap',
                            opacity: !selectedDate ? 0.5 : 1,
                        }}
                    >
                        {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
                    </button>

                    {logs.length > 0 && !isSyncing && (
                        <button
                            onClick={() => setLogs([])}
                            style={{
                                padding: '8px 12px',
                                background: 'transparent',
                                color: '#f87171',
                                border: '1px solid #7f1d1d',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '13px',
                            }}
                        >
                            Limpiar
                        </button>
                    )}
                </div>
            </div>

            {/* Campos que se sincronizan */}
            <details style={{ marginBottom: '16px' }}>
                <summary style={{ cursor: 'pointer', color: '#3b82f6', fontSize: '12px', userSelect: 'none', fontWeight: 500 }}>
                    Ver campos sincronizados ({SYNCED_FIELDS.length})
                </summary>
                <div style={{
                    marginTop: '8px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '4px',
                }}>
                    {SYNCED_FIELDS.map(f => (
                        <span key={f} style={{
                            background: '#1c1c24',
                            color: '#93c5fd',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontFamily: 'monospace'
                        }}>{f}</span>
                    ))}
                </div>
            </details>

            {/* Consola de logs */}
            <div style={{
                background: '#0c0c0e',
                color: '#4af626',
                padding: '12px',
                borderRadius: '8px',
                height: '200px',
                overflowY: 'auto',
                fontFamily: 'Consolas, monospace',
                fontSize: '12px',
                border: '1px solid #2B2B2B'
            }}>
                <div style={{ marginBottom: '8px', color: '#6b7280', borderBottom: '1px solid #1c1c24', paddingBottom: '6px', fontWeight: 'bold' }}>
                    Consola de Sincronización
                </div>
                {logs.length === 0 && (
                    <div style={{ color: '#4b5563' }}>Esperando acción...</div>
                )}
                {logs.map((log, i) => (
                    <div key={i} style={{
                        marginBottom: '4px',
                        lineHeight: '1.4',
                        color: log.includes('❌') ? '#f87171' : log.includes('✅') ? '#4af626' : log.includes('⚠️') ? '#fbbf24' : '#4af626'
                    }}>
                        {log}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SyncPanel;

