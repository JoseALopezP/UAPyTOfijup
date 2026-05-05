import firebase_app from "../config";
import { getFirestore, doc, writeBatch } from "firebase/firestore";

const db = getFirestore(firebase_app);

/**
 * Actualiza múltiples campos de una audiencia de forma atómica (Batch).
 * @param {string} date - Fecha de la audiencia (DDMMYYYY).
 * @param {string} audId - ID de la audiencia.
 * @param {Object} metadataChanges - Campos que se sincronizan con audienciasView.
 * @param {Object} bodyChanges - Campos pesados (minuta, resuelvo) que NO van a audienciasView.
 */
export const updateAudienciaBulk = async (date, audId, metadataChanges = {}, bodyChanges = {}) => {
  if (!date || !audId) throw new Error("Faltan parámetros obligatorios (date o audId).");

  try {
    const batch = writeBatch(db);
    const audDocRef = doc(db, "audiencias", date, "audiencias", audId);
    const viewDocRef = doc(db, "audienciasView", date);

    const allAudChanges = { ...metadataChanges, ...bodyChanges };
    
    // 1. Actualizar documento principal en la subcolección 'audiencias'
    if (Object.keys(allAudChanges).length > 0) {
      batch.update(audDocRef, allAudChanges);
    }

    // 2. Actualizar documento de resumen en 'audienciasView' (solo metadatos)
    if (Object.keys(metadataChanges).length > 0) {
      const viewUpdate = {};
      for (const [field, value] of Object.entries(metadataChanges)) {
        // Usar dot notation para actualizar campos específicos del objeto de la audiencia
        viewUpdate[`${audId}.${field}`] = value;
      }
      batch.update(viewDocRef, viewUpdate);
    }

    // 3. Ejecutar todo como una sola operación atómica
    await batch.commit();
  } catch (e) {
    console.error("Firebase bulk update error:", e);
    throw new Error(e.message || "Error al realizar la actualización en bloque.");
  }
};
