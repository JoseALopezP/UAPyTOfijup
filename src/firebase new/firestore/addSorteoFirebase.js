import { doc, setDoc, getFirestore } from "firebase/firestore";
import firebase_app from "../config";

const db = getFirestore(firebase_app);

export default async function addObjectToDocument(colName, fechaId, data, idToUse) {
  try {
    const sorteoDocRef = doc(db, colName, fechaId);
    await setDoc(
      sorteoDocRef,
      { [idToUse]: data },
      { merge: true }
    );
    return sorteoId;
  } catch (e) {
    console.error("Error adding sorteo:", e);
    throw new Error(e.message || "Failed to add object");
  }
}
