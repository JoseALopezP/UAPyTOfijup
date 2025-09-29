import { doc, setDoc, deleteDoc, getDocs, collection, getFirestore } from "firebase/firestore";
import firebase_app from "../config";
const db = getFirestore(firebase_app);

export default async function addOrUpdateDocument(collectionName, fechaId, data) {
    try {
        const targetCollectionRef = collection(db, collectionName, fechaId);
        await addDoc(targetCollectionRef, data);
    } catch (e) {
        console.error("Error adding document:", e);
        throw new Error(e.message || "Failed to add document to the target collection.");
    }
}
