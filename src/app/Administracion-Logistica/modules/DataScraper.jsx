'use client'
import { todayFunction } from '@/utils/dateUtils'
import styles from '../administracionLogistica.module.css'
import { useState } from 'react'

export default function DataScraper() {
    const [fechaScrap, setFechaScrap] = useState(todayFunction())
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [progress, setProgress] = useState(0)

    const handleScrap = async () => {
        if (!fechaScrap) return;

        setLoading(true);
        setError(null);
        setProgress(0);

        try {
            const eventSource = new EventSource(`/api/scrape-audiencias?dia=${fechaScrap}`);
            eventSource.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === 'progress') {
                    setProgress(data.progress);
                    console.log(data.message);
                } else if (data.type === 'complete') {
                    eventSource.close();
                    setLoading(false);
                    setProgress(100);
                    console.log('Datos scrapeados:', data.data);
                    alert('Scraping completado! Ver consola para resultados.');
                } else if (data.type === 'error') {
                    eventSource.close();

                    setLoading(false);
                    setError(data.error);
                    alert('Error: ' + data.error);
                }
            };

            eventSource.onerror = (error) => {
                console.error('Error en EventSource:', error);
                eventSource.close();
                setLoading(false);
                setError('Error de conexión con el servidor');
            };

        } catch (err) {
            console.error('Error:', err);
            setError(err.message);
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
                        {loading ? `Scrapeando... ${progress}%` : 'Scrap Datos'}
                    </button>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                </div>
            </div>
        </>
    )
}