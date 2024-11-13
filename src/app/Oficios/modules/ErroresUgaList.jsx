import { DataContext } from '@/context/DataContext'
import styles from '../Oficios.module.css'
import { useContext, useEffect, useState } from 'react'

const deepEqual = (obj1, obj2) => {
    if (obj1 === obj2) return true;
    if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) {
        return false;
    }
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length) return false;
    for (let key of keys1) {
        if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) return false;
    }
    return true;
};

export default function ErroresUgaList({aud, date, errores, setErrores}) {
    const {updateData} = useContext(DataContext)
    
    const [removedErrores, setREmovedErrores] = useState([]);
    const handleInputChange = (setter, index, key, value) => {
        setter(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [key]: value };
            return updated;
        });
        updateDataArr()
    };
    const removeInput = (setter, index, removedSetter, items) => {
        setter(prev => prev.filter((_, i) => i !== index));
        removedSetter(prev => [...prev, items[index]]);
        updateDataArr()
    };
    const updateDataArr = async() =>{
        for(const item of removedErrores){
            if(errores.includes(item)){
                await updateData(date, aud.numeroLeg, aud.hora, 'erroresUga', errores.filter(i => i !== item))
                setErrores(errores.filter(i => i !== item))
            }
        }
        await updateData(date, aud.numeroLeg, aud.hora, 'erroresUga', errores);
    }
    return (
        <div className={`${styles.erroresListBlock}`}>
            {errores && errores.map((el,i) =>(
                <span key={el.tipo + el.comentario} className={el.estado ? `${styles.tableRowErrores} ${styles.tableRowErroresSolved}` : `${styles.tableRowErrores}`}>
                    <p className={`${styles.errorListTipo}`}>{el.tipo}</p>
                    <p className={`${styles.errorListComentario}`}>{el.comentario}</p>
                    <button onClick={() => handleInputChange(setErrores,i,'estado',(!el.estado))} className={`${styles.errorListEstado}`}>{el.estado ? '✔' : 'X'}</button>
                    <button onClick={() => removeInput(setErrores,i,setREmovedErrores,errores)} className={`${styles.errorListDel}`}>🗑️</button>
                </span>
            ))}
        </div>
    )
}