import firebase_app from "../config";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";

const db = getFirestore(firebase_app);

export default async function deleteAudienciasDay(date) {
  try {
    const subcolRef = collection(db, "audiencias", date, "audiencias");
    const snapshot = await getDocs(subcolRef);
    const deleteSubcolPromises = snapshot.docs.map((d) =>
      deleteDoc(doc(db, "audiencias", date, "audiencias", d.id))
    );
    await Promise.all(deleteSubcolPromises);
    console.log(`🧹 Subcolección audiencias/${date}/audiencias borrada.`);
    const dateDocRef = doc(db, "audiencias", date);
    await deleteDoc(dateDocRef);

    console.log(`✅ Documento audiencias/${date} eliminado completamente.`);
  } catch (error) {
    console.error("❌ Error eliminando el día completo:", error);
    throw new Error(error.message || "Error al eliminar el día completo.");
  }
}