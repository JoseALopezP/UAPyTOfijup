import React, { createContext, useState } from "react";
import getDocument from "@/firebase new/firestore/getDocument";
import addOrUpdateDocument from "@/firebase new/firestore/addOrUpdateDocument";
import getListCollection from "@/firebase new/firestore/getListCollection";
import deleteDocumentAndObject from "@/firebase new/firestore/deleteDocumentAndObject";
import { updateDocumentAndObjectField } from "@/firebase new/firestore/updateDocumentAndObjectField";
import addStringToArray from "@/firebase new/firestore/addStringToArray";
import removeStringFromArray from "@/firebase new/firestore/removeStringFromArray";
import { removeObject } from "@/firebase new/firestore/removeObject";
import { addOrUpdateObject } from "@/firebase new/firestore/addOrUpdateObject";
import { countDocs } from "@/firebase new/firestore/countDocs";
import { pushItemToDocumentAndObjectField } from "@/firebase new/firestore/pushItemToDocumentAndObjectField";
import updateRealTimeFunction from "@/firebase new/firestore/updateRealTimeFunction";
import { updateDocumentField } from "@/firebase new/firestore/updateDocumentField";
import addObjectToDocument from "@/firebase new/firestore/addObjectToDocument";
import { yearFunction } from "@/utils/dateUtils";
import { updateInternalFieldJuicio } from "@/firebase new/firestore/updateInternalFieldJuicio";
import replaceDocument from "@/firebase new/firestore/replaceDocument";
import { updateInternalUALData } from "@/firebase new/firestore/updateInternalUALData";
import { updateJuicioBlockStatus } from "@/firebase new/firestore/updateJuicioBlockStatus";
import { updateDocumentOnly } from "@/firebase new/firestore/updateDocumentOnly";
import getCollection from "@/firebase new/firestore/getCollection";
import { setDocument, deleteDocument } from "@/firebase new/firestore/basicDocs";
import { batchWrite } from "@/firebase new/firestore/batchWrite";


export const DataContext = createContext({});

const { Provider } = DataContext;

export const DataContextProvider = ({ defaultValue = [], children }) => {
    const [errorMessage, setErrorMessage] = useState('');
    const [desplegables, setDesplegables] = useState(defaultValue);
    const [feriados, setFeriados] = useState(defaultValue);
    const [importantDates, setImportantDates] = useState(defaultValue);
    const [modelosMinuta, setModelosMinuta] = useState(defaultValue);
    const [bydate, setBydate] = useState(defaultValue);
    const [bydateView, setBydateView] = useState(defaultValue);
    const [byLegajo, setByLegajo] = useState(defaultValue);
    const [releaseNotes, setReleaseNotes] = useState(defaultValue);
    const [realTime, setRealTime] = useState(null)
    const [juiciosList, setJuiciosList] = useState(defaultValue)
    const [sorteoList, setSorteoList] = useState(defaultValue);
    const [pumaData, setPumaData] = useState(defaultValue);
    const [UALData, setUALData] = useState(defaultValue);
    const [solicitudesCompletadas, setSolicitudesCompletadas] = useState(defaultValue);
    const [solicitudesData, setSolicitudesData] = useState(defaultValue);
    const [solicitudesPendientes, setSolicitudesPendientes] = useState(defaultValue);
    const [abogados, setAbogados] = useState(defaultValue);

    const fiscalesList = React.useMemo(() => {
        if (!abogados || !Array.isArray(abogados)) return [];
        return abogados
            .filter(a => a.c && a.c.toLowerCase().includes('fiscal'))
            .map(a => a.n)
            .sort((a, b) => a.localeCompare(b));
    }, [abogados]);

    const defensoresOficialesList = React.useMemo(() => {
        if (!abogados || !Array.isArray(abogados)) return [];
        return abogados
            .filter(a => a.c && a.c.toLowerCase().includes('defens') && a.c.toLowerCase().includes('oficial'))
            .map(a => a.n)
            .sort((a, b) => a.localeCompare(b));
    }, [abogados]);

    const juecesList = React.useMemo(() => {
        if (!abogados || !Array.isArray(abogados)) return [];
        return abogados
            .filter(a => a.c && a.c.toLowerCase().includes('juez'))
            .map(a => a.n)
            .sort((a, b) => a.localeCompare(b));
    }, [abogados]);

    const defensoresParticularesList = React.useMemo(() => {
        if (!abogados || !Array.isArray(abogados)) return [];
        return abogados
            .filter(a => !a.c || (!a.c.toLowerCase().includes('fiscal') && !a.c.toLowerCase().includes('juez') && !a.c.toLowerCase().includes('oficial')))
            .map(a => `${a.n} (#${a.m})`)
            .sort((a, b) => a.localeCompare(b));
    }, [abogados]);

    const updateByDate = async (date) => {
        if (!date) return;
        try {
            const data = await getListCollection('audiencias', date, 'audiencias');
            setBydate(data)
        } catch (error) {
            console.error("An error occurred during data loading:", error.message);
            setErrorMessage(`${error.message}`);
        }
    }
    const getByDate = async (date) => {
        if (!date) return [];
        try {
            const data = await getListCollection('audiencias', date, 'audiencias');
            return data
        } catch (error) {
            console.error("An error occurred during data loading:", error.message);
            setErrorMessage(`${error.message}`);
        }
    }
    const updateByDateView = async (date) => {
        if (!date) return;
        try {
            const data = await getDocument('audienciasView', date);
            setBydateView(data)
        } catch (error) {
            console.error("An error occurred during data loading:", error.message);
            setErrorMessage(`${error.message}`);
        }
    }
    const addAudiencia = async (data, date, customId = null) => {
        try {
            await addOrUpdateDocument("audiencias", date, 'audiencias', data, customId);
        } catch (error) {
            console.error("Failed to add document:", error.message);
            setErrorMessage(`${error.message}`);
            throw error;
        }
    };
    const addJuicio = async (data, date) => {
        const dateTransform = yearFunction(date)
        try {
            await addOrUpdateObject("juicios", dateTransform, data.id, data);
        } catch (error) {
            console.error("Failed to add object:", error.message);
            setErrorMessage(`${error.message}`);
        }
    }
    const updateJuicios = async (date) => {
        if (!date) return;
        const dateTransform = yearFunction(date)
        try {
            const data = await getDocument('juicios', dateTransform);
            if (data) {
                setJuiciosList(Object.values(data))
            } else {
                setJuiciosList([])
            }
        } catch (error) {
            console.error("An error occurred during data loading:", error.message);
            setErrorMessage(`${error.message}`);
        }
    }
    const changeValueJuicio = async (date, juicioId, field, value) => {
        const dateTransform = yearFunction(date)
        try {
            await updateInternalFieldJuicio(dateTransform, juicioId, field, value);
        } catch (error) {
            console.error("An error occurred during data loading:", error.message);
            setErrorMessage(`${error.message}`);
        }
    }
    const changeStatusBlockJuicio = async (year, juicioId, audId, newStatus) => {
        try {
            await updateJuicioBlockStatus(year, juicioId, audId, newStatus);
        } catch (error) {
            console.error("An error occurred during status update:", error.message);
            setErrorMessage(`${error.message}`);
            throw error;
        }
    }
    const deleteJuicio = async (date, juicioId) => {
        const dateTransform = yearFunction(date)
        try {
            await removeObject("juicios", dateTransform, juicioId);
            await updateJuicios(dateTransform);
        } catch (error) {
            console.error("Failed to delete object:", error.message);
            setErrorMessage(`${error.message}`);
        }
    }
    const updateLegajosDatabase = async (data) => {
        try {
            await addOrUpdateObject("legajos", data.numeroLeg, data.id, data);
        } catch (error) {
            console.error("Failed to add document:", error.message);
            setErrorMessage(`${error.message}`);
        }
    }
    const updateByLegajo = async (legajo) => {
        try {
            const data = await getDocument('legajos', legajo);
            setByLegajo(data)
        } catch (error) {
            console.error("An error occurred during data loading:", error.message);
            setErrorMessage(`${error.message}`);
        }
    }
    const saveAudienciaDebate = async (aud) => {
        try {
            const legajoDoc = await getDocument('legajos', aud.numeroLeg);
            let audiencias = legajoDoc?.audiencias || [];
            const index = audiencias.findIndex(a => a.id === aud.id);
            if (index !== -1) {
                audiencias[index] = aud;
            } else {
                audiencias.push(aud);
            }
            await addOrUpdateObject("legajos", aud.numeroLeg, "audiencias", audiencias);
        } catch (error) {
            console.error("Failed to save audiencia debate:", error.message);
            setErrorMessage(`${error.message}`);
            throw error;
        }
    }
    const addSorteo = async (data, date) => {
        try {
            await addOrUpdateObject("sorteos", date, data.title, data);
        } catch (error) {
            setErrorMessage(`${error.message}`);
        }
    }
    const getSorteoList = async (date) => {
        if (!date) return;
        try {
            const data = await getDocument('sorteos', date);
            if (data) {
                setSorteoList(Object.values(data));
            } else {
                setSorteoList([]);
            }
        } catch (error) {
            setErrorMessage(`${error.message}`);
        }
    }
    const deleteAudiencia = async (date, audId) => {
        try {
            await deleteDocumentAndObject(date, audId);
        } catch (error) {
            setErrorMessage(`${error.message}`);
        }
    }
    const updateData = async (date, audId, property, newValue) => {
        try {
            await updateDocumentAndObjectField(date, audId, property, newValue)
        } catch (error) {
            setErrorMessage(`${error.message}`);
            throw error;
        }
    }
    const updateDataDeep = async (date, audId, property, newValue) => {
        try {
            await updateDocumentField(date, audId, property, newValue)
        } catch (error) {
            setErrorMessage(`${error.message}`);
            throw error;
        }
    }
    // Solo escribe en audiencias, NO sincroniza con audienciasView
    // Usar para: stopwatch, stopwatchStart, resuelvoText, minuta, cierre
    const updateDataOnly = async (date, audId, property, newValue) => {
        try {
            await updateDocumentOnly(date, audId, property, newValue)
        } catch (error) {
            setErrorMessage(`${error.message}`);
            throw error;
        }
    }
    const pushToAudienciaArray = async (date, audId, property, newValue) => {
        try {
            await pushItemToDocumentAndObjectField(date, audId, property, newValue)
        } catch (error) {
            setErrorMessage(`${error.message}`);
            throw error;
        }
    }
    const addDesplegable = async (type, data) => {
        try {
            await addStringToArray("desplegables", "desplegables", type, data);
        } catch (error) {
            setErrorMessage(`${error.message}`)
        }
    };
    const deleteDesplegables = async (type, data) => {
        await removeStringFromArray("desplegables", "desplegables", type, data);
    };
    const updateDesplegables = async () => {
        try {
            const data = await getDocument('desplegables', 'desplegables');
            if (data) {
                setDesplegables(data);
            } else {
                setDesplegables({});
            }
            const abgData = await getDocument('abogados', 'listaAbogados');
            if (abgData && abgData.list) {
                setAbogados(abgData.list);
            }
        } catch (error) {
            setErrorMessage(`${error.message}`);
        }
    };
    const addFeriado = async (type, data) => {
        try {
            await addStringToArray("desplegables", "feriados", type, data);
        } catch (error) {
            setErrorMessage(`${error.message}`)
        }
    };
    const deleteFeriado = async (type, data) => {
        await removeStringFromArray("desplegables", "feriados", type, data);
    };
    const updateFeriados = async () => {
        try {
            const data = await getDocument('desplegables', 'feriados');
            if (data) {
                setFeriados(data);
            } else {
                setFeriados({});
            }
        } catch (error) {
            setErrorMessage(`${error.message}`);
        }
    };
    const deleteImportantDate = async (type, data) => {
        await removeStringFromArray("informacion", "importantDates", type, data);
    };
    const updateImportantDates = async () => {
        try {
            const data = await getDocument('informacion', 'importantDates');
            if (data) {
                setImportantDates(data);
            } else {
                setImportantDates([]);
            }
        } catch (error) {
            setErrorMessage(`${error.message}`);
        }
    };
    const saveImportantDatesList = async (data) => {
        try {
            await replaceDocument("informacion", "importantDates", data);
            setImportantDates(data);
        } catch (error) {
            setErrorMessage(`${error.message}`);
        }
    };
    const addOrUpdateModeloMinuta = async (name, data) => {
        try {
            await addOrUpdateObject('desplegables', 'modelosMinuta', name, data)
        } catch (error) {
            setErrorMessage(`${error.message}`);
        }
    }
    const removeModeloMinuta = async (name) => {
        try {
            await removeObject('desplegables', 'modelosMinuta', name)
        } catch (error) {
            setErrorMessage(`${error.message}`);
        }
    }
    const updateModelosMinuta = async () => {
        try {
            const data = await getDocument('desplegables', 'modelosMinuta');
            if (data) {
                setModelosMinuta(data);
            } else {
                setModelosMinuta({});
            }
        } catch (error) {
            setErrorMessage(`${error.message}`);
        }
    }
    const moveBetween = async (date) => {
        if (!date) return;
        try {
            const data = await getListCollection("audiencias", date, 'audiencias');
            await data.forEach(el => {
                addOrUpdateDocument("audiencias", date, 'audiencias', el);
            })
            const amount = await countDocs('audiencias/' + date + '/audiencias')
        } catch (error) {
            console.error("Error in moveBetween:", error);
        }
    }
    const addReleaseNote = async (name, data) => {
        try {
            await addOrUpdateObject('informacion', 'releaseNotes', name, data)
        } catch (error) {
            setErrorMessage(`${error.message}`);
        }
    }
    const updateReleaseNotes = async () => {
        try {
            const data = await getDocument('informacion', 'releaseNotes');
            setReleaseNotes(data)
        } catch (error) {
            setErrorMessage(`${error.message}`);
        }
    }
    const updatePumaData = async (date) => {
        if (!date) return;
        try {
            const data = await getDocument('informeUAL', date);
            if (data) {
                setPumaData(data.audiencias || [])
            } else {
                setPumaData([])
            }
        } catch (error) {
            setErrorMessage(`${error.message}`);
        }
    }
    const addPumaData = async (date, newScrapedData) => {
        if (!date) return;
        try {
            const docData = await getDocument('informeUAL', date);
            const existingAudiencias = docData?.audiencias || [];

            const mergedAudiencias = [...existingAudiencias];

            const ualDocData = await getDocument('informeUALData', date);
            const updatedUalDataObj = ualDocData?.audiencias || {};
            let ualDataChanged = false;

            newScrapedData.forEach(newAud => {
                const index = mergedAudiencias.findIndex(oldAud => 
                    oldAud.numeroLeg === newAud.numeroLeg && 
                    oldAud.inicioProgramada === newAud.inicioProgramada
                );

                if (index !== -1) {
                    mergedAudiencias[index] = { ...mergedAudiencias[index], ...newAud };
                } else {
                    mergedAudiencias.push(newAud);
                }

                const rowKey = `${newAud.numeroLeg}_${newAud.inicioProgramada}`;
                const savedData = updatedUalDataObj[rowKey] || {};
                let changesMade = false;
                const dataToSave = { ...savedData };

                if (!savedData.legajo && newAud.numeroLeg) { dataToSave.legajo = newAud.numeroLeg; changesMade = true; }
                
                const audTipoExtracted = newAud.tipo ? (newAud.tipo + (newAud.tipo2 ? ' ' + newAud.tipo2 : '') + (newAud.tipo3 ? ' ' + newAud.tipo3 : '')) : '';
                if (!savedData.audTipo && audTipoExtracted) { dataToSave.audTipo = audTipoExtracted; changesMade = true; }

                if (!savedData.dyhsolicitud && newAud.dyhsolicitud) { dataToSave.dyhsolicitud = newAud.dyhsolicitud; changesMade = true; }
                if (!savedData.dyhagendamiento && newAud.dyhagendamiento) { dataToSave.dyhagendamiento = newAud.dyhagendamiento; changesMade = true; }
                if (!savedData.dyhnotificacion && newAud.fechaNotificacion) { dataToSave.dyhnotificacion = newAud.fechaNotificacion; changesMade = true; }
                
                const formattedDate = date.slice(0, 2) + '/' + date.slice(2, 4) + '/' + date.slice(6, 8);
                if (!savedData.dyhprogramada && newAud.inicioProgramada) { dataToSave.dyhprogramada = formattedDate + ' ' + newAud.inicioProgramada; changesMade = true; }
                if (!savedData.dyhreal && newAud.inicioReal) { dataToSave.dyhreal = formattedDate + ' ' + newAud.inicioReal; changesMade = true; }
                
                if ((savedData.demora === undefined || savedData.demora === '') && newAud.inicioReal && newAud.inicioProgramada) {
                    const dem = (parseInt(newAud.inicioReal.split(':')[0]) * 60 + parseInt(newAud.inicioReal.split(':')[1])) - (parseInt(newAud.inicioProgramada.split(':')[0]) * 60 + parseInt(newAud.inicioProgramada.split(':')[1]));
                    dataToSave.demora = dem; changesMade = true;
                }
                
                if ((savedData.duracionProgramada === undefined || savedData.duracionProgramada === '') && newAud.inicioProgramada && newAud.finProgramada) {
                    const durP = (parseInt(newAud.finProgramada.split(':')[0]) * 60 + parseInt(newAud.finProgramada.split(':')[1])) - (parseInt(newAud.inicioProgramada.split(':')[0]) * 60 + parseInt(newAud.inicioProgramada.split(':')[1]));
                    dataToSave.duracionProgramada = durP; changesMade = true;
                }
                
                if ((savedData.durReal === undefined || savedData.durReal === '') && newAud.finReal && newAud.inicioReal) {
                    const durR = (parseInt(newAud.finReal.split(':')[0]) * 60 + parseInt(newAud.finReal.split(':')[1])) - (parseInt(newAud.inicioReal.split(':')[0]) * 60 + parseInt(newAud.inicioReal.split(':')[1]));
                    dataToSave.durReal = durR; changesMade = true;
                }
                
                if (!savedData.dyhfinalizacion && newAud.finReal) { dataToSave.dyhfinalizacion = formattedDate + ' ' + newAud.finReal; changesMade = true; }
                if (!savedData.finalizadaMinuta && newAud.finalizadaMinuta) { dataToSave.finalizadaMinuta = newAud.finalizadaMinuta.split(' ')[1]; changesMade = true; }
                
                if ((savedData.cantImputados === undefined || savedData.cantImputados === '') && newAud.intervinientes) {
                    const cImp = newAud.intervinientes.filter(el2 => el2.includes('IMPUTADO')).length;
                    dataToSave.cantImputados = cImp; changesMade = true;
                }

                if (!savedData.sala && newAud.sala) { dataToSave.sala = newAud.sala; changesMade = true; }
                if (!savedData.operador && newAud.operador) { dataToSave.operador = newAud.operador; changesMade = true; }
                if (!savedData.finAudiencia && newAud.finAudiencia) { dataToSave.finAudiencia = newAud.finAudiencia; changesMade = true; }

                if (changesMade) {
                    dataToSave.numeroLeg = newAud.numeroLeg;
                    dataToSave.inicioProgramada = newAud.inicioProgramada;
                    updatedUalDataObj[rowKey] = dataToSave;
                    ualDataChanged = true;
                }
            });

            await addOrUpdateObject('informeUAL', date, 'audiencias', mergedAudiencias);
            setPumaData(mergedAudiencias);

            if (ualDataChanged) {
                const updatePromises = [];
                for (const rowKey in updatedUalDataObj) {
                    updatePromises.push(updateInternalUALData(date, rowKey, updatedUalDataObj[rowKey]));
                }
                await Promise.all(updatePromises);
                setUALData(Object.values(updatedUalDataObj));
            }
        } catch (error) {
            setErrorMessage(`${error.message}`);
        }
    }
    const updateUALData = async (date) => {
        if (!date) return;
        try {
            const data = await getDocument('informeUALData', date);
            if (data && data.audiencias) {
                setUALData(Object.values(data.audiencias))
            } else {
                setUALData([])
            }
        } catch (error) {
            setErrorMessage(`${error.message}`);
        }
    }
    const addUALData = async (date, rowKey, data) => {
        if (!date) return;
        try {
            await updateInternalUALData(date, rowKey, data);
            setUALData(prev => {
                const newData = [...prev];
                const index = newData.findIndex(item =>
                    item.numeroLeg === data.numeroLeg &&
                    item.inicioProgramada === data.inicioProgramada
                );
                if (index !== -1) {
                    newData[index] = data;
                } else {
                    newData.push(data);
                }
                return newData;
            });
        } catch (error) {
            setErrorMessage(`${error.message}`);
        }
    }
    const updateRealTime = async () => {
        setRealTime(await updateRealTimeFunction());
    };
    const updateSolicitudesCompletadas = async () => {
        try {
            const data = await getDocument('solicitudes', 'completadas');
            if (data) {
                setSolicitudesCompletadas(Object.values(data));
            } else {
                setSolicitudesCompletadas([]);
            }
        } catch (error) {
            setErrorMessage(`${error.message}`);
        }
    };
    const updateSolicitudesData = async () => {
        try {
            const data = await getDocument('solicitudesData', 'solicitudes');
            if (data) {
                setSolicitudesData(Object.values(data));
            } else {
                setSolicitudesData([]);
            }
        } catch (error) {
            setErrorMessage(`${error.message}`);
        }
    };
    const updateSolicitudesPendientes = async () => {
        try {
            const data = await getDocument('solicitudes', 'pendientes');
            if (data) {
                setSolicitudesPendientes(Object.entries(data).map(([key, val]) => ({ ...val, rowKey: key })));
            } else {
                setSolicitudesPendientes([]);
            }
        } catch (error) {
            setErrorMessage(`${error.message}`);
        }
    };
    const addSolicitudData = async (rowKey, data) => {
        try {
            await addOrUpdateObject('solicitudes', 'pendientes', rowKey, data);
            setSolicitudesPendientes(prev => {
                const newData = Array.isArray(prev) ? [...prev] : [];
                const index = newData.findIndex(item => item.rowKey === rowKey);
                if (index !== -1) {
                    newData[index] = { ...newData[index], ...data, rowKey };
                } else {
                    newData.push({ ...data, rowKey });
                }
                return newData;
            });
        } catch (error) {
            setErrorMessage(`${error.message}`);
        }
    };
    const removeSolicitudPendiente = async (rowKey) => {
        try {
            await removeObject('solicitudes', 'pendientes', rowKey);
            setSolicitudesPendientes(prev =>
                Array.isArray(prev) ? prev.filter(item => item.rowKey !== rowKey) : []
            );
        } catch (error) {
            setErrorMessage(`${error.message}`);
        }
    };
    const addSolicitudCompletada = async (rowKey, data) => {
        try {
            await addOrUpdateObject('solicitudes', 'completadas', rowKey, data);
            setSolicitudesCompletadas(prev => {
                const newData = Array.isArray(prev) ? [...prev] : [];
                const index = newData.findIndex(item => item.numeroLeg === data.numeroLeg && item.linkSol === data.linkSol);
                if (index !== -1) {
                    newData[index] = data;
                } else {
                    newData.unshift(data);
                }
                return newData;
            });
        } catch (error) {
            setErrorMessage(`${error.message}`);
        }
    };

    const archiveOldSolicitudes = async (pendientesList) => {
        const now = new Date();
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        
        // Función para parsear DD/MM/YYYY
        const parseDate = (dateStr) => {
            if (!dateStr) return null;
            const parts = dateStr.split('/');
            if (parts.length === 3) {
                return new Date(parts[2], parts[1] - 1, parts[0]);
            }
            return null;
        };

        let archivedCount = 0;

        for (const solicitud of pendientesList) {
            if (solicitud.fechaAudiencia) {
                const fAud = parseDate(solicitud.fechaAudiencia);
                if (fAud && fAud < oneWeekAgo) {
                    try {
                        const numeroLeg = solicitud.numeroLeg || 'LEGAJO_DESCONOCIDO';
                        const idSolicitud = solicitud.rowKey || (solicitud.linkSol ? solicitud.linkSol.replace(/[^a-zA-Z0-9]/g, '_') : `${numeroLeg}_${solicitud.fyhcreacion}`);
                        
                        // Guardar en legacy
                        await addOrUpdateObject('solicitudesLegacy', numeroLeg, idSolicitud, solicitud);
                        // Remover de pendientes
                        await removeObject('solicitudes', 'pendientes', solicitud.rowKey);
                        archivedCount++;
                    } catch (error) {
                        console.error("Error archivando solicitud:", error);
                    }
                }
            }
        }
        
        if (archivedCount > 0) {
            updateSolicitudesPendientes();
        }
        return archivedCount;
    };

    const addUser = async (data) => {
        await addObjectToDocument("users", "listaUsuarios", data);
    };

    const updateAbogados = async () => {
        try {
            const data = await getDocument('abogados', 'listaAbogados');
            if (data && data.list) {
                setAbogados(data.list);
            } else {
                setAbogados([]);
            }
        } catch (error) {
            setErrorMessage(`${error.message}`);
        }
    };

    const saveAbogadosList = async (newList) => {
        try {
            await replaceDocument('abogados', 'listaAbogados', { list: newList });
            setAbogados(newList);
        } catch (error) {
            setErrorMessage(`${error.message}`);
        }
    };

    const addAbogado = async (newLawyer) => {
        const newList = [newLawyer, ...abogados];
        await saveAbogadosList(newList);
    };

    const updateAbogadoData = async (updatedLawyer) => {
        const newList = abogados.map(a => 
            (a.m === updatedLawyer.m) ? updatedLawyer : a
        );
        await saveAbogadosList(newList);
    };

    const deleteAbogado = async (nroMatricula) => {
        const newList = abogados.filter(a => a.m !== nroMatricula);
        await saveAbogadosList(newList);
    };

    const importAbogados = async (dataList) => {
        await saveAbogadosList(dataList);
    };



    const context = {
        updateByDate, updateByDateView, addAudiencia, updateLegajosDatabase, saveAudienciaDebate, addSorteo, getSorteoList, deleteAudiencia, updateData, addDesplegable, deleteDesplegables,
        updateDesplegables, addFeriado, deleteFeriado, updateFeriados, deleteImportantDate, updateImportantDates, addOrUpdateModeloMinuta, removeModeloMinuta, updateModelosMinuta, updateByLegajo, moveBetween, addReleaseNote, updateReleaseNotes, getByDate,
        pushToAudienciaArray, updateRealTime, updateDataDeep, addUser, addJuicio, updateJuicios, deleteJuicio, changeValueJuicio, saveImportantDatesList, updatePumaData, addPumaData, updateUALData, addUALData,
        updateSolicitudesCompletadas, updateSolicitudesData, addSolicitudData, addSolicitudCompletada, archiveOldSolicitudes,
        updateSolicitudesPendientes, removeSolicitudPendiente, updateDataOnly, changeStatusBlockJuicio,
        updateAbogados, addAbogado, updateAbogadoData, deleteAbogado, importAbogados,
        bydate, bydateView, errorMessage, sorteoList, desplegables, feriados, importantDates, modelosMinuta, byLegajo, releaseNotes, realTime, juiciosList, pumaData, UALData,
        solicitudesCompletadas, solicitudesData, solicitudesPendientes, abogados,
        fiscalesList, defensoresOficialesList, juecesList, defensoresParticularesList

    };
    return <Provider value={context}>{children}</Provider>;
};
