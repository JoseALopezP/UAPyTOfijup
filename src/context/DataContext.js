import React, { createContext, useState} from "react";
import {doc, updateDoc, getFirestore} from 'firebase/firestore';
import firebase_app from "@/firebase/config";
import getCollection from "@/firebase/firestore/getCollection";
import addData from "@/firebase/firestore/addData";
import removeData from "@/firebase/firestore/removeData";
import getDocument from "@/firebase/firestore/getDocument";
import checkDoc from "@/firebase/firestore/checkDoc";
import updateDocument from "@/firebase/firestore/updateDocument";
export const DataContext = createContext({});

const {Provider} = DataContext;
const db = getFirestore(firebase_app)
export const DataContextProvider = ({defaultValue = [], children}) => {
    const [today, setToday] = useState(defaultValue);
    const [tiposAudiencias, setTiposAudiencias] = useState(defaultValue);
    const [jueces, setJueces] = useState(defaultValue);
    const [show, setShow] = useState(defaultValue);
    const [bydate, setBydate] = useState(defaultValue);
    const [informacion, setInformacion] = useState(defaultValue);
    const [date, setDate] = useState('');

    const updateJueces = async() =>{
        setJueces(await getDocument('audiencias', 'jueces'))
    }
    const updateToday = async() => {
        const dateT = '15042024' //await (new Date()).toLocaleDateString("es-AR",{day: "2-digit", month: "2-digit", year: "numeric"}).split('/').join('');
        setToday(await getDocument('audiencias', dateT))
    }
    const updateTiposAudiencias = async() => {
        setTiposAudiencias(await getDocument('audiencias', 'tiposaudiencia'))
    }
    const updateByDate = async() => {
        setBydate(await getDocument('audiencias', date))
    }
    const updateInformacion = async() =>{
        setInformacion(await getCollection('informacion'))
    }
    const updateDate = async(date) =>{
        setDate(date)
    }
    const updateState = async(state, num) =>{
        await updateByDate()
        const aux = bydate
        const index = aux.findIndex((element) => element.numeroLeg == num)
        aux[index].estado =
         state
        await updateDocument("audiencias", aux, date)
    }
    const saveDate = async(dateX) => {
        setDate(dateX)
    }
    const docExists = async(id) =>{
        return (checkDoc(id)>0 ? true : false)
    }
    const addAudiencia = async(data) =>{
        await updateByDate()
        if(bydate){
            const aux = bydate
            aux.push(data)
            await updateDocument("audiencias", aux, date)
        }else{
            addData('audiencias', data)
        }
    }
    const deleteAudiencia = async(num) =>{
        await updateByDate()
        const aux = bydate
        const index = aux.findIndex((element) => element.numeroLeg == num)
        aux.splice(index, 1)
        await updateDocument("audiencias", aux, date)
    }

    const addInfo = async(data) =>{
        addData('informacion', data)
    }
    const deleteInfo = async(id) =>{
        await removeData('informacion', id)
    }


    const context = {
        updateToday,
        updateByDate,
        updateInformacion,
        updateDate,
        updateState,
        saveDate,
        docExists,
        addAudiencia,
        deleteAudiencia,
        addInfo,
        deleteInfo,
        updateTiposAudiencias,
        updateJueces,
        today,
        bydate,
        informacion,
        date,
        show,
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