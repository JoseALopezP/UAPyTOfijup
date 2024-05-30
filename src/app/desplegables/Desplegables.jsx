'use client'
import { useContext, useEffect, useState } from 'react';
import styles from './Desplegables.module.css'
import { DataContext } from '@/context/DataContext';

export default function Desplegables() {
    const [newFiscal, setNewFiscal] = useState('')
    const [newFiscalTipo, setNewFiscalTipo] = useState('SOLUCIONES ALTERNATIVAS')
    const [newDefensa, setNewDefensa] = useState('')
    const [newDefensaTipo, setNewDefensaTipo] = useState('')
    const { addDesplegable, updateDesplegables, desplegables } = useContext(DataContext);
    const submitFiscalHandler = async(event) =>{
        event.preventDefault();
        await addDesplegable('fiscal', `${newFiscal} - ${newFiscalTipo}`)
        await updateDesplegables();
    }
    const submitDefensaHandler = async(event) =>{
        event.preventDefault();
        await addDesplegable('defensa', `${newDefensa} - ${newDefensaTipo}`)
        await updateDesplegables();
    }
    useEffect(() => {
        updateDesplegables();
        console.log(desplegables)
    }, []);
    return (
        <>
        <form  className={styles.desplegablesForm} onSubmit={(event) => submitFiscalHandler(event)}>
            <input type='text' onChange={(e)=>{setNewFiscal(e.target.value)}}/>
            <select onChange={(e)=>{setNewFiscalTipo(e.target.value)}}>
                <option value={"SOLUCIONES ALTERNATIVAS"}>SOLUCIONES ALTERNATIVAS</option>
                <option value={"GENÉRICA"}>GENÉRICA</option>
                <option value={"DELITOS INFORMÁTICOS Y ESTAFAS"}>DELITOS INFORMÁTICOS Y ESTAFAS</option>
                <option value={"CAVIG"}>CAVIG</option>
                <option value={"DELITOS ESPECIALES"}>DELITOS ESPECIALES</option>
                <option value={"ANIVI"}>ANIVI</option>
                <option value={"DELITOS CONTRA LA PROPIEDAD"}>DELITOS CONTRA LA PROPIEDAD</option>
                <option value={"DEL NORTE"}>DEL NORTE</option>
                <option value={"ABORDAJE TERRITORIAL"}>ABORDAJE TERRITORIAL</option>
            </select>
        </form>
        <div className={`${styles.desplegablesList}`}>
            {desplegables.fiscal && desplegables.fiscal.map(el =>{
                return(
                <span key={el}>{el}</span>)
            })}
        </div>
        <form  className={styles.desplegablesForm} onSubmit={(event) => submitDefensaHandler(event)}>
            <input type='text' onChange={(e)=>{setNewDefensa(e.target.value)}}/>
            <select onChange={(e)=>{setNewDefensaTipo(e.target.value)}}>
                <option value={""}></option>
                <option value={"Defensoría N°11"}>Defensoría N°11</option>
                <option value={"Defensoría N°13"}>Defensoría N°13</option>
                <option value={"Defensoría N°14"}>Defensoría N°14</option>
                <option value={"Defensoría N°15"}>Defensoría N°15</option>
                <option value={"Defensoría N°18"}>Defensoría N°18</option>
                <option value={"Defensoría N°21"}>Defensoría N°21</option>
            </select>
        </form>
        <div className={`${styles.desplegablesList}`}>
            {desplegables.defensa && desplegables.defensa.map(el =>{
                return(
                <span key={el}>{el}</span>)
            })}
        </div>
        </>
    )
}