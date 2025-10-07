import styles from '../listasDesplegables.module.css'
import { useContext, useState } from "react";
import { DataContext } from "@/context New/DataContext";

export default function AddToListBlock({desplegablesOption}) {
    const { desplegables, addDesplegable, deleteDesplegable, updateDesplegables } = useContext(DataContext);
    const [inputValue, setInputValue] = useState('')
    const uploadDesplegable = async() =>{
        await addDesplegable(desplegablesOption, inputValue)
        await setInputValue('')
        await updateDesplegables()
    }
    const deleteDesplegableFir = async(element) =>{
        await deleteDesplegable(desplegablesOption, element)
        await updateDesplegables()
    }
    return (
        <div className={styles.addToListBlock}>
            <span className={`${styles.inputDesplegableBlock}`}>
                <span><input className={`${styles.inputDesplegable}`} value={inputValue} onChange={e => {setInputValue(e.target.value)}}/>
                <button className={`${styles.addButton}`} onClick={()=>uploadDesplegable()}>AGREGAR</button></span>
            </span>
            <span className={`${styles.selectedListBlock}`}>
                {desplegablesOption && desplegables[desplegablesOption].map((el,i)=>(
                    <>{el.toUpperCase().includes(inputValue.toUpperCase()) && 
                        <span className={`${styles.inputList}`} key={el+i}><p>{el}</p>
                        <button className={`${styles.deleteButton}`} onClick={() => deleteDesplegableFir(el)}>ELIMINAR</button>
                    </span>}</>
                ))}
            </span>
        </div>
    )
}