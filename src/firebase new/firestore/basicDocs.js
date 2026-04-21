import firebase_app from "../config";
import { getFirestore, doc, setDoc, deleteDoc } from "firebase/firestore";

const db = getFirestore(firebase_app);

/**
 * Basic Set Document with merge enabled.
 */
export async function setDocument(collectionName, docId, data) {
    try {
        const ref = doc(db, collectionName, String(docId));
        await setDoc(ref, data, { merge: true });
    } catch (e) {
        console.error("Firebase set error:", e);
        throw new Error(e.message || "Failed to set document.");
    }
}

/**
 * Basic Delete Document.
 */
export async function deleteDocument(collectionName, docId) {
    try {
        const ref = doc(db, collectionName, String(docId));
        await deleteDoc(ref);
    } catch (e) {
        console.error("Firebase delete error:", e);
        throw new Error(e.message || "Failed to delete document.");
    }
}
