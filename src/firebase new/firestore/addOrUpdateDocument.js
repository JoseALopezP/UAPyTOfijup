import { collection, doc, setDoc, addDoc, getFirestore } from "firebase/firestore";
import firebase_app from "../config";

const db = getFirestore(firebase_app);

export default async function addOrUpdateDocument(collectionName, colName, data) {
  try {
    const targetCollectionRef = collection(db, collectionName, colName, "audiencias");
    const newDocRef = await addDoc(targetCollectionRef, data);
    const audId = newDocRef.id;
    const audienciasViewRef = doc(db, "audienciasView", "audiencias");
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