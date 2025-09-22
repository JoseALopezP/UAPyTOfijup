'use client'
import styles from './components/Carga-Juicio.module.css'
import { AuthContextProvider} from "@/context/AuthContext";
import { DataContextProvider } from "@/context/DataContext";
import AddJuicioInfo from './components/AddJuicioInfo';
import { BloqueList } from './components/BloqueList';
import { useState } from 'react';

export default function page(){
    const [bloquesArray, setBloquesArray] = useState([])
    return (
      <AuthContextProvider>
        <DataContextProvider>
          <section className={`${styles.viewBlock}`}>
            <AddJuicioInfo setBloquesArray={setBloquesArray}/>
            <BloqueList setBloquesArray={setBloquesArray}/>
          </section>
        </DataContextProvider>
      </AuthContextProvider>
    )
}