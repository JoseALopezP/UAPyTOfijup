'use client'
import styles from './Carga-Juicio.module.css'
import AddJuicioInfo from './AddJuicioInfo';
import { BloqueList } from './BloqueList';
import { useContext, useEffect, useState } from 'react';
import { TestigoEditList } from './TestigoEditList';
import { JuicioSelection } from './JuicioSelection';
import EditExisting from './EditExisting';
import { getCurrentYear } from '@/utils/dateUtils';
import { DataContext } from '@/context New/DataContext';
import { ButtonSelection } from './ButtonSelection';

export default function JuicioFrame() {
  const { changeValueJuicio, desplegables, updateDesplegables } = useContext(DataContext)
  const [previousVersion, setPreviousVersion] = useState({})
  const [newState, setNewState] = useState(true)
  const [changesToSave, setChangesToSave] = useState(null)
  const [year, setYear] = useState(getCurrentYear())
  const [bloquesArray, setBloquesArray] = useState([
    {
      audId: 101,
      fecha: '17122025',
      hora: '09:00',
      sala: '1',
      estadoBloque: 'PROGRAMADO'
    },
    {
      audId: 102,
      fecha: '18122025',
      hora: '10:00',
      sala: '2',
      estadoBloque: 'FINALIZADO'
    }
  ])
  const [testigos, setTestigos] = useState([
    {
      id: 1,
      nombre: 'Juan Perez',
      dni: '12345678',
      fecha: [
        {
          audid: 101,
          hora: '09:30',
          fecha: '17122025 09:00',
          asistencia: 'presente',
          complete: false
        }
      ]
    },
    {
      id: 2,
      nombre: 'Maria Garcia',
      dni: '87654321',
      fecha: [
        {
          audid: 102,
          hora: '10:30',
          fecha: '18122025 10:00',
          asistencia: 'ausente',
          complete: true
        }
      ]
    }
  ])
  const testFunctionAux = (value) => {
    if (!changesToSave.includes(value)) {
      setChangesToSave([...changesToSave, value])
    }
  }
  const saveTesting = () => {
    setChangesToSave([])
    previousVersion.bloques.forEach((bloque) => {
      if (bloque.fecha !== bloquesArray.find(el => bloque.audId === el.audId).fecha) {
        testFunctionAux('fecha-' + bloque.audId)
      }
      if (bloque.hora !== bloquesArray.find(el => bloque.audId === el.audId).hora) {
        testFunctionAux('hora-' + bloque.audId)
      }
      if (bloque.estadoBloque !== bloquesArray.find(el => bloque.audId === el.audId).estadoBloque) {
        testFunctionAux('estado-' + bloque.audId)
      }
      if (bloque.tipo !== bloquesArray.find(el => bloque.audId === el.audId).tipo) {
        testFunctionAux('tipo-' + bloque.audId)
      }
      if (bloque.sala !== bloquesArray.find(el => bloque.audId === el.audId).sala) {
        testFunctionAux('sala-' + bloque.audId)
      }
    })
    if (previousVersion.bloques.length !== bloquesArray.length) {
      testFunctionAux('bloques')
    }
    previousVersion.testigos.forEach((testigo) => {
      if (testigo.nombre !== testigos.find(el => testigo.id === el.id).nombre) {
        testFunctionAux('nombre-' + testigo.id)
      }
      if (testigo.dni !== testigos.find(el => testigo.id === el.id).dni) {
        testFunctionAux('dni-' + testigo.id)
      }
    })

  }
  useEffect(() => {
    updateDesplegables()
  }, [])
  const handleReset = () => {
    setBloquesArray(previousVersion.bloques)
    setTestigos(previousVersion.testigos)
  }
  useEffect(() => {
    if (previousVersion.bloques && previousVersion.testigos) {
      if (bloquesArray !== null) {
        if (confirm("¿Editar otra audiencia?")) {
          setBloquesArray(previousVersion.bloques)
          setTestigos(previousVersion.testigos)
        }
      } else {
        setBloquesArray(previousVersion.bloques)
        setTestigos(previousVersion.testigos)
      }
    }
  }, [previousVersion])

  useEffect(() => {
    if (!newState && previousVersion.bloques && previousVersion.testigos && bloquesArray && testigos) {
      const hasChanges = JSON.stringify(bloquesArray) !== JSON.stringify(previousVersion.bloques) ||
        JSON.stringify(testigos) !== JSON.stringify(previousVersion.testigos)
      setChangesToSave(hasChanges)
    } else {
      setChangesToSave(false)
    }
  }, [bloquesArray, testigos, previousVersion, newState])
  return (
    <div className={`${styles.globalBlock}`}><section className={`${styles.viewBlock}`}>
      {newState ? <AddJuicioInfo setBloquesArray={setBloquesArray} newState={newState} setNewState={setNewState} setTestigos={setTestigos} /> :
        <>{previousVersion.bloques ? <EditExisting newState={newState} setNewState={setNewState} previousVersion={previousVersion} setPreviousVersion={setPreviousVersion} /> :
          <><section className={`${styles.addJuicioSection}`}><ButtonSelection newState={newState} setNewState={setNewState} />No hay juicio seleccionado</section></>}</>}
      <BloqueList setBloquesArray={setBloquesArray} bloquesArray={bloquesArray} testigos={testigos} />
      <TestigoEditList setTestigos={setTestigos} testigos={testigos} bloquesArray={bloquesArray} />
      <JuicioSelection year={year} setYear={setYear} setPreviousVersion={setPreviousVersion} />
    </section>
      <div className={`${styles.saveResetBar}`}>
        <button className={changesToSave ? `${styles.reestablecerButton} ${styles.reestablecerButtonActive}` : `${styles.reestablecerButton}`}
          onClick={() => handleReset()}>REESTABLECER</button>
        <button onClick={() => handleSave()} className={changesToSave ? `${styles.guardarButton} ${styles.guardarButtonActive}` : `${styles.guardarButton}`}>GUARDAR</button>
      </div></div>
  )
}