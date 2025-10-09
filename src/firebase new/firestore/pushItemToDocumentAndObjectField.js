import firebase_app from "../config";
import { getFirestore, doc, updateDoc, arrayUnion } from "firebase/firestore";
const db = getFirestore(firebase_app);

export const pushItemToDocumentAndObjectField = async (date, audId, field, item) => {
  try {
    const audDocRef = doc(db, "audiencias", date, audId);
    await updateDoc(audDocRef, {
      [field]: arrayUnion(item),
    });
    const viewDocRef = doc(db, "audienciasView", date);
    await updateDoc(viewDocRef, {
      [`${audId}.${field}`]: arrayUnion(item),
    });
  } catch (e) {
    console.error("❌ Failed to push item to array:", e);
    throw new Error(e.message || "Failed to push item to array.");
  }
};