import { getFirestore, doc, setDoc } from "firebase/firestore";
import firebase_app from "../config";

const db = getFirestore(firebase_app);

export default async function updateListItem(collectionName, fechaId, data) {
  try {
    if (!data.hora || !data.numeroLeg) {
      throw new Error("Faltan hora o numeroLeg en data");
    }
    const safeHora = data.hora.replace(/:/g, "");
    const docId = `${safeHora}${data.numeroLeg}`;
    const docRef = doc(db, collectionName, fechaId, "audiencias", docId);

    await setDoc(docRef, data, { merge: true });
  } catch (e) {
    console.error("Error en updateListItem:", e);
  }
}
