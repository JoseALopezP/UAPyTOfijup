import firebase_app from "../config";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const db = getFirestore(firebase_app);

/**
 * Fetches all documents from a top-level collection.
 * @param {string} collectionName 
 * @returns {Promise<Array>}
 */
export default async function getCollection(collectionName) {
    try {
        const colRef = collection(db, collectionName);
        const snapshot = await getDocs(colRef);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
    } catch (e) {
        console.error("Firebase fetch error:", e);
        throw new Error(e.message || "Failed to fetch collection from Firestore.");
    }
}
