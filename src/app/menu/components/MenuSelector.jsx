'use client'
import Link from 'next/link'
import styles from './Selector.module.css'
import { useState } from 'react'

export default function MenuSelector() {
    const [dayUGA, setDayUGA] = useState(null)
    const [monthUGA, setMonthUGA] = useState(null)
    const [yearUGA, setYearUGA] = useState(null)
    const [dayUAC, setDayUAC] = useState(null)
    const [monthUAC, setMonthUAC] = useState(null)
    const [yearUAC, setYearUAC] = useState(null)
    /*useEffect(() => {
      if (user == null) router.push("/signin")
    }, [user])*/
    return (
      <section className={`${styles.selectorSection}`}>
        <div className={`${styles.selectorBody}`}>
          <Link href="/tablero" className={`${styles.linkRedirection}`}>TABLERO</Link>
          <Link href="/audienciasUGA/tablero" className={`${styles.linkRedirection}`}>UGA TABLERO</Link>
          <span className={`${styles.linkRedirection} ${styles.inputDate}`}>
            <input onChange={(e)=>{setDayUGA(e.target.value)}} type='number' min={1} max={31} className={`${styles.inputDay}`}/>
            &nbsp;/&nbsp;
            <input onChange={(e)=>{setMonthUGA(e.target.value)}} type='number' min={1} max={12} className={`${styles.inputMonth}`}/>
            &nbsp;/&nbsp;
            <input onChange={(e)=>{setYearUGA(e.target.value)}} type='number' min={2021} max={2025} className={`${styles.inputYear}`}/>
          </span>
          <Link href={'/audienciasUAC/' + dayUGA + monthUGA + yearUGA} className={`${styles.linkRedirection} ${styles.linkRedirectionCarga}`}>UGA CARGA</Link>
          <Link href="/audienciasUGA/listaAudiencias" className={`${styles.linkRedirection}`}>UGA OPERADOR</Link>
          <Link href="/audienciasUAC/tablero" className={`${styles.linkRedirection}`}>UAC TABLERO</Link>
          <span className={`${styles.linkRedirection} ${styles.inputDate}`}>
            <input onChange={(e)=>{setDayUAC(e.target.value)}} type='number' min={1} max={31} className={`${styles.inputDay}`}/>
            &nbsp;/&nbsp;
            <input onChange={(e)=>{setMonthUAC(e.target.value)}} type='number' min={1} max={12} className={`${styles.inputMonth}`}/>
            &nbsp;/&nbsp;
            <input onChange={(e)=>{setYearUAC(e.target.value)}} type='number' min={2021} max={2025} className={`${styles.inputYear}`}/>
          </span>
          <Link href={'/audienciasUAC/' + dayUAC + monthUAC + yearUAC} className={`${styles.linkRedirection} ${styles.linkRedirectionCarga}`}>UAC CARGA</Link>
        </div>
      </section>
    )
}