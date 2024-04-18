import firebase_app from "../config";
import { getFirestore, getDocs, collection, query, where } from "firebase/firestore";

const db = getFirestore(firebase_app)
export default async function checkDoc(colllectionName, id) {
    let result = null;
    try {
        const q = query(collection(db, colllectionName), where("id", "==", id));
        const snapshot = await getDocs(q);
        result = snapshot.size
    } catch (e) {
        console.log(e)
    }
    return result
}