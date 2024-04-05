import firebase_app from "../config";
import { getFirestore, addDoc, collection } from "firebase/firestore";

const db = getFirestore(firebase_app)
export default async function addData(colllectionName, data) {
    let result = null;
    try {
        await addDoc(collection(db, colllectionName), data);
    } catch (e) {
        console.log(e)
    }
    return result
}