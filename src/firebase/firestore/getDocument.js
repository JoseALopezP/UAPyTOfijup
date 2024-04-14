import firebase_app from "../config";
import { getFirestore, getDoc, doc } from "firebase/firestore";

const db = getFirestore(firebase_app)
export default async function getDocument(colllectionName, id) {
    let result = null;
    try {
        const document = doc(db, colllectionName, id)
        const col = await getDoc(document)
        result = await col.data().list
    } catch (e) {
        console.log(e)
    }
    return result
}