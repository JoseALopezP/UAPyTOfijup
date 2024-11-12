import { useContext, useEffect, useState } from 'react'
import styles from '../Oficios.module.css'
import ControlButtonsBlock from './ControlButtonsBlock'
import { DataContext } from '@/context/DataContext'
import ErroresUgaList from './ErroresUgaList'

export default function OficioLeftBlock({dateToUse, aud}) {
    const {updateData, desplegables} = useContext(DataContext)
    const [control, setControl] = useState(aud.control || '')
    useEffect(() => {
        setControl(aud.control)
    }, [aud]);
    return (
        <div className={styles.oficioLeftBlockContainer}>
            <span className={styles.oficioControlBlock}>
                <h2 className={styles.controlOficioTitle}>CONTROL OFICIO</h2>
                <textarea className={styles.oficioControlTextArea} rows="10" value={control} onChange={e => {setControl(e.target.value)}}/>
                <ControlButtonsBlock dateToUse={dateToUse} aud={aud} control={control} controlFunction={setControl}/>
            </span>
            <span className={styles.oficioErroresList}>
                <h2 className={styles.controlOficioTitle}>ERRORES UGA</h2>
                <ErroresUgaList aud={aud}/>
            </span>
        </div>
    )
}