'use client'
import styles from './ScheduleTable.module.css'
import logOut from '@/firebase/auth/signout'
import { useRouter } from 'next/navigation'

export function InfoBlock ({setFilterValue, filterValue}) {
    const router = useRouter()

    const handleSignOut = async () => {
        const { error } = await logOut()
        if (!error) {
            router.push('/signin')
        } else {
            console.error("Error signing out:", error)
        }
    }

    return(
        <div className={`${styles.infoBlock}`}>
            <span className={`${styles.infoBlockTitleSearch}`}>
                <h1 className={`${styles.ofijupTitle}`}>OFICINA JUDICIAL PENAL</h1>
                <input type='text' value={filterValue} placeholder='Buscar...' className={`${styles.tableroSearch}`} onChange={(e) => setFilterValue(e.target.value)}></input>
                <button onClick={handleSignOut} className={styles.logoutButton}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Cerrar Sesión
                </button>
            </span>
            <img src="./informe.png" className={`${styles.infoImg}`} />
            <div className={`${styles.textBlock}`}>
                <h2 className={`${styles.newsTitle}`}>AUDIENCIAS POR AÑO</h2>
                <p className={`${styles.newsBody}`}>
                    Audiencias celebradas por año en la Oficina Judicial Penal
                </p>
            </div>
        </div>
    )
}