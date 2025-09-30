import React, { createContext, useState } from "react";
import getCollection from "@/firebase new/firestore/getCollection";
import addData from "@/firebase new/firestore/addData";
import removeFromArray from "@/firebase new/firestore/removeFromArray";
import removeData from "@/firebase new/firestore/removeData";
import getDocument from "@/firebase new/firestore/getDocument";
import checkDoc from "@/firebase new/firestore/checkDoc";
import addOrUpdateDocument from "@/firebase new/firestore/addOrUpdateDocument";
import pushToHitos from "@/firebase new/firestore/pushToHitos";
import updateListItem from "@/firebase new/firestore/updateListItem";
import getList from "@/firebase new/firestore/getList";
import addStringToList from "@/firebase new/firestore/addStringToList";
import { todayFunction } from "@/utils/dateUtils";
import updateRealTimeFunction from "@/firebase new/firestore/updateRealTimeFunction";
import updateDocumentListener from "@/firebase new/firestore/updateDocumentListener";
import removeStringFromList from "@/firebase new/firestore/removeStringFromList";
import getDocumentGeneral from "@/firebase new/firestore/getDocumentGeneral";
import oldAddOrUpdateDocument from "@/firebase new/firestore/oldAddOrUpdateDocument";
import deleteDocumentAndObject from "@/firebase new/firestore/deleteDocumentAndObject";

export const DataContext = createContext({});

const { Provider } = DataContext;

export const DataContextProvider = ({ defaultValue = [], children }) => {
    const [today, setToday] = useState(defaultValue);
    const [errorMessage, setErrorMessage] = useState('')
    const [dateToUse, setDateToUse] = useState("");
    const [desplegables, setDesplegables] = useState(defaultValue);
    const [modelosMinuta, setModelosMinuta] = useState(defaultValue);
    const [realTime, setRealTime] = useState(null);
    const [años, setAños] = useState(defaultValue);
    const [jueces, setJueces] = useState(defaultValue);
    const [bydate, setBydate] = useState(defaultValue);
    const [byLegajo, setByLegajo] = useState(defaultValue);
    const [informacion, setInformacion] = useState(defaultValue);
    const [userType, setUsertype] = useState("");
    const [sorteoList, setSorteoList] = useState([]);

    const updateToday = async () =>{
        try {
        const data = await getList(collectionName, todayFunction);
        setToday(data)
        } catch (error) {
            console.error("An error occurred during data loading:", error.message);
            setErrorMessage(`${error.message}`);
        }
    }
    const updateByDate = async (date) =>{
        try {
        const data = await getList(collectionName, date);
        setBydate(data)
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
    const addSorteo = async (data) =>{ //revisar esto, que guarde todo en un mismo documento y no un nuevo documento por sorteo, innecesario
        try {
        await addOrUpdateDocument("sorteo", date, data);
        } catch (error) {
            console.error("Failed to add sorteo:", error.message);
            setErrorMessage(`${error.message}`);
        }
    }
    const deleteAudiencia = async (date, audId) =>{
        try {
        await deleteDocumentAndObject(date, audId);
        } catch (error) {
            console.error("Failed to delete audiencia:", error.message);
            setErrorMessage(`${error.message}`);
        }
    }
    const context = {
        updateToday,
        updateByDate,
        addAudiencia,
        updateLegajosDatabase,
        addSorteo,
        deleteAudiencia,
        addInfo,
        deleteInfo,
        updateJueces,
        updateAños,
        updateData,
        updateDataToday,
        pushtToArray,
        addUser,
        checkUserType,
        updateRealTime,
        updateDesplegables,
        updateModelosMinuta,
        addDesplegable,
        setDateToUse,
        updateByDateListener,
        deleteDesplegable,
        getByDate,
        updateByDateSorteo,
        updateByLegajo,
        modelosMinuta,
        dateToUse,
        desplegables,
        realTime,
        userType,
        años,
        today,
        bydate,
        byLegajo,
        informacion,
        jueces,
        sorteoList,
    };
    return <Provider value={context}>{children}</Provider>;
};
