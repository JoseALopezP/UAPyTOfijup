'use client'
import { useContext, useEffect, useState, useCallback, useRef } from 'react';
import { Reconversion } from './Reconversion';
import styles from '../RegistroAudiencia.module.css';
import RegistroChangeState from './RegistroChangeState';
import { DataContext } from '@/context New/DataContext';
import DeleteSVGF from './DeleteSVGF';
import { checkForResuelvo } from '@/utils/resuelvoUtils';
import deepEqual from '@/utils/deepEqual';
import Cronometro from './Cronometro';
import EditHitos from './EditHitos';
import { nameTranslate } from '@/utils/traductorNombres';
import { RepresentationSelector } from './RepresentationSelector';

const deepCopy = (obj) => {
    if (obj === null || typeof obj !== 'object') return obj;
    return JSON.parse(JSON.stringify(obj));
};

export default function RegistroAudienciaLeft({ setNeedsSaving1, item, dateToUse, operadorAud, setOperadorAud, isHovered, sala, setSala, saeNum, setSaeNum, caratula, setCaratula, razonDemora, setRazonDemora, mpf, setMpf, ufi, setUfi, estado, setEstado, defensa, setDefensa, imputado, setImputado, tipo, setTipo, tipo2, setTipo2, tipo3, setTipo3, partes, setPartes }) {
    const {updateDesplegables, desplegables, updateRealTime, realTime, updateData, updateByDate} = useContext(DataContext)
    const [caratula2, setCaratula2] = useState('');
    const [saeNum2, setSaeNum2] = useState('');
    const [mpf2, setMpf2] = useState([]);
    const [defensa2, setDefensa2] = useState([]);
    const [imputado2, setImputado2] = useState([]);
    const [showReconversion, setShowReconversion] = useState(false);
    const [partes2, setPartes2] = useState([]);
    const [razonDemora2, setRazonDemora2] = useState('');
    const [ufi2, setUfi2] = useState('');
    const [tipoAux, setTipoAux] = useState('');
    const [tipo2Aux, setTipo2Aux] = useState('');
    const [tipo3Aux, setTipo3Aux] = useState('');
    const [guardarInc, setGuardarInc] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [removedMpf, setRemovedMpf] = useState([]);
    const [removedDefensa, setRemovedDefensa] = useState([]);
    const [removedImputado, setRemovedImputado] = useState([]);
    const [removedPartes, setRemovedPartes] = useState([]);
    const [showEditHitos, setShowEditHitos] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const mpfCounter = useRef(0);
    const defensaCounter = useRef(0);
    const imputadoCounter = useRef(0);
    const partesCounter = useRef(0);

    const checkUFI = () =>{
        if((ufi == '' || ufi == null) && mpf && mpf[0] && typeof mpf[0] === 'object' && mpf[0].nombre && mpf[0].nombre.includes(' - ')){
            setUfi(mpf[0].nombre.split(' - ')[1])
        }
    }
    const updateImputado = (id, newData) => {
        setImputado(prev =>
            prev.map(p => (p.id === id ? { ...p, ...newData } : p))
        );
        setDefensa(prev =>
            prev.map(def => ({
            ...def,
            imputado: Array.isArray(def.imputado)
                ? def.imputado.map(v =>
                    v.id === id ? { ...v, ...newData } : v
                )
                : def.imputado,
            condenado: Array.isArray(def.condenado)
                ? def.condenado.map(v =>
                    v.id === id ? { ...v, ...newData } : v
                )
                : def.condenado,
        }))
    )};

    const handleInputChange = (setter, index, key, valueObj, toggleArray = false) => {
    setter(prev => {
    const updated = [...prev];
    const current = updated[index] || {};

    if (toggleArray) {
      const arr = Array.isArray(current[key]) ? [...current[key]] : [];
      const exists = arr.some(item => item.id === valueObj.id);
      updated[index] = {
        ...current,
        [key]: exists
          ? arr.filter(item => item.id !== valueObj.id)
          : [...arr, valueObj]
      };
    } else {
      updated[index] = { ...current, [key]: valueObj };
    }
    return updated
    })};

    const addNewInput = (setter, template, prefix, counter) => {
    setter(prev => {
        counter.current += 1;
        const nextId = `${prefix}${counter.current}`;
        return [...prev, { ...template, id: nextId }];
    })};
    const removeImputado = (id) => {
    setImputado(prev => prev.filter(p => p.id !== id));

    setDefensa(prev =>
        prev.map(def => ({
        ...def,
        imputado: Array.isArray(def.imputado)
            ? def.imputado.filter(v => v !== id)
            : def.imputado,
        condenado: Array.isArray(def.condenado)
            ? def.condenado.filter(v => v !== id)
            : def.condenado
        }))
    )};
    const removeInput = (setter, index, removedSetter, items) => {
        setter(prev => prev.filter((_, i) => i !== index));
        removedSetter(prev => [...prev, items[index]]);
    };
    const updateComparisson = () => {
        const initialMpf = item.mpf ? deepCopy(item.mpf) : [];
        setMpf(initialMpf);
        setMpf2(deepCopy(initialMpf));

        const initialImputado = item.imputado ? deepCopy(item.imputado) : [];
        setImputado(initialImputado);
        setImputado2(deepCopy(initialImputado));

        const initialDefensa = item.defensa ? deepCopy(item.defensa) : [];
        setDefensa(initialDefensa);
        setDefensa2(deepCopy(initialDefensa));

        const initialPartes = item.partes ? deepCopy(item.partes) : [];
        setPartes(initialPartes);
        setPartes2(deepCopy(initialPartes));

        setCaratula(item.caratula || '');
        setCaratula2(item.caratula || '');
        setSaeNum(item.saeNum || '');
        setSaeNum2(item.saeNum || '');
        setRazonDemora(item.razonDemora || '');
        setRazonDemora2(item.razonDemora || '');
        setUfi(item.ufi || '');
        setUfi2(item.ufi || '');
        setEstado(item.estado || '');
        setTipo(item.tipo || '');
        setTipoAux(item.tipo || '');
        setTipo2(item.tipo2 || '');
        setTipo2Aux(item.tipo2 || '');
        setTipo3(item.tipo3 || '');
        setTipo3Aux(item.tipo3 || '');
        setOperadorAud(item.operador || '')
        setIsInitialized(true);
    };
    
    const updateDataAud = async() =>{
        setGuardando(true)
        const handleRemove = async (itemList, removedList, field) => {
            for (const item of removedList) {
                if (itemList.includes(item)) {
                    await updateData(dateToUse, item.id, field, itemList.filter(i => i !== item));
                }
        }}
        await handleRemove(mpf, removedMpf, 'mpf');
        await handleRemove(defensa, removedDefensa, 'defensa');
        await handleRemove(imputado, removedImputado, 'imputado');
        await handleRemove(partes, removedPartes, 'partes');
        setRemovedMpf([]);
        setRemovedDefensa([]);
        setRemovedImputado([]);
        setRemovedPartes([]);
        if (!deepEqual(caratula2, caratula)){
            await updateData(dateToUse, item.id, 'caratula', caratula);
            setCaratula2(caratula)}
        if (!deepEqual(mpf2, mpf)){
            await updateData(dateToUse, item.id, 'mpf', mpf);
            setMpf2(mpf)} 
        if (!deepEqual(defensa2, defensa)){
            await updateData(dateToUse, item.id, 'defensa', defensa);
            setDefensa2(defensa)}
        if (!deepEqual(imputado2, imputado)){
            await updateData(dateToUse, item.id, 'imputado', imputado);
            setImputado2(imputado)}
        if (!deepEqual(partes2, partes)){
            await updateData(dateToUse, item.id, 'partes', partes);
            setPartes2(partes)}
        if (!deepEqual(razonDemora2, razonDemora)){
            await updateData(dateToUse, item.id, 'razonDemora', razonDemora);
            setRazonDemora2(razonDemora)}
        if (!deepEqual(ufi2, ufi)){
            await updateData(dateToUse, item.id, 'ufi', ufi);
            setUfi2(ufi)}
        if (!deepEqual(saeNum2, saeNum)){
            await updateData(dateToUse, item.id, 'saeNum', saeNum);
            setSaeNum2(saeNum)
        }
        if(showReconversion){
        if (!deepEqual(tipo, tipoAux)){
            if(!deepEqual(tipo2, tipo2Aux)){
                if(!deepEqual(tipo3, tipo3Aux)){
                    await updateData(dateToUse, item.id, 'tipo', tipo);
                    await updateData(dateToUse, item.id, 'tipo2', tipo2);
                    await updateData(dateToUse, item.id, 'tipo3', tipo3);
                }else{
                    await updateData(dateToUse, item.id, 'tipo', tipo);
                    await updateData(dateToUse, item.id, 'tipo2', tipo2);
                    await updateData(dateToUse, item.id, 'tipo3', '');
                }
            }else{
                await updateData(dateToUse, item.id, 'tipo', tipo);
                await updateData(dateToUse, item.id, 'tipo2', '');
                await updateData(dateToUse, item.id, 'tipo3', '');
            }
            await updateData(dateToUse, item.id, 'reconvertida', `${tipoAux} + ${tipo2Aux} + ${tipo3Aux}`);
            setTipoAux(tipo)
            setTipo2Aux(tipo2)
            setTipo3Aux(tipo3)
        }
        }
        if (await checkForResuelvo(item)){
            await updateRealTime();
            await updateData(dateToUse, item.id, 'horaResuelvo', realTime);
        }
        await setGuardarInc(false)
        await setGuardando(false)
        await updateByDate(dateToUse)
    }
    const handleSubmit = async (event) => {
        if(event) event.preventDefault();
        updateDataAud()
    };
    const handleReconversion = () =>{   
        setShowReconversion(!showReconversion)
        setTipo(tipoAux)
        setTipo2(tipo2Aux)
        setTipo3(tipo3Aux)
    }
    const checkGuardar = useCallback(() => {
        const normalize = (val) => (val === null || val === undefined ? '' : val);

        const hasChanges = 
            normalize(caratula2) !== normalize(caratula) ||
            normalize(saeNum2) !== normalize(saeNum) ||
            normalize(razonDemora2) !== normalize(razonDemora) ||
            normalize(ufi2) !== normalize(ufi) ||
            (showReconversion && (
                normalize(tipoAux) !== normalize(tipo) ||
                normalize(tipo2Aux) !== normalize(tipo2) ||
                normalize(tipo3Aux) !== normalize(tipo3)
            )) ||
            !deepEqual(mpf2, mpf) ||
            !deepEqual(defensa2, defensa) ||
            !deepEqual(imputado2, imputado) ||
            !deepEqual(partes2, partes);
    
        setGuardarInc(hasChanges);
        setNeedsSaving1(hasChanges);
    }, [caratula, caratula2, mpf, mpf2, razonDemora, razonDemora2, defensa, defensa2, imputado, imputado2, partes, partes2, ufi, ufi2, tipo, tipo2, tipo3, tipoAux, tipo2Aux, tipo3Aux, showReconversion, saeNum, saeNum2]);
    const operadorChange = (valueAux) =>{
        updateData(dateToUse, item.id, 'operador', valueAux)
        setOperadorAud(valueAux)
    }
    const checkHoraDiff = () => {
        const hora1 = parseInt(item.hora.split(':')[0]) * 60 + parseInt(item.hora.split(':')[1]);
        const hora2 = parseInt(item.hitos[0].split('|')[0].split(':')[0]) * 60 + parseInt(item.hitos[0].split('|')[0].split(':')[1]);
        return hora2 - hora1;
    };
    useEffect(() => {
        checkUFI()
    }, [mpf])
    useEffect(() => {
    if (isInitialized) {
        checkGuardar();
    }
    }, [caratula, mpf, defensa, imputado, partes, razonDemora, ufi, checkGuardar, tipo, tipo2, tipo3, isInitialized]);
    useEffect(() => {
        updateComparisson();
        setShowReconversion(false)
    }, [item]);
    useEffect(() => {
        setSala(item.sala);
        setShowEditHitos(false)
    }, [item]);
    useEffect(() => {
        updateDesplegables()
    }, [])
    return (
        <form className={`${styles.controlBlockLeft}`} onSubmit={(event) => handleSubmit(event)}>
            
            {guardarInc && <button className={guardando ? `${styles.inputLeft} ${styles.guardarButton} ${styles.guardandoButton}` : `${styles.inputLeft} ${styles.guardarButton}`} type="submit" id='submit-btn' value="GUARDAR">
                <span className={`${styles.sinGuardar}`}>CAMBIOS SIN GUARDAR</span>
                <span className={`${styles.guardar}`}>GUARDAR</span>
                <span className={`${styles.guardando}`}>GUARDANDO...</span>
            </button>}
            {item.hitos &&
                <span title='Editar Hitos' onClick={() => setShowEditHitos(!showEditHitos)} className={isHovered ? `${styles.editHitosButtonBlock} ${styles.editHitosButtonBlockHovered}` : `${styles.editHitosButtonBlock}`}><svg className={`${styles.editHitosButtonSVG}`} viewBox="0 0 24 24">
                <path stroke='#ffc107' fill='none' d="M12 7V12L14.5 10.5M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"  stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg></span>
            }
            {showEditHitos && <EditHitos hitos={item.hitos} isHovered={isHovered} item={item} dateToUse={dateToUse}/>}
            <h2 className={`${styles.audControlTitle}`}>{item.numeroLeg} - {item.hora}</h2>
            <RegistroChangeState estadoFunction={setEstado} estado={estado} audId={item.id} dateToUse={dateToUse} aId={(item.aId || false)}/>
            <span className={`${styles.inputLeftRow}`}><label className={`${styles.inputLeftNameDRow}`}>SALA: </label>
                <input list='sala' className={`${styles.inputLeft} ${styles.inputLeft30} ${styles.inputLeftDRow}`} value={sala} onChange={e => setSala(e.target.value)}/>
                <datalist id='sala' className={`${styles.tableCellInput} ${styles.inputLeft35}`}><option>{sala}</option>
                {desplegables.salas && desplegables.salas.map(el =>(
                    <option key={el} value={el}>SALA {el}</option>
                ))}</datalist>
                    <select value={nameTranslate(operadorAud)} className={`${styles.inputLeft} ${styles.inputLeft35} ${styles.selectOperador}`}
                        onChange={e => operadorChange(e.target.value)}>
                        <><option key={operadorAud+"selected"} value={operadorAud} selected>{nameTranslate(operadorAud)}</option></>
                        {desplegables.operador && desplegables.operador.map(el =>(
                            <><option key={el} value={el} selected>{nameTranslate(el)}</option></>
                        ))}
                    </select>
                </span>
            {item.tipo === "TRÁMITES DE EJECUCIÓN" &&
                <><span className={`${styles.inputLeftColumn}`}><label className={`${styles.inputLeftNameDColumn}`}>SAE:</label>
                <input className={`${styles.inputTyped100} ${styles.inputLeft}`} value={saeNum} onChange={(e) => setSaeNum(e.target.value)}/></span></>}
            <span className={`${styles.inputLeftColumn}`}><label className={`${styles.inputLeftNameDColumn}`}>Carátula</label>
                <input className={`${styles.inputLeft} ${styles.inputLeft100} ${styles.inputTyped100}`}
                    type="text" value={caratula} onChange={(e) => setCaratula(e.target.value)}/></span>
            <button className={showReconversion ? `${styles.inputLeft} ${styles.inputLeft100} ${styles.reconvertidaButtonClicked}` : `${styles.inputLeft} ${styles.inputLeft100} ${styles.reconvertidaButton}`} type="button" onClick={() => handleReconversion()}>{showReconversion ? 'RECONVERTIDA' : 'TIPO ORIGINAL'}</button>
            {showReconversion ? <Reconversion item={item} setTipo={setTipo} setTipo2={setTipo2} setTipo3={setTipo3} tipo={tipo} tipo2={tipo2} tipoAux={tipoAux} tipo2Aux={tipo2Aux}/> : ''}
            <span className={`${styles.inputLeftColumn}`}><label className={`${styles.inputLeftNameDColumn}`}>Ministerio Público Fiscal</label>
            {mpf.map((input, index) => (
                <div key={input.id} className={`${styles.inputRow}`}>
                    <input
                        list='mpf'
                        className={`${styles.inputLeft} ${styles.inputTyped70}`}
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
                    <button className={`${styles.inputLeft} ${styles.inputLeft10}`} title={input.asistencia ?  'Presente' : 'Ausente'} type="button" onClick={() => handleInputChange(setMpf, index, 'asistencia', (!input.asistencia))}>
                        {input.asistencia ?  'PRE' : 'AUS'}
                    </button>
                    <button className={`${styles.inputLeft} ${styles.inputLeft10}`} title={input.presencial ?  'fisicamente' : 'Virtual'} type="button" onClick={() => handleInputChange(setMpf, index, 'presencial', (!input.presencial))}>
                        {input.presencial ?  'FIS' : 'VIR'}
                    </button>
                    <button className={`${styles.inputLeft} ${styles.inputLeft15} ${styles.inputLeftDelete}`} type="button" onClick={() => removeInput(setMpf, index, setRemovedMpf, mpf)}><DeleteSVGF/></button>
                </div>
            ))}
            <button className={`${styles.inputLeft} ${styles.inputLeft100}`} type="button" onClick={() => addNewInput(setMpf, { nombre: '', representa: [], asistencia: true, presencial: true }, 'f', mpfCounter)}>+ FISCAL</button></span>
            <span className={`${styles.inputLeftRow}`}><label className={`${styles.inputLeftNameDRow}`}>UFI:</label>
                <input list='ufi' className={`${styles.inputLeftDRow} ${styles.inputLeft} ${styles.inputTyped50}`} value={ufi}
                    onChange={(e) => setUfi(e.target.value)}/>
                <datalist id='ufi'>{desplegables.fiscal && desplegables.ufi.map(option => (
                        <option key={option} value={option}>{option}</option>
                    ))}</datalist></span>
            <span className={`${styles.inputLeftColumn}`}><label className={`${styles.inputLeftNameDColumn}`}>Imputados</label>
                {imputado.map((input, realIndex) => input.condenado ? null : (
                    <><div key={input.id} className={`${styles.imputadoInput} ${styles.inputRow}`}>
                        <input className={`${styles.inputLeft} ${styles.inputTyped35}`}
                            type="text"
                            value={input.nombre}
                            onChange={(e) => updateImputado(input.id, { nombre: e.target.value })}
                            placeholder="Nombre"/>
                        <input className={`${styles.inputLeft} ${styles.inputTyped35}`}
                            type="text"
                            value={input.dni}
                            onChange={(e) => updateImputado(input.id, { dni: e.target.value })}
                            placeholder="DNI"/>
                        <button className={`${styles.inputLeft} ${styles.inputLeft10}`} title={input.asistencia ?  'Presente' : 'Ausente'} type="button" onClick={() => handleInputChange(setImputado, realIndex, 'asistencia', (!input.asistencia))}>{input.asistencia ? 'PRE' : 'AUS'}</button>
                        <button className={`${styles.inputLeft} ${styles.inputLeft10}`} title={input.presencial ?  'fisicamente' : 'Virtual'} type="button" onClick={() => handleInputChange(setImputado, realIndex, 'presencial', (!input.presencial))}>
                            {input.presencial ?  'FIS' : 'VIR'}
                        </button>
                        <button className={`${styles.inputLeft} ${styles.inputLeftDelete}`} type="button" onClick={() => removeImputado(input.id)}><DeleteSVGF/></button>
                    </div>
                        {(item.tipo === "CONTROL DE DETENCIÓN" || item.tipo2 === "CONTROL DE DETENCIÓN" || item.tipo3 === "CONTROL DE DETENCIÓN") &&
                        <input className={`${styles.inputLeft} ${styles.inputTyped100}`}
                        type="text"
                        value={input.detenido}
                        onChange={(e) => handleInputChange(setImputado, realIndex, 'detenido', e.target.value)}
                        placeholder="detenido en... 00/00/00"/>}
                        </>
                ))}
                <span className={styles.imputadoButtons}>
                    <button className={`${styles.inputLeft} ${styles.inputLeft100}`} type="button"
                    onClick={() => addNewInput(setImputado, { nombre: '', dni: '', condenado: false, asistencia: true, detenido: '', presencial: true, }, 'i', imputadoCounter)}
                        >+ IMPUTADO</button>
                </span></span>
                <span className={`${styles.inputLeftColumn}`}><label className={`${styles.inputLeftNameDColumn}`}>Condenados</label></span>
                {imputado.map((input, realIndex) => !input.condenado ? null : (
                    <><div key={input.id} className={`${styles.condenadoInput} ${styles.inputRow}`}>
                        <input className={`${styles.inputLeft} ${styles.inputTyped35}`}
                            type="text"
                            value={input.nombre}
                            onChange={(e) => handleInputChange(setImputado, realIndex, 'nombre', e.target.value)}
                            placeholder="Nombre"/>
                        <input className={`${styles.inputLeft} ${styles.inputTyped35}`}
                            type="text"
                            value={input.dni}
                            onChange={(e) => handleInputChange(setImputado, realIndex, 'dni', e.target.value)}
                            placeholder="DNI"/>
                        <button className={`${styles.inputLeft} ${styles.inputLeft10}`} title={input.asistencia ?  'Presente' : 'Ausente'} type="button" onClick={() => handleInputChange(setImputado, realIndex, 'asistencia', (!input.asistencia))}>{input.asistencia ? 'PRE' : 'AUS'}</button>
                        <button className={`${styles.inputLeft} ${styles.inputLeft10}`} title={input.presencial ?  'fisicamente' : 'Virtual'} type="button" onClick={() => handleInputChange(setImputado, realIndex, 'presencial', (!input.presencial))}>
                            {input.presencial ?  'FIS' : 'VIR'}
                        </button>
                        <button className={`${styles.inputLeft} ${styles.inputLeftDelete}`} type="button" onClick={() => removeImputado(input.id)}><DeleteSVGF/></button>
                    </div>
                        {(item.tipo === "CONTROL DE DETENCIÓN" || item.tipo2 === "CONTROL DE DETENCIÓN" || item.tipo3 === "CONTROL DE DETENCIÓN") &&
                        <input className={`${styles.inputLeft} ${styles.inputTyped100}`}
                        type="text"
                        value={input.detenido}
                        onChange={(e) => handleInputChange(setImputado, realIndex, 'detenido', e.target.value)}
                        placeholder="detenido en... 00/00/00"/>}
                        </>
                ))}
                <button className={`${styles.inputLeft} ${styles.inputLeft100}`} type="button"
                onClick={() => addNewInput(setImputado, { nombre: '', dni: '', condenado: true, asistencia: true, detenido: '', presencial: true, }, 'i', imputadoCounter)}
                    >+ CONDENADO</button>
                <span className={`${styles.inputLeftColumn}`}><label className={`${styles.inputLeftNameDColumn}`}>Defensa</label>
                    {defensa.map((input, index) => (
                        <div key={input.id} className={`${styles.inputRow}`}>
                            <select className={`${styles.inputLeft} ${styles.inputTyped50} ${styles.dropDownSelect}`}
                                value={input.tipo}
                                onChange={(e) => handleInputChange(setDefensa, index, 'tipo', e.target.value)}>
                                <option value=""></option>
                                <option value="Oficial">Oficial</option>
                                <option value="Particular">Particular</option>
                            </select>
                            {input.tipo && (input.tipo === 'Oficial' ? (
                                    <><input list='oficial'
                                        className={`${styles.inputLeft} ${styles.inputTyped50}`}
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
                                        className={`${styles.inputLeft} ${styles.inputTyped50}`}
                                        value={input.nombre}
                                        onChange={(e) => handleInputChange(setDefensa, index, 'nombre', e.target.value)}
                                        placeholder="Nombre"/>
                                    <datalist id='particular'>
                                        {desplegables.defensaParticular && desplegables.defensaParticular.map(option => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </datalist>
                                    </>
                                )
                            )}
                            <RepresentationSelector 
                                selectedItems={defensa[index].imputado} 
                                availableItems={Array.isArray(imputado) ? imputado : []}
                                onUpdate={(newItems) => handleInputChange(setDefensa, index, "imputado", newItems)}
                            />
                            <button className={`${styles.inputLeft} ${styles.inputLeft40}`} title={input.presencial ?  'Presente' : 'Ausente'} type="button" onClick={() => handleInputChange(setDefensa, index, 'asistencia', (!input.asistencia))}>{input.asistencia ? 'PRESENTE' : 'AUSENTE'}</button>
                            <button className={`${styles.inputLeft} ${styles.inputLeft40}`} title={input.presencial ?  'fisicamente' : 'Virtual'} type="button" onClick={() => handleInputChange(setDefensa, index, 'presencial', (!input.presencial))}>
                                {input.presencial ?  'FISICAMENTE' : 'VIRTUALMENTE'}
                            </button>
                            <button className={`${styles.inputLeft} ${styles.inputLeftDelete}`} type="button" onClick={() => removeInput(setDefensa, index, setRemovedDefensa, defensa)}><DeleteSVGF/></button>
                        </div>
                    ))}
                    <button className={`${styles.inputLeft} ${styles.inputLeft100}`} type="button" onClick={() => addNewInput(setDefensa, { tipo: '', nombre: '', imputado: '', asistencia: true, presencial: true }, 'd', defensaCounter)}>+ DEFENSA</button></span>
                    <span className={`${styles.inputLeftColumn}`}><label className={`${styles.inputLeftNameDColumn}`}>Otras Partes</label>
                    {partes.map((input, index) => (
                        <div key={input.id}>
                            <input list='partesVarias'
                                className={`${styles.inputLeft} ${styles.inputLeft50}  ${styles.inputLeftSelect}`}
                                value={input.role}
                                onChange={(e) => handleInputChange(setPartes, index, 'role', e.target.value)}
                                placeholder="tipo"/>
                            <datalist id='partesVarias'>
                                {desplegables.tiposPartes && desplegables.tiposPartes.map(tipoParte =>(
                                <option key={tipoParte} value={tipoParte}>{tipoParte}</option>))}
                            </datalist>
                            <input className={`${styles.inputLeft} ${styles.inputLeft50}`} type="text" value={input.name} onChange={(e) => handleInputChange(setPartes, index, 'name', e.target.value)} placeholder="nombre"/>
                            <input className={`${styles.inputLeft} ${styles.inputLeft50}`} type="text" value={input.dni} onChange={(e) => handleInputChange(setPartes, index, 'dni', e.target.value)} placeholder="dni"/>
                                <RepresentationSelector 
                                    selectedItems={partes[index].representa} 
                                    availableItems={[...(Array.isArray(imputado) ? imputado : []), ...(Array.isArray(partes) ? partes.filter(p => p.role === 'Denunciante') : [])]}
                                    onUpdate={(newItems) => handleInputChange(setPartes, index, "representa", newItems)}
                                />
                            <button className={`${styles.inputLeft} ${styles.inputLeft20}`} title={input.presencial ?  'Presente' : 'Ausente'} type="button" onClick={() => handleInputChange(setPartes, index, 'asistencia', (!input.asistencia))}>{input.asistencia ? 'PRE' : 'AUS'}</button>
                            <button className={`${styles.inputLeft} ${styles.inputLeft20}`} title={input.presencial ?  'fisicamente' : 'Virtual'} type="button" onClick={() => handleInputChange(setPartes, index, 'presencial', (!input.presencial))}>
                                {input.presencial ?  'FIS' : 'VIR'}
                            </button>
                            <button className={`${styles.inputLeft} ${styles.inputLeft15} ${styles.inputLeftDelete}`} type="button" onClick={() => removeInput(setPartes, index, setRemovedPartes, partes)}><DeleteSVGF/></button>
                        </div>
                    ))}
                    <button className={`${styles.inputLeft} ${styles.inputLeft100}`} type="button" onClick={() => addNewInput(setPartes, { role: '', name: '', representa: [], asistencia: true, presencial: true }, 'p', partesCounter)}>+ PARTE</button></span>
            {(item.hora && item.hitos && checkHoraDiff() > 5) &&
                <>
                    <span className={`${styles.inputLeftColumn}`}><label className={`${styles.inputLeftNameDColumn}`}>MOTIVO DEMORA ({checkHoraDiff()}min)</label>
                    <select className={`${styles.inputLeft} ${styles.inputLeft100}  ${styles.inputLeftSelect}`} onChange={(e) => setRazonDemora(e.target.value)}>
                        <option value={razonDemora}>{razonDemora}</option>
                        {desplegables.motivoDemora && desplegables.motivoDemora.map(el => <option key={el} value={el}>{el}</option>)}
                    </select></span>
                </>
            }
            <span className={`${styles.inputLeftColumn} ${styles.footerSpace}`}></span>
            <Cronometro item={item} dateToUse={dateToUse} isHovered={isHovered}/>
        </form>
    );
}