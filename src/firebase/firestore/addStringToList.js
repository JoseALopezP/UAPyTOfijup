import firebase_app from "../config";
import { getFirestore, doc, updateDoc, arrayUnion } from "firebase/firestore";

const db = getFirestore(firebase_app)
export default async function addStringToList(collectionName, documentName, listFieldName, stringToAdd) {
    const docRef = doc(db, collectionName, documentName);
    try {
        await updateDoc(docRef, {
            [listFieldName]: arrayUnion(stringToAdd)
        });
    } catch (error) {
        console.error("Error adding string to list: ", error);
    }
}