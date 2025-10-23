'use client'
import styles from '../listasDesplegables.module.css'
import { DataContext } from "@/context New/DataContext";
import { useContext, useState } from 'react';
import DesplegablesList from './DesplegablesList';
import AddToListBlock from './AddToListBlock';

export default function ContextWrapper() {
    const [desplegableList, setDesplegableList] = useState(null)
    const [listSelection, setListSelection] = useState('desplegables')
    const {updateDesplegables, desplegables, updateFeriados, feriados, addDesplegable, addFeriado, deleteDesplegables, deleteFeriado} = useContext(DataContext)
    return (
        <div className={styles.desplegablesContainer}>
            <DesplegablesList desplegableFunction={setDesplegableList} listSelection={listSelection} setListSelection={setListSelection}/>
            {desplegableList && <AddToListBlock desplegablesOption={desplegableList} list={listSelection === 'desplegables' ? desplegables : feriados} 
            addToList={listSelection === 'desplegables' ? addDesplegable : addFeriado} deleteFromList={listSelection === 'desplegables' ? deleteDesplegables : deleteFeriado} 
            updateList={listSelection === 'desplegables' ? updateDesplegables : updateFeriados}/>}
        </div>
    )
}