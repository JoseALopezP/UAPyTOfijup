'use client'
import { useState, useEffect, useCallback } from 'react';
import RegistroAudienciaList from './components/RegistroAudienciaList.jsx';
import { todayFunction } from '@/utils/dateUtils.js';
import styles from './RegistroAudiencia.module.css'
import { DataContextProvider } from '@/context/DataContext.js';
import { AuthContextProvider } from '@/context/AuthContext.js';
import RegistroAudienciaControl from './components/RegistroAudienciaControl.jsx';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import firebase_app from '@/firebase/config.js';

const db = getFirestore(firebase_app);

export default function Page() {
    const [date, setDate] = useState(null)
    const [selectedAud, setSelectedAud] = useState(null)
    const [fullSelectedAud, setFullSelectedAud] = useState(null)
    const [isHovered, setIsHovered] = useState(false)
    const [needsSaving1, setNeedsSaving1] = useState(false)
    const [needsSaving2, setNeedsSaving2] = useState(false)

    const handleSave = (newDate) => {
        setDate(newDate);
        localStorage.setItem('dateToUse', newDate);
        setSelectedAud(null);
        setFullSelectedAud(null);
    };

    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedData = localStorage.getItem('dateToUse');
            setDate(storedData || todayFunction());
        }
    }, []);

    const refreshAud = useCallback(async () => {
        if (selectedAud && selectedAud.id && date) {
            try {
                const audDocRef = doc(db, 'audiencias', date, 'audiencias', selectedAud.id);
                const audSnap = await getDoc(audDocRef);
                if (audSnap.exists()) {
                    setFullSelectedAud({ ...selectedAud, ...audSnap.data() });
                }
            } catch (error) {
                console.error("Error refreshing audiencia:", error);
            }
        }
    }, [selectedAud, date]);

    useEffect(() => {
        const fetchFullAudience = async () => {
            if (selectedAud && selectedAud.id && date) {
                try {
                    const audDocRef = doc(db, 'audiencias', date, 'audiencias', selectedAud.id);
                    const audSnap = await getDoc(audDocRef);
                    if (audSnap.exists()) {
                        setFullSelectedAud({ ...selectedAud, ...audSnap.data() });
                    } else {
                        setFullSelectedAud(selectedAud);
                    }
                } catch (error) {
                    console.error("Error fetching full audiencia document:", error);
                    setFullSelectedAud(selectedAud);
                }
            } else if (selectedAud) {
                setFullSelectedAud(selectedAud);
            } else {
                setFullSelectedAud(null);
            }
        };
        fetchFullAudience();
    }, [selectedAud, date]);

    return (
        <AuthContextProvider><DataContextProvider>
        <div className={[styles.container]}>
            {date && <RegistroAudienciaList key={`list-${date}`} needsSaving1={needsSaving1} needsSaving2={needsSaving2} dateFunction={handleSave} date={date} audFunction={setSelectedAud} selectedAud={selectedAud && (selectedAud.id || selectedAud.numeroLeg+selectedAud.hora)} setIsHovered={setIsHovered} isHovered={isHovered}/>}
            {fullSelectedAud && <RegistroAudienciaControl key={`control-${fullSelectedAud.id || fullSelectedAud.numeroLeg+fullSelectedAud.hora}`} aud={fullSelectedAud} dateToUse={date} isHovered={isHovered} setNeedsSaving1={setNeedsSaving1} setNeedsSaving2={setNeedsSaving2} needsSaving1={needsSaving1} needsSaving2={needsSaving2} refreshAud={refreshAud}/>}
        </div>
        </DataContextProvider></AuthContextProvider>
    );
}

