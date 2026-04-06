import { collection, doc, getFirestore, writeBatch } from "firebase/firestore";
import firebase_app from "../config";

const db = getFirestore(firebase_app);

export default async function addOrUpdateDocument(collectionName, date, subCol, data) {
  try {
    const batch = writeBatch(db);

    // Generar el ID antes de escribir (sin crear el doc)
    const targetCollectionRef = collection(db, collectionName, date, subCol);
    const newDocRef = doc(targetCollectionRef);
    const audId = newDocRef.id;

    // Inyectar el ID dentro del propio data
    const dataWithId = { ...data, id: audId };

    // Operación 1: subcolección
    batch.set(newDocRef, dataWithId);

    // Operación 2: audienciasView (mirror)
    const viewDocRef = doc(db, "audienciasView", date);
    batch.set(viewDocRef, { [audId]: dataWithId }, { merge: true });

    // Commit ATÓMICO → ambas o ninguna
    await batch.commit();
    return audId;
  } catch (e) {
    console.error("Error adding/updating document:", e);
    throw new Error(e.message || "Failed to add or update document.");
  }
}