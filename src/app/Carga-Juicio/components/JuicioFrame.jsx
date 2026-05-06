'use client'
import styles from './Carga-Juicio.module.css'
import AddJuicioInfo from './AddJuicioInfo';
import { BloqueList } from './BloqueList';
import { useContext, useEffect, useState } from 'react';
import { TestigoEditList } from './TestigoEditList';
import { JuicioSelection } from './JuicioSelection';
import EditExisting from './EditExisting';
import { getCurrentYear } from '@/utils/dateUtils';
import { DataContext } from '@/context/DataContext';
import { ButtonSelection } from './ButtonSelection';

export default function JuicioFrame() {
  const { changeValueJuicio, desplegables, updateDesplegables, updateData, addJuicio, updateJuicios, juiciosList, addAudiencia, deleteAudiencia, getDocument, deleteJuicio } = useContext(DataContext)
  const [previousVersion, setPreviousVersion] = useState({})
  const [newState, setNewState] = useState(true)
  const [changesToSave, setChangesToSave] = useState([])
  const [year, setYear] = useState(getCurrentYear())
  const [bloquesArray, setBloquesArray] = useState(null)
  const [testigos, setTestigos] = useState(null)
  const [juicioInfo, setJuicioInfo] = useState({
    numeroLeg: '',
    ufi: '',
    auto: '',
    inicio: '',
    tipoDelito: '',
    tipoTribunal: 'UNIPERSONAL',
    fiscal: '',
    defensa: '',
    defensoria: '',
    querella: '',
    jueces: '',
    estadoJuicio: 'PROGRAMADO',
    generado: false
  })
  const testFunctionAux = (value) => {
    setChangesToSave(prev => {
      if (!Array.isArray(prev)) return [value];
      if (!prev.includes(value)) return [...prev, value];
      return prev;
    });
  }

  const resetJuicioInfo = () => {
    setJuicioInfo({
      numeroLeg: '',
      ufi: '',
      auto: '',
      inicio: '',
      tipoDelito: '',
      tipoTribunal: 'UNIPERSONAL',
      fiscal: '',
      defensa: '',
      defensoria: '',
      querella: '',
      jueces: '',
      estadoJuicio: 'PROGRAMADO',
      generado: false
    });
    setBloquesArray(null);
    setTestigos(null);
    setPreviousVersion({});
    setChangesToSave([]);
  }

  const toggleMode = (targetIsCargar) => {
    if (targetIsCargar) { // Queremos ir a CARGAR
      if (newState) return; // Ya estamos en CARGAR
      if (window.confirm("¿Desea cargar un nuevo juicio? Se limpiarán los valores actuales.")) {
        resetJuicioInfo();
        setNewState(true);
      }
    } else { // Queremos ir a EDITAR
      if (!newState) return; // Ya estamos en EDITAR
      if (previousVersion.id) {
        setNewState(false);
      } else {
        alert("Seleccione un juicio del listado para editar.");
      }
    }
  }

  const handleDeleteJuicio = async (juicio) => {
    const legajo = juicio.numeroLeg || 'Sin Legajo';
    const auto = juicio.auto || 'Sin Auto';
    
    const confirmation1 = window.confirm(`¿Está seguro de que desea eliminar el juicio ${legajo} (Auto: ${auto})?`);
    if (!confirmation1) return;

    const confirmation2 = window.confirm(`RE-VALIDACIÓN: ¿Realmente desea eliminar PERMANENTEMENTE el juicio ${legajo} con Auto de Apertura ${auto}? Esta acción no se puede deshacer.`);
    if (!confirmation2) return;

    try {
      // 1. Eliminar todas las audiencias vinculadas al juicio antes de borrar el juicio en sí
      if (juicio.bloques && Array.isArray(juicio.bloques)) {
        for (const block of juicio.bloques) {
          try {
            await deleteAudiencia(block.fecha, block.audId);
          } catch (e) {
            console.error(`Error eliminando audiencia vinculada (${block.audId}):`, e);
          }
        }
      }

      await deleteJuicio(year, juicio.id);
      
      // Si el juicio eliminado es el que está cargado actualmente
      if (previousVersion.id === juicio.id) {
        resetJuicioInfo();
        setNewState(true);
      }
      
      // Recargar la lista se hace automáticamente por el context al llamar deleteJuicio
      // pero por seguridad nos aseguramos
      await updateJuicios(String(year));
    } catch (error) {
      alert("Error al eliminar el juicio: " + error.message);
    }
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

  const handleGenerarActualizar = async () => {
    const isNew = !previousVersion.generado;
    const confirmMsg = isNew
      ? "¿Está seguro de que desea GENERAR las audiencias para este juicio? Esto creará documentos en la agenda para cada bloque."
      : "¿Desea ACTUALIZAR las audiencias vinculadas a este juicio?";

    if (!window.confirm(confirmMsg)) return;

    const logs = [];
    const errores = [];
    const bloquesActualizados = bloquesArray ? [...bloquesArray] : [];

    // 1. Detectar y eliminar bloques que han sido borrados de la lista
    if (!isNew && previousVersion.bloques) {
        const deletedBlocks = previousVersion.bloques.filter(oldB => 
            !bloquesActualizados.some(newB => newB.audId === oldB.audId)
        );

        for (const oldBlock of deletedBlocks) {
            try {
                await deleteAudiencia(oldBlock.fecha, oldBlock.audId);
                logs.push(`Audiencia eliminada: El bloque con ID ${oldBlock.audId} ha sido removido.`);
            } catch (e) {
                errores.push(`Error al eliminar audiencia de bloque borrado (${oldBlock.audId}): ${e.message}`);
                console.error(e);
            }
        }
    }

    for (let i = 0; i < bloquesActualizados.length; i++) {
        const block = bloquesActualizados[i];
        
        // Si es actualización, verificar si el bloque ya se realizó
        if (!isNew) {
            try {
                const viewData = await getDocument('audienciasView', block.fecha);
                const existingAud = viewData ? viewData[block.audId] : null;

                if (existingAud && existingAud.estado !== 'PROGRAMADO') {
                    logs.push(`BLOQUE ${i + 1} no presentará cambios debido a que la audiencia ha sido realizada.`);
                    continue;
                }
            } catch (e) {
                console.error("Error al verificar estado previo:", e);
            }
        }

        // Preparar data de la audiencia
        const hearingData = {
            aId: block.aId || `${block.hora.replace(/:/g, "")}${juicioInfo.numeroLeg}`,
            titulo: 'DEBATE',
            numeroLeg: juicioInfo.numeroLeg,
            juez: juicioInfo.jueces,
            ufi: juicioInfo.ufi,
            tipo: 'DEBATE',
            tipo2: block.tipo2 || '',
            tipo3: block.tipo3 || '',
            horaProgramada: block.horaProgramada || 45,
            situacion: block.situacion || '',
            caratula: `${juicioInfo.numeroLeg} - ${juicioInfo.tipoDelito}`,
            mpf: [{ nombre: juicioInfo.fiscal, asistencia: true, presencial: true, id: 'mpf-1' }],
            defensa: [{ 
                tipo: juicioInfo.defensa && juicioInfo.defensa.includes('Particular') ? 'Particular' : 'Oficial', 
                nombre: juicioInfo.defensa, 
                asistencia: true, 
                presencial: true, 
                id: 'def-1' 
            }],
            partes: (testigos || [])
                .filter(t => t.fecha?.some(f => (f.audid || f.audId) === block.audId))
                .map(t => ({
                    role: 'Testigo',
                    name: t.nombre,
                    dni: t.dni,
                    asistencia: false,
                    presencial: true,
                    id: t.id
                })),
            estado: 'PROGRAMADA',
            hora: block.hora,
            sala: block.sala || ' -',
            juicioReference: {
                id: previousVersion.id || `${juicioInfo.numeroLeg}#pending`,
                year: year
            }
        };

        try {
            // Manejar cambio de fecha: eliminar de la fecha vieja si cambió
            const oldBlock = previousVersion.bloques?.find(b => b.audId === block.audId);
            if (!isNew && oldBlock && oldBlock.fecha !== block.fecha) {
                await deleteAudiencia(oldBlock.fecha, block.audId);
            }

            // Guardar o actualizar la audiencia usando el audId del bloque
            await addAudiencia(hearingData, block.fecha, block.audId);
            logs.push(`Bloque ${i + 1} ${isNew ? 'generado' : 'actualizado'} correctamente.`);
        } catch (e) {
            errores.push(`Error en Bloque ${i + 1}: ${e.message}`);
        }
    }

    if (isNew) {
        // Encontrar el ID real si era un juicio nuevo que no se había guardado aún
        let targetId = previousVersion.id;
        if (!targetId) {
            alert("Por favor, guarde el juicio antes de generar las audiencias.");
            return;
        }
        await changeValueJuicio(year, targetId, 'generado', true);
        setPreviousVersion(prev => ({...prev, generado: true}));
    }

    alert(logs.join('\n') + (errores.length > 0 ? '\n\nErrores:\n' + errores.join('\n') : ''));
  };

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
      // Robust sequence calculation finding the MAX existing #N
      const sameLegajoNumbers = (juiciosList || [])
        .filter(j => j.id && j.id.startsWith(`${juicioInfo.numeroLeg}#`))
        .map(j => parseInt(j.id.split('#')[1]) || 0);

      const nextNumber = sameLegajoNumbers.length > 0 ? Math.max(...sameLegajoNumbers) + 1 : 1;
      const finalId = `${juicioInfo.numeroLeg}#${nextNumber}`;

      const newJuicio = {
        ...juicioInfo,
        id: finalId,
        bloques: bloquesArray,
        testigos: testigos,
        añoCargo: year
      }
      try {
        const targetYearFromAuto = juicioInfo.auto ? juicioInfo.auto.split('/')[2]?.split(' ')[0] : null;
        const targetYear = targetYearFromAuto || year;
        await addJuicio(newJuicio, targetYear);
        await updateJuicios(targetYear);
        alert('Juicio guardado exitosamente');

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
      // Ensure all witnesses have an ID if they don't (backwards compatibility)
      const sanitizedTestigos = (previousVersion.testigos || []).map(t => ({
        ...t,
        id: t.id || `legacy-${crypto.randomUUID().slice(0, 8)}`
      }));

      // If we just came from newState (CARGAR), don't prompt, just update internal state
      if (bloquesArray !== null) {
        // If it's a new trial being saved, newState is still true in this cycle or just changed.
        // But a more reliable way is to check if previousVersion matches current state.
        const isSameTrial = JSON.stringify(previousVersion.bloques) === JSON.stringify(bloquesArray);

        if (!isSameTrial && confirm("¿Editar otra audiencia?")) {
          setBloquesArray(previousVersion.bloques)
          setTestigos(sanitizedTestigos)
        } else if (isSameTrial) {
          // Already synced, no need to prompt
          setBloquesArray(previousVersion.bloques)
          setTestigos(sanitizedTestigos)
        }
      } else {
        setBloquesArray(previousVersion.bloques)
        setTestigos(sanitizedTestigos)
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
      {newState ? <AddJuicioInfo setBloquesArray={setBloquesArray} newState={newState} onToggle={toggleMode} setTestigos={setTestigos} setJuicioInfo={setJuicioInfo} juicioInfo={juicioInfo} /> :
        <>{previousVersion.bloques ? <EditExisting newState={newState} onToggle={toggleMode} previousVersion={previousVersion} setPreviousVersion={setPreviousVersion} /> :
          <><section className={`${styles.addJuicioSection}`}><ButtonSelection newState={newState} onToggle={toggleMode} />No hay juicio seleccionado</section></>}</>}
      <BloqueList setBloquesArray={setBloquesArray} bloquesArray={bloquesArray} testigos={testigos} setTestigos={setTestigos} />
      <TestigoEditList setTestigos={setTestigos} testigos={testigos} bloquesArray={bloquesArray} />
      <JuicioSelection year={year} setYear={setYear} setPreviousVersion={(v) => { setPreviousVersion(v); setNewState(false); }} onDelete={handleDeleteJuicio} />
    </section>
      <div className={`${styles.saveResetBar}`}>
        <button 
          onClick={handleGenerarActualizar} 
          className={!newState ? `${styles.generarButton} ${styles.generarButtonActive}` : `${styles.generarButton}`}
          title="Genera o actualiza las audiencias en el calendario (audiencias y audienciasView) con toda la información cargada: jueces, defensa, fiscales y testigos distribuidos por día."
        >
          {previousVersion.generado ? 'ACTUALIZAR' : 'GENERAR'}
        </button>
        <button className={changesToSave.length > 0 ? `${styles.reestablecerButton} ${styles.reestablecerButtonActive}` : `${styles.reestablecerButton}`}
          onClick={() => handleReset()}>REESTABLECER</button>
        <button onClick={handleSave} className={changesToSave.length > 0 ? `${styles.guardarButton} ${styles.guardarButtonActive}` : `${styles.guardarButton}`}>GUARDAR</button>
      </div></div>
  )
}
