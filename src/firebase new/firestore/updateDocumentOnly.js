import firebase_app from "../config";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
const db = getFirestore(firebase_app);

/**
 * Actualiza un campo SOLO en audiencias/{date}/audiencias/{audId}.
 * NO sincroniza con audienciasView — para campos de uso interno
 * como stopwatch, stopwatchStart, resuelvoText, minuta, cierre.
 */
export const updateDocumentOnly = async (date, audId, field, value) => {
  try {
    const audDocRef = doc(db, "audiencias", date, "audiencias", audId);
    await updateDoc(audDocRef, { [field]: value });
  } catch (e) {
    console.error("Firebase updateDocumentOnly error:", e);
    throw new Error(e.message || "Failed to update audiencias document.");
  }
};
