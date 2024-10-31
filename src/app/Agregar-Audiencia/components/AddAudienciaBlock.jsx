'use client'
import { useContext, useState, useEffect } from 'react'
import styles from './AddAudiencia.module.css'
import { DataContext } from '@/context/DataContext'
import { todayFunction } from '@/utils/dateUtils'
import { AddAudienciaList } from './AddAudienciasList'
import { AddAudienciaForm } from './AddAudienciaForm'

export function AddAudienciaBlock() {
    const {updateByDate, updateDesplegables} = useContext(DataContext)
    const [dateToUse, setDateToUse] = useState(todayFunction())
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
    return(
        <section className={`${styles.addAudienciaBlock}`}>
            <AddAudienciaForm dateFunction={dateFunction} date={dateToUse}/>
            <AddAudienciaList date={dateToUse}/>
        </section>
    )
}