import React, { useState } from 'react';
import { getFirestore, collection, doc, writeBatch, getDocs } from 'firebase/firestore';
import firebase_app from '@/firebase new/config';

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
            padding: '24px',
            maxWidth: '800px',
            background: '#1a1f2e',
            borderRadius: '12px',
            color: '#e2e8f0',
            margin: '20px auto',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            fontFamily: 'Inter, system-ui, sans-serif'
        }}>
            <h2 style={{ margin: '0 0 6px 0', color: '#60a5fa', fontSize: '20px' }}>
                🔄 Forzar Sincronización <code style={{ fontSize: '14px', background: '#2d3748', padding: '2px 6px', borderRadius: '4px' }}>audiencias → audienciasView</code>
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '20px', lineHeight: '1.6' }}>
                Lee los datos de <strong style={{ color: '#e2e8f0' }}>audiencias</strong> (fuente de verdad) y sobreescribe el espejo <strong style={{ color: '#e2e8f0' }}>audienciasView</strong> para el día seleccionado.
                Solo sincroniza los campos que realmente se guardan en ambas colecciones: <code style={{ background: '#2d3748', padding: '1px 4px', borderRadius: '3px', fontSize: '12px' }}>estado, hitos, mpf, defensa, imputado, partes, caratula, ...</code>
            </p>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', marginBottom: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontWeight: '600', fontSize: '14px', color: '#94a3b8' }}>Fecha a sincronizar:</label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        disabled={isSyncing}
                        style={{
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: '1px solid #4a5568',
                            background: '#2d3748',
                            color: '#e2e8f0',
                            fontSize: '15px',
                            outline: 'none',
                            cursor: isSyncing ? 'not-allowed' : 'text'
                        }}
                    />
                </div>

                <button
                    onClick={handleSync}
                    disabled={isSyncing || !selectedDate}
                    style={{
                        padding: '10px 24px',
                        background: isSyncing ? '#4a5568' : '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: (isSyncing || !selectedDate) ? 'not-allowed' : 'pointer',
                        fontWeight: '700',
                        fontSize: '15px',
                        transition: 'background 0.2s',
                        whiteSpace: 'nowrap',
                        opacity: !selectedDate ? 0.5 : 1,
                    }}
                >
                    {isSyncing ? '⏳ Sincronizando...' : '🔄 Forzar Sincronización'}
                </button>

                {logs.length > 0 && !isSyncing && (
                    <button
                        onClick={() => setLogs([])}
                        style={{
                            padding: '10px 16px',
                            background: 'transparent',
                            color: '#64748b',
                            border: '1px solid #4a5568',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '13px',
                        }}
                    >
                        Limpiar
                    </button>
                )}
            </div>

            {/* Campos que se sincronizan */}
            <details style={{ marginBottom: '16px' }}>
                <summary style={{ cursor: 'pointer', color: '#60a5fa', fontSize: '13px', userSelect: 'none' }}>
                    Ver campos sincronizados ({SYNCED_FIELDS.length})
                </summary>
                <div style={{
                    marginTop: '8px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '6px',
                }}>
                    {SYNCED_FIELDS.map(f => (
                        <span key={f} style={{
                            background: '#1e3a5f',
                            color: '#93c5fd',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontFamily: 'monospace'
                        }}>{f}</span>
                    ))}
                </div>
            </details>

            {/* Consola de logs */}
            <div style={{
                background: '#0d1117',
                color: '#4af626',
                padding: '14px',
                borderRadius: '8px',
                height: '280px',
                overflowY: 'auto',
                fontFamily: 'Consolas, monospace',
                fontSize: '13px',
                border: '2px solid #2d3748'
            }}>
                <div style={{ marginBottom: '10px', color: '#6b7280', borderBottom: '1px solid #1e293b', paddingBottom: '8px', fontWeight: 'bold' }}>
                    Consola
                </div>
                {logs.length === 0 && (
                    <div style={{ color: '#4b5563' }}>Esperando acción...</div>
                )}
                {logs.map((log, i) => (
                    <div key={i} style={{
                        marginBottom: '5px',
                        lineHeight: '1.5',
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
