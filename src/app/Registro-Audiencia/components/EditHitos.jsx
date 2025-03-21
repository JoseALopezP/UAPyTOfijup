'use client'
import { useState } from 'react';
import styles from '../RegistroAudiencia.module.css';

export default function EditHitos({hitos, isHovered}) {
    const [items, setItems] = useState(hitos);
      const handleChange = (index, field, value) => {
        setItems((prev) =>
          prev.map((item, i) => {
            if (i === index) {
              let [time, status] = item.split(" | ");
              let [hours, minutes] = time.split(":");
    
              if (field === "hours") hours = value.padStart(2, "0");
              if (field === "minutes") minutes = value.padStart(2, "0");
              if (field === "status") status = value;
    
              return `${hours}:${minutes} | ${status}`;
            }
            return item;
          })
        );
      };
    
      const addItem = () => {
        setItems([...items, "00:00 | EN_CURSO"]);
      };
    
      const removeItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
      };
    return (
        <div className={isHovered ? `${styles.editHitosBlock} ${styles.editHitosBlockHovered}` : `${styles.editHitosBlock}`}>
        {items.map((item, index) => {
        const [time, status] = item.split(" | ");
        const [hours, minutes] = time.split(":");

        return (
          <div key={index} className={`${styles.hitoIndiv}`} >
            <input
              type="number"
              value={hours}
              onChange={(e) => handleChange(index, "hours", e.target.value)}
              className="border p-1 w-14 text-center"
              min="0"
              max="23"
            />
            <span>:</span>
            <input
              type="number"
              value={minutes}
              onChange={(e) => handleChange(index, "minutes", e.target.value)}
              className="border p-1 w-14 text-center"
              min="0"
              max="59"
            />
            <select
              value={status}
              onChange={(e) => handleChange(index, "status", e.target.value)}
              className="border p-1"
            >
              <option value="EN_CURSO">EN_CURSO</option>
              <option value="PENDIENTE">PENDIENTE</option>
              <option value="FINALIZADO">FINALIZADO</option>
            </select>
            <button
              onClick={() => removeItem(index)}
              className="bg-red-500 text-white px-2 py-1 rounded"
            >
              ❌
            </button>
          </div>
        );
      })}
      <button onClick={addItem} className="bg-blue-500 text-white px-4 py-2 rounded">
        ➕ Add More
      </button>
    </div>
    );
}