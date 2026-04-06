import { doc, getFirestore, updateDoc, deleteField } from "firebase/firestore";
import firebase_app from "../config";

const db = getFirestore(firebase_app);

export async function removeObject(collectionName, docId, objectId) {
  try {
    const ref = doc(db, collectionName, docId);
    await updateDoc(ref, {
      [objectId]: deleteField()
    });
  } catch (error) {
    console.error("❌ Error removing object:", error);
    throw new Error(error.message || "Failed to remove object.");
  }
}