'use client'
import { getValuesInDateRangeInforme } from '@/utils/excelUtils'
import styles from '../administracionLogistica.module.css'
import { useState, useContext } from 'react'
import { DataContext } from '@/context New/DataContext'

export default function DownloadXLSXInforme() {
    const [fechaInicio, setFechaInicio] = useState('')
    const [fechaFin, setFechaFin] = useState('')
    const {getByDate} = useContext(DataContext)
    const handleDescarga = () =>{
      getValuesInDateRangeInforme(fechaInicio, fechaFin, getByDate)
    }
    return (
      <>
        <div className={`${styles.downloadXLSXcontainer}`}>
            <span className={`${styles.downloadXLSXsubContainer}`}><h2 className={`${styles.title}`}>DESCARGAR xlxs Informe</h2>
            <label className={`${styles.subtitle}`}>Fecha Inicio (DDMMAAAA)</label>
            <input value={fechaInicio} className={`${styles.inputxlsx}`} onChange={e => {setFechaInicio(e.target.value)}}/>
            <label className={`${styles.subtitle}`}>Fecha fin (DDMMAAAA)</label>
            <input value={fechaFin} className={`${styles.inputxlsx}`} onChange={e => {setFechaFin(e.target.value)}}/></span>
            <button className={`${styles.buttonxlsx}`} onClick={()=>handleDescarga()}>DESCARGAR</button>
        </div>
      </>
    )
}