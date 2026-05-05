'use client'
import { useContext, useState } from 'react';
import styles from '../RegistroAudiencia.module.css';
import { DataContext } from '@/context New/DataContext';
import updateRealTimeFunction from '@/firebase new/firestore/updateRealTimeFunction';

export default function RegistroChangeState({estado, dateToUse, audId, estadoFunction, item, refreshAud}) {
    const [changeToMake, setChangeToMake] = useState('')
    const [tiempoPedido, setTiempoPedido] = useState(false)
    const [pidiente, setPidiente] = useState(false)
    const {updateData, pushToAudienciaArray, changeStatusBlockJuicio, updateByDate, saveAudienciaDebate} = useContext(DataContext)
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
        try {
            let updatedItem = { ...item };
            let itemChanged = false;

            if(changeToMake==='RESUELVO'){
                if (item && item.tipo !== "DEBATE DEL JUICIO ORAL") {
                    await updateData(dateToUse, audId, 'resuelvo', currentTime)
                    await pushToAudienciaArray(dateToUse, audId, `${currentTime} | ${translate[changeToMake]}`)
                } else {
                    updatedItem.resuelvo = currentTime;
                    updatedItem.hitos = [...(updatedItem.hitos || []), `${currentTime} | ${translate[changeToMake]}`];
                    itemChanged = true;
                }
                setChangeToMake('')
            }
            if(changeToMake && changeToMake!=='RESUELVO'){
                const newEstado = translate[changeToMake];
                if (item && item.tipo !== "DEBATE DEL JUICIO ORAL") await updateData(dateToUse, audId, 'estado', newEstado);
                else { updatedItem.estado = newEstado; itemChanged = true; }
                
                // Sincronizar con Juicio si es un debate
                if (item && item.titulo === 'DEBATE' && item.juicioReference) {
                    const { id, year } = item.juicioReference;
                    await changeStatusBlockJuicio(year, id, audId, newEstado);
                }

                if(changeToMake == 'CUARTO INTERMEDIO'){
                    if (item && item.tipo !== "DEBATE DEL JUICIO ORAL") await pushToAudienciaArray(dateToUse, audId, `${currentTime} | ${newEstado} | ${tiempoPedido ? tiempoPedido : 0} | ${pidiente ? pidiente : "juez"}`)
                    else { updatedItem.hitos = [...(updatedItem.hitos || []), `${currentTime} | ${newEstado} | ${tiempoPedido ? tiempoPedido : 0} | ${pidiente ? pidiente : "juez"}`]; itemChanged = true; }
                }else{
                    if (item && item.tipo !== "DEBATE DEL JUICIO ORAL") await pushToAudienciaArray(dateToUse, audId, `${currentTime} | ${newEstado}`)
                    else { updatedItem.hitos = [...(updatedItem.hitos || []), `${currentTime} | ${newEstado}`]; itemChanged = true; }
                }
            }
            if (item && item.tipo === "DEBATE DEL JUICIO ORAL" && itemChanged) {
                await saveAudienciaDebate(updatedItem);
            }
            await estadoFunction(translate[changeToMake])
            await updateByDate(dateToUse)
            if (refreshAud) await refreshAud()
        } catch (error) {
            console.error("Error cambiando estado:", error);
            alert("Hubo un error al guardar el nuevo estado. Verifique su conexión y vuelva a intentarlo.");
        }
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