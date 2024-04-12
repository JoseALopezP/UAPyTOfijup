import firebase_app from "../config";
import { getFirestore, getCountFromServer, collection } from "firebase/firestore";

const db = getFirestore(firebase_app)
export default async function checkDoc(colllectionName, id) {
    let result = null;
    try {
        const q = query(collection(db, colllectionName), where("id", "==", id));
        await getCountFromServer(q).data().count
        const snapshot = await getCountFromServer(q);
        result = snapshot.data().count
    } catch (e) {
        console.log(e)
    }
    return result
}