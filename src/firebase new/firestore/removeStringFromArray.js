import firebase_app from "../config";
import { getFirestore, doc, updateDoc, arrayRemove } from "firebase/firestore";

const db = getFirestore(firebase_app);

export default async function removeStringFromArray(collectionName, documentName, listFieldName, stringToRemove) {
    const docRef = doc(db, collectionName, documentName);
    try {
        await updateDoc(docRef, {
            [listFieldName]: arrayRemove(stringToRemove)
        });
    } catch (error) {
        console.error("Error removing string from array: ", error);
        throw new Error(e.message || "Failed to remove from array");
    }
}