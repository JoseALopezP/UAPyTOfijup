import { useState } from 'react'
import styles from './Carga-Juicio.module.css'

export function BloqueJuicio ({bloque}){
    const [fechaD, setFechaD] = useState(bloque.fechaD)
    const [fechaM, setFechaM] = useState(bloque.fechaM)
    const [fechaA, setFechaA] = useState(bloque.fechaA)
    const [horaH, setHoraH] = useState(bloque.fechaA)
    const [horaM, setHoraM] = useState(bloque.fechaA)
    return(
        <div className={`${styles.bloqueJuicioSection}`}>
            <input type='text' value={fechaD} onChange={e => setFechaD(e.target.value)}/>
            <input value={fechaM} onChange={e => setFechaM(e.target.value)}/>
            <input value={fechaA} onChange={e => setFechaA(e.target.value)}/>

            <input value={horaH} onChange={e => setHoraH(e.target.value)}/>
            <input value={horaM} onChange={e => setHoraM(e.target.value)}/>
        </div>
    )
}
