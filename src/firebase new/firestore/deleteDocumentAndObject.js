import { doc, deleteField, getFirestore, writeBatch } from "firebase/firestore";
import firebase_app from "../config";
const db = getFirestore(firebase_app);

export default async function deleteDocumentAndObject(fechaId, audId) {
  try {
    const batch = writeBatch(db);

    // Borrar doc de subcolección
    const audDocRef = doc(db, "audiencias", fechaId, "audiencias", audId);
    batch.delete(audDocRef);

    // Borrar key en audienciasView
    const viewDocRef = doc(db, "audienciasView", fechaId);
    batch.update(viewDocRef, { [audId]: deleteField() });

    await batch.commit();
    console.log(`Audiencia ${audId} eliminada en fecha ${fechaId}`);
  } catch (e) {
    console.error("Error eliminando audiencia:", e);
    throw new Error(e.message || "Failed to delete audiencia.");
  }
}
