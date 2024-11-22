'use client'
import { SelectDate } from '@/app/components/SelectDate'
import styles from '../Oficios.module.css'
import { useContext, useEffect } from "react"
import AudienciasListDisplay from './AudienciasListDisplay'
import { DataContext } from '@/context/DataContext'
import SorteoModule from './SorteoModule'
import { useAuthContext } from '@/context/AuthContext'
import { useRouter } from 'next/navigation';

export default function AudienciasListBlock({audFunction, dateFunction, dateToUse}) {
    const router = useRouter()
    const {updateByDateListener, bydate} = useContext(DataContext)
    const { user } = useAuthContext()
    useEffect(() => {
        const unsubscribe = updateByDateListener(dateToUse);
        return () => unsubscribe();
    }, [dateToUse]);
    useEffect(() => {
        if (user == null) router.push("/signin")
      }, [user])
    return (
        <div className={styles.audienciaListContainer}>
            <span className={styles.fechaSorteoBlock}><SelectDate dateFunction={dateFunction} date={dateToUse}/> <SorteoModule date={dateToUse} arr={bydate}/></span>
            {bydate && <AudienciasListDisplay arr={bydate} audFunction={audFunction}/>}
        </div>
    )
}