import firebase_app from "../config";
import { getFirestore, updateDoc, doc } from "firebase/firestore";

const db = getFirestore(firebase_app)
export default async function updateDocument(colllectionName, newList, date) {
    let result = null;
    try {
        await updateDoc(doc(db, colllectionName, date),{
            list: newList
        })
    } catch (e) {
        console.log(e)
    }
    return result
}