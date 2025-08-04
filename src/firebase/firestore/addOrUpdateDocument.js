import { doc, setDoc, deleteDoc, getDocs, collection, getFirestore } from "firebase/firestore";
import firebase_app from "../config";

const db = getFirestore(firebase_app);

export async function saveAudienciaByFecha(fechaId, data) {
  const audId = `${data.hora}${data.numeroLeg}`;
  const docRef = doc(db, "audiencias", fechaId, "audiencias", audId);
  await setDoc(docRef, data);
}

export async function saveAudienciaByLegajo(numeroLeg, data) {
  const audId = `${data.hora}${data.numeroLeg}`;
  const docRef = doc(db, "legajos", numeroLeg, "audiencias", audId);
  await setDoc(docRef, data);
}

export async function getAudienciasByLegajo(numeroLeg) {
  const collectionRef = collection(db, "legajos", numeroLeg, "audiencias");
  const querySnapshot = await getDocs(collectionRef);
  return querySnapshot.docs.map(doc => doc.data());
}

export async function deleteAudiencia(fechaId, numeroLeg, hora) {
  const audId = `${hora}${numeroLeg}`;
  const docRefFecha = doc(db, "audiencias", fechaId, "audiencias", audId);
  await deleteDoc(docRefFecha);
  const docRefLegajo = doc(db, "legajos", numeroLeg, "audiencias", audId);
  await deleteDoc(docRefLegajo);
}

export default async function addOrUpdateDocument(collectionName, fechaId, data) {
  try {
    const cleanHora = data.hora.replace(/:/g, '');
    const docId = `${cleanHora}${data.numeroLeg}`;
    const docRef = doc(db, collectionName, fechaId, "audiencias", docId);
    await setDoc(docRef, data);
  } catch (e) {
    console.error("Error in addOrUpdateDocument:", e);
  }
}
