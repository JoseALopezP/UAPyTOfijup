import firebase_app from "../config";
import { getFirestore, getDoc, doc } from "firebase/firestore";

const db = getFirestore(firebase_app)
export default async function getDocument(colllectionName, id) {
    let result = null;
    try {
        await getDoc(doc(db, colllectionName, id));
    } catch (e) {
        console.log(e)
    }
    return result
}