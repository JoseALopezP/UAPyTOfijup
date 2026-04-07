'use client'
import { useContext, useEffect, useRef, useState } from 'react';
import styles from '../RegistroAudiencia.module.css';
import { DataContext } from '@/context New/DataContext';

export default function EditHitos({ hitos, isHovered, item, dateToUse }) {
  const { updateData } = useContext(DataContext);
  const [items, setItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const isSavingRef = useRef(false);
  const hasChangesRef = useRef(false);

  // Reset edits and re-sync whenever the selected audiencia changes
  useEffect(() => {
    hasChangesRef.current = false;
    setItems(hitos || []);
  }, [item?.id]);

  // Sync if hitos change externally and we have no local edits pending
  useEffect(() => {
    if (!hasChangesRef.current) {
      setItems(hitos || []);
    }
  }, [hitos]);

  const parseHito = (hitoStr) => {
    // Tolerate both "HH:MM | STATUS" and "HH:MM|STATUS"
    const sepIndex = hitoStr.indexOf('|');
    if (sepIndex === -1) return { time: hitoStr.trim(), status: '' };
    const time = hitoStr.slice(0, sepIndex).trim();
    const status = hitoStr.slice(sepIndex + 1).trim();
    return { time, status };
  };

  const handleChange = (index, field, value) => {
    setItems((prev) =>
      prev.map((hitoStr, i) => {
        if (i !== index) return hitoStr;
        const { time, status } = parseHito(hitoStr);
        const [hours = '00', minutes = '00'] = time.split(':');
        const newHours   = field === 'hours'   ? value : hours;
        const newMinutes = field === 'minutes' ? value : minutes;
        const newStatus  = field === 'status'  ? value : status;
        return `${newHours}:${newMinutes} | ${newStatus}`;
      })
    );
    hasChangesRef.current = true;
  };

  const addItem = () => {
    setItems((prev) => [...prev, '00:00 | EN_CURSO']);
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
      await updateData(dateToUse, item.id, 'hitos', items);
      hasChangesRef.current = false;
    } catch (err) {
      console.error('Error guardando hitos:', err);
    } finally {
      setSaving(false);
      isSavingRef.current = false;
    }
  };

  return (
    <div className={isHovered ? `${styles.editHitosBlock} ${styles.editHitosBlockHovered}` : styles.editHitosBlock}>
      {items.map((hitoStr, index) => {
        const { time, status } = parseHito(hitoStr);
        const [hours = '00', minutes = '00'] = time.split(':');

        return (
          <div key={index} className={styles.hitoIndiv}>
            <input
              type="text"
              value={hours}
              onChange={(e) => handleChange(index, 'hours', e.target.value)}
              className={styles.inputTime}
            />
            <span>:</span>
            <input
              type="text"
              value={minutes}
              onChange={(e) => handleChange(index, 'minutes', e.target.value)}
              className={styles.inputTime}
            />
            <select
              value={status}
              onChange={(e) => handleChange(index, 'status', e.target.value)}
              className={styles.inputStatus}
            >
              <option value="FINALIZADA">FINALIZADA</option>
              <option value="EN_CURSO">EN CURSO</option>
              <option value="PROGRAMADA">PROGRAMADA</option>
              <option value="CANCELADA">CANCELADA</option>
              <option value="REPROGRAMADA">REPROGRAMADA</option>
              <option value="RESUELVO">RESUELVO</option>
              <option value="CUARTO_INTERMEDIO">CUARTO INTERMEDIO</option>
            </select>
            <button type="button" onClick={() => removeItem(index)} className={styles.deleteButton}>❌</button>
          </div>
        );
      })}

      <button type="button" onClick={addItem} className={styles.addHitoButton}>
        ➕ Agregar Hito
      </button>

      <button
        type="button"
        onClick={saveHitos}
        className={saving ? `${styles.guardarHitosButton} ${styles.guardarButtonSaving}` : styles.guardarHitosButton}
        disabled={saving}
      >
        {saving ? 'Guardando...' : 'Guardar'}
      </button>
    </div>
  );
}
