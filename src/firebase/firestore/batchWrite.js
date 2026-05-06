import firebase_app from "../config";
import { getFirestore, writeBatch, doc } from "firebase/firestore";

const db = getFirestore(firebase_app);

/**
 * Performs a batch write for a large array of objects into a collection.
 * Uses chunks of 500 (Firestore limit).
 * Each object should have a field to be used as ID or it will auto-generate.
 * @param {string} collectionName 
 * @param {Array} dataArray 
 * @param {string} idField - Field to use as Doc ID. If null, auto-ids.
 */
export async function batchWrite(collectionName, dataArray, idField = null) {
    const CHUNK_SIZE = 500;
    for (let i = 0; i < dataArray.length; i += CHUNK_SIZE) {
        const chunk = dataArray.slice(i, i + CHUNK_SIZE);
        const batch = writeBatch(db);
        
        chunk.forEach(item => {
            const docRef = idField ? doc(db, collectionName, String(item[idField])) : doc(collection(db, collectionName));
            batch.set(docRef, item, { merge: true });
        });
        
        await batch.commit();
        console.log(`Batch committed: ${i + chunk.length}/${dataArray.length}`);
    }
}
