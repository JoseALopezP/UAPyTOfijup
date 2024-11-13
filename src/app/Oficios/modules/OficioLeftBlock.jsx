import { useContext, useEffect, useState } from 'react'
import styles from '../Oficios.module.css'
import ControlButtonsBlock from './ControlButtonsBlock'
import { DataContext } from '@/context/DataContext'
import ErroresUgaList from './ErroresUgaList'

export default function OficioLeftBlock({date, aud}) {
    const {updateData, desplegables} = useContext(DataContext)
    const [control, setControl] = useState(aud.control || '')
    const [auxControl, setAuxControl] = useState(aud.control || '')
    const [errores, setErrores] = useState([]);
    const [errorTipo, setErrorTipo] = useState('')
    const [errorInput, setErrorInput] = useState('')
    const handleSubmit = async(event) =>{
        event.preventDefault();
        setErrores(prev => [...prev, {tipo: errorTipo, comentario: errorInput, estado: false}])
        await updateData(date, aud.numeroLeg, aud.hora, 'erroresUga', errores)
        await setErrorTipo('')
        await setErrorInput('')
    }
    useEffect(() => {
        setControl(aud.control)
        setErrores(aud.erroresUga ? [...aud.erroresUga] : [])
        setAuxControl(aud.control)
    }, [aud]);
    return (
        <div className={styles.oficioLeftBlockContainer}>
            <span className={styles.oficioControlBlock}>
                <h2 className={styles.controlOficioTitle}>CONTROL OFICIO</h2>
                <textarea className={styles.oficioControlTextArea} rows="8" value={control} onChange={e => {setControl(e.target.value)}}/>
                <ControlButtonsBlock date={date} aud={aud} control={control} controlFunction={setControl} auxControl={auxControl} setAuxControl={setAuxControl}/>
            </span>
            <span className={styles.oficioErroresList}>
                <h2 className={styles.controlOficioTitle}>ERRORES UGA</h2>
                <ErroresUgaList date={date} aud={aud} errores={errores} setErrores={setErrores}/>
                <form className={styles.addErrorBlock} onSubmit={(event) => handleSubmit(event)}>
                    <select onChange={e => setErrorTipo(e.target.value)} value={errorTipo} className={`${styles.controlOficioErrorInput} ${styles.controlOficioErrorInputTipos}`}>
                        <option></option>
                        {desplegables.tiposErrores.map(el=>(
                            <option key={el} value={el}>{el}</option>
                        ))}
                    </select>
                    <input type='text' onChange={e => setErrorInput(e.target.value)} value={errorInput} className={`${styles.controlOficioErrorInput} ${styles.controlOficioErrorInputComent}`}/>
                    <button type='submit' className={`${styles.controlOficioErrorInput} ${styles.controlOficioErrorInputAdd}`}>+</button>
                </form>
            </span>
        </div>
    )
}