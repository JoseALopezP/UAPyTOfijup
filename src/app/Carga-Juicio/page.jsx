'use client'
import styles from './components/Carga-Juicio.module.css'
import { AuthContextProvider} from "@/context New/AuthContext";
import { DataContextProvider } from "@/context New/DataContext";
import AddJuicioInfo from './components/AddJuicioInfo';
import { BloqueList } from './components/BloqueList';
import { useState } from 'react';
import { TestigoEditList } from './components/TestigoEditList';
import { JuicioSelection } from './components/JuicioSelection';
import EditExisting from './components/EditingExisting';
import { getCurrentYear } from '@/utils/dateUtils';

export default function page(){
    const [newState, setNewState] = useState(true)
    const [year, setYear] = useState(getCurrentYear())
    const [bloquesArray, setBloquesArray] = useState([
      { audId: "AUD001", fecha: "01012025", hora: "08:00", estadoBloque: 'FINALIZADO'},
      { audId: "AUD002", fecha: "02012025", hora: "09:30", estadoBloque: 'EN_PROCESO'},
      { audId: "AUD003", fecha: "03012025", hora: "10:00", estadoBloque: 'PROGRAMADO'},
      { audId: "AUD004", fecha: "04012025", hora: "11:15", estadoBloque: 'PROGRAMADO'},
    ])
    const [testigos, setTestigos] = useState([
      {
        nombre: "Juan Pérez",
        dni: "12345678",
        fecha: [{hora: '10:00', fecha: '02012025', asistencia: true, complete: false, audid: 'AUD002'}]
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
            {newState ? <AddJuicioInfo setBloquesArray={setBloquesArray} newState={newState} setNewState={setNewState}/> :
            <EditExisting newState={newState} setNewState={setNewState}/> }
            <BloqueList setBloquesArray={setBloquesArray} bloquesArray={bloquesArray} testigos={testigos}/>
            <TestigoEditList setTestigos={setTestigos} testigos={testigos} bloques={bloquesArray}/>
            <JuicioSelection year={year} setYear={setYear}/>
          </section>
        </DataContextProvider>
      </AuthContextProvider>
    )
}