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
        }
    }
    const updateDataDeep = async (date, audId, property, newValue) => {
        try {
            await updateDocumentField(date, audId, property, newValue)
        } catch (error) {
            setErrorMessage(`${error.message}`);
        }
    }
    // Solo escribe en audiencias, NO sincroniza con audienciasView
    // Usar para: stopwatch, stopwatchStart, resuelvoText, minuta, cierre
    const updateDataOnly = async (date, audId, property, newValue) => {
        try {
            await updateDocumentOnly(date, audId, property, newValue)
        } catch (error) {
            setErrorMessage(`${error.message}`);
        }
    }
    const pushToAudienciaArray = async (date, audId, property, newValue) => {
        try {
            await pushItemToDocumentAndObjectField(date, audId, property, newValue)
        } catch (error) {
            setErrorMessage(`${error.message}`);
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
            });

            await addOrUpdateObject('informeUAL', date, 'audiencias', mergedAudiencias);
            setPumaData(mergedAudiencias);
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
        updateByDate, updateByDateView, addAudiencia, updateLegajosDatabase, addSorteo, getSorteoList, deleteAudiencia, updateData, addDesplegable, deleteDesplegables,
        updateDesplegables, addFeriado, deleteFeriado, updateFeriados, deleteImportantDate, updateImportantDates, addOrUpdateModeloMinuta, removeModeloMinuta, updateModelosMinuta, updateByLegajo, moveBetween, addReleaseNote, updateReleaseNotes, getByDate,
        pushToAudienciaArray, updateRealTime, updateDataDeep, addUser, addJuicio, updateJuicios, deleteJuicio, changeValueJuicio, saveImportantDatesList, updatePumaData, addPumaData, updateUALData, addUALData,
        updateSolicitudesCompletadas, updateSolicitudesData, addSolicitudData, addSolicitudCompletada,
        updateSolicitudesPendientes, removeSolicitudPendiente, updateDataOnly, changeStatusBlockJuicio,
        updateAbogados, addAbogado, updateAbogadoData, deleteAbogado, importAbogados,
        bydate, bydateView, errorMessage, sorteoList, desplegables, feriados, importantDates, modelosMinuta, byLegajo, releaseNotes, realTime, juiciosList, pumaData, UALData,
        solicitudesCompletadas, solicitudesData, solicitudesPendientes, abogados,
        fiscalesList, defensoresOficialesList, juecesList, defensoresParticularesList

    };
    return <Provider value={context}>{children}</Provider>;
};
