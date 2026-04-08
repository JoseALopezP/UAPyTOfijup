'use client'
import React from 'react';
import styles from '../RegistroAudiencia.module.css';

/**
 * RepresentationSelector
 * @param {Array} selectedItems - Array of objects {id, nombre} already selected
 * @param {Array} availableItems - Array of all people available {id, nombre/name}
 * @param {Function} onUpdate - Callback function to update the list
 */
export const RepresentationSelector = ({ selectedItems = [], availableItems = [], onUpdate }) => {
    
    const handleChange = (index, valueId) => {
        const newItems = [...selectedItems];
        
        if (valueId === "") {
            // Remove this item
            newItems.splice(index, 1);
        } else {
            const person = availableItems.find(p => p.id === valueId);
            if (person) {
                const name = person.name || person.nombre || '';
                newItems[index] = { id: person.id, nombre: name };
            }
        }
        onUpdate(newItems);
    };

    return (
        <div className={styles.inputLeftColumn}>
            {selectedItems && selectedItems.map((item, idx) => (
                <select 
                    key={`${item.id}-${idx}`} 
                    className={`${styles.inputLeft} ${styles.inputLeft100} ${styles.inputLeftSelect}`}
                    value={item.id} 
                    onChange={(e) => handleChange(idx, e.target.value)}
                >
                    <option value="">-- Quitar Representación --</option>
                    {availableItems.map(p => (
                        <option key={p.id} value={p.id}>
                            {p.name || p.nombre} {p.role ? `(${p.role})` : ''}
                        </option>
                    ))}
                </select>
            ))}
            
            {/* The "next" selector */}
            <select 
                value="" 
                className={`${styles.inputLeft} ${styles.inputLeft100} ${styles.inputLeftSelect}`}
                onChange={(e) => handleChange(selectedItems.length, e.target.value)}
            >
                <option value="">-- Representa a... --</option>
                {availableItems
                  .filter(p => !selectedItems.some(s => s.id === p.id))
                  .map(p => (
                    <option key={p.id} value={p.id}>
                        {p.name || p.nombre} {p.role ? `(${p.role})` : ''}
                    </option>
                ))}
            </select>
        </div>
    );
};
