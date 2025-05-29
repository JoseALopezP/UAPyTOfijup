'use client'
import Link from 'next/link'
import styles from './Selector.module.css'
import { useState, useEffect, useContext } from 'react'
import { useRouter } from 'next/navigation'
import { DataContext } from '@/context/DataContext'
import { AuthContext } from '@/context/AuthContext'
import { generateExcel } from '@/utils/excelUtils'

export default function MenuSelector() {
    const [dayXLXS, setDayXLXS] = useState(null)
    const [monthXLXS, setMonthXLXS] = useState(null)
    const [yearXLXS, setYearXLXS] = useState(null)
    const {userType, updateByDate, bydate} = useContext(DataContext);
    const {user} = useContext(AuthContext);
    const router = useRouter()
    useEffect(() => {
      if (user == null){
        router.push("/signin")
      }
    }, [user])
    const generateXLXS = async() =>{
      await updateByDate(`${dayXLXS}${monthXLXS}${yearXLXS}`)
      await setTimeout(generateExcel(bydate, `${dayXLXS}${monthXLXS}${yearXLXS}`), 3000)
    }
    return (
      <section className={`${styles.selectorSection}`}>
        <div className={`${styles.selectorBody}`}>
            <Link href="/tablero" className={`${styles.linkRedirection}`}>TABLERO</Link>
            <Link href="/audienciasUGA/listaAudiencias" className={`${styles.linkRedirection}`}>UGA OPERADOR</Link>
            <Link href="/audienciasUAC/tablero" className={`${styles.linkRedirection}`}>UAC TABLERO</Link>
            <Link href={'/audienciasUAC/control'} className={`${styles.linkRedirection} ${styles.linkRedirectionCarga}`}>UAC CARGA</Link>
            <Link href="/signup" className={`${styles.linkRedirection}`}>CONTROL USUARIOS</Link>
          {(userType == 'admin')&&(
            <>
            <h1>ETAPA EN DESARROLLO...</h1>
            <span className={`${styles.linkRedirection} ${styles.inputDate}`}>
              <input onChange={(e)=>{setDayXLXS(e.target.value)}} type='number' min={1} max={31} className={`${styles.inputDay}`}/>
              &nbsp;/&nbsp;
              <input onChange={(e)=>{setMonthXLXS(e.target.value)}} type='number' min={1} max={12} className={`${styles.inputMonth}`}/>
              &nbsp;/&nbsp;
              <input onChange={(e)=>{setYearXLXS(e.target.value)}} type='number' min={2021} max={2025} className={`${styles.inputYear}`}/>
            </span>
            <button onClick={()=> generateXLXS()} className={`${styles.linkRedirection}`}>DESCARGAR XLXS</button>
            </>
          )}
        </div>
      </section>
    )
}