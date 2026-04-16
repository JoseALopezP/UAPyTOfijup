import firebase_app from "../config";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
const db = getFirestore(firebase_app);

export const updateJuicioBlockStatus = async (year, juicioId, audId, newStatus) => {
  try {
    const docRef = doc(db, "juicios", String(year));
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      const juicio = data[juicioId];
      if (juicio && juicio.bloques) {
        const updatedBloques = juicio.bloques.map(block => 
          block.audId === audId ? { ...block, estadoBloque: newStatus } : block
        );
        
        const fieldPath = `${juicioId}.bloques`;
        await updateDoc(docRef, {
          [fieldPath]: updatedBloques,
        });
      }
    }
  } catch (e) {
    console.error("Firebase update trial block error:", e);
    throw new Error(e.message || "Failed to update trial block status.");
  }
};
