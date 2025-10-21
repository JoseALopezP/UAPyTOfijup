'use client'
import styles from './components/Carga-Juicio.module.css'
import { AuthContextProvider} from "@/context New/AuthContext";
import { DataContextProvider } from "@/context New/DataContext";
import AddJuicioInfo from './components/AddJuicioInfo';
import { BloqueList } from './components/BloqueList';
import { useState } from 'react';
import { TestigoEditList } from './components/TestigoEditList';
import { JuicioSelection } from './components/JuicioSelection';

export default function page(){
    const [bloquesArray, setBloquesArray] = useState([{fechaD: '21',fechaM: '09',fechaA: '2025', hora:'16', minuto:'00'},{fechaD: '22',fechaM: '09',fechaA: '2025', hora:'16', minuto:'00'}])
    return (
      <AuthContextProvider>
        <DataContextProvider>
          <section className={`${styles.viewBlock}`}>
            <AddJuicioInfo setBloquesArray={setBloquesArray}/>
            <BloqueList setBloquesArray={setBloquesArray} bloquesArray={bloquesArray}/>
            <TestigoEditList />
            <JuicioSelection />
          </section>
        </DataContextProvider>
      </AuthContextProvider>
    )
}