import { useState, useEffect } from "react";
import { getLocalVersions } from "@/utils/localBackup";
import styles from '../RegistroAudiencia.module.css'

export default function HistorialDeVersiones({ id_audiencia, onSeleccionar, reloadTrigger }) {
  const [versiones, setVersiones] = useState([]);

  useEffect(() => {
    function fetchHistorial() {
      const historial = getLocalVersions(id_audiencia);
      setVersiones(historial);
    }
    fetchHistorial();
  }, [id_audiencia, reloadTrigger]);

  if (versiones.length === 0) return null;

  return (
    <select className={`${styles.backupList}`} onChange={(e) => {
        const seleccion = versiones[e.target.value];
        if (seleccion) {
            onSeleccionar(seleccion);
            e.target.value = ""; // reset
        }
    }}>
        <option value="">Restaurar versión local...</option>
        {versiones.map((v, i) => (
            <option key={i} value={i}>
                Local - {new Date(v.timestamp).toLocaleString("es-AR", { 
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit', second: '2-digit'
                })}
            </option>
        ))}
    </select>
  );
}