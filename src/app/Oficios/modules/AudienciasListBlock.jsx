'use client'
import { SelectDate } from '@/app/components/SelectDate'
import styles from '../Oficios.module.css'
import { useContext, useEffect } from "react"
import AudienciasListDisplay from './AudienciasListDisplay'
import { DataContext } from '@/context/DataContext'
import SorteoModule from './SorteoModule'
import { useAuthContext } from '@/context/AuthContext'
import { useRouter } from 'next/navigation';

export default function AudienciasListBlock({audFunction, dateFunction, dateToUse, showList, setShowList}) {
    const router = useRouter()
    const {bydate, updateDesplegables, updateByDate} = useContext(DataContext)
    const { user } = useAuthContext()
    useEffect(() => {
        updateByDate(dateToUse)
    }, [dateToUse]);
    useEffect(() => {
        if (user == null) router.push("/signin")
      }, [user])
    useEffect(()=>{
        updateDesplegables()
    },[])
    return (
        <div className={showList ? `${styles.audienciaListContainer}` : `${styles.audienciaListContainer} ${styles.audienciaListContainerHidden}`} onMouseEnter={() => setShowList(true)} onMouseLeave={() => setShowList(false)}>
            <span className={styles.fechaSorteoBlock}>
                {showList && <>
                <button className={`${styles.refreshButton}`} onClick={()=> updateByDate(dateToUse)}>↻</button>
                <SelectDate dateFunction={dateFunction} date={dateToUse}/> 
                <SorteoModule date={dateToUse} arr={bydate}/></>}
                </span>
            {bydate && <AudienciasListDisplay arr={bydate} audFunction={audFunction} dateToUse={dateToUse}/>}
        </div>
    )
}