import styles from '../RegistroAudiencia.module.css';
import { useState, useContext, useEffect, useRef } from 'react';
import { DataContext } from '@/context/DataContext';
const translateColor = {
    'FINALIZADA': '#28a745',
    'CUARTO_INTERMEDIO': '#ffc107',
    'EN_CURSO': '#17a2b8',
    'PROGRAMADA': '#007bff',
    'CANCELADA': '#dc3545',
    'REPROGRAMADA': '#6c757d',
    'RESUELVO': '#1F572B'
}
export default function Cronometro({item, dateToUse}) {
    const [tiempoPedido, setTiempoPedido] = useState(false)
    const [estadoActual, setEstadoActual] = useState(item.estado)
    const [prevColor, setPrevColor] = useState('#6c757d')
    const [newColor, setNewColor] = useState('#6c757d')
    const [guardando, setGuardando] = useState(false)
    const [newState, setNewState] = useState('')

    const [pidiente, setPidiente] = useState(false)
    const {updateData, updateRealTime, realTime, pushtToArray} = useContext(DataContext)

    const [stopwatchRunning, setStopwatchRunning] = useState((item.stopwatchStart !==0 && item.stopwatchStart)  ? true : false)
    const [stopwatchCurrent, setStopwatchCurrent] = useState((item.stopwatchStart !==0 && item.stopwatchStart) ? (Date.now() - item.stopwatchStart) : 0)
    const [stopwatchAccum, setStopwatchAccum] = useState(item.stopwatch ? item.stopwatch : 0)

    const [progress, setProgress] = useState(0);
    const [isPressing, setIsPressing] = useState(false);
    let interval = null;
    const states = {
        'FINALIZADA': ['INICIAR', 'RESUELVO'],
        'CUARTO_INTERMEDIO': ['INICIAR'],
        'EN_CURSO': ['FINALIZAR', 'CUARTO_INTERMEDIO'],
        'PROGRAMADA': ['INICIAR','CANCELAR','REPROGRAMAR'],
        'CANCELADA': [''],
        'REPROGRAMADA': [''],
        'RESUELVO': ['']
    }
    const translate = {
        'REINICIAR': 'EN_CURSO',
        'RESUELVO': 'RESUELVO',
        'CONTINUAR': 'EN_CURSO',
        'FINALIZAR': 'FINALIZADA',
        'CUARTO INTERMEDIO': 'CUARTO_INTERMEDIO',
        'INICIAR': 'EN_CURSO',
        'CANCELAR': 'CANCELADA',
        'REPROGRAMAR': 'REPROGRAMADA'
    }
    const stopwatch = async () => {
        const current = stopwatchCurrent || 0;
        const accum = stopwatchAccum || 0;
        const sum = current + accum; // Ensure valid numbers
    
        if (stopwatchRunning) {
            await setStopwatchAccum(sum);
            await updateData(dateToUse, item.numeroLeg, item.hora, 'stopwatch', sum);
            await updateData(dateToUse, item.numeroLeg, item.hora, 'stopwatchStart', 0);
            await setStopwatchCurrent(0);
            await setStopwatchRunning(false);
        } else {
            await updateData(dateToUse, item.numeroLeg, item.hora, 'stopwatchStart', Date.now());
            await setStopwatchRunning(true);
        }
    };
    const isSaving = useRef(false);
    const changeState = async () => {
        if (isSaving.current) return; // Evita múltiples ejecuciones
        isSaving.current = true;
        
        setGuardando(true); 
    
        await updateRealTime();
    
        if (newState === 'RESUELVO') {
            await updateData(dateToUse, item.numeroLeg, item.hora, 'resuelvo', realTime);
            await pushtToArray(dateToUse, item.numeroLeg, item.hora, `${realTime} | ${newState}`);
        }
    
        if (newState && newState !== 'RESUELVO') {
            if (newState === 'EN_CURSO' && !stopwatchRunning) {
                await stopwatch();
            }
            if (estadoActual === 'EN_CURSO' && newState !== 'EN_CURSO' && stopwatchRunning) {
                await stopwatch();
            }
            const entry = newState === 'CUARTO_INTERMEDIO'
                ? `${realTime} | ${newState} | ${tiempoPedido || 0} | ${pidiente || "juez"}`
                : `${realTime} | ${newState}`;
            await pushtToArray(dateToUse, item.numeroLeg, item.hora, entry);
        }
    
        await updateData(dateToUse, item.numeroLeg, item.hora, 'estado', newState);
        
        setEstadoActual(newState);
        setGuardando(false);
        isSaving.current = false;
    };
    
    
    const formatTime = (ms) => {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes
            .toString()
            .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };
    useEffect(() => {
        if (isPressing) {
            interval = setInterval(() => {
            setProgress((prev) => {
              if (prev >= 1) {
                clearInterval(interval);
                setPrevColor(newColor);
                changeState()
                setGuardando(true)
                return 1;
              }
              return prev + .05;
            });
            }, 100);
        }else {
            clearInterval(interval);
            setProgress(0);
        }
        return () => clearInterval(interval);
    }, [isPressing]);
    useEffect(() => {
        if (stopwatchRunning) {
            const interval = setInterval(() => {
                setStopwatchCurrent((prev) => (prev || 0) + 1000);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [stopwatchRunning]);
    
    useEffect(() => {
        if (item && item.estado) {
            setNewColor(translateColor[item.estado] || '#6c757d');
            setPrevColor(translateColor[item.estado] || '#6c757d');
            setEstadoActual(item.estado);
        }
    }, [item.estado]);
    useEffect(()=>{
        item.stopwatchStart !== 0 ? setStopwatchRunning(true) : setStopwatchRunning(false)
    }, [item.stopwatchStart])
    useEffect(()=>{
        setGuardando(false)
        if(item.stopwatchStart !==0 && item.stopwatchStart){
            setStopwatchRunning(true)
            setStopwatchCurrent(Date.now() - item.stopwatchStart)
        }else{
            setStopwatchRunning(false)
            setStopwatchCurrent(0)
        }
    }, [item.numeroLeg])
    useEffect(()=>{
        setStopwatchAccum(item.stopwatch)
    }, [item.stopwatch])  
    return (
        <div className={`${styles.stateBlock}`}
            style={{
                "--newColor": newColor,
                "--prevColor": prevColor,
                "--percentage": progress
            }}>
            <span className={``}>
            <button onMouseDown={() => {setIsPressing(true), setNewColor('#17a2b8'), setNewState('EN_CURSO')}} onMouseUp={() => {setIsPressing(false), setNewColor(prevColor)}} onMouseLeave={() => {setIsPressing(false), setNewColor(prevColor)}}
                className={`${styles.buttonEstado} ${states[estadoActual].includes('INICIAR') && styles.INICIAR}`}>
                {(estadoActual === 'FINALIZADA') ? 'Reiniciar' : (estadoActual === 'PROGRAMADA') ? 'Iniciar' : 'Continuar'}</button>
            <button onMouseDown={() => {setIsPressing(true), setNewColor(translateColor['CUARTO_INTERMEDIO']), setNewState('CUARTO_INTERMEDIO')}} onMouseUp={() => {setIsPressing(false), setNewColor(prevColor)}} onMouseLeave={() => {setIsPressing(false), setNewColor(prevColor)}} 
                className={`${styles.buttonEstado} ${states[estadoActual].includes('CUARTO_INTERMEDIO') && styles.CUARTOINTERMEDIO}`}>1/4 Intermedio</button>
            <button onMouseDown={() => {setIsPressing(true), setNewColor(translateColor['FINALIZADA']), setNewState('FINALIZADA')}} onMouseUp={() => {setIsPressing(false), setNewColor(prevColor)}} onMouseLeave={() => {setIsPressing(false), setNewColor(prevColor)}}
                className={`${styles.buttonEstado} ${states[estadoActual].includes('FINALIZAR') && styles.FINALIZAR}`}>Finalizar</button>
            <button onMouseDown={() => {setIsPressing(true), setNewColor(translateColor['REPROGRAMADA']), setNewState('REPROGRAMADA')}} onMouseUp={() => {setIsPressing(false), setNewColor(prevColor)}} onMouseLeave={() => {setIsPressing(false), setNewColor(prevColor)}}
                className={`${styles.buttonEstado} ${states[estadoActual].includes('REPROGRAMAR') && styles.REPROGRAMAR}`}>Reprogramar</button>
            <button onMouseDown={() => {setIsPressing(true), setNewColor(translateColor['CANCELADA']), setNewState('CANCELADA')}} onMouseUp={() => {setIsPressing(false), setNewColor(prevColor)}} onMouseLeave={() => {setIsPressing(false), setNewColor(prevColor)}}
                className={`${styles.buttonEstado} ${states[estadoActual].includes('CANCELAR') && styles.CANCELAR}`}>Cancelar</button>
            <button onMouseDown={() => {setIsPressing(true), setNewColor(translateColor['RESUELVO']), setNewState('RESUELVO')}} onMouseUp={() => {setIsPressing(false), setNewColor(prevColor)}} onMouseLeave={() => {setIsPressing(false), setNewColor(prevColor)}}
                className={`${styles.buttonEstado} ${states[estadoActual].includes('RESUELVO') && styles.RESUELVOSUB}`}>Resuelvo</button>
            </span>
            <span className={isPressing ? `${styles.cronoBlock} ${styles.cronoBlockPressing}` : `${styles.cronoBlock}`}>
                <p className={`${styles.stateTitle}`}>{guardando ? 'GUARDANDO...' : estadoActual.split('_').join(' ')}</p>
                <span className={`${styles.timeBlock}`}><p>ACUMULADO</p>
                <p className={`${styles.timeNumbers}`}>{formatTime(item.stopwatch ? stopwatchCurrent + stopwatchAccum : stopwatchCurrent)}</p></span>
                <span className={`${styles.timeBlock}`}><p>ACTUAL</p>
                <p className={`${styles.timeNumbers}`}>{formatTime(stopwatchCurrent)}</p></span>
            </span>
        </div>
    );
}
