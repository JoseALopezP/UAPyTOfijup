import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import firebase_app from "../config";

const db = getFirestore(firebase_app);

export default async function renameDocument() {
  const oldDocumentId = "08042026";
  const newDocumentId = "09042026";
  const collectionName = "audienciasView";

  const oldDocRef = doc(db, collectionName, oldDocumentId);
  const newDocRef = doc(db, collectionName, newDocumentId);

  const docSnap = await getDoc(oldDocRef);

  if (!docSnap.exists()) {
    console.log(`El documento original ${oldDocumentId} no existe en ${collectionName}.`);
    return;
  }

  const data = docSnap.data();
  await setDoc(newDocRef, data);

  console.log(`Documento '${oldDocumentId}' copiado a '${newDocumentId}' en la colección '${collectionName}'`);
}
