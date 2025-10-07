import { useContext } from 'react'
import styles from '../Oficios.module.css'
import { DataContext } from '@/context New/DataContext'

export default function ControlButtonsBlock({date, aud, control, controlFunction, auxControl, setAuxControl}) {
    const {updateData} = useContext(DataContext)
    const handleClickControlado = () => {
        if(control !== 'controlado'){
        updateData(date, aud.id, 'control', 'controlado')
        setAuxControl('controlado')
        controlFunction('controlado')
        }
    }
    const handleClickGuardar = () => {
        if(auxControl !== control){
            updateData(date, aud.id, 'control', control)
            setAuxControl(control)
            controlFunction(control)
        }
    }
    return (
        <div className={styles.controlButtonBlock}>
            <button type='button' className={`${styles.controlOficioButton1}`} onClick={() => handleClickControlado()}>CONTROLADO</button>
            <button type='button' onClick={() => handleClickGuardar()} className={(auxControl !== control) ? `${styles.controlOficioButton2}` : `${styles.controlOficioButton2} ${styles.controlOficioButtonNone}`}>GUARDAR</button>
        </div>
    )
}