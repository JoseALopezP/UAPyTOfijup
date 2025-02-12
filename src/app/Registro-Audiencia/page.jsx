'use client'
import { useState, useEffect } from 'react';
import RegistroAudienciaList from './components/RegistroAudienciaList';
import { todayFunction } from '@/utils/dateUtils';
import styles from './RegistroAudiencia.module.css'
import { DataContextProvider } from '@/context/DataContext';
import { AuthContextProvider } from '@/context/AuthContext';
import RegistroAudienciaControl from './components/RegistroAudienciaControl';

export default function Page() {
    const [date, setDate] = useState(null)
    const [selectedAud, setSelectedAud] = useState(null)
    const handleSave = (newDate) => {
        setDate(newDate);
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
        <div className={[styles.container]}>
            {date && <RegistroAudienciaList dateFunction={handleSave} date={date} audFunction={setSelectedAud} selectedAud={selectedAud && selectedAud.numeroLeg+selectedAud.hora}/>}
            <RegistroAudienciaControl aud={selectedAud} dateToUse={date}/>
        </div>
        </DataContextProvider></AuthContextProvider>
    );
}
