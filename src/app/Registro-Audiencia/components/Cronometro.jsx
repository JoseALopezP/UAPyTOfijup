'use client'

import styles from '../RegistroAudiencia.module.css';
import { useState, useContext, useEffect, useRef } from 'react';
import { DataContext } from '@/context/DataContext';
import updateRealTimeFunction from '@/firebase/firestore/updateRealTimeFunction';
import { removeHtmlTags } from '@/utils/removeHtmlTags';

const translateColor = {
    'FINALIZADA': '#28a745',
    'CUARTO_INTERMEDIO': '#ffc107',
    'EN_CURSO': '#17a2b8',
    'PROGRAMADA': '#007bff',
    'CANCELADA': '#dc3545',
    'REPROGRAMADA': '#6c757d',
    'RESUELVO': '#1F572B'
};

export default function Cronometro({ item, dateToUse, isHovered, minuta, setMinuta, cierre, setCierre, resuelvoText }) {
    const { updateData, updateDataOnly, pushToAudienciaArray, updateByDate } = useContext(DataContext);

    const isDebate = item.tipo?.toUpperCase().includes('DEBATE');

    const formatJudges = (j) => {
        if (!j) return "";
        return j.split('+').map(part =>
            part.trim().split(' ').map(word => {
                if (!word) return "";
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            }).join(' ')
        ).join(' + ');
    };
    const [estadoActual, setEstadoActual] = useState(item.estado);
    const [prevColor, setPrevColor] = useState(translateColor[item.estado] || '#6c757d');
    const [newColor, setNewColor] = useState(translateColor[item.estado] || '#6c757d');
    const [guardando, setGuardando] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [newState, setNewState] = useState('');
    const setNewStateAndRef = (val) => { setNewState(val); newStateRef.current = val; };
    const [cuartoShow, setCuartoShow] = useState(false);
    const [pidiente, setPidiente] = useState('JUEZ');
    const [pedido, setPedido] = useState('');
    const [stopwatchRunning, setStopwatchRunning] = useState(Boolean(item.stopwatchStart));
    const [stopwatchCurrent, setStopwatchCurrent] = useState(item.stopwatchStart ? Date.now() - item.stopwatchStart : 0);
    const [stopwatchAccum, setStopwatchAccum] = useState(item.stopwatch || 0);
    const [timeStampStart, setTimeStampStart] = useState(item.stopwatchStart || 0);
    const [progress, setProgress] = useState(0);
    const [isPressing, setIsPressing] = useState(false);

    // Debate finalization states
    const [debateFinShow, setDebateFinShow] = useState(false);
    const [debateNextDate, setDebateNextDate] = useState('');
    const [debateNextTime, setDebateNextTime] = useState('08:00');

    const intervalRef = useRef(null);
    const savingRef = useRef(false);
    const newStateRef = useRef('');

    const states = {
        'FINALIZADA': ['INICIAR', 'RESUELVO'],
        'CUARTO_INTERMEDIO': ['INICIAR'],
        'EN_CURSO': ['FINALIZAR', 'CUARTO_INTERMEDIO'],
        'PROGRAMADA': ['INICIAR', 'CANCELAR', 'REPROGRAMAR'],
        'CANCELADA': [''],
        'REPROGRAMADA': [''],
        'RESUELVO': ['']
    };

    const translate = {
        'REINICIAR': 'EN_CURSO',
        'RESUELVO': 'RESUELVO',
        'CONTINUAR': 'EN_CURSO',
        'FINALIZAR': 'FINALIZADA',
        'CUARTO INTERMEDIO': 'CUARTO_INTERMEDIO',
        'INICIAR': 'EN_CURSO',
        'CANCELAR': 'CANCELADA',
        'REPROGRAMAR': 'REPROGRAMADA'
    };

    const formatTime = (ms) => {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const stopwatch = async () => {
        if (stopwatchRunning) {
            const now = Date.now();
            const elapsed = now - timeStampStart;
            const newAccum = stopwatchAccum + elapsed;
            setStopwatchAccum(newAccum);
            await updateDataOnly(dateToUse, item.id, 'stopwatch', newAccum);
            await updateDataOnly(dateToUse, item.id, 'stopwatchStart', 0);
            setStopwatchCurrent(0);
            setStopwatchRunning(false);
        } else {
            const now = Date.now();
            setTimeStampStart(now);
            await updateDataOnly(dateToUse, item.id, 'stopwatchStart', now);
            setStopwatchRunning(true);
        }
    };

    // Reintenta una función async hasta maxAttempts veces con backoff exponencial
    const withRetry = async (fn, maxAttempts = 3, baseDelayMs = 1000) => {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return await fn();
            } catch (err) {
                if (attempt === maxAttempts) throw err;
                const delay = baseDelayMs * Math.pow(2, attempt - 1); // 1s, 2s
                console.warn(`Firebase: intento ${attempt} fallido, reintentando en ${delay}ms...`, err);
                await new Promise(res => setTimeout(res, delay));
            }
        }
    };

    const changeState = async () => {
        const currentState = newStateRef.current;
        if (currentState === 'CUARTO_INTERMEDIO' && !cuartoShow) {
            setCuartoShow(true);
            return;
        }
        // Debate: show date/time inputs before finalizing
        if (isDebate && currentState === 'FINALIZADA' && !debateFinShow) {
            setDebateFinShow(true);
            return;
        }
        if (savingRef.current) return;
        if (!currentState) return;

        savingRef.current = true;
        setErrorMsg('');
        setGuardando(true);

        try {
            if (currentState === 'RESUELVO') {
                // Debate: only allow Resuelvo if resuelvoText has content
                if (isDebate) {
                    const hasContent = resuelvoText && removeHtmlTags(resuelvoText).trim() !== '';
                    if (!hasContent) {
                        setErrorMsg('Escriba el contenido del Resuelvo antes de completar.');
                        savingRef.current = false;
                        setGuardando(false);
                        return;
                    }
                }
                await withRetry(() => updateData(dateToUse, item.id, 'resuelvo', updateRealTimeFunction()));
                await withRetry(() => pushToAudienciaArray(dateToUse, item.id, 'hitos', `${updateRealTimeFunction()} | ${currentState}`));
            } else {
                if (currentState === 'EN_CURSO' && !stopwatchRunning) await stopwatch();
                if (estadoActual === 'EN_CURSO' && currentState !== 'EN_CURSO' && stopwatchRunning) await stopwatch();

                const entry = currentState === 'CUARTO_INTERMEDIO'
                    ? `${updateRealTimeFunction()} | ${currentState} | ${pedido || 0} | ${pidiente || "juez"}`
                    : `${updateRealTimeFunction()} | ${currentState}`;

                await withRetry(() => pushToAudienciaArray(dateToUse, item.id, 'hitos', entry));
                setCuartoShow(false);
                setDebateFinShow(false);

                // Actualizar Minuta con texto automático
                const currentHora = updateRealTimeFunction();
                let updatedMinuta = minuta || item.minuta || "";

                if (currentState === 'CUARTO_INTERMEDIO') {
                    let pValue = pidiente;
                    if (!pValue || pValue === "JUEZ") {
                        // Tomar solo el nombre del primer juez y formatearlo
                        const firstJudge = (item.juez || "").split('+')[0];
                        pValue = formatJudges(firstJudge);
                    } else {
                        // El pidiente siempre en minúsculas
                        pValue = pValue.toLowerCase();
                    }
                    const text = `<br><b>Siendo las ${currentHora} horas se ordena un cuarto intermedio pedido por ${pValue}. </b>`;
                    updatedMinuta += text;
                    setMinuta(updatedMinuta);
                    await withRetry(() => updateDataOnly(dateToUse, item.id, 'minuta', updatedMinuta));
                } else if (estadoActual === 'CUARTO_INTERMEDIO' && currentState === 'EN_CURSO') {
                    const text = ` <b>Siendo las ${currentHora} horas se reanuda la presente audiencia.</b>`;
                    updatedMinuta += text;
                    setMinuta(updatedMinuta);
                    await withRetry(() => updateDataOnly(dateToUse, item.id, 'minuta', updatedMinuta));
                } else if (currentState === 'FINALIZADA') {
                    if (isDebate) {
                        // Debate: inject cuarto intermedio for next day into minuta body
                        const text = `<br><b>Sr. Juez dispone CUARTO INTERMEDIO para el día ${debateNextDate} a las ${debateNextTime} horas.</b>`;
                        updatedMinuta += text;
                        setMinuta(updatedMinuta);
                        await withRetry(() => updateDataOnly(dateToUse, item.id, 'minuta', updatedMinuta));
                    } else {
                        // Non-debate: generate cierre as usual
                        const currentHora = updateRealTimeFunction();
                        let updatedCierre = cierre || item.cierre || "";
                        const closureModel = `En este estado, siendo las  horas se dio por terminado el acto, labrándose la presente, dándose por concluida la presente Audiencia, quedando las partes plenamente notificadas de lo resuelto y habiendo quedado ésta íntegramente grabada mediante el sistema de audio y video.`;

                        if (!updatedCierre || updatedCierre.replace(/<[^>]*>/g, '').trim() === "") {
                            updatedCierre = closureModel.replace("siendo las  horas", `siendo las ${currentHora} horas`);
                        } else {
                            // Reemplazar el patrón de la hora en el texto existente
                            if (updatedCierre.includes("siendo las  horas")) {
                                updatedCierre = updatedCierre.replace("siendo las  horas", `siendo las ${currentHora} horas`);
                            } else {
                                // Intento de reemplazo por regex si ya tiene una hora o espacios distintos
                                const regex = /siendo las\s*(\d{2}:\d{2})?\s*horas/;
                                if (regex.test(updatedCierre)) {
                                    updatedCierre = updatedCierre.replace(regex, `siendo las ${currentHora} horas`);
                                }
                            }
                        }
                        setCierre(updatedCierre);
                        await withRetry(() => updateDataOnly(dateToUse, item.id, 'cierre', updatedCierre));
                    }
                }
            }

            await withRetry(() => updateData(dateToUse, item.id, 'estado', currentState));
            setEstadoActual(currentState);
            await updateByDate(dateToUse);
        } catch (err) {
            console.error('Error en changeState (todos los reintentos fallaron):', err);
            setErrorMsg('Error al guardar. Verificá tu conexión e intentá de nuevo.');
        } finally {
            setGuardando(false);
            savingRef.current = false;
        }
    };

    useEffect(() => {
        if (isPressing) {
            intervalRef.current = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 1) {
                        clearInterval(intervalRef.current);
                        setPrevColor(newColor);
                        changeState();
                        setGuardando(true);
                        return 1;
                    }
                    return prev + 0.05;
                });
            }, 100);
        } else {
            clearInterval(intervalRef.current);
            setProgress(0);
        }
        return () => clearInterval(intervalRef.current);
    }, [isPressing]);

    useEffect(() => {
        let interval;
        if (stopwatchRunning && estadoActual === 'EN_CURSO') {
            interval = setInterval(() => {
                setStopwatchCurrent(Date.now() - timeStampStart);
            }, 1000);
        } else {
            setStopwatchCurrent(0);
        }
        return () => clearInterval(interval);
    }, [stopwatchRunning, estadoActual, timeStampStart]);


    useEffect(() => {
        setNewColor(translateColor[item.estado] || '#6c757d');
        setPrevColor(translateColor[item.estado] || '#6c757d');
        setEstadoActual(item.estado);
    }, [item.estado]);

    useEffect(() => {
        const hasStart = Boolean(item.stopwatchStart);
        setStopwatchRunning(hasStart);
        setStopwatchCurrent(hasStart ? Date.now() - item.stopwatchStart : 0);
    }, [item.numeroLeg, item.stopwatchStart]);

    useEffect(() => {
        setStopwatchAccum(item.stopwatch || 0);
    }, [item.stopwatch]);

    return (
        <div
            className={isHovered ? `${styles.stateBlockHovered} ${styles.stateBlock}` : styles.stateBlock}
            style={{
                '--newColor': newColor,
                '--prevColor': prevColor,
                '--percentage': progress
            }}>

            {/* Botones */}
            <span>
                <button
                    onMouseDown={() => { if (states[estadoActual].includes('INICIAR')) { setIsPressing(true); setNewColor('#17a2b8'); setNewStateAndRef('EN_CURSO'); } }}
                    onMouseUp={() => { setIsPressing(false); setNewColor(prevColor); }}
                    onMouseLeave={() => { setIsPressing(false); setNewColor(prevColor); }}
                    className={`${styles.buttonEstado} ${states[estadoActual].includes('INICIAR') && styles.INICIAR}`}>
                    {estadoActual === 'FINALIZADA' ? 'Reiniciar' : estadoActual === 'PROGRAMADA' ? 'Iniciar' : 'Continuar'}
                </button>
                <button
                    onMouseDown={() => { if (states[estadoActual].includes('CUARTO_INTERMEDIO')) { setIsPressing(true); setNewColor(translateColor['CUARTO_INTERMEDIO']); setNewStateAndRef('CUARTO_INTERMEDIO'); } }}
                    onMouseUp={() => { setIsPressing(false); setNewColor(prevColor); }}
                    onMouseLeave={() => { setIsPressing(false); setNewColor(prevColor); }}
                    className={`${styles.buttonEstado} ${states[estadoActual].includes('CUARTO_INTERMEDIO') && styles.CUARTOINTERMEDIO}`}>
                    1/4 Intermedio
                </button>
                <button
                    onMouseDown={() => { if (states[estadoActual].includes('FINALIZAR')) { setIsPressing(true); setNewColor(translateColor['FINALIZADA']); setNewStateAndRef('FINALIZADA'); } }}
                    onMouseUp={() => { setIsPressing(false); setNewColor(prevColor); }}
                    onMouseLeave={() => { setIsPressing(false); setNewColor(prevColor); }}
                    className={`${styles.buttonEstado} ${states[estadoActual].includes('FINALIZAR') && styles.FINALIZAR}`}>
                    Finalizar
                </button>
                <button
                    onMouseDown={() => { if (states[estadoActual].includes('REPROGRAMAR')) { setIsPressing(true); setNewColor(translateColor['REPROGRAMADA']); setNewStateAndRef('REPROGRAMADA'); } }}
                    onMouseUp={() => { setIsPressing(false); setNewColor(prevColor); }}
                    onMouseLeave={() => { setIsPressing(false); setNewColor(prevColor); }}
                    className={`${styles.buttonEstado} ${states[estadoActual].includes('REPROGRAMAR') && styles.REPROGRAMAR}`}>
                    Reprogramar
                </button>
                <button
                    onMouseDown={() => { if (states[estadoActual].includes('CANCELAR')) { setIsPressing(true); setNewColor(translateColor['CANCELADA']); setNewStateAndRef('CANCELADA'); } }}
                    onMouseUp={() => { setIsPressing(false); setNewColor(prevColor); }}
                    onMouseLeave={() => { setIsPressing(false); setNewColor(prevColor); }}
                    className={`${styles.buttonEstado} ${states[estadoActual].includes('CANCELAR') && styles.CANCELAR}`}>
                    Cancelar
                </button>
                <button
                    onMouseDown={() => { if (states[estadoActual].includes('RESUELVO')) { setIsPressing(true); setNewColor(translateColor['RESUELVO']); setNewStateAndRef('RESUELVO'); } }}
                    onMouseUp={() => { setIsPressing(false); setNewColor(prevColor); }}
                    onMouseLeave={() => { setIsPressing(false); setNewColor(prevColor); }}
                    className={`${styles.buttonEstado} ${states[estadoActual].includes('RESUELVO') && styles.RESUELVOSUB}`}>
                    Resuelvo
                </button>
            </span>

            {/* Cronómetro */}
            <span className={isPressing ? `${styles.cronoBlock} ${styles.cronoBlockPressing}` : styles.cronoBlock}>
                {debateFinShow ? (
                    <>
                        <button type="button" className={styles.confirmarButton} onClick={() => changeState()}>CONFIRMAR</button>
                        <span className={styles.timeBlock}>
                            <p>PRÓXIMO DÍA:</p>
                            <input
                                type="text"
                                className={`${styles.inputCrono} ${styles.inputPidiente}`}
                                value={debateNextDate}
                                onChange={(e) => setDebateNextDate(e.target.value)}
                                placeholder="DD/MM/AAAA"
                            />
                        </span>
                        <span className={styles.timeBlock}>
                            <p>HORA:</p>
                            <input
                                type="text"
                                className={`${styles.inputCrono} ${styles.inputTiempoPedido}`}
                                value={debateNextTime}
                                onChange={(e) => setDebateNextTime(e.target.value)}
                                placeholder="HH:MM"
                            />
                        </span>
                    </>
                ) : cuartoShow ? (
                    <>
                        <button type="button" className={styles.confirmarButton} onClick={() => changeState()}>CONFIRMAR</button>
                        <span className={styles.timeBlock}>
                            <p>PEDIDO POR:</p>
                            <input
                                list='pidiente'
                                className={`${styles.inputCrono} ${styles.inputPidiente}`}
                                value={pidiente}
                                onChange={(e) => setPidiente(e.target.value)}
                            />
                            <datalist id='pidiente'>
                                {["JUEZ", "AUDIENCIA ANTERIOR", "COMISARIA", "FISCAL", "IMPUTADO", "OFIJUP - AGENDAMIENTO", "OFIJUP - NOTIFICACIÓN", "OFIJUP - OTROS", "PROBLEMA TECNICO", "QUERELLA", "SERVICIO PENITENCIARIO", "TRASLADO DE DETENIDO", "VICTIMA"].map(value => <option key={value} value={value} />)}
                            </datalist>
                        </span>
                        <span className={styles.timeBlock}>
                            <p>TIEMPO PEDIDO:</p>
                            <input
                                className={`${styles.inputCrono} ${styles.inputTiempoPedido}`}
                                value={pedido}
                                onChange={(e) => setPedido(e.target.value)}
                            />
                        </span>
                    </>
                ) : (
                    <>
                        <p className={styles.stateTitle}>{guardando ? 'GUARDANDO...' : estadoActual.split('_').join(' ')}</p>
                        <span className={styles.timeBlock}>
                            <p>ACUMULADO</p>
                            <p className={styles.timeNumbers}>{formatTime(stopwatchCurrent + stopwatchAccum)}</p>
                        </span>
                        <span className={styles.timeBlock}>
                            <p>ACTUAL</p>
                            <p className={styles.timeNumbers}>{formatTime(stopwatchCurrent)}</p>
                        </span>
                    </>
                )}
            </span>
            {errorMsg && (
                <span className={styles.errorBlock}>
                    <p className={styles.errorText}>⚠️ {errorMsg}</p>
                    <button type="button" className={styles.errorDismiss} onClick={() => setErrorMsg('')}>✕</button>
                </span>
            )}
        </div>
    );
}

