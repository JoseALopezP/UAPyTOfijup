'use client'
import { useState } from 'react'
import styles from '../SolicitudesAudiencia.module.css'

export default function HeaderSolicitudes() {
    const [url, setUrl] = useState('')
    const scrapHandler = async () => {
        if (!url) return;
        try {
            const response = await fetch('/api/extraer-datos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            });
            const data = await response.json();
            console.log(response.ok ? "Extracción exitosa:" : "Error:", data);
        } catch (error) {
            console.error("Error de red:", error);
        }
    }
    return (
        <div className={`${styles.solHeader}`}>
            <span className={`${styles.headerSection}`}>
                <input type="text" placeholder="url solicitud" className={`${styles.headerInput}`} value={url} onChange={(e) => setUrl(e.target.value)} />
                <button className={`${styles.addButton}`} onClick={scrapHandler}>+</button>
            </span>
        </div>
    )
}