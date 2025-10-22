'use client'
import styles from './listasDesplegables.module.css'
import { AuthContextProvider} from "@/context New/AuthContext";
import { DataContextProvider } from "@/context New/DataContext";
import { useState } from 'react';
import DesplegablesList from './modules/DesplegablesList';
import AddToListBlock from './modules/AddToListBlock';

export default function page() {
    const [desplegableList, setDesplegableList] = useState(null)
    const [listSelection, setListSelection] = useState('desplegables')
    return (
      <AuthContextProvider>
        <DataContextProvider>
            <div className={styles.desplegablesContainer}>
                <DesplegablesList desplegableFunction={setDesplegableList} listSelection={listSelection} setListSelection={setListSelection}/>
                {desplegableList && <AddToListBlock desplegablesOption={desplegableList}/>}
            </div>
        </DataContextProvider>
      </AuthContextProvider>
    )
}