'use client'
import { useState, useEffect } from 'react';
import AudienciaList from './AudienciaList';
import { todayFunction } from '@/utils/dateUtils';
import styles from './RegistroAudiencia.module.css'
import { DataContextProvider } from '@/context/DataContext';
import { AuthContextProvider } from '@/context/AuthContext';

export default function Page() {
    const [date, setDate] = useState(null)
    const handleSave = (newDate) => {
        setData(newDate);
        localStorage.setItem('dateToUse', newDate);
    };
    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedData = localStorage.getItem('dateToUse');
            setDate(storedData || todayFunction());
        }
    }, []);
    return (
        <AuthContextProvider><DataContextProvider>
        <container className={[styles.container]}>
            {date && <AudienciaList dateFunction={handleSave} date={date}/>}
        </container>
        </DataContextProvider></AuthContextProvider>
    );
}
