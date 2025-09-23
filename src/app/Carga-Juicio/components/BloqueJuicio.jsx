import { useState } from 'react'
import styles from './Carga-Juicio.module.css'

export function BloqueJuicio ({bloque, testigos}){
    const [fechaD, setFechaD] = useState(bloque.fechaD)
    const [fechaM, setFechaM] = useState(bloque.fechaM)
    const [fechaA, setFechaA] = useState(bloque.fechaA)
    const [horaH, setHoraH] = useState(bloque.hora)
    const [horaM, setHoraM] = useState(bloque.minuto)
    return(
        <div className={`${styles.bloqueJuicioSection}`}>
            <span className={`${styles.dateTimeJuicio}`}>
                <input className={`${styles.inputDateTime}`} type='text' value={fechaD} onChange={e => setFechaD(e.target.value)}/>
                <input className={`${styles.inputDateTime}`} value={fechaM} onChange={e => setFechaM(e.target.value)}/>
                <input className={`${styles.inputDateTimeDouble}`} value={fechaA} onChange={e => setFechaA(e.target.value)}/>
                <label className={`${styles.lineSeparator}`}>|</label>
                <input className={`${styles.inputDateTime}`} value={horaH} onChange={e => setHoraH(e.target.value)}/>
                <input className={`${styles.inputDateTime}`} value={horaM} onChange={e => setHoraM(e.target.value)}/>
            </span>
            <span className={`${styles.horizontalSeparator}`}></span>
            <span className={`${styles.controlJuicio}`}>
                {}
            </span>
        </div>
    )
}
