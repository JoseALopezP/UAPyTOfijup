import firebase_app from "../config";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
const db = getFirestore(firebase_app);

export const updateDocumentField = async (date, audId, field, value) => {
  try {
    const audDocRef = doc(db, "audiencias", date, audId);
    await updateDoc(audDocRef, {
        [field]: value
    });
    } catch (e) {
        console.error("Firebase update error:", e);
        throw new Error(e.message || "Failed to update data from Firestore.");
    }
};