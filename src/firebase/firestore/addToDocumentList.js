import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

export const addToDocumentList = async (collectionName, docId, field, value) => {
  try {
    const ref = doc(db, collectionName, docId);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, { [field]: [value] });
    }
    const data = snap.data();
    const currentArray = data[field] || [];
    if (!currentArray.includes(value)) {
      await updateDoc(ref, {
        [field]: [...currentArray, value],
      });
    }
  } catch (error) {
    console.error("Error adding element to document:", error);
    throw error;
  }
};
