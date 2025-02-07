import styles from './SelectDate.module.css';
import { useState } from 'react';

export function SelectDate({dateFunction, date}) {
    const [dia, setDia] = useState(date.substring(0,2))
    const [mes, setMes] = useState(date.substring(2,4))
    const [anio, setAnio] = useState(date.substring(4,8))
    return(
        <section className={`${styles.audienciaSelectDateBlock}`}>
            <input type="text" className={`${styles.selectDate2}`} value={dia} onChange={e => {setDia(e.target.value)}}/>
            <input type="text" className={`${styles.selectDate2}`} value={mes} onChange={e => {setMes(e.target.value)}}/>
            <input type="text" className={`${styles.selectDate4}`} value={anio} onChange={e => {setAnio(e.target.value)}}/>
            <button type="button" className={`${styles.selectDateButton}`} onClick={() => dateFunction(''+dia.padStart(2,'0')+mes.padStart(2,'0')+anio.padStart(4,'20'))}>CAMBIAR</button>
        </section>
    )
}