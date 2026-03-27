'use client';
import React, { useState, useRef, useEffect } from 'react';
import styles from '../SolicitudesAudiencia.module.css';

/**
 * Componente que muestra un botón (+) que al clickear abre un dropdown
 * con opciones para seleccionar.
 * 
 * @param {Array} options - Lista de strings a mostrar
 * @param {Function} onSelect - Callback al elegir una opción
 * @param {String} title - Título del dropdown
 */
export default function SelectorDropdown({ options = [], onSelect, title = "Opciones" }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Cerrar al hacer click fuera
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className={styles.selectorWrapper} ref={dropdownRef}>
            <button
                className={styles.buttonExpand}
                onClick={() => setIsOpen(!isOpen)}
                type="button"
            >
                {isOpen ? '-' : '+'}
            </button>

            {isOpen && (
                <div className={styles.expandDropdown} style={{ top: '25px', left: '0', minWidth: '180px', zIndex: 999999 }}>
                    <div className={styles.dropdownHeader}>
                        <span>{title}</span>
                        <button onClick={() => setIsOpen(false)} className={styles.closeBtn}>×</button>
                    </div>
                    <div className={styles.dropdownList}>
                        {options.length > 0 ? (
                            options.map((opt, i) => (
                                <div
                                    key={i}
                                    className={styles.dropdownItem}
                                    onClick={() => {
                                        onSelect(opt);
                                        setIsOpen(false);
                                    }}
                                >
                                    {opt}
                                </div>
                            ))
                        ) : (
                            <div className={styles.dropdownEmpty}>No hay opciones</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
