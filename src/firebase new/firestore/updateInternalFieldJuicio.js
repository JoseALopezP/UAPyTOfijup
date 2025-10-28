import firebase_app from "../config";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
const db = getFirestore(firebase_app);

export const updateInternalFieldJuicio = async (date, juicioId, field, value) => {
  try {
    const docRef = doc(db, "juicios", date);
    const fieldPath = `juicios.${juicioId}.${field}`;
    await updateDoc(docRef, {
      [fieldPath]: value,
    });
  } catch (e) {
    console.error("Firebase update data error:", e);
    throw new Error(e.message || "Failed to update internal field in Firestore.");
  }
};