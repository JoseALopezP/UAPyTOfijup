// utils/localBackup.js
const MAX_VERSIONS = 20;
let hasCleanedUp = false;

export const saveLocalVersion = (data) => {
  if (typeof window !== "undefined" && !hasCleanedUp) {
      hasCleanedUp = true;
      try { limpiarBackupsAntiguos(7); } catch (e) { console.error(e); }
  }

  if (!data || !data.id_audiencia) return;

  const storageKey = `audiencia_${data.id_audiencia}_history`;

  // 1. Obtener historial previo o crear uno nuevo
  let history = JSON.parse(localStorage.getItem(storageKey)) || [];

  // Verificamos que el último guardado no sea exactamente el mismo 
  const ultimo = history[0];
  if (
    ultimo &&
    ultimo.minuta === data.minuta &&
    ultimo.resuelvo === data.resuelvo &&
    ultimo.cierre === data.cierre
  ) {
    return; // No guardamos si es idéntico
  }

  // 2. Añadir la nueva versión con timestamp
  const newEntry = {
    ...data,
    timestamp: new Date().toISOString(),
  };

  history.unshift(newEntry); // Agregar al inicio

  // 3. Mantener solo las últimas N versiones
  if (history.length > MAX_VERSIONS) {
    history = history.slice(0, MAX_VERSIONS);
  }

  // 4. Guardar en LocalStorage
  localStorage.setItem(storageKey, JSON.stringify(history));
};

export const getLocalVersions = (id_audiencia) => {
  if (!id_audiencia) return [];
  const storageKey = `audiencia_${id_audiencia}_history`;
  try {
    return JSON.parse(localStorage.getItem(storageKey)) || [];
  } catch (error) {
    console.error("Error reading localStorage", error);
    return [];
  }
};

export const clearLocalVersions = (id_audiencia) => {
  if (!id_audiencia) return;
  const storageKey = `audiencia_${id_audiencia}_history`;
  localStorage.removeItem(storageKey);
};

export function limpiarBackupsAntiguos(dias = 7) {
  // Recorrer localStorage para limpiar keys antiguos (7 dias)
  const prefix = "audiencia_";
  const suffix = "_history";
  const hoy = new Date();

  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix) && key.endsWith(suffix)) {
      try {
        const history = JSON.parse(localStorage.getItem(key)) || [];
        if (history.length > 0) {
          const firstTimestamp = new Date(history[history.length - 1].timestamp);
          const diff = (hoy - firstTimestamp) / (1000 * 60 * 60 * 24);
          if (diff > dias) {
            localStorage.removeItem(key);
          }
        } else {
            localStorage.removeItem(key);
        }
      } catch (e) {
          // Si algo falla leyendo la historia, la borramos por seguridad.
          localStorage.removeItem(key);
      }
    }
  }
}