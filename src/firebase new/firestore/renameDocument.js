import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc
} from "firebase/firestore";
import firebase_app from "../../firebase/config";

const db = getFirestore(firebase_app);

export default async function renameDocument() {
  const oldParentId = "06.1082025";
  const newParentId = "06082025";
  const subcollectionName = "audiencias";

  const oldSubColRef = collection(db, "audiencias", oldParentId, subcollectionName);
  const newSubColPath = collection(db, "audiencias", newParentId, subcollectionName);

  const snapshot = await getDocs(oldSubColRef);

  if (snapshot.empty) {
    console.log("La subcolección original no tiene documentos.");
    return;
  }

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    const newDocRef = doc(newSubColPath, docSnap.id);
    await setDoc(newDocRef, data);
  }

  console.log(`Subcolección '${subcollectionName}' copiada de ${oldParentId} a ${newParentId}`);
}
