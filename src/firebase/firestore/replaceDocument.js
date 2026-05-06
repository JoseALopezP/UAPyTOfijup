import firebase_app from "../config";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const db = getFirestore(firebase_app);

export default async function replaceDocument(collectionName, documentName, data) {
    try {
        const docRef = doc(db, collectionName, documentName);
        await setDoc(docRef, data);
    } catch (e) {
        console.error("Error replacing document:", e);
        throw new Error(e.message || "Failed to replace document.");
    }
}
