import { doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

export const updateDocumentAndObjectField = async (date, audId, field, value) => {
  try {
    const audDocRef = doc(db, "audiencias", date, audId);
    await updateDoc(audDocRef, {
        [field]: value
    });
    const viewDocRef = doc(db, "audienciasView", date);
    await updateDoc(viewDocRef, {
        [`${audId}.${field}`]: value
    });
    } catch (e) {
        console.error("Firebase fetch error:", e);
        throw new Error(e.message || "Failed to fetch data from Firestore.");
    }
};