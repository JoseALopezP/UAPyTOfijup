import firebase_app from "../config";
import { getFirestore, getDoc, doc } from "firebase/firestore";

const db = getFirestore(firebase_app);

export default async function getDocumentGeneral(collectionName, docId) {
  try {
    const docRef = doc(db, collectionName, docId);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return snapshot.data();
    }
    return null;
  } catch (e) {
    console.error("Error getting general document:", e);
    return null;
  }
}
