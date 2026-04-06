import firebase_app from "../config";
import { getFirestore, doc, arrayUnion, writeBatch } from "firebase/firestore";
const db = getFirestore(firebase_app);

export const pushItemToDocumentAndObjectField = async (date, audId, field, item) => {
  try {
    const batch = writeBatch(db);

    const audDocRef = doc(db, "audiencias", date, "audiencias", audId);
    batch.update(audDocRef, { [field]: arrayUnion(item) });

    const viewDocRef = doc(db, "audienciasView", date);
    batch.update(viewDocRef, { [`${audId}.${field}`]: arrayUnion(item) });

    await batch.commit();
  } catch (e) {
    console.error("❌ Failed to push item to array:", e);
    throw new Error(e.message || "Failed to push item to array.");
  }
};