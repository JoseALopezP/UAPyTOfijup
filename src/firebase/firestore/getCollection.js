import firebase_app from "../config";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const db = getFirestore(firebase_app)
export default async function getCollection(collectionName) {
    let result = null;
    try {
        const document = collection(db, collectionName)
        const col = await getDocs(document)
        result = await col.docs.map((doc) => doc = {id: doc.id, ...doc.data()})
    } catch (e) {
        console.log(e)
    }
    return result;
}