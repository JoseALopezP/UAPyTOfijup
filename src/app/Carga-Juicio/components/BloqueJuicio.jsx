import { useState } from 'react'
import styles from './Carga-Juicio.module.css'

export function BloqueJuicio ({bloque, testigos=[{nombre: 'Pepe Honguito',fechaD: '21',fechaM: '09',fechaA: '2025',horaH: '17',horaM: '00', completo: true, dni:12121212},{nombre: 'Pepe Honguito',fechaD: '21',fechaM: '09',fechaA: '2025',horaH: '17',horaM: '30', completo: false, dni:12121212}]}){
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
                <span className={`${styles.testigosList}`}>
                    {testigos && testigos.filter(el => (el.fechaD === fechaD && el.fechaM === fechaM && el.fechaA === fechaA)).map(el =>(
                        <span className={`${styles.testigoIndiv}`}>{el.completo === true ? <p className={`${styles.completado}`}>&nbsp;⬤</p> : <p className={`${styles.noCompletado}`}>◯</p>}<p>&nbsp;{el.nombre}</p></span>
                    ))}
                </span>
                <span className={`${styles.estadoBlock}`}>
                    <p>BLOQUE 1</p>
                    <p>FINALIZADA</p>
                </span>
            </span>
        </div>
    )
}
