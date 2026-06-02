'use client'
import { useState, useMemo, useEffect, useContext } from 'react'
import styles from '../MinutaJuicio.module.css'
import regStyles from '../../Registro-Audiencia/RegistroAudiencia.module.css'
import { generateResuelvoSection } from '@/utils/resuelvoUtils'
import { minutaPrep } from '@/utils/minutaPrep'
import { PDFGenerator } from '@/utils/pdfUtils'
import { removeHtmlTags } from '@/utils/removeHtmlTags'
import { RepresentationSelector } from '../../Registro-Audiencia/components/RepresentationSelector'
import DeleteSVGF from '../../Registro-Audiencia/components/DeleteSVGF'
import { nameTranslate } from '@/utils/traductorNombres'
import { DataContext } from '@/context/DataContext'
import dynamic from 'next/dynamic'

const TextEditor = dynamic(() => import('../../Registro-Audiencia/components/TextEditor'), { ssr: false })

export default function EditBlock({ selectedList }) {
    const { updateDesplegables, desplegables, updateData, fiscalesList, defensoresOficialesList, defensoresParticularesList, abogados, juecesList } = useContext(DataContext);

    const [editableBody, setEditableBody] = useState('');
    const [editableResuelvo, setEditableResuelvo] = useState('');
    const [initialized, setInitialized] = useState(false);

    // Caratula States
    const [sala, setSala] = useState('');
    const [juez, setJuez] = useState('');
    const [caratula, setCaratula] = useState('');
    const [ufi, setUfi] = useState('');
    const [defensoria, setDefensoria] = useState('');
    const [operador, setOperador] = useState('');
    const [mpfSubrogandoPor, setMpfSubrogandoPor] = useState('');
    const [mpf, setMpf] = useState([]);
    const [imputado, setImputado] = useState([]);
    const [defensa, setDefensa] = useState([]);
    const [partes, setPartes] = useState([]);

    const [sectionsVisible, setSectionsVisible] = useState({
        mpf: true,
        imputados: true,
        defensa: true,
        partes: false
    });

    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        updateDesplegables();
    }, []);

    // Date/Time Chronological Helpers
    const parseDate = (dStr) => {
        if (!dStr) return new Date(0);
        if (dStr.includes('/')) {
            const parts = dStr.split('/');
            return new Date(parts[2], parts[1] - 1, parts[0]);
        }
        if (dStr.length === 8) {
            const day = dStr.slice(0, 2);
            const month = dStr.slice(2, 4);
            const year = dStr.slice(4, 8);
            return new Date(year, month - 1, day);
        }
        return new Date(dStr);
    };

    const parseDateAndTime = (dStr, tStr) => {
        const d = parseDate(dStr);
        if (tStr) {
            const parts = tStr.split(':');
            d.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), 0, 0);
        }
        return d;
    };

    // Merge all parties from all selected audiencias (union, no duplicates)
    const consolidatedParties = useMemo(() => {
        if (!selectedList || selectedList.length === 0) return null;

        const mergeByName = (arrays) => {
            const map = new Map();
            arrays.forEach(arr => {
                (arr || []).forEach(item => {
                    const name = item.nombre || item.name || '';
                    if (name && !map.has(name)) map.set(name, item);
                });
            });
            return Array.from(map.values());
        };

        const sortedList = [...selectedList].sort((a, b) => {
            const timeA = parseDateAndTime(a.fecha, a.hora).getTime();
            const timeB = parseDateAndTime(b.fecha, b.hora).getTime();
            return timeA - timeB;
        });

        const firstAud = sortedList[0] || {};

        return {
            mpf: mergeByName(sortedList.map(a => a.mpf)),
            defensa: mergeByName(sortedList.map(a => a.defensa)),
            imputado: mergeByName(sortedList.map(a => a.imputado)),
            partes: mergeByName(sortedList.map(a => a.partes)),
            juez: firstAud.juez || '',
            sala: firstAud.sala || '',
            ufi: firstAud.ufi || '',
            defensoria: firstAud.defensoria || '',
            operador: firstAud.operador || '',
            mpfSubrogandoPor: firstAud.mpfSubrogandoPor || '',
            tipo: firstAud.tipo || '',
            tipo2: firstAud.tipo2 || '',
            tipo3: firstAud.tipo3 || '',
            numeroLeg: firstAud.numeroLeg || '',
            saeNum: firstAud.saeNum || '',
            caratula: firstAud.caratula || '',
            hora: firstAud.hora || '',
            hitos: firstAud.hitos || [],
        };
    }, [selectedList]);

    // Concatenate all minuta bodies from selected audiencias
    const concatenatedBody = useMemo(() => {
        if (!selectedList || selectedList.length === 0) return '';
        const sortedList = [...selectedList].sort((a, b) => {
            const timeA = parseDateAndTime(a.fecha, a.hora).getTime();
            const timeB = parseDateAndTime(b.fecha, b.hora).getTime();
            return timeA - timeB;
        });
        return sortedList
            .map(aud => aud.minuta || '')
            .filter(m => m.trim() !== '')
            .join('<br><hr><br>');
    }, [selectedList]);

    // Find the resuelvo from the last block (the one that has content)
    const lastResuelvo = useMemo(() => {
        if (!selectedList || selectedList.length === 0) return '';
        const sortedList = [...selectedList].sort((a, b) => {
            const timeA = parseDateAndTime(a.fecha, a.hora).getTime();
            const timeB = parseDateAndTime(b.fecha, b.hora).getTime();
            return timeA - timeB;
        });
        const withResuelvo = sortedList.filter(a => a.resuelvoText && removeHtmlTags(a.resuelvoText).trim() !== '');
        if (withResuelvo.length === 0) return '';
        return withResuelvo[withResuelvo.length - 1].resuelvoText || '';
    }, [selectedList]);

    // Initialize editable fields when selection changes
    const selectedIds = (selectedList || []).map(a => a.id).join(',');

    useEffect(() => {
        if (consolidatedParties) {
            setSala(consolidatedParties.sala || '');
            setJuez(consolidatedParties.juez || '');
            setCaratula(consolidatedParties.caratula || '');
            setUfi(consolidatedParties.ufi || '');
            setDefensoria(consolidatedParties.defensoria || '');
            setOperador(consolidatedParties.operador || '');
            setMpfSubrogandoPor(consolidatedParties.mpfSubrogandoPor || '');
            const ensureIds = (array, prefix) => {
                if (!Array.isArray(array)) return [];
                return array.map((item, idx) => {
                    if (item && typeof item === 'object') {
                        if (!item.id) {
                            return { ...item, id: `${prefix}-${Date.now()}-${idx}-${Math.floor(Math.random() * 100000)}` };
                        }
                    }
                    return item;
                });
            };
            setMpf(ensureIds(consolidatedParties.mpf, 'f'));
            setImputado(ensureIds(consolidatedParties.imputado, 'i'));
            setDefensa(ensureIds(consolidatedParties.defensa, 'd'));
            setPartes(ensureIds(consolidatedParties.partes, 'p'));
        } else {
            setSala('');
            setJuez('');
            setCaratula('');
            setUfi('');
            setDefensoria('');
            setOperador('');
            setMpfSubrogandoPor('');
            setMpf([]);
            setImputado([]);
            setDefensa([]);
            setPartes([]);
        }
    }, [selectedIds, consolidatedParties]);

    useMemo(() => {
        if (selectedList && selectedList.length > 0) {
            setEditableBody(concatenatedBody);
            setEditableResuelvo(lastResuelvo);
            setInitialized(true);
        } else {
            setEditableBody('');
            setEditableResuelvo('');
            setInitialized(false);
        }
    }, [concatenatedBody, lastResuelvo]);

    // Form handlers
    const toggleSection = (section) => {
        setSectionsVisible(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const updateImputado = (id, newData) => {
        setImputado(prev =>
            prev.map(p => (p.id === id ? { ...p, ...newData } : p))
        );
        setDefensa(prev =>
            prev.map(def => ({
                ...def,
                imputado: Array.isArray(def.imputado)
                    ? def.imputado.map(v => {
                        if (!v) return v;
                        if (typeof v === 'object') {
                            return v.id === id ? { ...v, ...newData } : v;
                        }
                        return v === id ? { id: v, nombre: newData.nombre || '' } : v;
                    })
                    : def.imputado,
                condenado: Array.isArray(def.condenado)
                    ? def.condenado.map(v => {
                        if (!v) return v;
                        if (typeof v === 'object') {
                            return v.id === id ? { ...v, ...newData } : v;
                        }
                        return v === id ? { id: v, nombre: newData.nombre || '' } : v;
                    })
                    : def.condenado,
            }))
        );
        setPartes(prev =>
            prev.map(p => ({
                ...p,
                representa: Array.isArray(p.representa)
                    ? p.representa.map(v => {
                        if (!v) return v;
                        if (typeof v === 'object') {
                            return v.id === id ? { ...v, ...newData } : v;
                        }
                        return v === id ? { id: v, nombre: newData.nombre || '' } : v;
                    })
                    : p.representa
            }))
        );
    };

    const handleInputChange = (setter, index, key, valueObj, toggleArray = false) => {
        setter(prev => {
            const updated = [...prev];
            const current = updated[index] || {};

            if (toggleArray) {
                const arr = Array.isArray(current[key]) ? [...current[key]] : [];
                const exists = arr.some(item => (item && typeof item === 'object' ? item.id === valueObj.id : item === valueObj.id));
                updated[index] = {
                    ...current,
                    [key]: exists
                        ? arr.filter(item => (item && typeof item === 'object' ? item.id !== valueObj.id : item !== valueObj.id))
                        : [...arr, valueObj]
                };
            } else {
                updated[index] = { ...current, [key]: valueObj };

                if (key === 'nombre' && setter === setDefensa && current.tipo === 'Oficial') {
                    const abog = abogados.find(a => a.n === valueObj);
                    if (abog) {
                        if (abog.l && (!current.defensoria || current.defensoria === '')) updated[index].defensoria = abog.l;
                        if (abog.m && (!current.matricula || current.matricula === '')) updated[index].matricula = abog.m;
                    }
                }
            }

            // Propagate name changes for partes (Denunciante) to other partes representing them
            if (setter === setPartes && key === 'name') {
                const id = current.id;
                if (id) {
                    return updated.map((p, idx) => {
                        if (idx === index) return p;
                        return {
                            ...p,
                            representa: Array.isArray(p.representa)
                                ? p.representa.map(v => {
                                    if (!v) return v;
                                    if (typeof v === 'object') {
                                        return v.id === id ? { ...v, nombre: valueObj } : v;
                                    }
                                    return v === id ? { id: v, nombre: valueObj } : v;
                                })
                                : p.representa
                        };
                    });
                }
            }

            return updated;
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
                    ? def.imputado.filter(v => v && (typeof v === 'object' ? v.id !== id : v !== id))
                    : def.imputado,
                condenado: Array.isArray(def.condenado)
                    ? def.condenado.filter(v => v && (typeof v === 'object' ? v.id !== id : v !== id))
                    : def.condenado
            }))
        );
        setPartes(prev =>
            prev.map(p => ({
                ...p,
                representa: Array.isArray(p.representa)
                    ? p.representa.filter(v => v && (typeof v === 'object' ? v.id !== id : v !== id))
                    : p.representa
            }))
        );
    };

    const removeParte = (index) => {
        const parteToRemove = partes[index];
        if (parteToRemove && parteToRemove.id) {
            const id = parteToRemove.id;
            setPartes(prev =>
                prev
                    .filter((_, i) => i !== index)
                    .map(p => ({
                        ...p,
                        representa: Array.isArray(p.representa)
                            ? p.representa.filter(v => v && (typeof v === 'object' ? v.id !== id : v !== id))
                            : p.representa
                    }))
            );
        } else {
            setPartes(prev => prev.filter((_, i) => i !== index));
        }
    };

    const removeInput = (setter, index) => {
        setter(prev => prev.filter((_, i) => i !== index));
    };

    const handleSaveCaratula = async () => {
        if (!selectedList || selectedList.length === 0) return;
        setGuardando(true);
        try {
            for (const aud of selectedList) {
                const date = aud.fecha;
                const id = aud.id;
                await updateData(date, id, 'sala', sala);
                await updateData(date, id, 'juez', juez);
                await updateData(date, id, 'caratula', caratula);
                await updateData(date, id, 'ufi', ufi);
                await updateData(date, id, 'defensoria', defensoria);
                await updateData(date, id, 'operador', operador);
                await updateData(date, id, 'mpfSubrogandoPor', mpfSubrogandoPor);
                await updateData(date, id, 'mpf', mpf);
                await updateData(date, id, 'imputado', imputado);
                await updateData(date, id, 'defensa', defensa);
                await updateData(date, id, 'partes', partes);
            }
            alert("Cambios de la carátula guardados correctamente en todos los bloques.");
        } catch (error) {
            console.error("Error al guardar cambios de la carátula:", error);
            alert("Error al guardar cambios. Reintente por favor.");
        } finally {
            setGuardando(false);
        }
    };

    const handleDownload = () => {
        if (!consolidatedParties || !selectedList || selectedList.length === 0) return;

        const sortedList = [...selectedList].sort((a, b) => {
            const timeA = parseDateAndTime(a.fecha, a.hora).getTime();
            const timeB = parseDateAndTime(b.fecha, b.hora).getTime();
            return timeA - timeB;
        });

        const firstAud = sortedList[0];
        const date = firstAud.fecha || '';

        const consolidatedItem = {
            sala,
            juez,
            caratula,
            ufi,
            defensoria,
            operador,
            mpfSubrogandoPor,
            mpf,
            imputado,
            defensa,
            partes,
            numeroLeg: consolidatedParties.numeroLeg,
            saeNum: consolidatedParties.saeNum,
            tipo: consolidatedParties.tipo,
            tipo2: consolidatedParties.tipo2,
            tipo3: consolidatedParties.tipo3,
            hora: consolidatedParties.hora,
            hitos: consolidatedParties.hitos,
            minuta: editableBody,
            resuelvoText: editableResuelvo,
            cierre: '', // No cierre for debate
        };

        const caratulaSections = generateResuelvoSection(consolidatedItem, date);

        const bodyItem = { ...consolidatedItem, minuta: editableBody, resuelvoText: '', cierre: '' };
        const bodyParts = minutaPrep(bodyItem);

        const resuelvoSections = [];
        if (editableResuelvo && removeHtmlTags(editableResuelvo).trim() !== '') {
            const resuelvoLines = editableResuelvo
                .replace(/<br\s*\/?>/gi, '\n')
                .replace(/<[^>]*>/g, '')
                .split('\n')
                .filter(l => l.trim() !== '');

            resuelvoSections.push({
                text: [{ text: '\nResuelvo:', bold: true }]
            });
            resuelvoLines.forEach(line => {
                resuelvoSections.push({
                    text: [{ text: line, bold: false }]
                });
            });
        }

        const allSections = [...caratulaSections, ...bodyParts, ...resuelvoSections];
        PDFGenerator(allSections, consolidatedItem.numeroLeg, true);
    };

    if (!selectedList || selectedList.length === 0) {
        return (
            <section className={`${styles.editBlock}`}>
                <div className={`${styles.editBlockEmpty}`}>
                    <p>Seleccione bloques de debate para generar la minuta final</p>
                </div>
            </section>
        );
    }

    return (
        <section className={`${styles.editBlock}`} style={{ flex: 1, padding: 0 }}>
            <div className={regStyles.container} style={{ display: 'flex', flexDirection: 'row', width: '100%', height: '100%' }}>
                {/* Panel Izquierdo: Carátula Consolidada */}
                <div className={regStyles.controlBlockLeft} style={{ width: '40%', height: '100%', overflowY: 'auto', padding: '16px', borderRight: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h4 style={{ margin: 0, textTransform: 'uppercase', color: 'var(--text)' }}>Carátula Consolidada</h4>
                        <button
                            type="button"
                            onClick={handleSaveCaratula}
                            disabled={guardando}
                            className={guardando ? `${regStyles.btnControl} ${regStyles.saving}` : `${regStyles.btnControl}`}
                            style={{ backgroundColor: 'var(--guardar-bg)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                        >
                            {guardando ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
                        </button>
                    </div>

                    {/* SALA y OPERADOR */}
                    <span className={`${regStyles.inputLeftRow}`}>
                        <label className={`${regStyles.inputLeftNameDRow}`}>SALA: </label>
                        <input list='sala' className={`${regStyles.inputLeft} ${regStyles.inputLeft30} ${regStyles.inputLeftDRow}`} value={sala} onChange={e => setSala(e.target.value)} />
                        <datalist id='sala'>
                            {desplegables.salas && desplegables.salas.map(el => (
                                <option key={el} value={el}>SALA {el}</option>
                            ))}
                        </datalist>
                        
                        <select value={operador} className={`${regStyles.inputLeft} ${regStyles.inputLeft35} ${regStyles.selectOperador}`}
                            onChange={e => setOperador(e.target.value)}>
                            <option value="">-- Operador --</option>
                            {desplegables.operador && desplegables.operador.map(el => (
                                <option key={el} value={el}>{nameTranslate(el) || el}</option>
                            ))}
                        </select>
                    </span>

                    {/* JUEZ */}
                    <span className={`${regStyles.inputLeftRow}`} style={{ marginTop: '8px' }}>
                        <label className={`${regStyles.inputLeftNameDRow}`}>JUEZ: </label>
                        <input list='juez-list' className={`${regStyles.inputLeft} ${regStyles.inputLeft100} ${regStyles.inputLeftDRow}`} value={juez} onChange={e => setJuez(e.target.value)} />
                        <datalist id='juez-list'>
                            {juecesList && juecesList.map(el => (
                                <option key={el} value={el}>{el}</option>
                            ))}
                        </datalist>
                    </span>

                    {/* CARATULA */}
                    <span className={`${regStyles.inputLeftColumn}`} style={{ marginTop: '8px' }}>
                        <label className={`${regStyles.inputLeftNameDColumn}`}>Carátula</label>
                        <input className={`${regStyles.inputLeft} ${regStyles.inputLeft100} ${regStyles.inputTyped100}`}
                            type="text" value={caratula} onChange={(e) => setCaratula(e.target.value)} />
                    </span>

                    {/* SECCIÓN MPF */}
                    <div className={regStyles.sectionHeader} onClick={() => toggleSection('mpf')} style={{ marginTop: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
                        <label className={`${regStyles.inputLeftNameDColumn}`}>Ministerio Público Fiscal</label>
                        <span className={`${regStyles.chevron} ${sectionsVisible.mpf ? regStyles.chevronOpen : ''}`}>▼</span>
                    </div>
                    {sectionsVisible.mpf && (
                        <span className={`${regStyles.inputLeftColumn}`}>
                            {mpf.map((input, index) => (
                                <div key={input.id} style={{ marginBottom: '4px' }}>
                                    <div className={regStyles.inputRow}>
                                        <input
                                            list={`mpf-${index}`}
                                            className={`${regStyles.inputLeft} ${regStyles.inputLeft100}`}
                                            value={input.nombre}
                                            onChange={(e) => handleInputChange(setMpf, index, 'nombre', e.target.value)}
                                        />
                                        <datalist id={`mpf-${index}`}>
                                            {fiscalesList && fiscalesList.map(option => (
                                                <option key={option} value={option}>{option}</option>
                                            ))}
                                        </datalist>
                                        <button className={`${regStyles.btnControl} ${regStyles.btnCompact}`} title={input.asistencia ? 'PRESENTE' : 'AUSENTE'} type="button" onClick={() => handleInputChange(setMpf, index, 'asistencia', (!input.asistencia))}>
                                            {input.asistencia ? 'PRE' : 'AUS'}
                                        </button>
                                        <button className={`${regStyles.btnControl} ${regStyles.btnCompact}`} title={input.presencial ? 'PRESENCIALMENTE' : 'VIRTUALMENTE'} type="button" onClick={() => handleInputChange(setMpf, index, 'presencial', (!input.presencial))}>
                                            {input.presencial ? 'FIS' : 'VIR'}
                                        </button>
                                        <label className={`${regStyles.btnControl} ${regStyles.subrogandoLabel} ${input.subrogando ? regStyles.subrogandoActive : ''}`} title="SUBROGANDO">
                                            <input
                                                type="checkbox"
                                                checked={input.subrogando || false}
                                                onChange={(e) => handleInputChange(setMpf, index, 'subrogando', e.target.checked)}
                                                style={{ display: 'none' }}
                                            />
                                            SUB
                                        </label>
                                        <button className={`${regStyles.btnControl} ${regStyles.btnDelete} ${regStyles.deleteNarrow}`} title="ELIMINAR" type="button" onClick={() => removeInput(setMpf, index)}><DeleteSVGF /></button>
                                    </div>
                                </div>
                            ))}
                            <button className={`${regStyles.inputLeft} ${regStyles.inputLeft100}`} type="button" onClick={() => addNewInput(setMpf, { nombre: '', representa: [], asistencia: true, presencial: true, subrogando: false }, 'f')}>+ FISCAL</button>
                            <div className={regStyles.inputRow} style={{ marginTop: '10px' }}>
                                <label className={`${regStyles.inputLeftNameDRow}`} style={{ width: 'auto', marginRight: '8px' }}>UFI:</label>
                                <input list='ufi' className={`${regStyles.inputLeft} ${regStyles.inputLeft100}`} value={ufi}
                                    onChange={(e) => setUfi(e.target.value)} placeholder="UFI" />
                                <datalist id='ufi'>{desplegables.ufi && desplegables.ufi.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}</datalist>
                            </div>
                            {mpf.some(m => m.subrogando) && (
                                <div className={regStyles.inputRow} style={{ marginTop: '10px' }}>
                                    <label className={`${regStyles.inputLeftNameDRow}`} style={{ width: 'auto', marginRight: '8px' }}>A quien subroga:</label>
                                    <input list='fiscalesListSub' className={`${regStyles.inputLeft} ${regStyles.inputLeft100}`} value={mpfSubrogandoPor || ''}
                                        onChange={(e) => setMpfSubrogandoPor(e.target.value)} placeholder="Subrogando a..." />
                                    <datalist id='fiscalesListSub'>{fiscalesList && fiscalesList.map(option => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}</datalist>
                                </div>
                            )}
                        </span>
                    )}

                    {/* SECCIÓN IMPUTADOS */}
                    <div className={regStyles.sectionHeader} onClick={() => toggleSection('imputados')} style={{ marginTop: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
                        <label className={`${regStyles.inputLeftNameDColumn}`}>Imputados y Condenados</label>
                        <span className={`${regStyles.chevron} ${sectionsVisible.imputados ? regStyles.chevronOpen : ''}`}>▼</span>
                    </div>
                    {sectionsVisible.imputados && (
                        <span className={`${regStyles.inputLeftColumn}`}>
                            {imputado.map((input, realIndex) => input.condenado ? null : (
                                <div key={input.id}>
                                    <div className={`${regStyles.imputadoInput} ${regStyles.inputRow}`}>
                                        <input className={`${regStyles.inputLeft} ${regStyles.inputLeft100}`}
                                            type="text"
                                            value={input.nombre}
                                            onChange={(e) => updateImputado(input.id, { nombre: e.target.value })}
                                            placeholder="Nombre" />
                                        <input className={`${regStyles.inputLeft} ${regStyles.inputTyped20}`}
                                            type="text"
                                            value={input.dni}
                                            onChange={(e) => updateImputado(input.id, { dni: e.target.value })}
                                            placeholder="DNI" />
                                        <button className={`${regStyles.btnControl} ${regStyles.btnCompact}`} title="PRESENTE" type="button" onClick={() => handleInputChange(setImputado, realIndex, 'asistencia', (!input.asistencia))}>{input.asistencia ? 'PRE' : 'AUS'}</button>
                                        <button className={`${regStyles.btnControl} ${regStyles.btnCompact}`} title="PRESENCIALMENTE" type="button" onClick={() => handleInputChange(setImputado, realIndex, 'presencial', (!input.presencial))}>
                                            {input.presencial ? 'FIS' : 'VIR'}
                                        </button>
                                        <button className={`${regStyles.btnControl} ${regStyles.btnCompact} ${regStyles.btnDelete}`} style={{ marginLeft: '4px' }} title="ELIMINAR" type="button" onClick={() => removeImputado(input.id)}><DeleteSVGF /></button>
                                    </div>
                                </div>
                            ))}
                            <button className={`${regStyles.inputLeft} ${regStyles.inputLeft100}`} type="button"
                                onClick={() => addNewInput(setImputado, { nombre: '', dni: '', condenado: false, asistencia: true, detenido: '', presencial: true, }, 'i')}
                            >+ IMPUTADO</button>

                            <label className={`${regStyles.inputLeftNameDColumn}`} style={{ marginTop: '10px' }}>Condenados</label>
                            {imputado.map((input, realIndex) => !input.condenado ? null : (
                                <div key={input.id}>
                                    <div className={`${regStyles.condenadoInput} ${regStyles.inputRow}`}>
                                        <input className={`${regStyles.inputLeft} ${regStyles.inputLeft100}`}
                                            type="text"
                                            value={input.nombre}
                                            onChange={(e) => handleInputChange(setImputado, realIndex, 'nombre', e.target.value)}
                                            placeholder="Nombre" />
                                        <input className={`${regStyles.inputLeft} ${regStyles.inputTyped20}`}
                                            type="text"
                                            value={input.dni}
                                            onChange={(e) => handleInputChange(setImputado, realIndex, 'dni', e.target.value)}
                                            placeholder="DNI" />
                                        <button className={`${regStyles.btnControl} ${regStyles.btnCompact}`} title="PRESENTE" type="button" onClick={() => handleInputChange(setImputado, realIndex, 'asistencia', (!input.asistencia))}>{input.asistencia ? 'PRE' : 'AUS'}</button>
                                        <button className={`${regStyles.btnControl} ${regStyles.btnCompact}`} title="PRESENCIALMENTE" type="button" onClick={() => handleInputChange(setImputado, realIndex, 'presencial', (!input.presencial))}>
                                            {input.presencial ? 'FIS' : 'VIR'}
                                        </button>
                                        <button className={`${regStyles.btnControl} ${regStyles.btnCompact} ${regStyles.btnDelete}`} style={{ marginLeft: '4px' }} title="ELIMINAR" type="button" onClick={() => removeImputado(input.id)}><DeleteSVGF /></button>
                                    </div>
                                </div>
                            ))}
                            <button className={`${regStyles.inputLeft} ${regStyles.inputLeft100}`} type="button"
                                onClick={() => addNewInput(setImputado, { nombre: '', dni: '', condenado: true, asistencia: true, detenido: '', presencial: true, }, 'i')}
                            >+ CONDENADO</button>
                        </span>
                    )}

                    {/* SECCIÓN DEFENSA */}
                    <div className={regStyles.sectionHeader} onClick={() => toggleSection('defensa')} style={{ marginTop: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
                        <label className={`${regStyles.inputLeftNameDColumn}`}>Defensa</label>
                        <span className={`${regStyles.chevron} ${sectionsVisible.defensa ? regStyles.chevronOpen : ''}`}>▼</span>
                    </div>
                    {sectionsVisible.defensa && (
                        <span className={`${regStyles.inputLeftColumn}`}>
                            {defensa.map((input, index) => (
                                <div key={input.id} className={`${regStyles.defenseRow}`}>
                                    <div className={regStyles.inputRow}>
                                        <button
                                            className={`${regStyles.btnControl} ${regStyles.btnCompact}`}
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
                                                        className={`${regStyles.inputLeft} ${regStyles.inputLeft100}`}
                                                        value={input.nombre}
                                                        onChange={(e) => handleInputChange(setDefensa, index, 'nombre', e.target.value)}
                                                        placeholder="Nombre" />
                                                    <datalist id={`oficial-${index}`}>
                                                        {defensoresOficialesList && defensoresOficialesList.map(option => (
                                                            <option key={option} value={option}>{option}</option>
                                                        ))}
                                                    </datalist>
                                                </>
                                            ) : (
                                                <>
                                                    <input list={`particular-${index}`}
                                                        className={`${regStyles.inputLeft} ${regStyles.inputLeft100}`}
                                                        value={input.nombre}
                                                        onChange={(e) => handleInputChange(setDefensa, index, 'nombre', e.target.value)}
                                                        placeholder="Nombre" />
                                                    <datalist id={`particular-${index}`}>
                                                        {defensoresParticularesList && defensoresParticularesList.map(option => (
                                                            <option key={option} value={option}>{option}</option>
                                                        ))}
                                                    </datalist>
                                                </>
                                            )}
                                        </div>
                                        <button className={`${regStyles.btnControl} ${regStyles.btnCompact}`} title={input.asistencia ? 'PRESENTE' : 'AUSENTE'} type="button" onClick={() => handleInputChange(setDefensa, index, 'asistencia', (!input.asistencia))}>{input.asistencia ? 'PRE' : 'AUS'}</button>
                                        <button className={`${regStyles.btnControl} ${regStyles.btnCompact}`} title={input.presencial ? 'PRESENCIALMENTE' : 'VIRTUALMENTE'} type="button" onClick={() => handleInputChange(setDefensa, index, 'presencial', (!input.presencial))}>{input.presencial ? 'FIS' : 'VIR'}</button>
                                        <label className={`${regStyles.btnControl} ${regStyles.subrogandoLabel} ${input.subrogando ? regStyles.subrogandoActive : ''}`} title="SUBROGANDO">
                                            <input
                                                type="checkbox"
                                                checked={input.subrogando || false}
                                                onChange={(e) => handleInputChange(setDefensa, index, 'subrogando', e.target.checked)}
                                                style={{ display: 'none' }}
                                            />
                                            SUB
                                        </label>
                                        <button className={`${regStyles.btnControl} ${regStyles.btnCompact} ${regStyles.btnDelete}`} style={{ marginLeft: '4px' }} title="ELIMINAR" type="button" onClick={() => removeInput(setDefensa, index)}><DeleteSVGF /></button>
                                    </div>
                                    {(imputado && imputado.length > 0) && (
                                        <div className={regStyles.inputRowFlexible}>
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
                            <button className={`${regStyles.btnControl} ${regStyles.inputLeft100}`} type="button" onClick={() => addNewInput(setDefensa, { tipo: 'Oficial', nombre: '', imputado: [], asistencia: true, presencial: true, subrogando: false }, 'd')}>+ DEFENSA</button>
                            <div className={regStyles.inputRow} style={{ marginTop: '10px' }}>
                                <label className={`${regStyles.inputLeftNameDRow}`} style={{ width: 'auto', marginRight: '8px' }}>DEFENSORÍA:</label>
                                <input className={`${regStyles.inputLeft} ${regStyles.inputLeft100}`}
                                    value={defensoria || ''}
                                    onChange={(e) => setDefensoria(e.target.value)}
                                    placeholder="Defensoría"
                                />
                            </div>
                        </span>
                    )}

                    {/* SECCIÓN OTRAS PARTES */}
                    <div className={regStyles.sectionHeader} onClick={() => toggleSection('partes')} style={{ marginTop: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
                        <label className={`${regStyles.inputLeftNameDColumn}`}>Otras Partes</label>
                        <span className={`${regStyles.chevron} ${sectionsVisible.partes ? regStyles.chevronOpen : ''}`}>▼</span>
                    </div>
                    {sectionsVisible.partes && (
                        <span className={`${regStyles.inputLeftColumn}`}>
                            {partes.map((input, index) => {
                                const isQuerella = input.role && (input.role.toUpperCase() === 'QUERELLA' || input.role.toUpperCase() === 'QUERELLANTE');
                                return (
                                    <div key={input.id} style={{ marginBottom: '8px', borderBottom: '1px dashed var(--border)', paddingBottom: '6px' }}>
                                        <div className={regStyles.inputRow} style={{ marginBottom: '4px' }}>
                                            <input list='partesVarias'
                                                className={`${regStyles.inputLeft} ${regStyles.inputLeft50} ${regStyles.inputLeftSelect}`}
                                                value={input.role}
                                                onChange={(e) => handleInputChange(setPartes, index, 'role', e.target.value)}
                                                placeholder="Tipo" />
                                            <datalist id='partesVarias'>
                                                {desplegables.tiposPartes && desplegables.tiposPartes.map(tipoParte => (
                                                    <option key={tipoParte} value={tipoParte}>{tipoParte}</option>))}
                                            </datalist>
                                            {isQuerella ? (
                                                <>
                                                    <input list={`querella-particular-${index}`}
                                                        className={`${regStyles.inputLeft} ${regStyles.inputLeft50}`}
                                                        value={input.name}
                                                        onChange={(e) => handleInputChange(setPartes, index, 'name', e.target.value)}
                                                        placeholder="Nombre Abogado Querella"
                                                        onBlur={(e) => {
                                                            if (e.target.value && defensoresParticularesList && !defensoresParticularesList.includes(e.target.value)) {
                                                                alert("Por favor, selecciona un nombre de la lista.");
                                                                handleInputChange(setPartes, index, 'name', '');
                                                            }
                                                        }} />
                                                    <datalist id={`querella-particular-${index}`}>
                                                        {defensoresParticularesList && defensoresParticularesList.map(option => (
                                                            <option key={option} value={option}>{option}</option>
                                                        ))}
                                                    </datalist>
                                                </>
                                            ) : (
                                                <input className={`${regStyles.inputLeft} ${regStyles.inputLeft50}`} type="text" value={input.name} onChange={(e) => handleInputChange(setPartes, index, 'name', e.target.value)} placeholder="Nombre" />
                                            )}
                                        </div>
                                        <div className={regStyles.inputRow}>
                                            <input className={`${regStyles.inputLeft} ${regStyles.inputLeft50}`} type="text" value={input.dni} onChange={(e) => handleInputChange(setPartes, index, 'dni', e.target.value)} placeholder="DNI" />
                                            <button className={`${regStyles.btnControl} ${regStyles.btnCompact}`} title={input.asistencia ? 'PRESENTE' : 'AUSENTE'} type="button" onClick={() => handleInputChange(setPartes, index, 'asistencia', (!input.asistencia))}>{input.asistencia ? 'PRE' : 'AUS'}</button>
                                            <button className={`${regStyles.btnControl} ${regStyles.btnCompact}`} title={input.presencial ? 'PRESENCIAL' : 'VIRTUAL'} type="button" onClick={() => handleInputChange(setPartes, index, 'presencial', (!input.presencial))}>
                                                {input.presencial ? 'FIS' : 'VIR'}
                                            </button>
                                            <button className={`${regStyles.btnControl} ${regStyles.btnDelete} ${regStyles.deleteNarrow}`} type="button" onClick={() => removeParte(index)}><DeleteSVGF /></button>
                                        </div>
                                        {isQuerella && (
                                            <div className={regStyles.inputRowFlexible} style={{ marginTop: '4px' }}>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <RepresentationSelector
                                                        selectedItems={partes[index].representa}
                                                        availableItems={Array.isArray(partes) ? partes.filter(p => p.role && p.role.toUpperCase() === 'DENUNCIANTE') : []}
                                                        onUpdate={(newItems) => handleInputChange(setPartes, index, "representa", newItems)}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            <button className={`${regStyles.btnControl} ${regStyles.inputLeft100}`} type="button" onClick={() => addNewInput(setPartes, { role: '', name: '', dni: '', representa: [], asistencia: true, presencial: true }, 'p')}>+ PARTE</button>
                        </span>
                    )}
                </div>

                {/* Panel Derecho: Minuta Final */}
                <div className={regStyles.controlBlockRight} style={{ width: '60%', height: '100%', overflowY: 'auto', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                        <h3 style={{ margin: 0, color: 'var(--text)' }}>Minuta Final de Juicio — {consolidatedParties?.numeroLeg}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <p style={{ margin: 0, fontSize: '0.85em', color: 'var(--text2)' }}>
                                {selectedList.length} bloque{selectedList.length > 1 ? 's' : ''} seleccionado{selectedList.length > 1 ? 's' : ''}
                            </p>
                            <button type='button' className={`${styles.buttonDownloadFinal}`} onClick={handleDownload}>
                                DESCARGAR MINUTA FINAL
                            </button>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ color: 'var(--text2)', fontSize: '0.85em', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Cuerpo de la Minuta (todos los bloques)
                            </label>
                            <TextEditor textValue={editableBody} setTextValue={setEditableBody} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ color: 'var(--text2)', fontSize: '0.85em', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Resuelvo Final
                            </label>
                            <TextEditor textValue={editableResuelvo} setTextValue={setEditableResuelvo} />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}