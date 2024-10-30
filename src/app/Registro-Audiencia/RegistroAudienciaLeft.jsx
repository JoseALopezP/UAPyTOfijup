import { useContext, useEffect, useState, useCallback } from 'react';
import { Reconversion } from './Reconversion';
import styles from './RegistroAudiencia.module.css';
import RegistroChangeState from './RegistroChangeState';
import { DataContext } from '@/context/DataContext';

const deepEqual = (obj1, obj2) => {
    if (obj1 === obj2) return true;
    if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) {
        return false;}
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length) return false;
    for (let key of keys1) {
        if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) return false;}
    return true;
};
export default function RegistroAudienciaLeft({ item, dateToUse }) {
    const {updateDesplegables, desplegables, updateByDate, bydate, updateRealTime, realTime, updateData} = useContext(DataContext)
    const [sala, setSala] = useState(item.sala)
    const [caratula2, setCaratula2] = useState('');
    const [mpf2, setMpf2] = useState([]);
    const [defensa2, setDefensa2] = useState([]);
    const [imputado2, setImputado2] = useState([]);
    const [showReconversion, setShowReconversion] = useState(false);
    const [partes2, setPartes2] = useState([]);
    const [caratula, setCaratula] = useState('');
    const [razonDemora, setRazonDemora] = useState('');
    const [razonDemora2, setRazonDemora2] = useState('');
    const [mpf, setMpf] = useState([]);
    const [ufi, setUfi] = useState('');
    const [ufi2, setUfi2] = useState('');
    const [defensa, setDefensa] = useState([]);
    const [imputado, setImputado] = useState([]);
    const [tipo, setTipo] = useState('');
    const [tipoAux, setTipoAux] = useState('');
    const [tipo2, setTipo2] = useState('');
    const [tipo2Aux, setTipo2Aux] = useState('');
    const [tipo3, setTipo3] = useState('');
    const [tipo3Aux, setTipo3Aux] = useState('');
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
        setCaratula(item.caratula || '');
        setCaratula2(item.caratula || '');
        setPartes(item.partes ? [...item.partes] : []);
        setPartes2(item.partes ? [...item.partes] : []);
        setRazonDemora(item.razonDemora || '');
        setRazonDemora2(item.razonDemora || '');
        setUfi(item.ufi || '');
        setUfi2(item.ufi || '');
        setTipo(item.tipo || '')
        setTipoAux(item.tipo || '')
        setTipo2(item.tipo2 || '')
        setTipo2Aux(item.tipo2 || '')
        setTipo3(item.tipo3 || '')
        setTipo3Aux(item.tipo3 || '')
    };
    const updateDataAud = async() =>{
        setGuardando(true)
        const handleRemove = async (itemList, removedList, field) => {
            for (const item of removedList) {
                if (itemList.includes(item)) {
                    await updateData(dateToUse, item.numeroLeg, item.hora, field, itemList.filter(i => i !== item));
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
            await updateData(dateToUse, item.numeroLeg, item.hora, 'caratula', caratula);
            setCaratula2(caratula)}
        if (!deepEqual(mpf2, mpf)){
            await updateData(dateToUse, item.numeroLeg, item.hora, 'mpf', mpf);
            setMpf2(mpf)} 
        if (!deepEqual(defensa2, defensa)){
            await updateData(dateToUse, item.numeroLeg, item.hora, 'defensa', defensa);
            setDefensa2(defensa)}
        if (!deepEqual(imputado2, imputado)){
            await updateData(dateToUse, item.numeroLeg, item.hora, 'imputado', imputado);
            setImputado2(imputado)}
        if (!deepEqual(partes2, partes)){
            await updateData(dateToUse, item.numeroLeg, item.hora, 'partes', partes);
            setPartes2(partes)}
        if (!deepEqual(razonDemora2, razonDemora)){
            await updateData(dateToUse, item.numeroLeg, item.hora, 'razonDemora', razonDemora);
            setRazonDemora2(razonDemora)}
        if (!deepEqual(ufi2, ufi)){
            await updateData(dateToUse, item.numeroLeg, item.hora, 'ufi', ufi);
            setUfi2(ufi)}
        if(showReconversion){
        if (!deepEqual(tipo, tipoAux)){
            if(!deepEqual(tipo2, tipo2Aux)){
                if(!deepEqual(tipo3, tipo3Aux)){
                    await updateData(dateToUse, item.numeroLeg, item.hora, 'tipo', tipo);
                    await updateData(dateToUse, item.numeroLeg, item.hora, 'tipo2', tipo2);
                    await updateData(dateToUse, item.numeroLeg, item.hora, 'tipo3', tipo3);
                }else{
                    await updateData(dateToUse, item.numeroLeg, item.hora, 'tipo', tipo);
                    await updateData(dateToUse, item.numeroLeg, item.hora, 'tipo2', tipo2);
                    await updateData(dateToUse, item.numeroLeg, item.hora, 'tipo3', '');
                }
            }else{
                await updateData(dateToUse, item.numeroLeg, item.hora, 'tipo', tipo);
                await updateData(dateToUse, item.numeroLeg, item.hora, 'tipo2', '');
                await updateData(dateToUse, item.numeroLeg, item.hora, 'tipo3', '');
            }
            await updateData(dateToUse, item.numeroLeg, item.hora, 'reconvertida', `${tipoAux} + ${tipo2Aux} + ${tipo3Aux}`);
            setTipoAux(tipo)
            setTipo2Aux(tipo2)
            setTipo3Aux(tipo3)
        }
        }
        await updateToday();
        if (await checkForResuelvo(item)) {
            await updateRealTime();
            await updateData(dateToUse, item.numeroLeg, item.hora, 'horaResuelvo', realTime);
        }
        await setGuardarInc(false)
        await setGuardando(false)
    }
    const handleSubmit = async (event) => {
        if(event) event.preventDefault();
        await updateDataAud()
    };
    const handleReconversion = () =>{   
        setShowReconversion(!showReconversion)
        setTipo(tipoAux)
        setTipo2(tipo2Aux)
        setTipo3(tipo3Aux)
    }
    const checkGuardar = useCallback(() => {
        const guardarStatus = !deepEqual(caratula2, caratula) ||
            !deepEqual(mpf2, mpf) ||
            !deepEqual(razonDemora2, razonDemora) ||
            !deepEqual(defensa2, defensa) ||
            (showReconversion & !deepEqual(tipoAux, tipo)) ||
            (showReconversion & !deepEqual(tipo2Aux, tipo2)) ||
            (showReconversion & !deepEqual(tipo3Aux, tipo3)) ||
            !deepEqual(imputado2, imputado) ||
            !deepEqual(partes2, partes) ||
            !deepEqual(ufi2, ufi);
    
        setGuardarInc(guardarStatus);
    }, [caratula, caratula2, mpf, mpf2, razonDemora, razonDemora2, defensa, defensa2, imputado, imputado2, partes, partes2, ufi, ufi2, tipo2, tipo, tipo3, showReconversion]);

    const checkHoraDiff = () => {
        const hora1 = parseInt(item.hora.split(':')[0]) * 60 + parseInt(item.hora.split(':')[1]);
        const hora2 = parseInt(item.hitos[0].split('|')[0].split(':')[0]) * 60 + parseInt(item.hitos[0].split('|')[0].split(':')[1]);
        return hora2 - hora1;
    };
    useEffect(() => {
        const interval = setInterval(() => {
            if(document.getElementById('submit-btn') && !showReconversion){
                document.getElementById('submit-btn').click();
            }
        }, 60000);
        return () => clearInterval(interval);
      }, []);
    useEffect(() => {
        checkUFI()
    }, [mpf])
    useEffect(() => {
        updateDesplegables();
    }, []);
    useEffect(() => {
        checkGuardar();
    }, [caratula, mpf, defensa, imputado, partes, razonDemora, ufi, checkGuardar, tipo, tipo2, tipo3]);
    useEffect(() => {
        updateComparisson();
    }, []);
    useEffect(() => {
        checkGuardar();
    }, [guardarInc]);
    useEffect(() => {
        updateDesplegables()
    }, [])
    return (
        <div className={`${styles.controlBlockLeft}`}>
            <h2 className={`${styles.audControlTitle}`}>{item.numeroLeg} - {item.hora}</h2>
            <RegistroChangeState aud={item}/>
            <span className={`${styles.inputLeftRow}`}><label className={`${styles.inputLeftNameDRow}`}>SALA: </label>
                <input list='sala' className={`${styles.inputLeftDRow}`} value={sala} onChange={e => setSala(e.target.value)}/>
                <datalist id='sala' className={`${styles.tableCellInput}`}><option>{sala}</option>
                {desplegables.salas && desplegables.salas.map(el =>(
                    <option key={el} value={el}>SALA {el}</option>
                ))}</datalist></span>
            <span className={`${styles.inputLeftColumn}`}><label className={`${styles.inputLeftNameDColumn}`}>Carátula</label>
                <input className={`${styles.inputItem}`}
                    type="text" value={caratula} onChange={(e) => setCaratula(e.target.value)}/></span>
            <button className={showReconversion ? `${styles.formButton} ${styles.reconvertidaButton} ${styles.reconvertidaButtonClicked}` : `${styles.formButton} ${styles.reconvertidaButton}`} type="button" onClick={() => handleReconversion()}>{showReconversion ? 'RECONVERTIDA' : 'TIPO ORIGINAL'}</button>
            {showReconversion ? <Reconversion item={item} setTipo={setTipo} setTipo2={setTipo2} setTipo3={setTipo3} tipo={tipo} tipo2={tipo2} tipoAux={tipoAux} tipo2Aux={tipo2Aux}/> : ''}
            <span className={`${styles.inputLeftColumn}`}><label className={`${styles.inputLeftNameDRow}`}>Ministerio Público Fiscal</label>
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
            <button className={styles.formButton} type="button" onClick={() => addNewInput(setMpf, { nombre: '', asistencia: true })}>+ FISCAL</button></span>
            <span className={`${styles.inputLeftRow}`}><label className={`${styles.inputLeftNameDRow}`}>UFI:</label>
                <input list='ufi' className={`${styles.inputLeftDRow}`} value={ufi}
                    onChange={(e) => setUfi(e.target.value)}/>
                <datalist id='ufi'>{desplegables.fiscal && desplegables.ufi.map(option => (
                        <option key={option} value={option}>{option}</option>
                    ))}</datalist></span>
            <span className={`${styles.inputLeftColumn}`}><label className={`${styles.inputLeftNameDColumn}`}>Imputados</label>
                {imputado.map((input, index) => (
                    <div key={input.id} className={input.condenado ? `${styles.condenadoInput} ${styles.inputRow}` : `${styles.imputadoInput} ${styles.inputRow}`}>
                        <input className={`${styles.inputResuelvo} ${styles.inputResuelvo2} ${styles.inputText}`}
                            type="text"
                            value={input.nombre}
                            onChange={(e) => handleInputChange(setImputado, index, 'nombre', e.target.value)}
                            placeholder="Nombre"/>
                        <input className={`${styles.inputResuelvo} ${styles.inputResuelvo2} ${styles.inputText}`}
                            type="text"
                            value={input.dni}
                            onChange={(e) => handleInputChange(setImputado, index, 'dni', e.target.value)}
                            placeholder="DNI"/>
                        <button className={`${styles.formButton} ${styles.removeButton}`} type="button" onClick={() => removeInput(setImputado, index, setRemovedImputado, imputado)}>QUITAR</button>
                        <button className={`${styles.formButton} ${styles.presenteButton}`} type="button" onClick={() => handleInputChange(setImputado, index, 'asistencia', (!input.asistencia))}>{input.asistencia ? 'P' : 'A'}</button>
                    </div>
                ))}
                <span className={styles.imputadoButtons}>
                    <button className={`${styles.formButton} ${styles.imputadoButton}`} type="button" onClick={() => addNewInput(setImputado, { nombre: '', dni: '', condenado: false, asistencia: true })}>+ IMPUTADO</button>
                    <button className={`${styles.formButton} ${styles.condenadoButton}`} type="button" onClick={() => addNewInput(setImputado, { nombre: '', dni: '', condenado: true, asistencia: true })}>+ CONDENADO</button>
                </span></span>
                <span className={`${styles.inputLeftColumn}`}><label className={`${styles.inputLeftNameDColumn}`}>Defensa</label>
                    {defensa.map((input, index) => (
                        <div key={input.id} className={`${styles.inputRow}`}>
                            <select className={`${styles.inputResuelvo} ${styles.inputResuelvo3} ${styles.inputSelect}`}
                                value={input.tipo}
                                onChange={(e) => handleInputChange(setDefensa, index, 'tipo', e.target.value)}>
                                <option value=""></option>
                                <option value="Oficial">Oficial</option>
                                <option value="Particular">Particular</option>
                            </select>
                            {input.tipo && (input.tipo === 'Oficial' ? (
                                    <><input list='oficial'
                                        value={input.nombre}
                                        onChange={(e) => handleInputChange(setDefensa, index, 'nombre', e.target.value)}/>
                                    <datalist id='oficial'>
                                        {desplegables.defensa && desplegables.defensa.map(option => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>))}
                                    </datalist></>
                                ) : (
                                    <><input list='particular'
                                        value={input.nombre}
                                        onChange={(e) => handleInputChange(setDefensa, index, 'nombre', e.target.value)}
                                        placeholder="Nombre"/>
                                    <datalist id='particular'>
                                        {desplegables.defensaParticular && desplegables.defensaParticular.map(option => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </datalist></>
                                )
                            )}
                            <select value={input.imputado} onChange={(e) => handleInputChange(setDefensa, index, 'imputado', e.target.value)}>
                                <option value="">imputado - (opcional)</option>
                                {imputado.map(imputadoItem =>(
                                    <option key={imputadoItem.nombre} value={imputadoItem.nombre}>
                                        {imputadoItem.nombre}
                                    </option>))}
                            </select>
                            <button className={`${styles.formButton} ${styles.removeButton}`} type="button" onClick={() => removeInput(setDefensa, index, setRemovedDefensa, defensa)}>QUITAR</button>
                            <button className={`${styles.formButton} ${styles.presenteButton}`} type="button" onClick={() => handleInputChange(setDefensa, index, 'asistencia', (!input.asistencia))}>{input.asistencia ? 'P' : 'A'}</button>
                        </div>
                    ))}
                    <button className={styles.formButton} type="button" onClick={() => addNewInput(setDefensa, { tipo: '', nombre: '', imputado: '', asistencia: true })}>+ DEFENSA</button></span>
                    <span className={`${styles.inputLeftColumn}`}><label className={`${styles.inputLeftNameDColumn}`}>Otras Partes</label>
                    {partes.map((input, index) => (
                        <div key={input.id}>
                            <select value={input.role} onChange={(e) => handleInputChange(setPartes, index, 'role', e.target.value)}>
                            <option value=""></option>
                            {desplegables.tiposPartes && desplegables.tiposPartes.map(tipoParte =>(
                                    <option key={tipoParte} value={tipoParte}>{tipoParte}</option>))}
                            </select>
                            <input type="text" value={input.name} onChange={(e) => handleInputChange(setPartes, index, 'name', e.target.value)} placeholder="Name"/>
                            <button className={`${styles.formButton} ${styles.removeButton}`} type="button" onClick={() => removeInput(setPartes, index, setRemovedPartes, partes)}>QUITAR</button>
                        </div>
                    ))}
                    <button className={styles.formButton} type="button" onClick={() => addNewInput(setPartes, { role: '', name: '' })}>+ PARTE</button></span>
        </div>
    );
}