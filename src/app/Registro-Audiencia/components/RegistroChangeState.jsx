'use client'
import { useContext, useState } from 'react';
import styles from '../RegistroAudiencia.module.css';
import { DataContext } from '@/context/DataContext';
import updateRealTimeFunction from '@/firebase/firestore/updateRealTimeFunction';

export default function RegistroChangeState({estado, dateToUse, audId, estadoFunction, item, refreshAud}) {
    const [changeToMake, setChangeToMake] = useState('')
    const [tiempoPedido, setTiempoPedido] = useState(false)
    const [pidiente, setPidiente] = useState(false)
    const {updateData, pushToAudienciaArray, changeStatusBlockJuicio, updateByDate} = useContext(DataContext)
    const states = {
        'FINALIZADA': ['REINICIAR', 'RESUELVO'],
        'CUARTO_INTERMEDIO': ['CONTINUAR'],
        'EN_CURSO': ['FINALIZAR', 'CUARTO INTERMEDIO'],
        'PROGRAMADA': ['INICIAR','CANCELAR','REPROGRAMAR'],
        'CANCELADA': [''],
        'REPROGRAMADA': [''],
        'RESUELVO': ['REINICIAR']
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
    const handleSubmit = async() =>{
        const currentTime = updateRealTimeFunction();
        if(changeToMake==='RESUELVO'){
            await updateData(dateToUse, audId, 'resuelvo', currentTime)
            await pushToAudienciaArray(dateToUse, audId, `${currentTime} | ${translate[changeToMake]}`)
            setChangeToMake('')
        }
        if(changeToMake && changeToMake!=='RESUELVO'){
            const newEstado = translate[changeToMake];
            await updateData(dateToUse, audId, 'estado', newEstado)
            
            // Sincronizar con Juicio si es un debate
            if (item && item.titulo === 'DEBATE' && item.juicioReference) {
                const { id, year } = item.juicioReference;
                await changeStatusBlockJuicio(year, id, audId, newEstado);
            }

            if(changeToMake == 'CUARTO INTERMEDIO'){
                await pushToAudienciaArray(dateToUse, audId, `${currentTime} | ${newEstado} | ${tiempoPedido ? tiempoPedido : 0} | ${pidiente ? pidiente : "juez"}`)
            }else{
                await pushToAudienciaArray(dateToUse, audId, `${currentTime} | ${newEstado}`)
            }
        }
        await estadoFunction(translate[changeToMake])
        await updateByDate(dateToUse)
        if (refreshAud) await refreshAud()
    }
    return (
        <div className={`${styles.controlChangeStateButtonBlock}`} >
            {states[0] === '' && <>
            {estado && <span className={`${styles.buttonsStateBlock}`}>{states[estado].map(el => (
                <button type='button' key={el} className={`${styles.buttonChange} ${styles[el.split(' ').join('')]}`} onClick={() => setChangeToMake(changeToMake === el ? '' : el)}>{el}</button>
            ))}</span>}
            <button type='button' onClick={() => handleSubmit()} className={`${styles.buttonChange} ${styles[changeToMake.split(' ').join('')]}`}>GUARDAR</button></>}
        </div>
    );
}
