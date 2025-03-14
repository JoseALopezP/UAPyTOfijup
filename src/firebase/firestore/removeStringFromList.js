import firebase_app from "../config";
import { getFirestore, doc, updateDoc, arrayRemove } from "firebase/firestore";

const db = getFirestore(firebase_app);

export default async function removeStringFromList(collectionName, documentName, listFieldName, stringToRemove) {
    const docRef = doc(db, collectionName, documentName);
    try {
        await updateDoc(docRef, {
            [listFieldName]: arrayRemove(stringToRemove)
        });
    } catch (error) {
        console.error("Error removing string from list: ", error);
    }
}