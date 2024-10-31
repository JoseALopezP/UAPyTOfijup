import React, { createContext, useState, useRef, useEffect} from "react";
import getCollection from "@/firebase/firestore/getCollection";
import { getFirestore } from "firebase/firestore";
import addData from "@/firebase/firestore/addData";
import removeFromArray from "@/firebase/firestore/removeFromArray";
import removeData from "@/firebase/firestore/removeData";
import getDocument from "@/firebase/firestore/getDocument";
import checkDoc from "@/firebase/firestore/checkDoc";
import addOrUpdateDocument from "@/firebase/firestore/addOrUpdateDocument";
import updateDocument from "@/firebase/firestore/updateDocument";
import pushToHitos from "@/firebase/firestore/pushToHitos";
import updateListItem from "@/firebase/firestore/updateListItem";
import getList from "@/firebase/firestore/getList";
import addStringToList from "@/firebase/firestore/addStringToList";
import { todayFunction } from "@/utils/dateUtils";
export const DataContext = createContext({});
import firebase_app from "@/firebase/config";


const {Provider} = DataContext;
export const DataContextProvider = ({defaultValue = [], children}) => {
    const [today, setToday] = useState(defaultValue);
    const [dateToUse, setDateToUse] = useState('');
    const [desplegables, setDesplegables] = useState(defaultValue);
    const [realTime, setRealTime] = useState(null);
    const [tiposAudiencias, setTiposAudiencias] = useState(defaultValue);
    const [años, setAños] = useState(defaultValue);
    const [jueces, setJueces] = useState(defaultValue);
    const [bydate, setBydate] = useState(defaultValue);
    const [informacion, setInformacion] = useState(defaultValue);
    const [userType, setUsertype] = useState('')
    const updateRealTime = async () => {
        const db = getFirestore(firebase_app)
        try {
            const tempDocRef = doc(db, "timestamps", "temp");
            await setDoc(tempDocRef, { time: serverTimestamp() });
            const docSnap = await getDoc(tempDocRef);
            if (docSnap.exists()) {
                const serverTime = docSnap.data().time.toDate();
                console.log(realTime)
                setRealTime(serverTime.toLocaleTimeString("es-AR", {
                    hourCycle: 'h23',
                    hour: "2-digit",
                    minute: "2-digit"
                }));
            } else {
                throw new Error("No timestamp document found.");
            }
            
        } catch (error) {
            console.error('Error fetching server time from Firestore, using local time:', error);
            setRealTime(new Date().toLocaleTimeString("es-AR", {
                hourCycle: 'h23',
                hour: "2-digit",
                minute: "2-digit"
            }));
        }
    };
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
        setToday(await getDocument('audiencias', todayFunction()))
    }
    const updateByDate = async(date) => {
        setBydate(await getDocument('audiencias', date))
    }
    const updateInformacion = async() =>{
        setInformacion(await getCollection('informacion'))
    }
    const updateDesplegables = async() =>{
        setDesplegables(await getList('desplegables', 'desplegables'))
    }
    const pushtToArray = async(date, searchValLeg, searchValHora, newValue) => {
        await pushToHitos('audiencias', date, searchValLeg, searchValHora, newValue)
    }
    const updateState = async(state, num, date) =>{
        await updateByDate(date)
        const aux = await bydate
        const index = await aux.findIndex((element) => element.numeroLeg == num)
        aux[index].estado =
         state
        await updateDocument("audiencias", aux, date)
    }
    const updateData = async(date, searchValLeg, searchValHora, property, newValue) =>{
        return updateListItem('audiencias', date, searchValLeg, searchValHora, property, newValue)
    }
    const updateDataToday = async(searchValLeg, searchValHora, property, newValue) =>{
        return updateListItem('audiencias', (new Date()).toLocaleDateString("es-AR",{day: "2-digit", month: "2-digit", year: "numeric"}).split('/').join(''), searchValLeg, searchValHora, property, newValue)
    }
    const docExists = async(id) =>{
        return checkDoc('audiencias',id)
    }
    const addAudiencia = async(data, date) =>{
        await addOrUpdateDocument('audiencias', date, data)
    }
    const addDesplegable = async(type, data) =>{
        await addStringToList('desplegables', 'desplegables', type, data)
    }
    const deleteAudiencia = async(date, searchValLeg, searchValHora) =>{
        await removeFromArray('audiencias', date, searchValLeg, searchValHora)
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
        updateState,
        docExists,
        addAudiencia,
        deleteAudiencia,
        addInfo,
        addAudiencia,
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
        addDesplegable,
        setDateToUse,
        dateToUse,
        desplegables,
        realTime,
        userType,
        años,
        today,
        bydate,
        informacion,
        tiposAudiencias,
        jueces
    }
    return(
        <>
            <Provider value={context}>
                {children}
            </Provider>
        </>
    )
}