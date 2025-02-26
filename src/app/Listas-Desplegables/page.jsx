'use client'
import styles from './listasDesplegables.module.css'
import { AuthContextProvider} from "@/context/AuthContext";
import { DataContextProvider } from "@/context/DataContext";
import { useState } from 'react';
import DesplegablesList from './modules/DesplegablesList';

export default function page() {
    const [desplegableList, setDesplegableList] = useState([])
    return (
      <AuthContextProvider>
        <DataContextProvider>
            <div className={styles.desplegablesContainer}>
                <DesplegablesList desplegableFunction={setDesplegableList}/>
            </div>
        </DataContextProvider>
      </AuthContextProvider>
    )
}