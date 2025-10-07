'use client'
import { useState, useEffect } from 'react';
import RegistroAudienciaList from './components/RegistroAudienciaList';
import { todayFunction } from '@/utils/dateUtils';
import styles from './RegistroAudiencia.module.css'
import { DataContextProvider } from '@/context New/DataContext';
import { AuthContextProvider } from '@/context New/AuthContext';
import RegistroAudienciaControl from './components/RegistroAudienciaControl';

export default function Page() {
    const [date, setDate] = useState(null)
    const [selectedAud, setSelectedAud] = useState(null)
    const [isHovered, setIsHovered] = useState(false)
    const [needsSaving1, setNeedsSaving1] = useState(false)
    const [needsSaving2, setNeedsSaving2] = useState(false)
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
            {date && <RegistroAudienciaList needsSaving1={needsSaving1} needsSaving2={needsSaving2} dateFunction={handleSave} date={date} audFunction={setSelectedAud} selectedAud={selectedAud && selectedAud.numeroLeg+selectedAud.hora} setIsHovered={setIsHovered} isHovered={isHovered}/>}
            <RegistroAudienciaControl aud={selectedAud} dateToUse={date} isHovered={isHovered} setNeedsSaving1={setNeedsSaving1} setNeedsSaving2={setNeedsSaving2}/>
        </div>
        </DataContextProvider></AuthContextProvider>
    );
}
