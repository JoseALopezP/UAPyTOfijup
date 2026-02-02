import firebase_app from "../config";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const db = getFirestore(firebase_app);

export default async function upsertDocument(collectionName, documentId, data) {
    let result = null;
    let error = null;

    try {
        await setDoc(doc(db, collectionName, documentId), data, { merge: true });
        result = true;
    } catch (e) {
        error = e;
        console.error("Error in upsertDocument:", e);
    }

    return { result, error };
}
