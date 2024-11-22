'use client'
import { useContext, useState, useEffect } from 'react'
import styles from './AddAudiencia.module.css'
import { DataContext } from '@/context/DataContext'
import { todayFunction } from '@/utils/dateUtils'
import { AddAudienciaList } from './AddAudienciasList'
import { AddAudienciaForm } from './AddAudienciaForm'
import { useAuthContext } from '@/context/AuthContext'
import { useRouter } from 'next/navigation';

export function AddAudienciaBlock() {
    const router = useRouter()
    const {updateByDate, updateDesplegables} = useContext(DataContext)
    const [dateToUse, setDateToUse] = useState(todayFunction())
    const { user } = useAuthContext()
    const dateFunction = (value) =>{
        setDateToUse(value)
        updateByDate(dateToUse)
    }
    useEffect(() => {
        updateByDate(dateToUse)
    }, [dateToUse])
    useEffect(() => {
        updateByDate(dateToUse)
        updateDesplegables()
    }, [])
    useEffect(() => {
        if (user == null) router.push("/signin")
      }, [user])
    return(
        <section className={`${styles.addAudienciaBlock}`}>
            <AddAudienciaForm dateFunction={dateFunction} date={dateToUse}/>
            <AddAudienciaList date={dateToUse}/>
        </section>
    )
}