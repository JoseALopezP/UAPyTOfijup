import { collection, doc, setDoc, addDoc, getFirestore } from "firebase/firestore";
import firebase_app from "../config";

const db = getFirestore(firebase_app);

export default async function addOrUpdateDocument(collectionName, date, subCol, data) {
  try {
    const targetCollectionRef = collection(db, collectionName, date, subCol);
    const newDocRef = await addDoc(targetCollectionRef, data);
    const audId = newDocRef.id;
    const audienciasViewRef = doc(db, "audienciasView", date);
    await setDoc(
      audienciasViewRef,
      { [audId]: data },
      { merge: true }
    );
    return audId;
  } catch (e) {
    console.error("Error adding/updating document:", e);
    throw new Error(e.message || "Failed to add or update document.");
  }
}