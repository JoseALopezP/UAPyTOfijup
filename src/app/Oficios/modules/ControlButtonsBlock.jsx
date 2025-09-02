import { useContext, useEffect, useState } from 'react'
import styles from '../Oficios.module.css'
import { DataContext } from '@/context/DataContext'

export default function ControlButtonsBlock({date, aud, control, controlFunction, auxControl, setAuxControl}) {
    const {updateData} = useContext(DataContext)
    const handleClickControlado = () => {
        if(control !== 'controlado'){
        updateData(date, aud.numeroLeg, aud.hora, 'control', 'controlado', (aud.aId || false))
        setAuxControl('controlado')
        controlFunction('controlado')
        }
    }
    const handleClickGuardar = () => {
        if(auxControl !== control){
            updateData(date, aud.numeroLeg, aud.hora, 'control', control, (aud.aId || false))
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