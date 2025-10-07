'use client'

import styles from '../RegistroAudiencia.module.css';
import { useState, useContext, useEffect, useRef } from 'react';
import { DataContext } from '@/context New/DataContext';
import updateRealTimeFunction from '@/firebase/firestore/updateRealTimeFunction';

const translateColor = {
    'FINALIZADA': '#28a745',
    'CUARTO_INTERMEDIO': '#ffc107',
    'EN_CURSO': '#17a2b8',
    'PROGRAMADA': '#007bff',
    'CANCELADA': '#dc3545',
    'REPROGRAMADA': '#6c757d',
    'RESUELVO': '#1F572B'
};

export default function Cronometro({ item, dateToUse, isHovered }) {
    const { updateData, pushToAudienciaArray, updateByDate } = useContext(DataContext);
    const [estadoActual, setEstadoActual] = useState(item.estado);
    const [prevColor, setPrevColor] = useState(translateColor[item.estado] || '#6c757d');
    const [newColor, setNewColor] = useState(translateColor[item.estado] || '#6c757d');
    const [guardando, setGuardando] = useState(false);
    const [newState, setNewState] = useState('');
    const [cuartoShow, setCuartoShow] = useState(false);
    const [pidiente, setPidiente] = useState('JUEZ');
    const [pedido, setPedido] = useState(0);
    const [stopwatchRunning, setStopwatchRunning] = useState(Boolean(item.stopwatchStart));
    const [stopwatchCurrent, setStopwatchCurrent] = useState(item.stopwatchStart ? Date.now() - item.stopwatchStart : 0);
    const [stopwatchAccum, setStopwatchAccum] = useState(item.stopwatch || 0);
    const [timeStampStart, setTimeStampStart] = useState(item.stopwatchStart || 0);
    const [progress, setProgress] = useState(0);
    const [isPressing, setIsPressing] = useState(false);

    const intervalRef = useRef(null);
    const savingRef = useRef(false);

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
        const current = Date.now() - timeStampStart;
        const sum = stopwatchAccum + current;
        if (stopwatchRunning) {
            const now = Date.now();
            const elapsed = now - timeStampStart;

            const newAccum = stopwatchAccum + elapsed;
            setStopwatchAccum(newAccum);
            await updateData(dateToUse, item.is, 'stopwatch', newAccum);
            await updateData(dateToUse, item.id, 'stopwatchStart', 0);
            setStopwatchCurrent(0);
            setStopwatchRunning(false);
        } else {
            const now = Date.now();
            setTimeStampStart(now);
            await updateData(dateToUse, item.id, 'stopwatchStart', now);
            setStopwatchRunning(true);
        }
    };

    const changeState = async () => {
        if (newState === 'CUARTO_INTERMEDIO' && !cuartoShow) {
            setCuartoShow(true);
            return;
        }
        if (savingRef.current) return;

        savingRef.current = true;
        setGuardando(true);

        if (newState === 'RESUELVO') {
            await updateData(dateToUse, id, 'resuelvo', updateRealTimeFunction());
            await pushToAudienciaArray(dateToUse, item, 'hitos', `${updateRealTimeFunction()} | ${newState}`);
        } else {
            if (newState === 'EN_CURSO' && !stopwatchRunning) await stopwatch();
            if (estadoActual === 'EN_CURSO' && newState !== 'EN_CURSO' && stopwatchRunning) await stopwatch();

            const entry = newState === 'CUARTO_INTERMEDIO'
                ? `${updateRealTimeFunction()} | ${newState} | ${pedido || 0} | ${pidiente || "juez"}`
                : `${updateRealTimeFunction()} | ${newState}`;

            await pushtToArray(dateToUse, item.numeroLeg, item.hora, entry);
            setCuartoShow(false);
        }

        await updateData(dateToUse, item.id, 'estado', newState);
        setEstadoActual(newState);
        setGuardando(false);
        await updateByDate(dateToUse);
        savingRef.current = false;
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
                    onMouseDown={() => { if (states[estadoActual].includes('INICIAR')) { setIsPressing(true); setNewColor('#17a2b8'); setNewState('EN_CURSO'); } }}
                    onMouseUp={() => { setIsPressing(false); setNewColor(prevColor); }}
                    onMouseLeave={() => { setIsPressing(false); setNewColor(prevColor); }}
                    className={`${styles.buttonEstado} ${states[estadoActual].includes('INICIAR') && styles.INICIAR}`}>
                    {estadoActual === 'FINALIZADA' ? 'Reiniciar' : estadoActual === 'PROGRAMADA' ? 'Iniciar' : 'Continuar'}
                </button>
                <button
                    onMouseDown={() => { if (states[estadoActual].includes('CUARTO_INTERMEDIO')) { setIsPressing(true); setNewColor(translateColor['CUARTO_INTERMEDIO']); setNewState('CUARTO_INTERMEDIO'); } }}
                    onMouseUp={() => { setIsPressing(false); setNewColor(prevColor); }}
                    onMouseLeave={() => { setIsPressing(false); setNewColor(prevColor); }}
                    className={`${styles.buttonEstado} ${states[estadoActual].includes('CUARTO_INTERMEDIO') && styles.CUARTOINTERMEDIO}`}>
                    1/4 Intermedio
                </button>
                <button
                    onMouseDown={() => { if (states[estadoActual].includes('FINALIZAR')) { setIsPressing(true); setNewColor(translateColor['FINALIZADA']); setNewState('FINALIZADA'); } }}
                    onMouseUp={() => { setIsPressing(false); setNewColor(prevColor); }}
                    onMouseLeave={() => { setIsPressing(false); setNewColor(prevColor); }}
                    className={`${styles.buttonEstado} ${states[estadoActual].includes('FINALIZAR') && styles.FINALIZAR}`}>
                    Finalizar
                </button>
                <button
                    onMouseDown={() => { if (states[estadoActual].includes('REPROGRAMAR')) { setIsPressing(true); setNewColor(translateColor['REPROGRAMADA']); setNewState('REPROGRAMADA'); } }}
                    onMouseUp={() => { setIsPressing(false); setNewColor(prevColor); }}
                    onMouseLeave={() => { setIsPressing(false); setNewColor(prevColor); }}
                    className={`${styles.buttonEstado} ${states[estadoActual].includes('REPROGRAMAR') && styles.REPROGRAMAR}`}>
                    Reprogramar
                </button>
                <button
                    onMouseDown={() => { if (states[estadoActual].includes('CANCELAR')) { setIsPressing(true); setNewColor(translateColor['CANCELADA']); setNewState('CANCELADA'); } }}
                    onMouseUp={() => { setIsPressing(false); setNewColor(prevColor); }}
                    onMouseLeave={() => { setIsPressing(false); setNewColor(prevColor); }}
                    className={`${styles.buttonEstado} ${states[estadoActual].includes('CANCELAR') && styles.CANCELAR}`}>
                    Cancelar
                </button>
                <button
                    onMouseDown={() => { if (states[estadoActual].includes('RESUELVO')) { setIsPressing(true); setNewColor(translateColor['RESUELVO']); setNewState('RESUELVO'); } }}
                    onMouseUp={() => { setIsPressing(false); setNewColor(prevColor); }}
                    onMouseLeave={() => { setIsPressing(false); setNewColor(prevColor); }}
                    className={`${styles.buttonEstado} ${states[estadoActual].includes('RESUELVO') && styles.RESUELVOSUB}`}>
                    Resuelvo
                </button>
            </span>

            {/* Cronómetro */}
            <span className={isPressing ? `${styles.cronoBlock} ${styles.cronoBlockPressing}` : styles.cronoBlock}>
                {cuartoShow ? (
                    <>
                        <button className={styles.confirmarButton} onClick={() => changeState()}>CONFIRMAR</button>
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
        </div>
    );
}
