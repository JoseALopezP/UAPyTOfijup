import React, { useState } from 'react';
import { getFirestore, collection, doc, writeBatch, getDocs, getDoc } from 'firebase/firestore';
import firebase_app from '@/firebase/config';

const db = getFirestore(firebase_app);

const getDatesInRange = (startDateStr, endDateStr) => {
    const dates = [];
    const startParts = startDateStr.split('-');
    const endParts = endDateStr.split('-');

    const currentDate = new Date(startParts[0], startParts[1] - 1, startParts[2]);
    const endDateObj = new Date(endParts[0], endParts[1] - 1, endParts[2]);

    while (currentDate <= endDateObj) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
};

const formatDateStr = (dateObj) => {
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}${month}${year}`;
};

const MigrationPanel = () => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isMigrating, setIsMigrating] = useState(false);
    const [currentDateProccessing, setCurrentDateProccessing] = useState('');
    const [logs, setLogs] = useState([]);

    const addLog = (message) => {
        setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${message}`]);
    };

    const handleMigration = async () => {
        if (!startDate || !endDate) {
            alert('Por favor, selecciona fecha de inicio y fin.');
            return;
        }

        setIsMigrating(true);
        setLogs([]);
        addLog('Iniciando proceso de migración al Esquema Espejo...');

        const datesToProcess = getDatesInRange(startDate, endDate);

        for (const dateObj of datesToProcess) {
            const dateStr = formatDateStr(dateObj);
            setCurrentDateProccessing(dateStr);

            try {
                const viewDocRef = doc(db, 'audienciasView', dateStr);
                const viewSnap = await getDoc(viewDocRef);

                if (viewSnap.exists() && Object.keys(viewSnap.data() || {}).length > 0) {
                    addLog(`Día ${dateStr} saltado: Ya existe información en el esquema nuevo (audienciasView).`);
                    continue;
                }

                const oldColRef = collection(db, 'audiencias', dateStr, 'audiencias');
                const oldSnap = await getDocs(oldColRef);

                if (oldSnap.empty) {
                    addLog(`Día ${dateStr} saltado: No hay audiencias en el formato viejo para procesar.`);
                    continue;
                }

                const batch = writeBatch(db);
                const viewObj = {};
                let processedCount = 0;
                const seenIds = new Set();

                for (const docSnap of oldSnap.docs) {
                    const data = docSnap.data();

                    let uniqueId = data.id || data.aId;

                    if (!uniqueId || seenIds.has(uniqueId)) {
                        uniqueId = doc(collection(db, 'audiencias')).id;
                    }

                    seenIds.add(uniqueId);

                    const dataWithId = { ...data, id: uniqueId };
                    
                    viewObj[uniqueId] = dataWithId;

                    const newDocRef = doc(db, 'audiencias', dateStr, 'audiencias', uniqueId);
                    batch.set(newDocRef, dataWithId);

                    if (docSnap.id !== uniqueId) {
                        const oldDocRef = doc(db, 'audiencias', dateStr, 'audiencias', docSnap.id);
                        batch.delete(oldDocRef);
                    }

                    processedCount++;
                }

                if (processedCount > 0) {
                    batch.set(viewDocRef, viewObj, { merge: true });

                    await batch.commit();
                    addLog(`Día ${dateStr} migrado con éxito: ${processedCount} audiencias procesadas.`);
                }

            } catch (error) {
                addLog(`ERROR crítico en el día ${dateStr}: ${error.message}`);
                console.error(`Error procesando ${dateStr}:`, error);
                alert(`Migración detenida en la fecha ${dateStr} debido a un error.`);
                break;
            }
        }

        setIsMigrating(false);
        setCurrentDateProccessing('');
        addLog('Proceso de migración finalizado.');
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', background: '#f5f7fa', borderRadius: '12px', color: '#1a1a1a', margin: '20px auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginBottom: '10px', color: '#0d2b45' }}>Herramienta de Migración: Esquema Espejo 🔄</h2>
            <p style={{ color: '#555', marginBottom: '20px', fontSize: '14px' }}>
                Migra la colección <code style={{background: '#ddd', padding: '2px 4px', borderRadius: '4px'}}>audiencias</code> del formato antiguo al nuevo (mirror a <code style={{background: '#ddd', padding: '2px 4px', borderRadius: '4px'}}>audienciasView</code>). El proceso garantiza integridad de IDs atómicamente y elimina documentos viejos redundantes.
            </p>

            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <label style={{fontWeight: 'bold', marginBottom: '5px'}}>Fecha Inicio:</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        disabled={isMigrating}
                        style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
                    />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <label style={{fontWeight: 'bold', marginBottom: '5px'}}>Fecha Fin:</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        disabled={isMigrating}
                        style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
                    />
                </div>
            </div>

            <button
                onClick={handleMigration}
                disabled={isMigrating}
                style={{
                    padding: '12px 24px',
                    background: isMigrating ? '#aaa' : '#0056b3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: isMigrating ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    width: '100%',
                    fontSize: '16px',
                    transition: 'all 0.3s'
                }}
            >
                {isMigrating ? 'Procesando migración...' : 'Iniciar Migración Segura'}
            </button>

            {isMigrating && (
                <div style={{ marginTop: '20px', fontWeight: 'bold', color: '#e85d04', textAlign: 'center' }}>
                    <span style={{ fontSize: '18px' }}>⏳</span> Procesando fecha actualmente: {currentDateProccessing.replace(/(\d{2})(\d{2})(\d{4})/, "$1/$2/$3")}
                </div>
            )}

            <div style={{
                marginTop: '30px',
                background: '#1e1e1e',
                color: '#4af626',
                padding: '15px',
                borderRadius: '8px',
                height: '300px',
                overflowY: 'auto',
                fontFamily: 'Consolas, monospace',
                fontSize: '14px',
                border: '4px solid #333'
            }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#fff', borderBottom: '1px solid #444', paddingBottom: '10px' }}>Consola de Operaciones:</h4>
                {logs.map((log, index) => (
                    <div key={index} style={{ marginBottom: '8px', lineHeight: '1.4' }}>{log}</div>
                ))}
                {logs.length === 0 && <div style={{ color: '#888' }}>Esperando a que inicies el proceso...</div>}
            </div>
        </div>
    );
};

export default MigrationPanel;

