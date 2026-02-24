import firebase_app from "../config";
import { getFirestore, doc, setDoc } from "firebase/firestore";
const db = getFirestore(firebase_app);

/**
 * Updates a specific row inside the 'audiencias' map of a document in 'informeUALData' collection.
 * Uses setDoc with merge: true to handle cases where the document doesn't exist yet.
 */
export const updateInternalUALData = async (date, rowKey, data) => {
    try {
        const docRef = doc(db, "informeUALData", date);
        await setDoc(docRef, {
            audiencias: {
                [rowKey]: data
            }
        }, { merge: true });
    } catch (e) {
        console.error("Firebase updateInternalUALData error:", e);
        throw new Error(e.message || "Failed to update granular UAL data.");
    }
};
