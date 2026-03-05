'use client';
import React, { useState, useRef } from 'react';
import styles from '../SolicitudesAudiencia.module.css';

export default function ExpandContent({ children, label = "Ver" }) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    return (
        <div
            className={styles.expandContainer}
            ref={containerRef}
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            <button
                className={`${styles.expandButton} ${isOpen ? styles.expandButtonActive : ''}`}
                type="button"
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
