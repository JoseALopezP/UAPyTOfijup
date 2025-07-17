import React, { createContext, useState, useRef, useEffect} from "react";
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
export const DataContext = createContext({});


const {Provider} = DataContext;
export const DataContextProvider = ({defaultValue = [], children}) => {
    const [today, setToday] = useState(defaultValue);
    const [dateToUse, setDateToUse] = useState('');
    const [desplegables, setDesplegables] = useState(defaultValue);
    const [modelosMinuta, setModelosMinuta] = useState(defaultValue)
    const [realTime, setRealTime] = useState(null);
    const [tiposAudiencias, setTiposAudiencias] = useState(defaultValue);
    const [años, setAños] = useState(defaultValue);
    const [jueces, setJueces] = useState(defaultValue);
    const [bydate, setBydate] = useState(defaultValue);
    const [byLegajo, setByLegajo] = useState(defaultValue)
    const [informacion, setInformacion] = useState(defaultValue);
    const [userType, setUsertype] = useState('')
    const [sorteoList, setSorteoList] = useState([])
    
    const updateRealTime = async() =>{
        setRealTime(await updateRealTimeFunction())
    }
    const updateJueces = async() =>{
        setJueces(await getDocument('audiencias', 'jueces'))
    }
    const updateTiposAudiencias = async() => {
        setTiposAudiencias(await getDocument('audiencias', 'tiposaudiencia'))
    }
    const updateAños = async() => {
        setAños(await getDocument('audiencias', 'años'))
    }
    const updateToday = async() => {
        const unsubscribe = updateDocumentListener('audiencias', todayFunction(), (updatedData) => {
            setToday(updatedData);
        });
        return unsubscribe;
    }
    const updateByLegajo = async(leg) =>{
        setByLegajo(await getDocument('legajos', leg))
    }
    const updateByDate = async(date) => {
        setBydate(await getDocument('audiencias', date))
    }
    const getByDate = async(date) => {
        return await getDocument('audiencias', date)
    }
    const updateByDateSorteo = async(date) => {
        setSorteoList(await getDocument('sorteos', date))
    }
    const updateByDateListener = (date) => {
        const unsubscribe = updateDocumentListener('audiencias', date, (updatedData) => {
            setBydate(updatedData);
        });
        return unsubscribe;
    };
    const updateInformacion = async() =>{
        setInformacion(await getCollection('informacion'))
    }
    const updateDesplegables = async() =>{
        setDesplegables(await getList('desplegables', 'desplegables'))
    }
    const updateModelosMinuta = async() =>{
        setModelosMinuta(await getList('desplegables', 'modelosMinuta'))
    }
    const pushtToArray = async(date, searchValLeg, searchValHora, newValue) => {
        await pushToHitos('audiencias', date, searchValLeg, searchValHora, newValue)
        await pushToHitos('legajos', searchValLeg, date, searchValHora, newValue)
    }
    const updateData = async (date, searchValLeg, searchValHora, property, newValue) => {
        if (!newValue) {
            console.warn("❌ Ignorado updateData: newValue es inválido", newValue);
            return;
        }
        await updateListItem('audiencias', date, searchValLeg, searchValHora, property, newValue);
        await updateListItem('legajos', searchValLeg, date, searchValHora, property, newValue);
    };
    const updateDataToday = async(searchValLeg, searchValHora, property, newValue) =>{
        await updateListItem('audiencias', (new Date()).toLocaleDateString("es-AR",{day: "2-digit", month: "2-digit", year: "numeric"}).split('/').join(''), searchValLeg, searchValHora, property, newValue)
        await updateListItem('legajos', searchValLeg, (new Date()).toLocaleDateString("es-AR",{day: "2-digit", month: "2-digit", year: "numeric"}).split('/').join(''), searchValHora, property, newValue)
    }
    const docExists = async(id) =>{
        return checkDoc('audiencias',id)
    }
    const addAudiencia = async(data, date) =>{
        await addOrUpdateDocument('audiencias', date, data)
        await addOrUpdateDocument('legajos', data.numeroLeg, {...data, fecha: date})
    }
    const addSorteo = async(data, date) =>{
        await addOrUpdateDocument('sorteos', date, data)
    }
    const addDesplegable = async(type, data) =>{
        await addStringToList('desplegables', 'desplegables', type, data)
    }
    const deleteDesplegable = async(type, data) =>{
        await removeStringFromList('desplegables', 'desplegables', type, data)
    }
    const deleteAudiencia = async(date, searchValLeg, searchValHora) =>{
        await removeFromArray('audiencias', date, searchValLeg, searchValHora)
        await removeFromArray('legajos', searchValLeg, date, searchValHora)
    }
    const addInfo = async(data) =>{
        addData('informacion', data)
    }
    const deleteInfo = async(id) =>{
        await removeData('informacion', id)
    }
    const addUser = async(data) =>{
        await addOrUpdateDocument('users', 'listaUsuarios', data)
    }
    const checkUserType = async(userId) =>{
        const userList = await getDocument('users', 'listaUsuarios')
        await setUsertype(userList.find(item => item['userId'] === userId).type)
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
        updateTiposAudiencias,
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
        tiposAudiencias,
        jueces,
        sorteoList
    }
    return(
        <>
            <Provider value={context}>
                {children}
            </Provider>
        </>
    )
}