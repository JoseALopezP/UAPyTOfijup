import { useContext, useEffect, useState } from 'react'
import styles from '../Oficios.module.css'
import { DataContext } from '@/context/DataContext'

export default function ControlButtonsBlock({dateToUse, aud, control, controlFunction, }) {
    const {updateData} = useContext(DataContext)
    const [auxControl, setAuxControl] = useState(control)
    const [controlAvail, setControlAvail] = useState(false)
    const handleClickControlado = () => {
        updateData(date, aud.numeroLeg, aud.hora, 'control', 'controlado')
        setAuxControl('controlado')
        controlFunction('controlado')
    }
    const handleClickGuardar = () => {
        updateData(date, aud.numeroLeg, aud.hora, 'control', control)
        setAuxControl(control)
        controlFunction(control)
    }
    useEffect(() => {
        (auxControl !== control) ? setControlAvail(true) : setControlAvail(false)
    }, [control]);
    return (
        <div className={styles.controlButtonBlock}>
            <button type='button' className={`${styles.controlOficioButton1}`} onClick={() => handleClickControlado()}>CONTROLADO</button>
            <button type='button' onClick={() => handleClickGuardar()} className={controlAvail ? `${styles.controlOficioButton2}` : `${styles.controlOficioButton2} ${styles.controlOficioButtonNone}`}>GUARDAR</button>
        </div>
    )
}