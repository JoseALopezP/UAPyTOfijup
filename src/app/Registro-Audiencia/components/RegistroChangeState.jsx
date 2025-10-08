'use client'
import { useContext, useState } from 'react';
import styles from '../RegistroAudiencia.module.css';
import { DataContext } from '@/context New/DataContext';

export default function RegistroChangeState({estado, dateToUse, audId, estadoFunction}) {
    const [changeToMake, setChangeToMake] = useState('')
    const [tiempoPedido, setTiempoPedido] = useState(false)
    const [pidiente, setPidiente] = useState(false)
    const {updateData, updateRealTime, realTime, pushToAudienciaArray} = useContext(DataContext)
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
        await updateRealTime()
        if(changeToMake==='RESUELVO'){
            await updateData(dateToUse, audId, 'resuelvo', realTime)
            await pushToAudienciaArray(dateToUse, audId, `${realTime} | ${translate[changeToMake]}`)
            setChangeToMake('')
        }
        if(changeToMake && changeToMake!=='RESUELVO'){
            await updateData(dateToUse, audId, 'estado', translate[changeToMake])
            if(changeToMake == 'CUARTO INTERMEDIO'){
                await pushToAudienciaArray(dateToUse, audId, `${realTime} | ${translate[changeToMake]} | ${tiempoPedido ? tiempoPedido : 0} | ${pidiente ? pidiente : "juez"}`)
            }else{
                await pushToAudienciaArray(dateToUse, audId, `${realTime} | ${translate[changeToMake]}`)
            }
        }
        await estadoFunction(translate[changeToMake])
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