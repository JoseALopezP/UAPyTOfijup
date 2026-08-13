import styles from '../listasDesplegables.module.css'
import { useState, useContext } from "react";
import { DataContext } from "@/context/DataContext";
import { nameTranslate, nameTranslateActuario } from "@/utils/traductorNombres";

const APODO_TIPOS = ['operador', 'actuario'];

function ApodoField({ nombre, tipo }) {
    const { apodos, addApodo, updateApodoData } = useContext(DataContext);
    const existing = apodos.find(a => a.tipo === tipo && a.nombre === nombre);
    const sugerido = tipo === 'actuario' ? nameTranslateActuario(nombre) : nameTranslate(nombre);
    const [value, setValue] = useState(existing?.apodo ?? sugerido ?? '');

    const commit = async () => {
        const trimmed = value.trim();
        if (trimmed === (existing?.apodo ?? '')) return;
        if (existing) {
            await updateApodoData({ ...existing, apodo: trimmed });
        } else if (trimmed) {
            await addApodo({ id: Date.now().toString(), tipo, nombre, apodo: trimmed });
        }
    };

    return (
        <input
            className={styles.inputDesplegable}
            style={{ width: '90px' }}
            placeholder="Apodo"
            value={value}
            onChange={e => setValue(e.target.value)}
            onBlur={commit}
        />
    );
}

export default function AddToListBlock({desplegablesOption, list, addToList, deleteFromList, updateList}) {
    const [inputValue, setInputValue] = useState('')
    const showApodo = APODO_TIPOS.includes(desplegablesOption)
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
                        <span className={`${styles.inputList}`} style={showApodo ? { width: 'calc(48% - 10px)' } : undefined} key={el+i}><p>{el}</p>
                            {showApodo && <ApodoField nombre={el} tipo={desplegablesOption} />}
                            <button className={`${styles.deleteButton}`} onClick={() => deleteDesplegableFir(el)}>ELIMINAR</button>
                        </span>}</>
                ))}
            </span>
        </div>
    )
}
