'use client'
import { useState, useRef, useCallback } from 'react'
import styles from './ExtractorAnuladas.module.css'

// ── Utilidades ──────────────────────────────────────────────────────────────

function toCSV(rows) {
    if (!rows || rows.length === 0) return '';
    const headers = [
        'Nro. Legajo', 'Carátula', 'Fecha y Hora Creación',
        'Parte Solicitante', 'Rol Solicitante', 'Nombre Solicitante',
        'Fiscales', 'Documentos Descargados', 'Link Solicitud'
    ];
    const escape = (v) => {
        if (v === null || v === undefined) return '';
        const str = Array.isArray(v) ? v.join(' | ') : String(v);
        return str.includes(',') || str.includes('"') || str.includes('\n')
            ? `"${str.replace(/"/g, '""')}"`
            : str;
    };
    const lines = [headers.join(',')];
    for (const r of rows) {
        lines.push([
            escape(r.nroLegajo),
            escape(r.caratula),
            escape(r.fyhCreacion),
            escape(r.parteSolicitante),
            escape(r.rolSolicitante),
            escape(r.nombreSolicitante),
            escape(r.fiscales),
            escape(r.docDescargados),
            escape(r.linkSol),
        ].join(','));
    }
    return lines.join('\n');
}

function downloadCSV(data, filename) {
    const blob = new Blob(['\uFEFF' + data], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// ── Componente ──────────────────────────────────────────────────────────────

export default function ExtractorAnuladas() {
    const [fechaHasta, setFechaHasta] = useState('');
    const [downloadDir, setDownloadDir] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [logs, setLogs] = useState([]);
    const [progress, setProgress] = useState(0);
    const [results, setResults] = useState([]);
    const [phase, setPhase] = useState('idle'); // idle | extracting | processing | done | error
    const logsEndRef = useRef(null);

    const addLog = useCallback((msg, type = 'info') => {
        setLogs(prev => {
            const next = [...prev, { msg, type, ts: new Date().toLocaleTimeString() }];
            return next.slice(-300);
        });
        setTimeout(() => logsEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }, []);

    const handleStart = async () => {
        if (!fechaHasta) {
            addLog('⚠️ Ingresá una "Fecha Hasta" antes de iniciar.', 'warn');
            return;
        }

        setIsRunning(true);
        setLogs([]);
        setResults([]);
        setProgress(0);
        setPhase('extracting');
        addLog(`Iniciando extracción. Fecha hasta: ${fechaHasta}`, 'info');

        const bodyData = {
            fechaHasta,
            downloadDir: downloadDir.trim() || null,
        };

        try {
            if (typeof window !== 'undefined' && window.electronAPI) {
                // ── Electron (app de escritorio) ──────────────────────────
                window.electronAPI.removeAllListeners('extraer-anuladas-progress');
                window.electronAPI.on('extraer-anuladas-progress', (event, parsed) => {
                    if (parsed.type === 'progress') {
                        addLog(parsed.message, 'info');
                        if (parsed.pct !== null && parsed.pct !== undefined) {
                            setProgress(parsed.pct);
                            setPhase('processing');
                        }
                    } else if (parsed.type === 'error') {
                        addLog(`Error: ${parsed.error}`, 'error');
                    }
                });

                const result = await window.electronAPI.invoke('extraer-anuladas', bodyData);
                if (!result.success) throw new Error(result.error);

                setResults(result.data || []);
                setPhase('done');
                addLog(`✓ Extracción completa. ${(result.data || []).length} solicitudes guardadas.`, 'success');
                setProgress(100);

            } else {
                // ── Navegador / API ───────────────────────────────────────
                const response = await fetch('/api/extraer-anuladas', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(bodyData),
                });

                if (!response.body) throw new Error('No readable stream');

                const reader = response.body.getReader();
                const decoder = new TextDecoder('utf-8');
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
                                addLog(parsed.message, 'info');
                                if (parsed.pct !== null && parsed.pct !== undefined) {
                                    setProgress(parsed.pct);
                                    setPhase('processing');
                                }
                            } else if (parsed.type === 'done') {
                                setResults(parsed.data || []);
                                setPhase('done');
                                addLog(`✓ Extracción completa. ${(parsed.data || []).length} solicitudes guardadas.`, 'success');
                                setProgress(100);
                            } else if (parsed.type === 'error') {
                                addLog(`Error: ${parsed.error}`, 'error');
                                setPhase('error');
                            }
                        } catch (e) {
                            console.error('Parse error:', e, line);
                        }
                    }
                }
            }
        } catch (err) {
            addLog(`Error fatal: ${err.message}`, 'error');
            setPhase('error');
        } finally {
            setIsRunning(false);
        }
    };

    const handleDownloadCSV = () => {
        const csv = toCSV(results);
        const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16);
        downloadCSV(csv, `anuladas_${ts}.csv`);
    };

    const phaseLabel = {
        idle: '',
        extracting: 'Extrayendo links...',
        processing: `Procesando detalles... ${progress}%`,
        done: `✓ Completado — ${results.length} solicitudes`,
        error: '✗ Error durante la extracción',
    }[phase];

    const phaseColor = {
        idle: 'transparent',
        extracting: '#3b82f6',
        processing: '#8b5cf6',
        done: '#22c55e',
        error: '#ef4444',
    }[phase];

    return (
        <div className={styles.wrapper}>
            {/* ── Header ───────────────────────────────────────────────── */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <div className={styles.headerIcon}>⚖️</div>
                    <div>
                        <h1 className={styles.title}>Extractor de Solicitudes Anuladas</h1>
                        <p className={styles.subtitle}>
                            Tipo: <strong>SUSPENSIÓN/MODIFICACIÓN DE FECHA DE AUDIENCIA</strong> · Estado: <strong>ANULADA</strong>
                        </p>
                    </div>
                </div>
                {phase !== 'idle' && (
                    <div className={styles.phaseTag} style={{ background: phaseColor }}>
                        {phaseLabel}
                    </div>
                )}
            </div>

            {/* ── Controles ────────────────────────────────────────────── */}
            <div className={styles.controls}>
                <div className={styles.controlGroup}>
                    <label className={styles.label}>
                        Fecha Hasta <span className={styles.labelHint}>(no extrae registros anteriores a esta fecha)</span>
                    </label>
                    <input
                        type="date"
                        className={styles.input}
                        value={fechaHasta}
                        onChange={e => setFechaHasta(e.target.value)}
                        disabled={isRunning}
                    />
                </div>

                <div className={styles.controlGroup}>
                    <label className={styles.label}>
                        Carpeta de Descarga <span className={styles.labelHint}>(opcional — ruta absoluta donde guardar los documentos)</span>
                    </label>
                    <input
                        type="text"
                        className={styles.input}
                        placeholder="Ej: C:\Users\Usuario\Descargas\Anuladas"
                        value={downloadDir}
                        onChange={e => setDownloadDir(e.target.value)}
                        disabled={isRunning}
                    />
                </div>

                <div className={styles.actions}>
                    <button
                        className={`${styles.btn} ${styles.btnPrimary}`}
                        onClick={handleStart}
                        disabled={isRunning || !fechaHasta}
                        title="Extrae todos los links y luego lanza 4 navegadores en paralelo"
                    >
                        {isRunning
                            ? <><span className={styles.spinner} /> Extrayendo...</>
                            : <><span>🚀</span> Iniciar Extracción</>}
                    </button>

                    {results.length > 0 && (
                        <>
                            <button
                                className={`${styles.btn} ${styles.btnSuccess}`}
                                onClick={handleDownloadCSV}
                                title="Descargar tabla como CSV (compatible con Excel)"
                            >
                                <span>📄</span> Descargar CSV
                            </button>
                            <button
                                className={`${styles.btn} ${styles.btnOutline}`}
                                onClick={() => {
                                    const json = JSON.stringify(results, null, 2);
                                    const blob = new Blob([json], { type: 'application/json' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    const ts = new Date().toISOString().slice(0, 16).replace(/[:.]/g, '-');
                                    a.download = `anuladas_${ts}.json`;
                                    a.click();
                                    URL.revokeObjectURL(url);
                                }}
                                title="Descargar datos completos en JSON"
                            >
                                <span>💾</span> Descargar JSON
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* ── Barra de progreso ────────────────────────────────────── */}
            {phase === 'processing' && (
                <div className={styles.progressContainer}>
                    <div className={styles.progressBar}>
                        <div
                            className={styles.progressFill}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <span className={styles.progressLabel}>{progress}%</span>
                </div>
            )}

            {/* ── Cuerpo ───────────────────────────────────────────────── */}
            <div className={styles.body}>
                {/* Logs */}
                <div className={styles.logsPanel}>
                    <div className={styles.panelHeader}>
                        <span className={styles.panelTitle}>📋 Registro de actividad</span>
                        {logs.length > 0 && (
                            <button
                                className={styles.clearBtn}
                                onClick={() => setLogs([])}
                            >
                                Limpiar
                            </button>
                        )}
                    </div>
                    <div className={styles.logsContent}>
                        {logs.length === 0 && (
                            <span className={styles.emptyLogs}>Los logs aparecerán aquí cuando inicies la extracción.</span>
                        )}
                        {logs.map((l, i) => (
                            <div key={i} className={`${styles.logLine} ${styles[`log_${l.type}`]}`}>
                                <span className={styles.logTs}>{l.ts}</span>
                                <span className={styles.logMsg}>{l.msg}</span>
                            </div>
                        ))}
                        <div ref={logsEndRef} />
                    </div>
                </div>

                {/* Resultados */}
                {results.length > 0 && (
                    <div className={styles.resultsPanel}>
                        <div className={styles.panelHeader}>
                            <span className={styles.panelTitle}>
                                📊 Resultados — <strong>{results.length}</strong> solicitudes
                            </span>
                        </div>
                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Nro. Legajo</th>
                                        <th>Carátula</th>
                                        <th>Fecha Creación</th>
                                        <th>Parte Solicitante</th>
                                        <th>Fiscales</th>
                                        <th>Docs</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {results.map((r, idx) => (
                                        <tr key={idx} className={idx % 2 === 0 ? styles.trEven : styles.trOdd}>
                                            <td className={styles.tdNum}>{idx + 1}</td>
                                            <td>
                                                <a
                                                    href={r.linkSol}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={styles.legLink}
                                                >
                                                    {r.nroLegajo}
                                                </a>
                                            </td>
                                            <td className={styles.tdCaratula} title={r.caratula}>
                                                {r.caratula}
                                            </td>
                                            <td className={styles.tdFecha}>{r.fyhCreacion}</td>
                                            <td>
                                                <span className={styles.solicitante}>
                                                    <span className={styles.rol}>{r.rolSolicitante}</span>
                                                    {r.nombreSolicitante}
                                                </span>
                                            </td>
                                            <td>
                                                {r.fiscales && r.fiscales.length > 0
                                                    ? <ul className={styles.fiscalList}>
                                                        {r.fiscales.map((f, fi) => (
                                                            <li key={fi}>{f}</li>
                                                        ))}
                                                    </ul>
                                                    : <span className={styles.noData}>—</span>}
                                            </td>
                                            <td className={styles.tdDocs}>
                                                {r.docDescargados && r.docDescargados.length > 0
                                                    ? <span className={styles.docBadge}>
                                                        {r.docDescargados.length} doc{r.docDescargados.length > 1 ? 's' : ''}
                                                    </span>
                                                    : <span className={styles.noData}>—</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
