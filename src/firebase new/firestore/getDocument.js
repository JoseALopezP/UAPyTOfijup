import firebase_app from "../config";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const db = getFirestore(firebase_app);

export default async function getDocument(collectionName, date, docId) {
    try {
        const docRef = doc(db, collectionName, date, docId);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? docSnap.data() : null;
    } catch (e) {
        console.error("Firebase fetch error:", e);
        throw new Error(e.message || "Failed to fetch data from Firestore.");
    }
}