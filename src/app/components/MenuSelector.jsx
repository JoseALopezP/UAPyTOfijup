'use client'
import Link from 'next/link'
import styles from './Selector.module.css'
import { useState, useEffect, useContext } from 'react'
import { useRouter } from 'next/navigation'
import { DataContext } from '@/context/DataContext'
import { AuthContext } from '@/context/AuthContext'

export default function MenuSelector() {
    const [dayUGA, setDayUGA] = useState(null)
    const [monthUGA, setMonthUGA] = useState(null)
    const [yearUGA, setYearUGA] = useState(null)
    const [dayUAC, setDayUAC] = useState(null)
    const [monthUAC, setMonthUAC] = useState(null)
    const [yearUAC, setYearUAC] = useState(null)
    const {checkUserType, userType} = useContext(DataContext);
    const {user} = useContext(AuthContext);
    const router = useRouter()
    useEffect(() => {
      if (user == null){
        router.push("/signin")
      }else{
        console.log(user.uid)
        checkUserType(user.uid)
        if(userType == 'operador'){
          router.push("/audienciasUGA/listaAudiencias")
        }
      }
    }, [user])
    return (
      <section className={`${styles.selectorSection}`}>
        <div className={`${styles.selectorBody}`}>
          {(userType == 'admin' || userType == 'uapyt')&&(
            <Link href="/tablero" className={`${styles.linkRedirection}`}>TABLERO</Link>
          )}
          {(userType == 'admin' || userType == 'ugaadmin')&&(
            <>
            <Link href="/audienciasUGA/tablero" className={`${styles.linkRedirection}`}>UGA TABLERO</Link>
            <span className={`${styles.linkRedirection} ${styles.inputDate}`}>
              <input onChange={(e)=>{setDayUGA(e.target.value)}} type='number' min={1} max={31} className={`${styles.inputDay}`}/>
              &nbsp;/&nbsp;
              <input onChange={(e)=>{setMonthUGA(e.target.value)}} type='number' min={1} max={12} className={`${styles.inputMonth}`}/>
              &nbsp;/&nbsp;
              <input onChange={(e)=>{setYearUGA(e.target.value)}} type='number' min={2021} max={2025} className={`${styles.inputYear}`}/>
            </span>
            {(dayUGA && monthUGA && yearUGA)&&
            (<Link href={'/audienciasUGA/' + dayUGA.padStart(2,'0') + monthUGA.padStart(2,'0') + yearUGA.padStart(4,'20')} className={`${styles.linkRedirection} ${styles.linkRedirectionCarga}`}>UGA CARGA</Link>)}
            </>
          )}
          {(userType == 'admin' || userType == 'ugaadmin' || userType == 'operador')&&(
            <Link href="/audienciasUGA/listaAudiencias" className={`${styles.linkRedirection}`}>UGA OPERADOR</Link>
          )}
          {(userType == 'admin' || userType == 'uac')&&(
            <>
            <Link href="/audienciasUAC/tablero" className={`${styles.linkRedirection}`}>UAC TABLERO</Link>
            <span className={`${styles.linkRedirection} ${styles.inputDate}`}>
              <input onChange={(e)=>{setDayUAC(e.target.value)}} type='number' min={1} max={31} className={`${styles.inputDay}`}/>
              &nbsp;/&nbsp;
              <input onChange={(e)=>{setMonthUAC(e.target.value)}} type='number' min={1} max={12} className={`${styles.inputMonth}`}/>
              &nbsp;/&nbsp;
              <input onChange={(e)=>{setYearUAC(e.target.value)}} type='number' min={2021} max={2025} className={`${styles.inputYear}`}/>
            </span>
            {(dayUAC && monthUAC && yearUAC)&&
            (<Link href={'/audienciasUAC/' + dayUAC.padStart(2,'0') + monthUAC.padStart(2,'0') + yearUAC.padStart(4,'20')} className={`${styles.linkRedirection} ${styles.linkRedirectionCarga}`}>UAC CARGA</Link>)}
            </>
          )}
          {(userType == 'admin')&&(
            <Link href="/signup" className={`${styles.linkRedirection}`}>CONTROL USUARIOS</Link>
          )}
        </div>
      </section>
    )
}