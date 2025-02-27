import styles from '../listasDesplegables.module.css'
import { useContext, useState } from "react";
import { DataContext } from "@/context/DataContext";

export default function AddToListBlock({desplegablesOption}) {
    const { desplegables } = useContext(DataContext);
    const [inputValue, setInputValue] = useState('')
    return (
        <div className={styles.addToListBlock}>
            <span className={`${styles.inputDesplegableBlock}`}>
                <span><input className={`${styles.inputDesplegable}`}/>
                <button>AGREGAR</button></span>
            </span>
            <span className={`${styles.selectedListBlock}`}>
                {desplegablesOption && desplegables[desplegablesOption].map(el=>(
                    <span className={`${styles.input}`} key={el}>{el}</span>
                ))}
            </span>
        </div>
    )
}