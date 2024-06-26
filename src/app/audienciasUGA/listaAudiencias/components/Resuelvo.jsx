'use client'
import styles from './Resuelvo.module.css'
import { useState, useContext, useEffect, useCallback } from 'react'
import { DataContext } from '@/context/DataContext';
import { copyResuelvoToClipboard, checkForResuelvo } from '@/utils/resuelvoUtils';
import { listModelos, modeloMinuta } from '@/utils/modelosUtils';
import { generatePDF } from '@/utils/pdfUtils';

const deepEqual = (obj1, obj2) => {
    if (obj1 === obj2) return true;

    if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) {
        return false;
    }

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    for (let key of keys1) {
        if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) return false;
    }

    return true;
};

export function Resuelvo({ item }) {
    const [caratula2, setCaratula2] = useState('');
    const [modeloSelector, setModeloSelector] = useState('');
    const [mpf2, setMpf2] = useState([]);
    const [defensa2, setDefensa2] = useState([]);
    const [imputado2, setImputado2] = useState([]);
    const [resuelvo2, setResuelvo2] = useState('');
    const [partes2, setPartes2] = useState([]);
    const { updateDesplegables, desplegables, updateDataToday, updateToday, updateRealTime, realTime } = useContext(DataContext);
    const [caratula, setCaratula] = useState('');
    const [razonDemora, setRazonDemora] = useState('');
    const [razonDemora2, setRazonDemora2] = useState('');
    const [mpf, setMpf] = useState([]);
    const [ufi, setUfi] = useState('');
    const [ufi2, setUfi2] = useState('');
    const [defensa, setDefensa] = useState([]);
    const [imputado, setImputado] = useState([]);
    const [resuelvo, setResuelvo] = useState('');
    const [minuta, setMinuta] = useState('');
    const [minuta2, setMinuta2] = useState('');
    const [cierre, setCierre] = useState('');
    const [cierre2, setCierre2] = useState('');
    const [partes, setPartes] = useState([]);
    const [guardarInc, setGuardarInc] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [removedMpf, setRemovedMpf] = useState([]);
    const [removedDefensa, setRemovedDefensa] = useState([]);
    const [removedImputado, setRemovedImputado] = useState([]);
    const [removedPartes, setRemovedPartes] = useState([]);
    const checkUFI = () =>{
        if((ufi == '' || ufi == null) && typeof mpf[0] === 'object' && mpf[0].nombre !== null){
            setUfi(mpf[0].nombre.split(' - ')[1])
        }
    }
    const handleInputChange = (setter, index, key, value) => {
        setter(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [key]: value };
            return updated;
        });
    };
    
    const addNewInput = (setter, template) => {
        setter(prev => [...prev, { ...template, id: prev.length + 1 }]);
    };

    const removeInput = (setter, index, removedSetter, items) => {
        setter(prev => prev.filter((_, i) => i !== index));
        removedSetter(prev => [...prev, items[index]]);
    };
    
    const updateComparisson = () => {
        setMpf(item.mpf ? [...item.mpf] : []);
        setMpf2(item.mpf ? [...item.mpf] : []);
        setImputado(item.imputado ? [...item.imputado] : []);
        setImputado2(item.imputado ? [...item.imputado] : []);
        setDefensa(item.defensa ? [...item.defensa] : []);
        setDefensa2(item.defensa ? [...item.defensa] : []);
        setResuelvo(item.resuelvoText || '');
        setResuelvo2(item.resuelvoText || '');
        setCaratula(item.caratula || '');
        setCaratula2(item.caratula || '');
        setPartes(item.partes ? [...item.partes] : []);
        setPartes2(item.partes ? [...item.partes] : []);
        setRazonDemora(item.razonDemora || '');
        setRazonDemora2(item.razonDemora || '');
        setMinuta(item.minuta || '');
        setMinuta2(item.minuta || '');
        setCierre(item.cierre || '');
        setCierre2(item.cierre || '');
        setUfi(item.ufi || '');
        setUfi2(item.ufi || '');
    };
    const insertarModelo = () =>{
        setCierre(modeloMinuta('cierre'))
        setMinuta(modeloMinuta(modeloSelector).cuerpo)
        setResuelvo(modeloMinuta(modeloSelector).resuelvo)
    }
    const updateData = async() =>{
        setGuardando(true)
        const handleRemove = async (itemList, removedList, field) => {
            for (const item of removedList) {
                if (itemList.includes(item)) {
                    await updateDataToday(item.numeroLeg, item.hora, field, itemList.filter(i => i !== item));
                }
            }
        }
        await handleRemove(mpf, removedMpf, 'mpf');
        await handleRemove(defensa, removedDefensa, 'defensa');
        await handleRemove(imputado, removedImputado, 'imputado');
        await handleRemove(partes, removedPartes, 'partes');
        setRemovedMpf([]);
        setRemovedDefensa([]);
        setRemovedImputado([]);
        setRemovedPartes([]);
        if (!deepEqual(caratula2, caratula)){
            await updateDataToday(item.numeroLeg, item.hora, 'caratula', caratula);
            setCaratula2(caratula)
        } 
        if (!deepEqual(mpf2, mpf)){
            await updateDataToday(item.numeroLeg, item.hora, 'mpf', mpf);
            setMpf2(mpf)
        } 
        if (!deepEqual(defensa2, defensa)){
            await updateDataToday(item.numeroLeg, item.hora, 'defensa', defensa);
            setDefensa2(defensa)
        }
        if (!deepEqual(imputado2, imputado)){
            await updateDataToday(item.numeroLeg, item.hora, 'imputado', imputado);
            setImputado2(imputado)
        }
        if (!deepEqual(resuelvo2, resuelvo)){
            await updateDataToday(item.numeroLeg, item.hora, 'resuelvoText', resuelvo);
            setResuelvo2(resuelvo)
        }
        if (!deepEqual(partes2, partes)){
            await updateDataToday(item.numeroLeg, item.hora, 'partes', partes);
            setPartes2(partes)
        }
        if (!deepEqual(razonDemora2, razonDemora)){
            await updateDataToday(item.numeroLeg, item.hora, 'razonDemora', razonDemora);
            setRazonDemora2(razonDemora)   
        }
        if (!deepEqual(minuta2, minuta)){
            await updateDataToday(item.numeroLeg, item.hora, 'minuta', minuta);
            setMinuta2(minuta)
        }
        if (!deepEqual(cierre2, cierre)){
            await updateDataToday(item.numeroLeg, item.hora, 'cierre', cierre);
            setCierre2(cierre)
        }
        if (!deepEqual(ufi2, ufi)){
            await updateDataToday(item.numeroLeg, item.hora, 'ufi', ufi);
            setUfi2(ufi)
        }
        await updateToday();
        if (await checkForResuelvo(item)) {
            await updateRealTime();
            await updateDataToday(item.numeroLeg, item.hora, 'horaResuelvo', realTime);
        }
        await setGuardarInc(false)
        await setGuardando(false)
    }
    const handleSubmit = async (event) => {
        event.preventDefault();
        await updateData()
    };

    const checkGuardar = useCallback(() => {
        const guardarStatus = !deepEqual(caratula2, caratula) ||
            !deepEqual(mpf2, mpf) ||
            !deepEqual(razonDemora2, razonDemora) ||
            !deepEqual(defensa2, defensa) ||
            !deepEqual(imputado2, imputado) ||
            !deepEqual(resuelvo2, resuelvo) ||
            !deepEqual(partes2, partes) ||
            !deepEqual(minuta2, minuta) ||
            !deepEqual(cierre2, cierre) ||
            !deepEqual(ufi2, ufi);
    
        setGuardarInc(guardarStatus);
    }, [caratula, caratula2, mpf, mpf2, razonDemora, razonDemora2, defensa, defensa2, imputado, imputado2, resuelvo, resuelvo2, partes, partes2, minuta, minuta2, cierre, cierre2, ufi, ufi2]);

    const checkHoraDiff = () => {
        const hora1 = parseInt(item.hora.split(':')[0]) * 60 + parseInt(item.hora.split(':')[1]);
        const hora2 = parseInt(item.hitos[0].split('|')[0].split(':')[0]) * 60 + parseInt(item.hitos[0].split('|')[0].split(':')[1]);
        return hora2 - hora1;
    };
    useEffect(() => {
        checkUFI()
    }, [mpf])
    useEffect(() => {
        updateDesplegables();
    }, []);
    useEffect(() => {
        checkGuardar();
    }, [caratula, mpf, defensa, imputado, resuelvo, minuta, cierre, partes, razonDemora, ufi, checkGuardar]);
    useEffect(() => {
        updateComparisson();
    }, []);
    useEffect(() => {
        checkGuardar();
    }, [guardarInc]);
    return (
        <>
            <div className={`${styles.buttonsBlock} ${styles.buttonsBlockResuelvo}`}>
                <form className={styles.resuelvoForm} onSubmit={(event) => handleSubmit(event)}>
                    <label>Carátula</label>
                    <input
                        className={`${styles.inputResuelvo} ${styles.inputText} ${styles.inputCaratula} ${styles.inputItem}`}
                        type="text"
                        value={caratula}
                        onChange={(e) => setCaratula(e.target.value)}
                    />
                    <label>Ministerio Público Fiscal</label>
                    {mpf.map((input, index) => (
                        <div key={input.id} className={`${styles.inputRow}`}>
                            <input
                                list='mpf'
                                className={`${styles.inputResuelvo} ${styles.inputResuelvo1} ${styles.inputSelect}`}
                                value={input.nombre}
                                onChange={(e) => handleInputChange(setMpf, index, 'nombre', e.target.value)}
                            />
                            <datalist id='mpf'>
                                {desplegables.fiscal && desplegables.fiscal.map(option => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </datalist>
                            <button className={`${styles.formButton} ${styles.removeButton}`} type="button" onClick={() => removeInput(setMpf, index, setRemovedMpf, mpf)}>QUITAR</button>
                            <button className={`${styles.formButton} ${styles.presenteButton}`} type="button" onClick={() => handleInputChange(setMpf, index, 'asistencia', (!input.asistencia))}>{input.asistencia ? 'P' : 'A'}</button>
                        </div>
                    ))}
                    <button className={styles.formButton} type="button" onClick={() => addNewInput(setMpf, { nombre: '', asistencia: true })}>+ FISCAL</button>
                    <span><label>UFI:</label><input
                                list='ufi'
                                className={`${styles.inputResuelvo} ${styles.inputResuelvo1} ${styles.inputUfi}`}
                                value={ufi}
                                onChange={(e) => setUfi(e.target.value)}
                            />
                            <datalist id='ufi'>
                                <option>CAVIG</option>
                                <option>ANIVI</option>
                                <option>DELITOS ESPECIALES</option>
                                <option>DELITOS CONTRA LA PROPIEDAD</option>
                                <option>DELITOS INFORMÁTICOS Y ESTAFAS</option>
                                <option>GENÉRICA</option>
                                <option>SOLUCIONES ALTERNATIVAS</option>
                                <option>FLAGRANCIA</option>
                            </datalist></span>
                    <label>Imputados</label>
                    {imputado.map((input, index) => (
                        <div key={input.id} className={input.condenado ? `${styles.condenadoInput} ${styles.inputRow}` : `${styles.imputadoInput} ${styles.inputRow}`}>
                            <input
                                className={`${styles.inputResuelvo} ${styles.inputResuelvo2} ${styles.inputText}`}
                                type="text"
                                value={input.nombre}
                                onChange={(e) => handleInputChange(setImputado, index, 'nombre', e.target.value)}
                                placeholder="Nombre"
                            />
                            <input
                                className={`${styles.inputResuelvo} ${styles.inputResuelvo2} ${styles.inputText}`}
                                type="text"
                                value={input.dni}
                                onChange={(e) => handleInputChange(setImputado, index, 'dni', e.target.value)}
                                placeholder="DNI"
                            />
                            <button className={`${styles.formButton} ${styles.removeButton}`} type="button" onClick={() => removeInput(setImputado, index, setRemovedImputado, imputado)}>QUITAR</button>
                            <button className={`${styles.formButton} ${styles.presenteButton}`} type="button" onClick={() => handleInputChange(setImputado, index, 'asistencia', (!input.asistencia))}>{input.asistencia ? 'P' : 'A'}</button>
                        </div>
                    ))}
                    <span className={styles.imputadoButtons}>
                        <button className={`${styles.formButton} ${styles.imputadoButton}`} type="button" onClick={() => addNewInput(setImputado, { nombre: '', dni: '', condenado: false, asistencia: true })}>+ IMPUTADO</button>
                        <button className={`${styles.formButton} ${styles.condenadoButton}`} type="button" onClick={() => addNewInput(setImputado, { nombre: '', dni: '', condenado: true, asistencia: true })}>+ CONDENADO</button>
                    </span>
                    <label>Defensa</label>
                    {defensa.map((input, index) => (
                        <div key={input.id} className={`${styles.inputRow}`}>
                            <select
                                className={`${styles.inputResuelvo} ${styles.inputResuelvo3} ${styles.inputSelect}`}
                                value={input.tipo}
                                onChange={(e) => handleInputChange(setDefensa, index, 'tipo', e.target.value)}
                            >
                                <option value=""></option>
                                <option value="Oficial">Oficial</option>
                                <option value="Particular">Particular</option>
                            </select>
                            {input.tipo && (
                                input.tipo === 'Oficial' ? (
                                    <><input
                                        list='oficial'
                                        className={`${styles.inputResuelvo} ${styles.inputResuelvo1} ${styles.inputSelect}`}
                                        value={input.nombre}
                                        onChange={(e) => handleInputChange(setDefensa, index, 'nombre', e.target.value)}
                                    />
                                    <datalist id='oficial'>
                                        {desplegables.defensa && desplegables.defensa.map(option => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </datalist></>
                                ) : (
                                    <input
                                        className={`${styles.inputResuelvo} ${styles.inputResuelvo3} ${styles.inputText}`}
                                        type="text"
                                        value={input.nombre}
                                        onChange={(e) => handleInputChange(setDefensa, index, 'nombre', e.target.value)}
                                        placeholder="Nombre"
                                    />
                                )
                            )}
                            <select
                                className={`${styles.inputResuelvo} ${styles.inputSelect}`}
                                value={input.imputado}
                                onChange={(e) => handleInputChange(setDefensa, index, 'imputado', e.target.value)}
                            >
                                <option value="">imputado - (opcional)</option>
                                {imputado.map(imputadoItem => (
                                    <option key={imputadoItem.nombre} value={imputadoItem.nombre}>
                                        {imputadoItem.nombre}
                                    </option>
                                ))}
                            </select>
                            <button className={`${styles.formButton} ${styles.removeButton}`} type="button" onClick={() => removeInput(setDefensa, index, setRemovedDefensa, defensa)}>QUITAR</button>
                            <button className={`${styles.formButton} ${styles.presenteButton}`} type="button" onClick={() => handleInputChange(setDefensa, index, 'asistencia', (!input.asistencia))}>{input.asistencia ? 'P' : 'A'}</button>
                        </div>
                    ))}
                    <button className={styles.formButton} type="button" onClick={() => addNewInput(setDefensa, { tipo: '', nombre: '', imputado: '', asistencia: true })}>+ DEFENSA</button>
                    <label>Otras Partes</label>
                    {partes.map((input, index) => (
                        <div key={input.id} className={`${styles.inputRow}`}>
                            <select
                                className={`${styles.inputResuelvo} ${styles.inputResuelvo2} ${styles.inputSelect}`}
                                value={input.role}
                                onChange={(e) => handleInputChange(setPartes, index, 'role', e.target.value)}
                            >
                                <option value=""></option>
                                <option value="DENUNCIANTE">DENUNCIANTE</option>
                                <option value="TESTIGO">TESTIGO</option>
                                <option value="QUERELLA">QUERELLA</option>
                                <option value="ASESOR DE MENORES">ASESOR DE MENORES</option>
                                <option value="AUXILIAR">AUXILIAR</option>
                                <option value="INTÉRPRETE">INTÉRPRETE</option>
                            </select>
                            <input
                                className={`${styles.inputResuelvo} ${styles.inputResuelvo2} ${styles.inputText}`}
                                type="text"
                                value={input.name}
                                onChange={(e) => handleInputChange(setPartes, index, 'name', e.target.value)}
                                placeholder="Name"
                            />
                            <button className={`${styles.formButton} ${styles.removeButton}`} type="button" onClick={() => removeInput(setPartes, index, setRemovedPartes, partes)}>QUITAR</button>
                        </div>
                    ))}
                    <button className={styles.formButton} type="button" onClick={() => addNewInput(setPartes, { role: '', name: '' })}>+ PARTE</button>
                    <span className={`${styles.insertarModeloBlock}`}>
                    <label>MODELO MINUTA</label>
                    <select
                        className={`${styles.inputResuelvo} ${styles.inputResuelvo2} ${styles.inputSelect}`}
                        onChange={(e) => setModeloSelector(e.target.value)}
                    >
                        <option value={''}></option>
                        {listModelos.map(mod =>
                            <option key={mod} value={mod}>{mod.split('_').join(' ')}</option>
                        )}
                    </select>
                    <button type='button' onClick={() => insertarModelo()} className={`${styles.formButton} ${styles.insertarButton}`}>INSERTAR</button>
                    </span>
                    <label>Cuerpo Minuta</label>
                    <textarea
                        className={`${styles.textArea} ${styles.textAreaCuerpo}`}
                        rows="20"
                        value={minuta}
                        onChange={(e) => setMinuta(e.target.value)}
                    />
                    <label>Fundamentos y Resolución</label>
                    <textarea
                        className={`${styles.textArea} ${styles.textAreaResuelvo}`}
                        rows="5"
                        value={resuelvo}
                        onChange={(e) => setResuelvo(e.target.value)}
                    />
                    <label>Cierre</label>
                    <textarea
                        className={`${styles.textArea} ${styles.textAreaCierre}`}
                        rows="5"
                        value={cierre}
                        onChange={(e) => setCierre(e.target.value)}
                    />
                    {(item.hora && item.hitos && checkHoraDiff() > 5) &&
                        <>
                            <label>MOTIVO DEMORA ({checkHoraDiff()}min)</label>
                            <select
                                onChange={(e) => setRazonDemora(e.target.value)}
                                className={`${styles.inputResuelvo} ${styles.inputResuelvoDemora}`}
                            >
                                <option value={razonDemora}>{razonDemora}</option>
                                <option value='JUEZ'>JUEZ</option>
                                <option value='FISCAL'>FISCAL</option>
                                <option value='DEFENSA'>DEFENSA</option>
                                <option value='IMPUTADO'>IMPUTADO</option>
                                <option value='AUDIENCIA PREVIA'>AUDIENCIA PREVIA</option>
                                <option value='VICTIMA'>VICTIMA</option>
                                <option value='QUERELLA'>QUERELLA</option>
                                <option value='TRASLADO DETENIDO'>TRASLADO DETENIDO</option>
                                <option value='PROBLEMAS TÉCNICOS'>PROBLEMAS TÉCNICOS</option>
                                <option value='DEMORA OPERADOR'>DEMORA OPERADOR</option>
                                <option value='OFIJUP'>OFIJUP</option>
                                <option value='OFIJUP'>OTRO</option>
                            </select>
                        </>
                    }
                    {guardarInc && <button className={guardando ? `${styles.formButton} ${styles.guardarButton} ${styles.guardandoButton}` : `${styles.formButton} ${styles.guardarButton}`} type="submit" value="GUARDAR">
                        <span className={`${styles.sinGuardar}`}>CAMBIOS SIN<br/>GUARDAR</span>
                        <span className={`${styles.guardar}`}>GUARDAR</span>
                        <span className={`${styles.guardando}`}>GUARDANDO...</span>
                    </button>}
                </form>
            </div>
            <button type='button' className={`${styles.formButton} ${styles.descargarButton}`} onClick={async() => await generatePDF(item,(new Date()).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" }).split('/').join(''))}>Descargar PDF</button>        
            </>
    );
}