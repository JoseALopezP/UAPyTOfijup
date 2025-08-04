import firebase_app from "../config";
import { getFirestore, getDoc, doc } from "firebase/firestore";

const db = getFirestore(firebase_app)
export default async function getDocument(collectionName, fechaId, hora, numeroLeg) {
    try {
        const docId = `${hora.replace(/:/g, '')}${numeroLeg}`;
        const docRef = doc(db, collectionName, fechaId, "audiencias", docId);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
            return snapshot.data();
        }
        return null;
    } catch (e) {
        console.error("Error getting document:", e);
        return null;
    }
}