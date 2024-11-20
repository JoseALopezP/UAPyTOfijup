import styles from '../SituacionCorporal.module.css';
import { useEffect, useState } from 'react';

export function SitCorporalSelectDate({dateFunction, date}) {
    const [dia, setDia] = useState(date.substring(0,2))
    const [mes, setMes] = useState(date.substring(2,4))
    const [anio, setAnio] = useState(date.substring(4,8))
    useEffect(() =>{
        setDia(date.substring(0,2))
        setMes(date.substring(2,4))
        setAnio(date.substring(4,8))
    }, [date])
    return(
        <div className={`${styles.selectDateBlock}`}>
        <div className={`${styles.audienciaSelectDateBlock}`}>
            <input type="text" className={`${styles.selectDate2}`} value={dia} onChange={e => {setDia(e.target.value)}}/>
            <input type="text" className={`${styles.selectDate2}`} value={mes} onChange={e => {setMes(e.target.value)}}/>
            <input type="text" className={`${styles.selectDate4}`} value={anio} onChange={e => {setAnio(e.target.value)}}/>
            <button type="button" className={`${styles.selectDateButton}`} onClick={() => dateFunction(''+dia+mes+anio)}>CAMBIAR</button>
        </div></div>
    )
}