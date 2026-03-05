'use client';
import React, { useState, useRef, useEffect } from 'react';
import styles from '../SolicitudesAudiencia.module.css';

export default function ExpandContent({ children, label = "Ver" }) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Cerrar al hacer click fuera
    useEffect(() => {
        function handleClickOutside(event) {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
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
        <div className={styles.expandContainer} ref={containerRef}>
            <button
                className={styles.expandButton}
                onClick={() => setIsOpen(!isOpen)}
            >
                {label} {isOpen ? '▲' : '▼'}
            </button>

            {isOpen && (
                <div className={styles.expandDropdown}>
                    {children}
                </div>
            )}
        </div>
    );
}
