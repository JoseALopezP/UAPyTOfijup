import firebase_app from "../config";
import { getFirestore, doc, onSnapshot } from "firebase/firestore";

const db = getFirestore(firebase_app);

/**
 * Escucha cambios en audienciasView/{date} en tiempo real.
 * Retorna una función unsubscribe para limpiar el listener.
 * 
 * Uso:
 *   const unsub = listenToDateView("06042026", (data) => setState(data));
 *   // cleanup:
 *   unsub();
 */
export function listenToDateView(date, callback, onError) {
  const docRef = doc(db, "audienciasView", date);

  const unsubscribe = onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data());
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error(`❌ Error listening to audienciasView/${date}:`, error);
      if (onError) onError(error);
    }
  );

  return unsubscribe;
}
