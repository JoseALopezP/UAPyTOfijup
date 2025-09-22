import { useState } from 'react'
import styles from './Carga-Juicio.module.css'

export function BloqueJuicio ({bloque}){
    const [fechaD, setFechaD] = useState(bloque.fechaD)
    const [fechaM, setFechaM] = useState(bloque.fechaM)
    const [fechaA, setFechaA] = useState(bloque.fechaA)
    return(
        <div className={`${styles.bloqueJuicioSection}`}>
            <p>{fechaD}{fechaM}{fechaA}</p>
            <p>{bloque.hora}</p>
            <p>{bloque.minuto}</p>
        </div>
    )
}
