import styles from '../listasDesplegables.module.css'
import { useState } from "react";

export default function AddToListBlock({desplegablesOption, list, addToList, deleteFromList, updateList}) {
    const [inputValue, setInputValue] = useState('')
    const uploadDesplegable = async() =>{
        await addToList(desplegablesOption, inputValue)
        await setInputValue('')
        await updateList()
    }
    const deleteDesplegableFir = async(element) =>{
        await deleteFromList(desplegablesOption, element)
        await updateList()
    }
    return (
        <div className={styles.addToListBlock}>
            <span className={`${styles.inputDesplegableBlock}`}>
                <span><input className={`${styles.inputDesplegable}`} value={inputValue} onChange={e => {setInputValue(e.target.value)}}/>
                <button className={`${styles.addButton}`} onClick={()=>uploadDesplegable()}>AGREGAR</button></span>
            </span>
            <span className={`${styles.selectedListBlock}`}>
                {(list && desplegablesOption) && list[desplegablesOption].map((el,i)=>(
                    <>{el.toUpperCase().includes(inputValue.toUpperCase()) && 
                        <span className={`${styles.inputList}`} key={el+i}><p>{el}</p>
                            <button className={`${styles.deleteButton}`} onClick={() => deleteDesplegableFir(el)}>ELIMINAR</button>
                        </span>}</>
                ))}
            </span>
        </div>
    )
}