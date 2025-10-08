import React, { createContext, useState } from "react";
import getDocument from "@/firebase new/firestore/getDocument";
import addOrUpdateDocument from "@/firebase new/firestore/addOrUpdateDocument";
import getListCollection from "@/firebase new/firestore/getListCollection";
import { todayFunction } from "@/utils/dateUtils";
import deleteDocumentAndObject from "@/firebase new/firestore/deleteDocumentAndObject";
import { updateDocumentAndObjectField } from "@/firebase new/firestore/updateDocumentAndObjectField";
import addStringToArray from "@/firebase new/firestore/addStringToArray";
import removeStringFromArray from "@/firebase new/firestore/removeStringFromArray";
import { removeObject } from "@/firebase new/firestore/removeObject";
import { addOrUpdateObject } from "@/firebase new/firestore/addOrUpdateObject";
import { countDocs } from "@/firebase new/firestore/countDocs";
import { pushItemToDocumentAndObjectField } from "@/firebase new/firestore/pushItemToDocumentAndObjectField";
import updateRealTimeFunction from "@/firebase/firestore/updateRealTimeFunction";
import { updateDocumentField } from "@/firebase new/firestore/updateDocumentField";
import addObjectToDocument from "@/firebase new/firestore/addObjectToDocument";

export const DataContext = createContext({});

const { Provider } = DataContext;

    export const DataContextProvider = ({ defaultValue = [], children }) => {
    const [today, setToday] = useState(defaultValue);
    const [todayView, setTodayView] = useState(defaultValue);
    const [errorMessage, setErrorMessage] = useState('');
    const [desplegables, setDesplegables] = useState(defaultValue);
    const [modelosMinuta, setModelosMinuta] = useState(defaultValue);
    const [bydate, setBydate] = useState(defaultValue);
    const [bydateView, setBydateView] = useState(defaultValue);
    const [byLegajo, setByLegajo] = useState(defaultValue);
    const [releaseNotes, setReleaseNotes] = useState(defaultValue);
    const [realTime, setRealTime] = useState(null)
    const [sorteoList, setSorteoList] = useState(defaultValue);

    const updateToday = async () =>{
        try {
        const data = await getListCollection('audiencias', todayFunction());
        setToday(data)
        } catch (error) {
            console.error("An error occurred during data loading:", error.message);
            setErrorMessage(`${error.message}`);
        }
    }
    const updateTodayView = async () =>{
        try {
        const data = await getDocument('audienciasView', todayFunction());
        setTodayView(data)
        } catch (error) {
            console.error("An error occurred during data loading:", error.message);
            setErrorMessage(`${error.message}`);
        }
    }
    const updateByDate = async (date) =>{
        try {
        const data = await getListCollection('audiencias', date);
        setBydate(data)
        } catch (error) {
            console.error("An error occurred during data loading:", error.message);
            setErrorMessage(`${error.message}`);
        }
    }
    const getByDate = async (date) =>{
        try {
        const data = await getListCollection('audiencias', date);
        return data
        } catch (error) {
            console.error("An error occurred during data loading:", error.message);
            setErrorMessage(`${error.message}`);
        }
    }
    const updateByDateView = async (date) =>{
        try {
        const data = await getDocument('audienciasView', date);
        setBydateView(data)
        } catch (error) {
            console.error("An error occurred during data loading:", error.message);
            setErrorMessage(`${error.message}`);
        }
    }
    const addAudiencia = async (data, date) => {
        try {
        await addOrUpdateDocument("audiencias", date, data);
        } catch (error) {
            console.error("Failed to add document:", error.message);
            setErrorMessage(`${error.message}`);
        }
    };
    const updateLegajosDatabase = async (data) => {
        try {
            await addOrUpdateObject("legajos", data.numeroLeg, data.id, data);
        } catch (error) {
            console.error("Failed to add document:", error.message);
            setErrorMessage(`${error.message}`);
        }
    }
    const updateByLegajo = async (date) =>{
        try {
            const data = await getDocument('audienciasView', date);
            setByLegajo(data)
        } catch (error) {
            console.error("An error occurred during data loading:", error.message);
            setErrorMessage(`${error.message}`);
        }
    }
    const addSorteo = async (data, date) =>{
        try {
        await addObjectToDocument("sorteo", date, data, time);
        } catch (error) {
            setErrorMessage(`${error.message}`);
        }
    }
    const getSorteoList = async (date) =>{
        try {
        const data = await getDocument('sorteos', date);
        setSorteoList(data)
        } catch (error) {
            setErrorMessage(`${error.message}`);
        }
    }
    const deleteAudiencia = async (date, audId) =>{
        try {
            await deleteDocumentAndObject(date, audId);
        } catch (error) {
            setErrorMessage(`${error.message}`);
        }
    }
    const updateData = async (date, audId, property, newValue) =>{
        try {
            await updateDocumentAndObjectField(date, audId, property, newValue)
        } catch (error) {
            setErrorMessage(`${error.message}`);
        }
    }
    const updateDataDeep = async (date, audId, property, newValue) =>{
        try {
            await updateDocumentField(date, audId, property, newValue)
        } catch (error) {
            setErrorMessage(`${error.message}`);
        }
    }
    const pushToAudienciaArray = async (date, audId, property, newValue) =>{
        try {
            await pushItemToDocumentAndObjectField(date, audId, property, newValue)
        } catch (error) {
            setErrorMessage(`${error.message}`);
        }
    }
    const addDesplegable = async (type, data) => {
        try{
            await addStringToArray("desplegables", "desplegables", type, data);
        } catch (error) {
            setErrorMessage(`${error.message}`)
        }
    };
    const deleteDesplegable = async (type, data) => {
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
        } catch (error) {
            setErrorMessage(`${error.message}`);
        }
    };
    const addOrUpdateModeloMinuta = async (name, data) =>{
        try{
            await addOrUpdateObject('desplegables', 'modelosMinuta', name, data)
        } catch (error) {
            setErrorMessage(`${error.message}`);
        }
    }
    const removeModeloMinuta = async (name) =>{
        try{
            await removeObject('desplegables', 'modelosMinuta', name)
        } catch (error) {
            removeObject(`${error.message}`);
        }
    }
    const updateModelosMinuta = async () =>{
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
    const moveBetween = async (date) =>{
        const data = await getList("audiencias", date);
        await data.forEach(el =>{
            addOrUpdateDocument("audiencias", date, el);
        })
        const amount = await countDocs('audiencias/'+date+'/audiencias')
    }
    const addReleaseNote = async (name, data) =>{
        try{
            await addOrUpdateObject('informacion', 'releaseNotes', name, data)
        } catch (error) {
            setErrorMessage(`${error.message}`);
        }
    }
    const updateReleaseNotes = async () =>{
        try {
        const data = await getDocument('informacion', 'releaseNotes');
        setReleaseNotes(data)
        } catch (error) {
            setErrorMessage(`${error.message}`);
        }
    }
    const updateRealTime = async () => {
        setRealTime(await updateRealTimeFunction());
    };
    const addUser = async (data) => {
        await addObjectToDocument("users", "listaUsuarios", data);
    };
    
    const context = {
        updateToday, updateTodayView, updateByDate, updateByDateView, addAudiencia, updateLegajosDatabase, addSorteo, getSorteoList, deleteAudiencia, updateData, 
        addDesplegable, deleteDesplegable, updateDesplegables, addOrUpdateModeloMinuta, removeModeloMinuta, updateModelosMinuta, updateByLegajo, moveBetween, addReleaseNote,
        updateReleaseNotes, getByDate, pushToAudienciaArray, updateRealTime, updateDataDeep, addUser,
        todayView, today, todayView, bydate, bydateView, errorMessage, sorteoList, desplegables, modelosMinuta, byLegajo, releaseNotes, realTime
    };
    return <Provider value={context}>{children}</Provider>;
};
