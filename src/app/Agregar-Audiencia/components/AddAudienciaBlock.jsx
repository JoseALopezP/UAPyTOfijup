'use client'
import { useContext, useState, useEffect } from 'react'
import styles from './AddAudiencia.module.css'
import { DataContext } from '@/context/DataContext'
import { todayFunction } from '@/utils/dateUtils'
import { AddAudienciaList } from './AddAudienciasList'
import { AuthContext } from '@/context/AuthContext'
import { AddAudienciaForm } from './AddAudienciaForm'

export function AddAudienciaBlock() {
    const [dateToUse, setDateToUse] = useState(todayFunction())
    const {updateByDate} = useContext(DataContext)
    const {user} = useContext(AuthContext);
    useEffect(() => {
        updateByDate(dateToUse)
    }, [dateToUse])
    useEffect(() => {
        updateByDate(dateToUse)
    }, [])
    useEffect(() => {
        if (user == null){
          router.push("/signin")
        }
    }, [user])
    return(
        <section className={`${styles.addAudienciaBlock}`}>
            <AddAudienciaForm/>
            <AddAudienciaList dateFunction={setDateToUse}/>
        </section>
    )
}