import { getFirestore, doc, deleteDoc } from "firebase/firestore";
import firebase_app from "../config";

const db = getFirestore(firebase_app);

export default async function removeFromArray(collectionName, fechaId, hora, numeroLeg) {
    try {
        const docId = `${hora.replace(/:/g, '')}${numeroLeg}`;
        const docRef = doc(db, collectionName, fechaId, "audiencias", docId);
        await deleteDoc(docRef);
    } catch (e) {
        console.error("Error in removeFromArray:", e);
    }
}