'use client'
import styles from '../Pumba.module.css'
import Image from 'next/image'
import { useState, useContext } from 'react'
import { DataContext } from '@/context New/DataContext'

export default function HeaderPumba({ setDateToUse, autofillB, setAutofillB }) {
    const { pumaData, updatePumaData, addPumaData } = useContext(DataContext);

    const [fechaScrap, setFechaScrap] = useState('');
    const [fechaFill, setFechaFill] = useState('');
    const [loading, setLoading] = useState(false);
    const [loading2, setLoading2] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);
    const [error2, setError2] = useState(null);

    const handleFill = async () => {
        if (fechaFill !== '') {
            setLoading2(true);
            setError2(null);
            setProgress(0);
            try {
                await updatePumaData(fechaFill);
                setLoading2(false);
                setDateToUse(fechaFill);
                setProgress(100);
            } catch (error) {
                setError2(`${error}`);
                setLoading2(false);
            }
        }

    }

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
                    console.log('Datos scrapeados:', data.data.length);
                    addPumaData(fechaScrap, data.data);
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
        <><div className={styles.headerContainer}>
            <Image className={styles.pumbaLogo} src="pumbaLogo.png" alt="Logo" color='white' width={81} height={38} />
            <button className={`${styles.autofillButton}`} onClick={() => setAutofillB(!autofillB)}>Autofill</button>
            <h2 className={`${styles.titleScrap}`}>Justificar el sueldo</h2>
            <div className={styles.headerTitleContainer}>
                <input
                    value={fechaFill}
                    className={`${styles.inputScrap}`}
                    onChange={e => { setFechaFill(e.target.value) }}
                    disabled={loading2}
                />
                <button
                    className={`${styles.buttonScrap}`}
                    onClick={handleFill}
                    disabled={loading2}
                >Cargar Día</button>
                {error2 && <p style={{ color: 'red' }}>{error2}</p>}
            </div>
            <div className={styles.headerTitleContainer}>
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
                >{loading ? `Scrapeando... ${progress}%` : 'Scrap Datos'}</button>
                {error && <p style={{ color: 'red' }}>{error}</p>}
            </div>
        </div></>
    )
}