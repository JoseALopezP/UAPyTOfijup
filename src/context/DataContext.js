import React, { createContext, useState} from "react";
import {doc, updateDoc, getFirestore} from 'firebase/firestore';
import firebase_app from "@/firebase/config";
import getCollection from "@/firebase/firestore/getCollection";
import addData from "@/firebase/firestore/addData";
import removeData from "@/firebase/firestore/removeData";
import getDocument from "@/firebase/firestore/getDocument";
import checkDoc from "@/firebase/firestore/checkDoc";
export const DataContext = createContext({});

const {Provider} = DataContext;
const db = getFirestore(firebase_app)
export const DataContextProvider = ({defaultValue = [], children}) => {
    const [today, setToday] = useState(defaultValue);
    const [bydate, setBydate] = useState(defaultValue);
    const [informacion, setInformacion] = useState(defaultValue);
    const [date, setdate] = useState('');

    const updateToday = async(id) => {
        const dateT = date.toLocaleDateString("es-AR",{day: "2-digit", month: "2-digit", year: "numeric"}).split('/').join('');
        setToday(await getDocument('audiencias', dateT))
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
    const updateState = async(id, state) =>{
        await updateToday()
        await 
    }
    const docExists = async(id) =>{
        return checkDoc(id)
    }
    const addAudiencia = async(data) =>{

    }
    const deleteAudiencia = async(id) =>{
        
    }
    const addInfo = async(data) =>{
        
    }
    const deleteInfo = async(id) =>{
        
    }
    

    const updateGifts = async() => {
        setGifts(await getCollection('giftList'))
    }
    const updateNotes = async() => {
        setNotes(await getCollection('notesList'))
    }
    const updateGifteds = async() => {
        setGifteds(await getCollection('giftedList'))
    }
    const updateTransfers = async() => {
        setTransfers(await getCollection('transferedList'))
    }
    const updateGuests = async() => {
        setGuests((await getCollection('guestList')).sort((a,b)=>(a.date.toDate() - b.date.toDate())));
        let d = 0; 
        let a = 0;
        guests.forEach(el =>{
            if(el.after){
                a += el.guests.length
            }else{
                d += el.guests.length
            }
        });
        setDinner(d);
        setAfterDinner(a);

    }

    const selectId = async(id) =>{
        if(id === idSelected){
            setIdSelected('');
            setGift('');
        }else{
            setIdSelected(id);
            setGift(gifts.find(x => x.id == id));
        }
        
    }
    
    const selectGift = async(data, oldStock) => {
        const result = doc(db, "giftList", idSelected);
        await updateDoc(result, {
        stock: (oldStock - 1)
        });
        addGifted(data)
    }

    const addGift = (data) => {
        addData('giftList', data)
    }
    const addNote = (data) => {
        addData('notesList', data)
    }
    const addGifted = (data) => {
        addData('giftedList', data)
    }
    const addTransfered = (data) => {
        addData('transferedList', data)
    }
    const addGuest = (data) => {
        addData('guestList', data)
    }

    const removeGift = (id) => {
        removeData('giftList', id)
    }
    const removeNote = async (id) => {
        removeData('notesList', id)
    }
    const removeGifted = async (id, oldStock) => {
        const result1 = doc(db, "giftedList", id);
        const result2 = doc(db, "giftList", result1.gid);
        await updateDoc(result2, {
        stock: ServerValue.increment(1)
        });
        await removeData('giftedList', id)
    }
    const removeTransfered = (id) => {
        removeData('transferedList', id)
    }
    const removeGuest = (id) => {
        removeData('guestList', id)
    }

    const context = {
        updateGifts,
        updateNotes,
        updateGifteds,
        updateTransfers,
        updateGuests,
        selectId,
        selectGift,
        addGift,
        addNote,
        addGifted,
        addTransfered,
        addGuest,
        removeGift,
        removeNote,
        removeGifted,
        removeTransfered,
        removeGuest,
        gift,
        gifts,
        notes,
        gifteds,
        transfers,
        guests,
        idSelected,
        dinner,
        afterDinner
    }
    return(
        <>
            <Provider value={context}>
                {children}
            </Provider>
        </>
    )
}