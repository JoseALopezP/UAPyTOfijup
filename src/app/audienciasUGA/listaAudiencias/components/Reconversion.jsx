'use client'
import styles from './Resuelvo.module.css'
import { useState, useContext, useEffect} from 'react'
import { DataContext } from '@/context/DataContext';


export function Reconversion({ item, funcClose }) {
    const {updateData, updateTiposAudiencias, tiposAudiencias} = useContext(DataContext);
    const [tipo, setTipo] = useState('-')
    const [tipo2, setTipo2] = useState('-')
    const [tipo3, setTipo3] = useState('-')
    const handleSubmit = (event) =>{
        event.preventDefault()
    }
    useEffect(() => {
        updateTiposAudiencias()
    }, [])
    return (
    <form className={`${styles.reconversionBlock}`} onSubmit={(event) => handleSubmit(event)}>
        <div className={`${styles.inputTipos}`}>
        <h3 className={`${styles.originalTipos}`}>ACTUAL: {item.tipo}  {item.tipo2}  {item.tipo3}</h3>
        <input list="tipo1" className={`${styles.inputReconvertida} ${styles.inputReconvertida1}`} placeholder='TIPO 1' onChange={(e)=>{setTipo(e.target.value)}}/>
        <datalist id='tipo1'>
            {tiposAudiencias && tiposAudiencias.sort().map((el) =>{
                return(
                    <option key={el} value={el}>{el}</option>
                )
            })}
        </datalist>
        {(tipo && tipo =='-' || tipo =='') ||
        <>
            <input list="tipo2" className={`${styles.inputReconvertida} ${styles.inputReconvertida2}`} placeholder='TIPO 2' onChange={(e)=>{setTipo2(e.target.value)}}/>
            <datalist id='tipo2'>
                {tiposAudiencias && tiposAudiencias.sort().map((el) =>{
                    return(
                        <option key={el} value={el}>{el}</option>
                    )
                })}
            </datalist>
        </>}
        {((tipo && tipo =='-' || tipo =='') || (tipo2 && tipo2 =='-' || tipo2 =='')) ||
            <>
            <input list="tipo3" className={`${styles.inputReconvertida} ${styles.inputReconvertida3}`} placeholder='TIPO 3' onChange={(e)=>{setTipo3(e.target.value)}}/>
            <datalist id='tipo3'>
                {tiposAudiencias && tiposAudiencias.sort().map((el) =>{
                    return(
                        <option key={el} value={el}>{el}</option>
                    )
                })}
            </datalist>
            </>}
            </div>
        <button type='button' className={`${styles.formButton} ${styles.guardarReconvertidaButton}`}>GUARDAR</button>
    </form>);
}