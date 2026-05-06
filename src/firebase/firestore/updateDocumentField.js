import firebase_app from "../config";
import { getFirestore, doc, writeBatch } from "firebase/firestore";
const db = getFirestore(firebase_app);

export const updateDocumentField = async (date, audId, field, value) => {
  try {
    const batch = writeBatch(db);

    // Subcolección
    const audDocRef = doc(db, "audiencias", date, "audiencias", audId);
    batch.update(audDocRef, { [field]: value });

    // Sincronizar con audienciasView (antes faltaba)
    const viewDocRef = doc(db, "audienciasView", date);
    batch.update(viewDocRef, { [`${audId}.${field}`]: value });

    await batch.commit();
  } catch (e) {
    console.error("Firebase update error:", e);
    throw new Error(e.message || "Failed to update data from Firestore.");
  }
};