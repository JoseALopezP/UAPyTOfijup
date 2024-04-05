import firebase_app from "../config";
import { getFirestore, doc, deleteDoc} from "firebase/firestore";

const db = getFirestore(firebase_app)
export default async function removeData(colllectionName, id) {
    let result = null;
    try {
        await deleteDoc(doc(db, colllectionName, id))
    } catch (e) {
        console.log(e)
    }
    return result
}