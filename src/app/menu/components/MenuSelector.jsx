'use client'
import Link from 'next/link'
import styles from './Selector.module.css'
import { useEffect, useContext } from 'react'
import { useRouter } from 'next/navigation'
import { AuthContext } from '@/context New/AuthContext'

export default function MenuSelector() {
    const {user} = useContext(AuthContext);
    const router = useRouter()
    useEffect(() => {
      if (user == null){
        router.push("/signin")
      }
    }, [user])
    return (
      <section className={`${styles.selectorSection}`}>
        <div className={`${styles.selectorBody}`}>
            <Link href={'/audienciasUAC/control'} className={`${styles.linkRedirection} ${styles.linkRedirectionCarga}`}>UAC CARGA</Link>
            <Link href="/signup" className={`${styles.linkRedirection}`}>CONTROL USUARIOS</Link>
        </div>
      </section>
    )
}