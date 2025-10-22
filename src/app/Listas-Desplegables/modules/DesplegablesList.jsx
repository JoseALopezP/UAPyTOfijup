import { useContext, useEffect, useState } from 'react';
import styles from '../listasDesplegables.module.css'
import { DataContext } from '@/context New/DataContext';
import Selector from './selector';

export default function DesplegablesList({desplegableFunction, listSelection, setListSelection}) {
    const { updateDesplegables, desplegables, updateFeriados, feriados } = useContext(DataContext);
    useEffect(() => {
        updateDesplegables()
    }, [])
    useEffect(() => {
        if(listSelection === 'desplegables'){
            updateDesplegables()
        }else{
            updateFeriados()
        }
    }, [listSelection])
    return (
        <div className={styles.listasDesplegablesSelector}>
            <Selector listSelection={listSelection} setListSelection={setListSelection}/>
            {listSelection === 'desplegables' ? 
            <>{desplegables && Object.keys(desplegables).map((key)=>(
                <div key={key} className={styles.listIndiv} onClick={()=>desplegableFunction(key)}><p>{key}</p></div>
            ))}</>:
            <>{feriados && Object.keys(feriados).map((key)=>(
                <div key={key} className={styles.listIndiv} onClick={()=>desplegableFunction(key)}><p>{key}</p></div>
            ))}</>}
        </div>
    )
}