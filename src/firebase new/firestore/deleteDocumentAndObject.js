import { doc, deleteDoc, updateDoc, deleteField, getFirestore } from "firebase/firestore";
import firebase_app from "../config";
const db = getFirestore(firebase_app);

export default async function deleteDocumentAndObject(fechaId, audId) {
  try {
    const audDocRef = doc(db, "audiencias", fechaId, "audiencias", audId);
    await deleteDoc(audDocRef);
    const viewDocRef = doc(db, "audienciasView", fechaId);
    await updateDoc(viewDocRef, {
      [audId]: deleteField(),
    });
    console.log(`Audiencia ${audId} eliminada en fecha ${fechaId}`);
  } catch (e) {
    console.error("Error eliminando audiencia:", e);
    throw new Error(e.message || "Failed to delete audiencia.");
  }
}
