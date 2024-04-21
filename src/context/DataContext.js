import React, { createContext, useState} from "react";
import {doc, updateDoc, getFirestore, setDoc} from 'firebase/firestore';
import firebase_app from "@/firebase/config";
import getCollection from "@/firebase/firestore/getCollection";
import addData from "@/firebase/firestore/addData";
import removeData from "@/firebase/firestore/removeData";
import getDocument from "@/firebase/firestore/getDocument";
import checkDoc from "@/firebase/firestore/checkDoc";
import addOrUpdateDocument from "@/firebase/firestore/addOrUpdateDocument";
import updateDocument from "@/firebase/firestore/updateDocument";
export const DataContext = createContext({});

const {Provider} = DataContext;
const db = getFirestore(firebase_app)
export const DataContextProvider = ({defaultValue = [], children}) => {
    const [today, setToday] = useState(defaultValue);
    const [tiposAudiencias, setTiposAudiencias] = useState(defaultValue);
    const [años, setAños] = useState(defaultValue);
    const [jueces, setJueces] = useState(defaultValue);
    const [bydate, setBydate] = useState(defaultValue);
    const [informacion, setInformacion] = useState(defaultValue);

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
        const dateT = await (new Date()).toLocaleDateString("es-AR",{day: "2-digit", month: "2-digit", year: "numeric"}).split('/').join('');
        if(await docExists(dateT)){
            setToday(await getDocument('audiencias', dateT))
        }else{
            return []
        }
    }
    const updateByDate = async(date) => {
        setBydate(await getDocument('audiencias', date))
    }
    const updateInformacion = async() =>{
        setInformacion(await getCollection('informacion'))
    }
    const updateState = async(state, num, date) =>{
        await updateByDate(date)
        const aux = await bydate
        const index = await aux.findIndex((element) => element.numeroLeg == num)
        aux[index].estado =
         state
        await updateDocument("audiencias", aux, date)
    }
    const docExists = async(id) =>{
        return checkDoc('audiencias',id)
    }
    const addAudiencia = async(data, date) =>{
        await console.log("hasta acá llegaste")
        await addOrUpdateDocument('audiencias', date, data)
    }
    const deleteAudiencia = async(num) =>{
        await updateByDate(date)
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