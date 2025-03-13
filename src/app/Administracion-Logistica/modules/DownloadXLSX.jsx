'use client'
import styles from '../administracionLogistica.module.css'
import { useState } from 'react'

export default function DownloadXLSX() {
    const [fechaInicio, setFechaInicio] = useState('')
    const [fechaFin, setFechaFin] = useState('')
    const handleDescarga = () =>{
      
    }
    return (
      <>
        <div className={`${styles.downloadXLSXcontainer}`}>
            <span className={`${styles.downloadXLSXsubContainer}`}><h2 className={`${styles.title}`}>DESCARGAR xlxs</h2>
            <label className={`${styles.subtitle}`}>Fecha Inicio (DDMMAAAA)</label>
            <input value={fechaInicio} className={`${styles.inputxlsx}`} onChange={e => {setFechaInicio(e.target.value)}}/>
            <label className={`${styles.subtitle}`}>Fecha fin (DDMMAAAA)</label>
            <input value={fechaFin} className={`${styles.inputxlsx}`} onChange={e => {setFechaFin(e.target.value)}}/></span>
            <button className={`${styles.buttonxlsx}`} onClick={()=>handleDescarga}>DESCARGAR</button>
        </div>
      </>
    )
}