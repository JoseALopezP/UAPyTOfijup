'use client'
import styles from '../administracionLogistica.module.css'
import { useState } from 'react'
import getInfoUAL from './scrappingUAL'

export default function DataScraper() {
    const [fechaScrap, setFechaScrap] = useState('')
    const handleScrap = () => {
        getInfoUAL(fechaScrap)
    }
    return (
        <>
            <div className={`${styles.dataScraperBlock}`}>
                <h2 className={`${styles.titleScrap}`}>Justificar el sueldo</h2>
                <div className={`${styles.SelectionBlockScrap}`}>
                    <label className={`${styles.subtitleScrap}`}>Día a completar:</label>
                    <input value={fechaScrap} className={`${styles.inputScrap}`} onChange={e => { setFechaScrap(e.target.value) }} />
                    <button className={`${styles.buttonScrap}`} onClick={() => handleScrap()}>Scrap Datos</button>
                </div>
            </div>
        </>
    )
}