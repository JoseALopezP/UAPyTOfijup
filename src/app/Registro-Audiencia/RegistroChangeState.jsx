import { useContext, useState } from 'react';
import styles from './RegistroAudiencia.module.css';
import { DataContext } from '@/context/DataContext';

export default function RegistroChangeState({aud}) {
    const [changeToMake, setChangeToMake] = useState('')
    const {updateData, updateRealTime, realTime} = useContext(DataContext)
    const states = {
        'FINALIZADA': ['REINICIAR', 'RESUELVO'],
        'CUARTO_INTERMEDIO': ['CONTINUAR'],
        'EN_CURSO': ['FINALIZAR', 'CUARTO INTERMEDIO'],
        'PROGRAMADA': ['INICIAR','CANCELAR','REPROGRAMAR'],
        'CANCELADA': [''],
        'REPROGRAMADA': ['']
    }
    const handleSubmit = async() =>{
        await updateRealTime()
        if(changeToMake && changeToMake!=='RESUELVO'){
            const date = await new Date().toLocaleDateString("es-AR",{day: "2-digit", month: "2-digit", year: "numeric"}).split('/').join('')
            await updateData(date, aud.numeroLeg, aud.hora, 'estado', changeToMake)
            if(actionAud == 'CUARTO_INTERMEDIO'){
                await pushtToArray(date, aud.numeroLeg, aud.hora, `${realTime} | ${changeToMake} | ${tiempoPedido} | ${pidiente}`)
            }else{
                await pushtToArray(date, aud.numeroLeg, aud.hora, `${realTime} | ${changeToMake}`)
            }
            await updateToday()
            await setEditable(false)
            await setActionAud(null)
        }else{
            if(changeToMake==='RESUELVO'){
                
            }
        }
    }
    return (
        <span className={`${styles.controlChangeStateButtonBlock}`}>
            {aud && <span className={`${styles.buttonsStateBlock}`}>{states[aud.estado].map(el => (
                <button className={`${styles.buttonChange} ${styles[el.split(' ').join('')]}`} onClick={() => setChangeToMake(changeToMake === el ? '' : el)}>{el}</button>
            ))}</span>}
            <button className={`${styles.buttonChange} ${styles[changeToMake.split(' ').join('')]}`}>GUARDAR</button>
        </span>
    );
}