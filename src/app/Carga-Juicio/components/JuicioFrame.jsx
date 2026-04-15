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
  const { changeValueJuicio, desplegables, updateDesplegables, updateData, addJuicio } = useContext(DataContext)
  const [previousVersion, setPreviousVersion] = useState({})
  const [newState, setNewState] = useState(true)
  const [changesToSave, setChangesToSave] = useState([])
  const [year, setYear] = useState(getCurrentYear())
  const [bloquesArray, setBloquesArray] = useState(null)
  const [testigos, setTestigos] = useState(null)
  const [juicioInfo, setJuicioInfo] = useState({
    numeroLeg: '',
    ufi: '',
    autoApertura: '',
    inicioJuicio: '',
    tipoDelito: '',
    tipoTribunal: 'UNIPERSONAL',
    fiscal: '',
    defensa: '',
    defensoria: '',
    querella: '',
    jueces: [],
    estadoJuicio: 'PROGRAMADO'
  })
  const testFunctionAux = (value) => {
    setChangesToSave(prev => {
        if (!Array.isArray(prev)) return [value];
        if (!prev.includes(value)) return [...prev, value];
        return prev;
    });
  }
  const updateAud = (attribute) => {
    bloquesArray.forEach(el => {
      updateData(el.fecha, el.audId, attribute, el[attribute])
    })
  }
  const saving = (aux) => {
    if (aux && aux.id && Array.isArray(changesToSave)) {
        changesToSave.forEach((value) => {
          switch (value) {
            case 'numeroLeg':
              changeValueJuicio(year, aux.id, 'numeroLeg', aux.numeroLeg)
              updateAud('numeroLeg')
              break;
            case 'auto':
              changeValueJuicio(year, aux.id, 'auto', aux.auto)
              break;
            case 'inicio':
              changeValueJuicio(year, aux.id, 'inicio', aux.inicio)
              break;
            case 'fiscal':
              changeValueJuicio(year, aux.id, 'fiscal', aux.fiscal)
              break;
            case 'tipoDelito':
              changeValueJuicio(year, aux.id, 'tipoDelito', aux.tipoDelito)
              break;
            case 'ufi':
              changeValueJuicio(year, aux.id, 'ufi', aux.ufi)
              updateAud('ufi')
              break;
            case 'defensa':
              changeValueJuicio(year, aux.id, 'defensa', aux.defensa)
              break;
            case 'defensoria':
              changeValueJuicio(year, aux.id, 'defensoria', aux.defensoria)
              updateAud('defensoria')
              break;
            case 'querella':
              changeValueJuicio(year, aux.id, 'querella', aux.querella)
              break;
            case 'jueces':
              changeValueJuicio(year, aux.id, 'jueces', aux.jueces)
              break;
            case 'estadoJuicio':
              changeValueJuicio(year, aux.id, 'estadoJuicio', aux.estadoJuicio)
              break;
            case 'bloques':
              changeValueJuicio(year, aux.id, 'bloques', bloquesArray)
              break;
            case 'testigos':
              changeValueJuicio(year, aux.id, 'testigos', testigos)
              break;
            default:
              break;
          }
        })
    }
    setChangesToSave([])
  }

  const handleSave = async () => {
    // Validate DNI duplicates
    const dniList = (testigos || []).map(t => t.dni).filter(d => d);
    const hasDuplicateDNI = new Set(dniList).size !== dniList.length;
    if (hasDuplicateDNI) {
      alert('Validación Fallida: Existen DNI duplicados entre los testigos.');
      return;
    }

    if (newState) {
      // NEW TRIAL (CARGAR)
      const newJuicio = {
          ...juicioInfo,
          id: juicioInfo.numeroLeg + '-' + crypto.randomUUID().slice(0, 4), // Generar ID único basado en legajo
          bloques: bloquesArray,
          testigos: testigos,
          añoCargo: year // Usar el año seleccionado en la UI
      }
      try {
          // Note: using the year from autoApertura if available, or current 'year' state
          const targetYear = juicioInfo.autoApertura ? juicioInfo.autoApertura.split('/')[2] : year;
          await addJuicio(newJuicio, targetYear);
          alert('Juicio guardado exitosamente en la colección juicios/' + targetYear);
          setNewState(false);
          setPreviousVersion(newJuicio);
          setChangesToSave([]);
      } catch (error) {
          alert('Error al guardar: ' + error.message);
      }
    } else {
      // EDIT TRIAL (EDITAR)
      saving(previousVersion);
      alert('Cambios actualizados en Firebase');
    }
  }

  const saveTesting = (aux) => {
    setChangesToSave([])
    if (previousVersion.numeroLeg !== aux.numeroLeg) {
      testFunctionAux('numeroLeg')
    }
    if (previousVersion.auto !== aux.auto) {
      testFunctionAux('auto')
    }
    if (previousVersion.inicio !== aux.inicio) {
      testFunctionAux('inicio')
    }
    if (previousVersion.fiscal !== aux.fiscal) {
      testFunctionAux('fiscal')
    }
    if (previousVersion.tipoDelito !== aux.tipoDelito) {
      testFunctionAux('tipoDelito')
    }
    if (previousVersion.ufi !== aux.ufi) {
      testFunctionAux('ufi')
    }
    if (previousVersion.defensa !== aux.defensa) {
      testFunctionAux('defensa')
    }
    if (previousVersion.defensoria !== aux.defensoria) {
      testFunctionAux('defensoria')
    }
    if (previousVersion.querella !== aux.querella) {
      testFunctionAux('querella')
    }
    if (previousVersion.jueces !== aux.jueces) {
      testFunctionAux('jueces')
    }
    if (previousVersion.estadoJuicio !== aux.estadoJuicio) {
      testFunctionAux('estadoJuicio')
    }
    if (previousVersion && previousVersion.bloques) {
        previousVersion.bloques.forEach((bloque) => {
          const matchingBlock = (bloquesArray || []).find(el => bloque.audId === el.audId);
          if (matchingBlock) {
            if (bloque.fecha !== matchingBlock.fecha) testFunctionAux('fecha-' + bloque.audId);
            if (bloque.hora !== matchingBlock.hora) testFunctionAux('hora-' + bloque.audId);
            if (bloque.estadoBloque !== matchingBlock.estadoBloque) testFunctionAux('estado-' + bloque.audId);
            if (bloque.tipo !== matchingBlock.tipo) testFunctionAux('tipo-' + bloque.audId);
            if (bloque.sala !== matchingBlock.sala) testFunctionAux('sala-' + bloque.audId);
          }
        })
        if (previousVersion.bloques.length !== (bloquesArray || []).length) {
          testFunctionAux('bloques')
        }
    }
    if (previousVersion && previousVersion.testigos) {
        previousVersion.testigos.forEach((testigo) => {
          const matchingTestigo = (testigos || []).find(el => testigo.id === el.id);
          if (matchingTestigo) {
            if (testigo.nombre !== matchingTestigo.nombre) testFunctionAux('nombre-' + testigo.id);
            if (testigo.dni !== matchingTestigo.dni) testFunctionAux('dni-' + testigo.id);
          }
        })
    }
  }
  useEffect(() => {
    updateDesplegables()
  }, [])
  const handleReset = () => {
    if (window.confirm("¿Está seguro de que desea restablecer los cambios? Se perderán todas las modificaciones no guardadas.")) {
      setBloquesArray(previousVersion.bloques || [])
      setTestigos(previousVersion.testigos || [])
    }
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
    if (newState) {
      if ((bloquesArray && bloquesArray.length > 0) || (testigos && testigos.length > 0)) {
        setChangesToSave(['new-data'])
      } else {
        setChangesToSave([])
      }
    } else {
      const changes = []
      if (previousVersion.bloques && previousVersion.testigos && bloquesArray && testigos) {
        if (JSON.stringify(bloquesArray) !== JSON.stringify(previousVersion.bloques)) changes.push('bloques');
        if (JSON.stringify(testigos) !== JSON.stringify(previousVersion.testigos)) changes.push('testigos');
        // Note: Field changes for info section (numeroLeg, etc) are handled by EditExisting component mostly
        // but it's good to keep the detection here for blocks/testigos
      }
      setChangesToSave(changes)
    }
  }, [bloquesArray, testigos, previousVersion, newState])
  return (
    <div className={`${styles.globalBlock}`}><section className={`${styles.viewBlock}`}>
      {newState ? <AddJuicioInfo setBloquesArray={setBloquesArray} newState={newState} setNewState={setNewState} setTestigos={setTestigos} setJuicioInfo={setJuicioInfo} juicioInfo={juicioInfo} /> :
        <>{previousVersion.bloques ? <EditExisting newState={newState} setNewState={setNewState} previousVersion={previousVersion} setPreviousVersion={setPreviousVersion} /> :
          <><section className={`${styles.addJuicioSection}`}><ButtonSelection newState={newState} setNewState={setNewState} />No hay juicio seleccionado</section></>}</>}
      <BloqueList setBloquesArray={setBloquesArray} bloquesArray={bloquesArray} testigos={testigos} setTestigos={setTestigos} />
      <TestigoEditList setTestigos={setTestigos} testigos={testigos} bloquesArray={bloquesArray} />
      <JuicioSelection year={year} setYear={setYear} setPreviousVersion={setPreviousVersion} />
    </section>
      <div className={`${styles.saveResetBar}`}>
        <button className={changesToSave.length > 0 ? `${styles.reestablecerButton} ${styles.reestablecerButtonActive}` : `${styles.reestablecerButton}`}
          onClick={() => handleReset()}>REESTABLECER</button>
        <button onClick={handleSave} className={changesToSave.length > 0 ? `${styles.guardarButton} ${styles.guardarButtonActive}` : `${styles.guardarButton}`}>GUARDAR</button>
      </div></div>
  )
}