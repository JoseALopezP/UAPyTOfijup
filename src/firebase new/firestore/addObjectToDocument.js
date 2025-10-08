import { doc, setDoc, getFirestore } from "firebase/firestore";
import firebase_app from "../config";

const db = getFirestore(firebase_app);

export default async function addObjectToDocument(colName, docName, data) {
  try {
    const docRef = doc(db, colName, docName);
    await setDoc(
      docRef,
      { [Date.now()]: data },
      { merge: true }
    );
    return sorteoId;
  } catch (e) {
    console.error("Error adding sorteo:", e);
    throw new Error(e.message || "Failed to add object");
  }
}
