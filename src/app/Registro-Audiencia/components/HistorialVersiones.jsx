import { useState, useEffect } from "react";
import { obtenerHistorialAudiencia } from "@/utils/localBackup";
import styles from '../RegistroAudiencia.module.css'

export default function HistorialDeVersiones({ fecha, legajo, hora, onSeleccionar }) {
  const [versiones, setVersiones] = useState([]);

  useEffect(() => {
    async function fetchHistorial() {
      const historial = await obtenerHistorialAudiencia(fecha, legajo, hora);
      setVersiones(historial);
    }
    fetchHistorial();
  }, [fecha, legajo, hora]);

  if (versiones.length === 0) return null;

  return (
    <select className={`${styles.backupList}`} onChange={(e) => {
        const seleccion = versiones[e.target.value];
        if (seleccion) onSeleccionar(seleccion.cambios);
        }}>
        {versiones.slice().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).map((v, i) => (
            <option key={i} value={i}>
            {new Date(v.timestamp).toLocaleString("es-AR", { hour12: false })}
            </option>
        ))}
    </select>
  );
}
