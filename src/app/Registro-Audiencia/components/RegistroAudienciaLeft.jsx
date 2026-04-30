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
import updateRealTimeFunction from '@/firebase new/firestore/updateRealTimeFunction';

const deepCopy = (obj) => {
    if (obj === null || typeof obj !== 'object') return obj;
    return JSON.parse(JSON.stringify(obj));
};

export default function RegistroAudienciaLeft({ setNeedsSaving1, item, dateToUse, operadorAud, setOperadorAud, isHovered, sala, setSala, saeNum, setSaeNum, caratula, setCaratula, razonDemora, setRazonDemora, mpf, setMpf, ufi, setUfi, defensoria, setDefensoria, estado, setEstado, defensa, setDefensa, imputado, setImputado, tipo, setTipo, tipo2, setTipo2, tipo3, setTipo3, partes, setPartes, minuta, setMinuta, cierre, setCierre, refreshAud }) {
    const { updateDesplegables, desplegables, updateData, updateByDate, fiscalesList, defensoresOficialesList, defensoresParticularesList, abogados } = useContext(DataContext)
    const [caratula2, setCaratula2] = useState('');
    const [saeNum2, setSaeNum2] = useState('');
    const [mpf2, setMpf2] = useState([]);
    const [defensa2, setDefensa2] = useState([]);
    const [imputado2, setImputado2] = useState([]);
    const [showReconversion, setShowReconversion] = useState(false);
    const [partes2, setPartes2] = useState([]);
    const [razonDemora2, setRazonDemora2] = useState('');
    const [ufi2, setUfi2] = useState('');
    const [defensoria2, setDefensoria2] = useState('');
    const [tipoAux, setTipoAux] = useState('');
    const [tipo2Aux, setTipo2Aux] = useState('');
    const [tipo3Aux, setTipo3Aux] = useState('');
    const [guardarInc, setGuardarInc] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [showEditHitos, setShowEditHitos] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [sectionsVisible, setSectionsVisible] = useState({
        mpf: true,
        imputados: true,
        defensa: true,
        partes: false
    });

    const generateId = (prefix) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

    const checkUFI = () => {
        if ((ufi == '' || ufi == null) && mpf && mpf[0] && typeof mpf[0] === 'object' && mpf[0].nombre) {
            const abog = abogados.find(a => a.n === mpf[0].nombre);
            if (abog && abog.l) {
                setUfi(abog.l);
            } else if (mpf[0].nombre.includes(' - ')) {
                setUfi(mpf[0].nombre.split(' - ')[1]);
            }
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
        )
    };

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

                // Auto-poblar defensoria y matricula si se selecciona un nombre y es Oficial
                if (key === 'nombre' && setter === setDefensa && current.tipo === 'Oficial') {
                    const abog = abogados.find(a => a.n === valueObj);
                    if (abog) {
                        if (abog.l && (!current.defensoria || current.defensoria === '')) updated[index].defensoria = abog.l;
                        if (abog.m && (!current.matricula || current.matricula === '')) updated[index].matricula = abog.m;
                    }
                }
            }
            return updated
        })
    };

    const addNewInput = (setter, template, prefix) => {
        setter(prev => [...prev, { ...template, id: generateId(prefix) }]);
    };
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
        );
    };
    const removeInput = (setter, index) => {
        setter(prev => prev.filter((_, i) => i !== index));
    };
    const updateComparisson = () => {
        setMpf2(item.mpf ? deepCopy(item.mpf) : []);
        setImputado2(item.imputado ? deepCopy(item.imputado) : []);
        setDefensa2(item.defensa ? deepCopy(item.defensa) : []);
        setPartes2(item.partes ? deepCopy(item.partes) : []);
        setCaratula2(item.caratula || '');
        setSaeNum2(item.saeNum || '');
        setRazonDemora2(item.razonDemora || '');
        setUfi2(item.ufi || '');
        setDefensoria2(item.defensoria || '');
        setTipoAux(item.tipo || '');
        setTipo2Aux(item.tipo2 || '');
        setTipo3Aux(item.tipo3 || '');
        setIsInitialized(true);
    };

    const updateDataAud = async () => {
        setGuardando(true);
        let retries = 3;
        let success = false;

        while (retries > 0 && !success) {
            try {
                if (!deepEqual(caratula2, caratula)) await updateData(dateToUse, item.id, 'caratula', caratula);
                if (!deepEqual(mpf2, mpf)) await updateData(dateToUse, item.id, 'mpf', mpf);
                if (!deepEqual(defensa2, defensa)) await updateData(dateToUse, item.id, 'defensa', defensa);
                if (!deepEqual(imputado2, imputado)) await updateData(dateToUse, item.id, 'imputado', imputado);
                if (!deepEqual(partes2, partes)) await updateData(dateToUse, item.id, 'partes', partes);
                if (!deepEqual(razonDemora2, razonDemora)) await updateData(dateToUse, item.id, 'razonDemora', razonDemora);
                if (!deepEqual(ufi2, ufi)) await updateData(dateToUse, item.id, 'ufi', ufi);
                if (!deepEqual(defensoria2, defensoria)) await updateData(dateToUse, item.id, 'defensoria', defensoria);
                if (!deepEqual(saeNum2, saeNum)) await updateData(dateToUse, item.id, 'saeNum', saeNum);

                if (showReconversion) {
                    if (!deepEqual(tipo, tipoAux)) {
                        if (!deepEqual(tipo2, tipo2Aux)) {
                            if (!deepEqual(tipo3, tipo3Aux)) {
                                await updateData(dateToUse, item.id, 'tipo', tipo);
                                await updateData(dateToUse, item.id, 'tipo2', tipo2);
                                await updateData(dateToUse, item.id, 'tipo3', tipo3);
                            } else {
                                await updateData(dateToUse, item.id, 'tipo', tipo);
                                await updateData(dateToUse, item.id, 'tipo2', tipo2);
                                await updateData(dateToUse, item.id, 'tipo3', '');
                            }
                        } else {
                            await updateData(dateToUse, item.id, 'tipo', tipo);
                            await updateData(dateToUse, item.id, 'tipo2', '');
                            await updateData(dateToUse, item.id, 'tipo3', '');
                        }
                        await updateData(dateToUse, item.id, 'reconvertida', `${tipoAux} + ${tipo2Aux} + ${tipo3Aux}`);
                    }
                }
                if (await checkForResuelvo(item)) {
                    const currentTime = updateRealTimeFunction();
                    await updateData(dateToUse, item.id, 'horaResuelvo', currentTime);
                }

                await updateByDate(dateToUse);

                setCaratula2(caratula);
                setMpf2(mpf);
                setDefensa2(defensa);
                setImputado2(imputado);
                setPartes2(partes);
                setRazonDemora2(razonDemora);
                setUfi2(ufi);
                setDefensoria2(defensoria);
                setSaeNum2(saeNum);
                if (showReconversion) {
                    setTipoAux(tipo);
                    setTipo2Aux(tipo2);
                    setTipo3Aux(tipo3);
                }
                setGuardarInc(false);
                setNeedsSaving1(false);
                if (refreshAud) await refreshAud();
                success = true; // Succeeded!
            } catch (error) {
                console.error(`Error en updateDataAud. Retries left: ${retries - 1}`, error);
                retries -= 1;
                if (retries > 0) {
                    await new Promise(resolve => setTimeout(resolve, 1500)); // wait 1.5s
                } else {
                    alert("No se pudieron guardar los cambios de la izquierda después de varios intentos. Reintente por favor.");
                }
            }
        }
        setGuardando(false);
    };
    const handleSubmit = async (event) => {
        if (event) event.preventDefault();
        updateDataAud()
    };
    const handleReconversion = () => {
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
            normalize(defensoria2) !== normalize(defensoria) ||
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
    }, [caratula, caratula2, mpf, mpf2, razonDemora, razonDemora2, defensa, defensa2, imputado, imputado2, partes, partes2, ufi, ufi2, defensoria, defensoria2, tipo, tipo2, tipo3, tipoAux, tipo2Aux, tipo3Aux, showReconversion, saeNum, saeNum2]);
    const operadorChange = (valueAux) => {
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
    const toggleSection = (section) => {
        setSectionsVisible(prev => ({ ...prev, [section]: !prev[section] }));
    };

    useEffect(() => {
        if (isInitialized) {
            checkGuardar();
        }
    }, [caratula, saeNum, mpf, defensa, imputado, partes, razonDemora, ufi, checkGuardar, tipo, tipo2, tipo3, isInitialized]);
    useEffect(() => {
        updateComparisson();
        setShowReconversion(false)
    }, [item]);
    useEffect(() => {
        setSala(item.sala);
        setShowEditHitos(false)
    }, [item]);

    return (
        <form className={`${styles.controlBlockLeft}`} onSubmit={(event) => handleSubmit(event)}>

            {item.hitos &&
                <span title='Editar Hitos' onClick={() => setShowEditHitos(!showEditHitos)} className={isHovered ? `${styles.editHitosButtonBlock} ${styles.editHitosButtonBlockHovered}` : `${styles.editHitosButtonBlock}`}><svg className={`${styles.editHitosButtonSVG}`} viewBox="0 0 24 24">
                    <path stroke='#ffc107' fill='none' d="M12 7V12L14.5 10.5M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg></span>
            }
            {showEditHitos && <EditHitos hitos={item.hitos} isHovered={isHovered} item={item} dateToUse={dateToUse} />}
            <div className={styles.headerLeftConBoton}>
                <h2 className={`${styles.audControlTitle}`}>
                    {item.numeroLeg} - {item.hora}
                    <span style={{ opacity: 0.6, fontSize: '0.65em', marginLeft: '12px', fontWeight: '400' }}>
                        {tipo}{tipo2 ? ` - ${tipo2}` : ''}{tipo3 ? ` - ${tipo3}` : ''}
                    </span>
                </h2>
                {(guardarInc || guardando) && (
                    <button
                        type="submit"
                        disabled={guardando}
                        className={guardando ? `${styles.saveButtonLeftSmall} ${styles.saving}` : `${styles.saveButtonLeftSmall} ${styles.unsaved}`}
                    >
                        {guardando ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
                    </button>
                )}
            </div>
            <RegistroChangeState estadoFunction={setEstado} estado={estado} audId={item.id} dateToUse={dateToUse} aId={(item.aId || false)} item={item} refreshAud={refreshAud} />
            <span className={`${styles.inputLeftRow}`}><label className={`${styles.inputLeftNameDRow}`}>SALA: </label>
                <input list='sala' className={`${styles.inputLeft} ${styles.inputLeft30} ${styles.inputLeftDRow}`} value={sala} onChange={e => setSala(e.target.value)} />
                <datalist id='sala' className={`${styles.tableCellInput} ${styles.inputLeft35}`}><option>{sala}</option>
                    {desplegables.salas && desplegables.salas.map(el => (
                        <option key={el} value={el}>SALA {el}</option>
                    ))}</datalist>
                <select value={nameTranslate(operadorAud)} className={`${styles.inputLeft} ${styles.inputLeft35} ${styles.selectOperador}`}
                    onChange={e => operadorChange(e.target.value)}>
                    <><option key={operadorAud + "selected"} value={operadorAud} selected>{nameTranslate(operadorAud)}</option></>
                    {desplegables.operador && desplegables.operador.map(el => (
                        <><option key={el} value={el} selected>{nameTranslate(el)}</option></>
                    ))}
                </select>
            </span>
            {item.tipo === "TRÁMITES DE EJECUCIÓN" &&
                <><span className={`${styles.inputLeftColumn}`}><label className={`${styles.inputLeftNameDColumn}`}>SAE:</label>
                    <input className={`${styles.inputTyped100} ${styles.inputLeft}`} value={saeNum} onChange={(e) => setSaeNum(e.target.value)} /></span></>}
            <span className={`${styles.inputLeftColumn}`}><label className={`${styles.inputLeftNameDColumn}`}>Carátula</label>
                <input className={`${styles.inputLeft} ${styles.inputLeft100} ${styles.inputTyped100}`}
                    type="text" value={caratula} onChange={(e) => setCaratula(e.target.value)} /></span>
            <button className={showReconversion ? `${styles.inputLeft} ${styles.inputLeft100} ${styles.reconvertidaButtonClicked}` : `${styles.inputLeft} ${styles.inputLeft100} ${styles.reconvertidaButton}`} type="button" onClick={() => handleReconversion()}>{showReconversion ? 'RECONVERTIDA' : 'TIPO ORIGINAL'}</button>
            {showReconversion ? <Reconversion item={item} setTipo={setTipo} setTipo2={setTipo2} setTipo3={setTipo3} tipo={tipo} tipo2={tipo2} tipoAux={tipoAux} tipo2Aux={tipo2Aux} /> : ''}
            <div className={styles.sectionHeader} onClick={() => toggleSection('mpf')}>
                <label className={`${styles.inputLeftNameDColumn}`}>Ministerio Público Fiscal</label>
                <span className={`${styles.chevron} ${sectionsVisible.mpf ? styles.chevronOpen : ''}`}>▼</span>
            </div>
            {sectionsVisible.mpf && (
                <span className={`${styles.inputLeftColumn}`}>
                    {mpf.map((input, index) => (
                        <div key={input.id} style={{ marginBottom: '4px' }}>
                            <div className={styles.inputRow}>
                                <input
                                    list={`mpf-${index}`}
                                    className={`${styles.inputLeft} ${styles.inputLeft100}`}
                                    value={input.nombre}
                                    onChange={(e) => handleInputChange(setMpf, index, 'nombre', e.target.value)}
                                    onBlur={(e) => {
                                        if (e.target.value && fiscalesList && !fiscalesList.includes(e.target.value)) {
                                            alert("Por favor, selecciona un nombre de la lista.");
                                            handleInputChange(setMpf, index, 'nombre', '');
                                        }
                                    }}
                                />
                                <datalist id={`mpf-${index}`}>
                                    {fiscalesList && fiscalesList.map(option => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </datalist>
                                <button className={`${styles.btnControl} ${styles.btnCompact}`} title={input.asistencia ? 'PRESENTE' : 'AUSENTE'} type="button" onClick={() => handleInputChange(setMpf, index, 'asistencia', (!input.asistencia))}>
                                    {input.asistencia ? 'PRE' : 'AUS'}
                                </button>
                                <button className={`${styles.btnControl} ${styles.btnCompact}`} title={input.presencial ? 'PRESENCIALMENTE' : 'VIRTUALMENTE'} type="button" onClick={() => handleInputChange(setMpf, index, 'presencial', (!input.presencial))}>
                                    {input.presencial ? 'FIS' : 'VIR'}
                                </button>
                                <label className={`${styles.btnControl} ${styles.subrogandoLabel} ${input.subrogando ? styles.subrogandoActive : ''}`} title="SUBROGANDO">
                                    <input
                                        type="checkbox"
                                        checked={input.subrogando || false}
                                        onChange={(e) => handleInputChange(setMpf, index, 'subrogando', e.target.checked)}
                                    />
                                    SUB
                                </label>
                                <button className={`${styles.btnControl} ${styles.btnDelete} ${styles.deleteNarrow}`} title="ELIMINAR" type="button" onClick={() => removeInput(setMpf, index)}><DeleteSVGF /></button>
                            </div>
                        </div>
                    ))}
                    <button className={`${styles.inputLeft} ${styles.inputLeft100}`} type="button" onClick={() => addNewInput(setMpf, { nombre: '', representa: [], asistencia: true, presencial: true, subrogando: false }, 'f')}>+ FISCAL</button>
                    <div className={styles.inputRow} style={{ marginTop: '10px' }}>
                        <label className={`${styles.inputLeftNameDRow}`} style={{ width: 'auto', marginRight: '8px' }}>UFI:</label>
                        <input list='ufi' className={`${styles.inputLeft} ${styles.inputLeft100}`} value={ufi}
                            onChange={(e) => setUfi(e.target.value)} placeholder="UFI" />
                        <datalist id='ufi'>{desplegables.ufi && desplegables.ufi.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}</datalist>
                    </div>
                </span>
            )}
            <div className={styles.sectionHeader} onClick={() => toggleSection('imputados')}>
                <label className={`${styles.inputLeftNameDColumn}`}>Imputados y Condenados</label>
                <span className={`${styles.chevron} ${sectionsVisible.imputados ? styles.chevronOpen : ''}`}>▼</span>
            </div>
            {sectionsVisible.imputados && (
                <span className={`${styles.inputLeftColumn}`}>
                    {imputado.map((input, realIndex) => input.condenado ? null : (
                        <div key={input.id}>
                            <div className={`${styles.imputadoInput} ${styles.inputRow}`}>
                                <input className={`${styles.inputLeft} ${styles.inputLeft100}`}
                                    type="text"
                                    value={input.nombre}
                                    onChange={(e) => updateImputado(input.id, { nombre: e.target.value })}
                                    placeholder="Nombre" />
                                <input className={`${styles.inputLeft} ${styles.inputTyped20}`}
                                    type="text"
                                    value={input.dni}
                                    onChange={(e) => updateImputado(input.id, { dni: e.target.value })}
                                    placeholder="DNI" />
                                <button className={`${styles.btnControl} ${styles.btnCompact}`} title="PRESENTE" type="button" onClick={() => handleInputChange(setImputado, realIndex, 'asistencia', (!input.asistencia))}>{input.asistencia ? 'PRE' : 'AUS'}</button>
                                <button className={`${styles.btnControl} ${styles.btnCompact}`} title="PRESENCIALMENTE" type="button" onClick={() => handleInputChange(setImputado, realIndex, 'presencial', (!input.presencial))}>
                                    {input.presencial ? 'FIS' : 'VIR'}
                                </button>
                                <button className={`${styles.btnControl} ${styles.btnCompact} ${styles.btnDelete}`} style={{ marginLeft: '4px' }} title="ELIMINAR" type="button" onClick={() => removeImputado(input.id)}><DeleteSVGF /></button>
                            </div>
                            {(item.tipo === "CONTROL DE DETENCIÓN" || item.tipo2 === "CONTROL DE DETENCIÓN" || item.tipo3 === "CONTROL DE DETENCIÓN") &&
                                <input className={`${styles.inputLeft} ${styles.inputTyped100}`}
                                    type="text"
                                    value={input.detenido}
                                    onChange={(e) => handleInputChange(setImputado, realIndex, 'detenido', e.target.value)}
                                    placeholder="detenido en... 00/00/00" />}
                        </div>
                    ))}
                    <span className={styles.imputadoButtons}>
                        <button className={`${styles.inputLeft} ${styles.inputLeft100}`} type="button"
                            onClick={() => addNewInput(setImputado, { nombre: '', dni: '', condenado: false, asistencia: true, detenido: '', presencial: true, }, 'i')}
                        >+ IMPUTADO</button>
                    </span>

                    <label className={`${styles.inputLeftNameDColumn}`} style={{ marginTop: '10px' }}>Condenados</label>
                    {imputado.map((input, realIndex) => !input.condenado ? null : (
                        <div key={input.id}>
                            <div className={`${styles.condenadoInput} ${styles.inputRow}`}>
                                <input className={`${styles.inputLeft} ${styles.inputLeft100}`}
                                    type="text"
                                    value={input.nombre}
                                    onChange={(e) => handleInputChange(setImputado, realIndex, 'nombre', e.target.value)}
                                    placeholder="Nombre" />
                                <input className={`${styles.inputLeft} ${styles.inputTyped20}`}
                                    type="text"
                                    value={input.dni}
                                    onChange={(e) => handleInputChange(setImputado, realIndex, 'dni', e.target.value)}
                                    placeholder="DNI" />
                                <button className={`${styles.btnControl} ${styles.btnCompact}`} title="PRESENTE" type="button" onClick={() => handleInputChange(setImputado, realIndex, 'asistencia', (!input.asistencia))}>{input.asistencia ? 'PRE' : 'AUS'}</button>
                                <button className={`${styles.btnControl} ${styles.btnCompact}`} title="PRESENCIALMENTE" type="button" onClick={() => handleInputChange(setImputado, realIndex, 'presencial', (!input.presencial))}>
                                    {input.presencial ? 'FIS' : 'VIR'}
                                </button>
                                <button className={`${styles.btnControl} ${styles.btnCompact} ${styles.btnDelete}`} style={{ marginLeft: '4px' }} title="ELIMINAR" type="button" onClick={() => removeImputado(input.id)}><DeleteSVGF /></button>
                            </div>
                            {(item.tipo === "CONTROL DE DETENCIÓN" || item.tipo2 === "CONTROL DE DETENCIÓN" || item.tipo3 === "CONTROL DE DETENCIÓN") &&
                                <input className={`${styles.inputLeft} ${styles.inputTyped100}`}
                                    type="text"
                                    value={input.detenido}
                                    onChange={(e) => handleInputChange(setImputado, realIndex, 'detenido', e.target.value)}
                                    placeholder="detenido en... 00/00/00" />}
                        </div>
                    ))}
                    <button className={`${styles.inputLeft} ${styles.inputLeft100}`} type="button"
                        onClick={() => addNewInput(setImputado, { nombre: '', dni: '', condenado: true, asistencia: true, detenido: '', presencial: true, }, 'i')}
                    >+ CONDENADO</button>
                </span>
            )}
            <div className={styles.sectionHeader} onClick={() => toggleSection('defensa')}>
                <label className={`${styles.inputLeftNameDColumn}`}>Defensa</label>
                <span className={`${styles.chevron} ${sectionsVisible.defensa ? styles.chevronOpen : ''}`}>▼</span>
            </div>
            {sectionsVisible.defensa && (
                <span className={`${styles.inputLeftColumn}`}>
                    {defensa.map((input, index) => (
                        <div key={input.id} className={`${styles.defenseRow}`}>
                            <div className={styles.inputRow}>
                                <button
                                    className={`${styles.btnControl} ${styles.btnCompact}`}
                                    title="TIPO DE DEFENSA"
                                    type="button"
                                    onClick={() => handleInputChange(setDefensa, index, 'tipo', input.tipo === 'Particular' ? 'Oficial' : 'Particular')}
                                >
                                    {input.tipo === 'Particular' ? 'PAR' : 'OFI'}
                                </button>
                                <div style={{ flex: 1, minWidth: 0, display: 'flex' }}>
                                    {(!input.tipo || input.tipo === 'Oficial') ? (
                                        <>
                                            <input list={`oficial-${index}`}
                                                className={`${styles.inputLeft} ${styles.inputLeft100}`}
                                                value={input.nombre}
                                                onChange={(e) => handleInputChange(setDefensa, index, 'nombre', e.target.value)}
                                                placeholder="Nombre"
                                                onBlur={(e) => {
                                                    if (e.target.value && defensoresOficialesList && !defensoresOficialesList.includes(e.target.value)) {
                                                        alert("Por favor, selecciona un nombre de la lista.");
                                                        handleInputChange(setDefensa, index, 'nombre', '');
                                                    }
                                                }} />
                                            <datalist id={`oficial-${index}`}>
                                                {defensoresOficialesList && defensoresOficialesList.map(option => (
                                                    <option key={option} value={option}>{option}</option>
                                                ))}
                                            </datalist>
                                        </>
                                    ) : (
                                        <>
                                            <input list={`particular-${index}`}
                                                className={`${styles.inputLeft} ${styles.inputLeft100}`}
                                                value={input.nombre}
                                                onChange={(e) => handleInputChange(setDefensa, index, 'nombre', e.target.value)}
                                                placeholder="Nombre"
                                                onBlur={(e) => {
                                                    if (e.target.value && defensoresParticularesList && !defensoresParticularesList.includes(e.target.value)) {
                                                        alert("Por favor, selecciona un nombre de la lista.");
                                                        handleInputChange(setDefensa, index, 'nombre', '');
                                                    }
                                                }} />
                                            <datalist id={`particular-${index}`}>
                                                {defensoresParticularesList && defensoresParticularesList.map(option => (
                                                    <option key={option} value={option}>{option}</option>
                                                ))}
                                            </datalist>
                                        </>
                                    )}
                                </div>
                                <button className={`${styles.btnControl} ${styles.btnCompact}`} title={input.asistencia ? 'PRESENTE' : 'AUSENTE'} type="button" onClick={() => handleInputChange(setDefensa, index, 'asistencia', (!input.asistencia))}>{input.asistencia ? 'PRE' : 'AUS'}</button>
                                <button className={`${styles.btnControl} ${styles.btnCompact}`} title={input.presencial ? 'PRESENCIALMENTE' : 'VIRTUALMENTE'} type="button" onClick={() => handleInputChange(setDefensa, index, 'presencial', (!input.presencial))}>{input.presencial ? 'FIS' : 'VIR'}</button>
                                <label className={`${styles.btnControl} ${styles.subrogandoLabel} ${input.subrogando ? styles.subrogandoActive : ''}`} title="SUBROGANDO">
                                    <input
                                        type="checkbox"
                                        checked={input.subrogando || false}
                                        onChange={(e) => handleInputChange(setDefensa, index, 'subrogando', e.target.checked)}
                                    />
                                    SUB
                                </label>
                            </div>
                            {(imputado && imputado.length > 1) && (
                                <div className={styles.inputRowFlexible}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <RepresentationSelector
                                            selectedItems={defensa[index].imputado}
                                            availableItems={Array.isArray(imputado) ? imputado : []}
                                            onUpdate={(newItems) => handleInputChange(setDefensa, index, "imputado", newItems)}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    <button className={`${styles.btnControl} ${styles.inputLeft100}`} type="button" onClick={() => addNewInput(setDefensa, { tipo: 'Oficial', nombre: '', imputado: [], asistencia: true, presencial: true, subrogando: false }, 'd')}>+ DEFENSA</button>
                    <div className={styles.inputRow} style={{ marginTop: '10px' }}>
                        <label className={`${styles.inputLeftNameDRow}`} style={{ width: 'auto', marginRight: '8px' }}>DEFENSORÍA:</label>
                        <input className={`${styles.inputLeft} ${styles.inputLeft100}`}
                            value={defensoria || ''}
                            onChange={(e) => setDefensoria(e.target.value)}
                            placeholder="Defensoría"
                            title="Número de Defensoría"
                        />
                    </div>
                </span>
            )}
            <div className={styles.sectionHeader} onClick={() => toggleSection('partes')}>
                <label className={`${styles.inputLeftNameDColumn}`}>Otras Partes</label>
                <span className={`${styles.chevron} ${sectionsVisible.partes ? styles.chevronOpen : ''}`}>▼</span>
            </div>
            {sectionsVisible.partes && (
                <span className={`${styles.inputLeftColumn}`}>
                    {partes.map((input, index) => (
                        <div key={input.id}>
                            <input list='partesVarias'
                                className={`${styles.inputLeft} ${styles.inputLeft50}  ${styles.inputLeftSelect}`}
                                value={input.role}
                                onChange={(e) => handleInputChange(setPartes, index, 'role', e.target.value)}
                                placeholder="tipo" />
                            <datalist id='partesVarias'>
                                {desplegables.tiposPartes && desplegables.tiposPartes.map(tipoParte => (
                                    <option key={tipoParte} value={tipoParte}>{tipoParte}</option>))}
                            </datalist>
                            <input className={`${styles.inputLeft} ${styles.inputLeft50}`} type="text" value={input.name} onChange={(e) => handleInputChange(setPartes, index, 'name', e.target.value)} placeholder="nombre" />
                            <input className={`${styles.inputLeft} ${styles.inputLeft50}`} type="text" value={input.dni} onChange={(e) => handleInputChange(setPartes, index, 'dni', e.target.value)} placeholder="dni" />
                            <RepresentationSelector
                                selectedItems={partes[index].representa}
                                availableItems={[...(Array.isArray(imputado) ? imputado : []), ...(Array.isArray(partes) ? partes.filter(p => p.role === 'Denunciante') : [])]}
                                onUpdate={(newItems) => handleInputChange(setPartes, index, "representa", newItems)}
                            />
                            <button className={`${styles.inputLeft} ${styles.inputLeft20}`} title={input.presencial ? 'Presente' : 'Ausente'} type="button" onClick={() => handleInputChange(setPartes, index, 'asistencia', (!input.asistencia))}>{input.asistencia ? 'PRE' : 'AUS'}</button>
                            <button className={`${styles.inputLeft} ${styles.inputLeft20}`} title={input.presencial ? 'fisicamente' : 'Virtual'} type="button" onClick={() => handleInputChange(setPartes, index, 'presencial', (!input.presencial))}>
                                {input.presencial ? 'FIS' : 'VIR'}
                            </button>
                            <button className={`${styles.inputLeft} ${styles.inputLeft15} ${styles.inputLeftDelete}`} type="button" onClick={() => removeInput(setPartes, index)}><DeleteSVGF /></button>
                        </div>
                    ))}
                    <button className={`${styles.inputLeft} ${styles.inputLeft100}`} type="button" onClick={() => addNewInput(setPartes, { role: '', name: '', representa: [], asistencia: true, presencial: true }, 'p')}>+ PARTE</button>
                </span>
            )}
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
            <Cronometro item={item} dateToUse={dateToUse} isHovered={isHovered} minuta={minuta} setMinuta={setMinuta} cierre={cierre} setCierre={setCierre} />
        </form>
    );
}