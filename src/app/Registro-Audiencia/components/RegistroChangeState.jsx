import { useContext, useState } from 'react';
import styles from '../RegistroAudiencia.module.css';
import { DataContext } from '@/context/DataContext';

export default function RegistroChangeState({estado, dateToUse, numeroLegajo, audienciaHora, estadoFunction}) {
    const [changeToMake, setChangeToMake] = useState('')
    const {updateData, updateRealTime, realTime, pushtToArray} = useContext(DataContext)
    const states = {
        'FINALIZADA': ['REINICIAR', 'RESUELVO'],
        'CUARTO_INTERMEDIO': ['CONTINUAR'],
        'EN_CURSO': ['FINALIZAR', 'CUARTO INTERMEDIO'],
        'PROGRAMADA': ['INICIAR','CANCELAR','REPROGRAMAR'],
        'CANCELADA': [''],
        'REPROGRAMADA': ['']
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
        if(changeToMake && changeToMake!=='RESUELVO'){
            await updateData(dateToUse, numeroLegajo, audienciaHora, 'estado', translate[changeToMake])
            if(changeToMake == 'CUARTO INTERMEDIO'){
                await pushtToArray(dateToUse, numeroLegajo, audienciaHora, `${realTime} | ${translate[changeToMake]} | ${tiempoPedido} | ${pidiente}`)
            }else{
                await pushtToArray(dateToUse, numeroLegajo, audienciaHora, `${realTime} | ${translate[changeToMake]}`)
            }
        }
        await estadoFunction(translate[changeToMake])
    }
    return (
        <div className={`${styles.controlChangeStateButtonBlock}`} >
            {estado && <span className={`${styles.buttonsStateBlock}`}>{states[estado].map(el => (
                <button type='button' key={el} className={`${styles.buttonChange} ${styles[el.split(' ').join('')]}`} onClick={() => setChangeToMake(changeToMake === el ? '' : el)}>{el}</button>
            ))}</span>}
            <button type='button' onClick={() => handleSubmit()} className={`${styles.buttonChange} ${styles[changeToMake.split(' ').join('')]}`}>GUARDAR</button>
        </div>
    );
}