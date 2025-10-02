import firebase_app from "../config";
import { doc, setDoc } from "firebase/firestore";
const db = getFirestore(firebase_app)

export async function addOrUpdateObject(collectionName, docId, objectId, data) {
    try {
        const ref = doc(db, collectionName, docId);
        await setDoc(ref, { [objectId]: data }, { merge: true });
    } catch (error) {
        console.error("Error setting object:", e);
        throw new Error(e.message || "Failed to set object");
    }
}