import { getFirestore, doc, updateDoc, arrayUnion } from "firebase/firestore";
import firebase_app from "../config";

const db = getFirestore(firebase_app);

export default async function pushToHitos(collectionName, fechaId, hora, numeroLeg, nuevoHito) {
    try {
        const docId = `${hora.replace(/:/g, '')}${numeroLeg}`;
        const docRef = doc(db, collectionName, fechaId, "audiencias", docId);
        await updateDoc(docRef, {
            hitos: arrayUnion(nuevoHito)
        });
    } catch (e) {
        console.error("Error pushing to hitos:", e);
    }
}
