'use client'
import styles from './Carga-Juicio.module.css'
import AddJuicioInfo from './AddJuicioInfo';
import { BloqueList } from './BloqueList';
import { useContext, useEffect, useState } from 'react';
import { TestigoEditList } from './TestigoEditList';
import { JuicioSelection } from './JuicioSelection';
import EditExisting from './EditingExisting';
import { getCurrentYear } from '@/utils/dateUtils';
import { DataContext } from '@/context New/DataContext';

export default function JuicioFrame(){
    const {changeValueJuicio, desplegables, updateDesplegables} = useContext(DataContext)
    const [newState, setNewState] = useState(true)
    const [changesToSave, setChangesToSave] = useState(false)
    const [year, setYear] = useState(getCurrentYear())
    const [bloquesArray, setBloquesArray] = useState([
      { audId: "AUD001", fecha: "01012025", hora: "08:00", estadoBloque: 'FINALIZADO', sala: '1'},
      { audId: "AUD002", fecha: "02012025", hora: "09:30", estadoBloque: 'EN_PROCESO', sala: '1'},
      { audId: "AUD003", fecha: "03012025", hora: "10:00", estadoBloque: 'PROGRAMADO', sala: '1'},
      { audId: "AUD004", fecha: "04012025", hora: "11:15", estadoBloque: 'PROGRAMADO', sala: '2'},
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
    useEffect(() =>{
      updateDesplegables()
    }, [])
    return (
        <div className={`${styles.globalBlock}`}><section className={`${styles.viewBlock}`}>
        {newState ? <AddJuicioInfo setBloquesArray={setBloquesArray} newState={newState} setNewState={setNewState}/> :
        <EditExisting newState={newState} setNewState={setNewState}/> }
        <BloqueList setBloquesArray={setBloquesArray} bloquesArray={bloquesArray} testigos={testigos}/>
        <TestigoEditList setTestigos={setTestigos} testigos={testigos} bloques={bloquesArray}/>
        <JuicioSelection year={year} setYear={setYear}/>
        </section>
        <div className={`${styles.saveResetBar}`}>
          <button className={changesToSave ? `${styles.reestablecerButton} ${styles.reestablecerButtonActive}` : `${styles.reestablecerButton}`}>REESTABLECER</button>
          <button className={changesToSave ? `${styles.guardarButton} ${styles.guardarButtonActive}` : `${styles.guardarButton}`}>GUARDAR</button>
        </div></div>
    )
}