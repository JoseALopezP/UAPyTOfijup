'use client'
import Link from 'next/link'
import styles from '../Menu.module.css'
import { useEffect, useContext } from 'react'
import { useRouter } from 'next/navigation'
import { AuthContext } from '@/context/AuthContext'
import logOut from '@/firebase/auth/signout'

export default function MenuSelector() {
  const { user } = useContext(AuthContext);
  const router = useRouter()

  useEffect(() => {
    if (user == null) {
      router.push("/signin")
    }
  }, [user])

  const handleSignOut = async () => {
    const { error } = await logOut()
    if (!error) {
      router.push("/signin")
    } else {
      console.error("Error signing out:", error)
    }
  }

  return (
    <>
      <div className={`${styles.menuSelector}`}>
        <div className={`${styles.selectorBody}`}>
          <Link href={'/audienciasUAC/control'} className={`${styles.linkRedirection} ${styles.linkRedirectionCarga}`}>UAC CARGA</Link>
          <Link href="/signup" className={`${styles.linkRedirection}`}>CONTROL USUARIOS</Link>
        </div>
      </div>
      <button onClick={handleSignOut} className={styles.logoutButton}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: 'middle' }}>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        Cerrar Sesión
      </button>
    </>
  )
}
