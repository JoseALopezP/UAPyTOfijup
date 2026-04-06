import { doc, setDoc, getFirestore } from "firebase/firestore";
import firebase_app from "../config";

const db = getFirestore(firebase_app);

export default async function addObjectToDocument(colName, docName, data) {
  try {
    const docRef = doc(db, colName, docName);
    const id = Date.now().toString();
    await setDoc(
      docRef,
      { [id]: data },
      { merge: true }
    );
    return id;
  } catch (e) {
    console.error("Error adding object:", e);
    throw new Error(e.message || "Failed to add object");
  }
}
