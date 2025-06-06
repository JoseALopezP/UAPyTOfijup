// utils/localBackup.js
const DB_NAME = "BackupAudiencias";
const STORE_NAME = "dias";
const DB_VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "fecha" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function formatFechaDDMMAAAA(fechaStr) {
  const fecha = new Date(fechaStr);
  const dd = String(fecha.getDate()).padStart(2, '0');
  const mm = String(fecha.getMonth() + 1).padStart(2, '0');
  const yyyy = fecha.getFullYear();
  return `${dd}${mm}${yyyy}`;
}

function deepSortedStringify(obj) {
  return JSON.stringify(obj, (key, value) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return Object.keys(value)
        .sort()
        .reduce((acc, k) => {
          acc[k] = value[k];
          return acc;
        }, {});
    }
    return value;
  });
}

function isEqual(obj1, obj2) {
  return deepSortedStringify(obj1) === deepSortedStringify(obj2);
}

function normalizeCambios(cambios) {
  return JSON.parse(JSON.stringify(cambios));
}

export async function guardarBackup(fecha, legajo, hora, cambios) {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);

  const fechaFormateada = formatFechaDDMMAAAA(fecha);
  const request = store.get(fechaFormateada);

  request.onsuccess = () => {
    const data = request.result || { fecha: fechaFormateada, audiencias: [] };
    const existente = data.audiencias.find(
      (a) => a.legajo === legajo && a.hora === hora
    );

    const timestamp = new Date().toLocaleString("es-AR", { hour12: false });
    const entrada = { cambios: normalizeCambios(cambios), timestamp };

    if (existente) {
      existente.historial = existente.historial || [];
      const ultimo = existente.historial[existente.historial.length - 1];
      if (!ultimo || !isEqual(ultimo.cambios, entrada.cambios)) {
        console.log("🔄 Guardando nueva versión: cambios detectados");
        console.log("Último:", JSON.stringify(ultimo?.cambios));
        console.log("Nuevo :", JSON.stringify(entrada.cambios));
        existente.historial.push(entrada);
      } else {
        console.log("✅ Cambios idénticos, no se guarda una nueva versión.");
      }
    } else {
      console.log("➕ Nueva audiencia, guardando primer versión");
      data.audiencias.push({ legajo, hora, historial: [entrada] });
    }

    store.put(data);
  };

  request.onerror = () => {
    console.error("Error al obtener el backup local del día", fechaFormateada);
  };

  tx.oncomplete = () => db.close();
}

export async function limpiarBackupsAntiguos(dias = 7) {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);

  const hoy = new Date();
  const request = store.getAll();

  request.onsuccess = () => {
    request.result.forEach((registro) => {
      const fechaStr = registro.fecha;
      const dd = parseInt(fechaStr.substring(0, 2), 10);
      const mm = parseInt(fechaStr.substring(2, 4), 10) - 1;
      const yyyy = parseInt(fechaStr.substring(4, 8), 10);
      const fecha = new Date(yyyy, mm, dd);

      const diff = (hoy - fecha) / (1000 * 60 * 60 * 24);
      if (diff > dias) {
        store.delete(fechaStr);
      }
    });
  };

  request.onerror = () => console.error("Error al limpiar backups antiguos");
  tx.oncomplete = () => db.close();
}

export async function obtenerHistorialAudiencia(fecha, legajo, hora) {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);

  const fechaFormateada = formatFechaDDMMAAAA(fecha);
  const request = store.get(fechaFormateada);

  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      const data = request.result;
      if (!data) return resolve([]);

      const audiencia = data.audiencias.find(
        (a) => a.legajo === legajo && a.hora === hora
      );

      const historial = audiencia?.historial || [];
      historial.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      resolve(historial);
    };
    request.onerror = () => reject("Error al obtener historial del backup");
  });
}