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
    const [bloquesArray, setBloquesArray] = useState([
      { audid: "AUD001", fecha: "01012025", hora: "08:00" },
      { audid: "AUD002", fecha: "01012025", hora: "09:30" },
      { audid: "AUD003", fecha: "02012025", hora: "10:00" },
      { audid: "AUD004", fecha: "02012025", hora: "11:15" },
    ])
    const [testigos, setTestigos] = useState([
      {
        nombre: "Juan Pérez",
        dni: "12345678",
        fecha: []
      },
      {
        nombre: "María López",
        dni: "87654321",
        fecha: []
      },
      {
        nombre: "Carlos Gómez",
        dni: "11223344",
        fecha: []
      }])
    
    return (
      <AuthContextProvider>
        <DataContextProvider>
          <section className={`${styles.viewBlock}`}>
            <AddJuicioInfo setBloquesArray={setBloquesArray}/>
            <BloqueList setBloquesArray={setBloquesArray} bloquesArray={bloquesArray}/>
            <TestigoEditList setTestigos={setTestigos} testigos={testigos} bloques={bloquesArray}/>
            <JuicioSelection />
          </section>
        </DataContextProvider>
      </AuthContextProvider>
    )
}