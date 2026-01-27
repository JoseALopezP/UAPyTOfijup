'use client'
import styles from '../administracionLogistica.module.css'
import { useState } from 'react'

export default function DataScraper() {
    const [fechaScrap, setFechaScrap] = useState('26')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const handleScrap = async () => {
        if (!fechaScrap) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/scrape-audiencias', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dia: fechaScrap })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Error en scraping');
            }

            console.log('Datos scrapeados:', result.data);
            alert('Scraping completado! Ver consola para resultados.');
        } catch (err) {
            console.error('Error:', err);
            setError(err.message);
            alert('Error: ' + err.message);
        } finally {
            setLoading(false);
        }
    }
    return (
        <>
            <div className={`${styles.dataScraperBlock}`}>
                <h2 className={`${styles.titleScrap}`}>Justificar el sueldo</h2>
                <div className={`${styles.SelectionBlockScrap}`}>
                    <label className={`${styles.subtitleScrap}`}>Día a completar:</label>
                    <input
                        value={fechaScrap}
                        className={`${styles.inputScrap}`}
                        onChange={e => { setFechaScrap(e.target.value) }}
                        disabled={loading}
                    />
                    <button
                        className={`${styles.buttonScrap}`}
                        onClick={handleScrap}
                        disabled={loading}
                    >
                        {loading ? 'Scrapeando...' : 'Scrap Datos'}
                    </button>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                </div>
            </div>
        </>
    )
}