import React, { createContext, useState } from "react";
import getCollection from "@/firebase new/firestore/getCollection";
import addData from "@/firebase new/firestore/addData";
import removeData from "@/firebase new/firestore/removeData";
import getDocument from "@/firebase new/firestore/getDocument";
import checkDoc from "@/firebase new/firestore/checkDoc";
import addOrUpdateDocument from "@/firebase new/firestore/addOrUpdateDocument";
import pushToHitos from "@/firebase new/firestore/pushToHitos";
import updateListItem from "@/firebase new/firestore/updateListItem";
import getListCollection from "@/firebase new/firestore/getListCollection";
import addStringToList from "@/firebase new/firestore/addStringToArray";
import { todayFunction } from "@/utils/dateUtils";
import updateRealTimeFunction from "@/firebase new/firestore/updateRealTimeFunction";
import updateDocumentListener from "@/firebase new/firestore/updateDocumentListener";
import getDocumentGeneral from "@/firebase new/firestore/getDocumentGeneral";
import oldAddOrUpdateDocument from "@/firebase new/firestore/oldAddOrUpdateDocument";
import deleteDocumentAndObject from "@/firebase new/firestore/deleteDocumentAndObject";
import addSorteoFirebase from "@/firebase new/firestore/addSorteoFirebase";
import { updateDocumentAndObjectField } from "@/firebase new/firestore/updateDocumentAndObjectField";
import addStringToArray from "@/firebase new/firestore/addStringToArray";
import removeStringFromArray from "@/firebase new/firestore/removeStringFromArray";

export const DataContext = createContext({});

const { Provider } = DataContext;

export const DataContextProvider = ({ defaultValue = [], children }) => {
    const [today, setToday] = useState(defaultValue);
    const [todayView, setTodayView] = useState(defaultValue);
    const [errorMessage, setErrorMessage] = useState('')
    const [dateToUse, setDateToUse] = useState("");
    const [desplegables, setDesplegables] = useState(defaultValue);
    const [modelosMinuta, setModelosMinuta] = useState(defaultValue);
    const [realTime, setRealTime] = useState(null);
    const [bydate, setBydate] = useState(defaultValue);
    const [bydateView, setBydateView] = useState(defaultValue);
    const [byLegajo, setByLegajo] = useState(defaultValue);
    const [informacion, setInformacion] = useState(defaultValue);
    const [userType, setUsertype] = useState("");
    const [sorteoList, setSorteoList] = useState([]);

    const updateToday = async () =>{
        try {
        const data = await getListCollection('audiencias', todayFunction);
        setToday(data)
        } catch (error) {
            console.error("An error occurred during data loading:", error.message);
            setErrorMessage(`${error.message}`);
        }
    }
    const updateTodayView = async () =>{
        try {
        const data = await getDocument('audienciasView', todayFunction);
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
            await addOrUpdateDocument("legajos", data.numeroLeg, data);
        } catch (error) {
            console.error("Failed to add document:", error.message);
            setErrorMessage(`${error.message}`);
        }
    }
    const addSorteo = async (data, date) =>{
        try {
        await addSorteoFirebase("sorteo", date, data);
        } catch (error) {
            setErrorMessage(`${error.message}`);
        }
    }
    const getSorteoList = async (date) =>{
        try {
        const data = await getDocument('sorteos', date);
        setSorteoList(data)
        } catch (error) {
            console.error("An error occurred during data loading:", error.message);
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
            console.error("An error occurred during data loading:", error.message);
            setErrorMessage(`${error.message}`);
        }
    };
    const addModeloMinuta = async () =>{

    }
    const removeModeloMinuta = async () =>{

    }
    const updateModelosMinuta = async () =>{
        
    }

    const context = {
        updateToday, updateTodayView, updateByDate, updateByDateView, addAudiencia, updateLegajosDatabase, addSorteo, getSorteoList, deleteAudiencia, updateData, 
        addDesplegable, deleteDesplegable, updateDesplegables,
        todayView, today, todayView, bydate, bydateView, errorMessage, sorteoList, desplegables
    };
    return <Provider value={context}>{children}</Provider>;
};
