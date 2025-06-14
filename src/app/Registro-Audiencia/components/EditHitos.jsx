'use client'
import { useContext, useEffect, useRef, useState } from 'react';
import styles from '../RegistroAudiencia.module.css';
import { DataContext } from '@/context/DataContext';

export default function EditHitos({ hitos, isHovered, item, dateToUse }) {
  const { updateData } = useContext(DataContext);
  const [items, setItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const isSavingRef = useRef(false);
  const hasChangesRef = useRef(false);
  useEffect(() => {
    if (!hasChangesRef.current) {
      setItems(hitos || []);
    }
  }, [hitos]);

  const handleChange = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          let [time, status] = item.split(" | ");
          let [hours, minutes] = time.split(":");
          if (field === "hours") hours = value;
          if (field === "minutes") minutes = value;
          if (field === "status") status = value;
          return `${hours}:${minutes} | ${status}`;
        }
        return item;
      })
    );
    hasChangesRef.current = true;
  };

  const addItem = () => {
    setItems((prev) => [...prev, "00:00 | EN_CURSO"]);
    hasChangesRef.current = true;
  };

  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
    hasChangesRef.current = true;
  };

  const saveHitos = async () => {
    if (saving || isSavingRef.current) return;
    setSaving(true);
    isSavingRef.current = true;

    try {
      await updateData(dateToUse, item.numeroLeg, item.hora, 'hitos', items);
      hasChangesRef.current = false; // ya se guardaron
    } catch (err) {
      console.error('Error guardando hitos:', err);
    } finally {
      setSaving(false);
      isSavingRef.current = false;
    }
  };

  return (
    <div className={isHovered ? `${styles.editHitosBlock} ${styles.editHitosBlockHovered}` : styles.editHitosBlock}>
      {items.map((item, index) => {
        const [time = '', status = ''] = item.split(" | ");
        const [hours = '00', minutes = '00'] = time.split(":");

        return (
          <div key={index} className={styles.hitoIndiv}>
            <input
              type="text"
              value={hours}
              onChange={(e) => handleChange(index, "hours", e.target.value)}
              className={styles.inputTime}
            />
            <span>:</span>
            <input
              type="text"
              value={minutes}
              onChange={(e) => handleChange(index, "minutes", e.target.value)}
              className={styles.inputTime}
            />
            <select
            value={status}
            onChange={(e) => handleChange(index, "status", e.target.value)}
            className={styles.inputStatus}
          >
            <option value="FINALIZADA">FINALIZADA</option>
            <option value="CUARTO_INTERMEDIO">CUARTO INTERMEDIO</option>
            <option value="EN_CURSO">EN CURSO</option>
            <option value="PROGRAMADA">PROGRAMADA</option>
            <option value="CANCELADA">CANCELADA</option>
            <option value="REPROGRAMADA">REPROGRAMADA</option>
            <option value="RESUELVO">RESUELVO</option>
          </select>
            <button onClick={() => removeItem(index)} className={styles.deleteButton}>❌</button>
          </div>
        );
      })}

      <button onClick={addItem} className={styles.addHitoButton}>
        ➕ Agregar Hito
      </button>

      <button
        onClick={saveHitos}
        className={saving ? `${styles.guardarHitosButton} ${styles.guardarButtonSaving}` : styles.guardarHitosButton}
        disabled={saving}
      >
        {saving ? 'Guardando...' : 'Guardar'}
      </button>
    </div>
  );
}
