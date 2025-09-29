import React, { createContext, useState } from "react";
import getCollection from "@/firebase/firestore/getCollection";
import addData from "@/firebase/firestore/addData";
import removeFromArray from "@/firebase/firestore/removeFromArray";
import removeData from "@/firebase/firestore/removeData";
import getDocument from "@/firebase/firestore/getDocument";
import checkDoc from "@/firebase/firestore/checkDoc";
import addOrUpdateDocument from "@/firebase/firestore/addOrUpdateDocument";
import pushToHitos from "@/firebase/firestore/pushToHitos";
import updateListItem from "@/firebase/firestore/updateListItem";
import getList from "@/firebase/firestore/getList";
import addStringToList from "@/firebase/firestore/addStringToList";
import { todayFunction } from "@/utils/dateUtils";
import updateRealTimeFunction from "@/firebase/firestore/updateRealTimeFunction";
import updateDocumentListener from "@/firebase/firestore/updateDocumentListener";
import removeStringFromList from "@/firebase/firestore/removeStringFromList";
import getDocumentGeneral from "@/firebase/firestore/getDocumentGeneral";
import oldAddOrUpdateDocument from "@/firebase/firestore/oldAddOrUpdateDocument";

export const DataContext = createContext({});

const { Provider } = DataContext;

export const DataContextProvider = ({ defaultValue = [], children }) => {
    const [today, setToday] = useState(defaultValue);
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
            alert(`Error: ${error.message}`);
        }
    }
    const updateByDate = async (date) =>{
        try {
        const data = await getList(collectionName, date);
        setBydate(data)
        } catch (error) {
            console.error("An error occurred during data loading:", error.message);
            alert(`Error: ${error.message}`);
        }
    }

    const context = {
        updateToday,
        updateByDate,
        updateInformacion,
        docExists,
        addAudiencia,
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
