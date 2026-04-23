import firebase_app from "../config";
import { getFirestore, doc, setDoc } from "firebase/firestore";
const db = getFirestore(firebase_app)

export async function addOrUpdateObject(collectionName, docId, objectId, data) {
    if (!collectionName || !docId) {
        // console.warn(`addOrUpdateObject called with missing parameters: ${collectionName}/${docId}`);
        return;
    }
    try {
        const ref = doc(db, collectionName, docId);
        await setDoc(ref, { [objectId]: data }, { merge: true });
    } catch (error) {
        console.error("Error setting object:", error);
        throw new Error(error.message || "Failed to set object");
    }
}