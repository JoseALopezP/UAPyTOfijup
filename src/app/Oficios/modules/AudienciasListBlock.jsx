'use client'
import { SelectDate } from '@/app/components/SelectDate'
import styles from '../Oficios.module.css'
import { useContext, useEffect } from "react"
import AudienciasListDisplay from './AudienciasListDisplay'
import { DataContext } from '@/context/DataContext'

export default function AudienciasListBlock({audFunction, dateFunction, dateToUse}) {
    const {updateByDateListener, bydate} = useContext(DataContext)
    useEffect(() => {
        const unsubscribe = updateByDateListener(dateToUse);
        return () => unsubscribe();
    }, [dateToUse]);
    return (
        <div className={styles.audienciaListContainer}>
            <SelectDate dateFunction={dateFunction} date={dateToUse} />
            {bydate && <AudienciasListDisplay arr={bydate} audFunction={audFunction}/>}
        </div>
    )
}