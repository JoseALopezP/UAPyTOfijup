'use client'
import styles from './Oficios.module.css'
import { AuthContextProvider} from "@/context/AuthContext";
import { DataContextProvider } from "@/context/DataContext";
import AudienciasListBlock from './modules/AudienciasListBlock';
import { useState, useEffect } from 'react';
import OficioBlock from './modules/OficioBlock';

export default function page() {
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
      <AuthContextProvider>
        <DataContextProvider>
          <div className={styles.container}>
            {date && <AudienciasListBlock audFunction={setSelectedAud} dateFunction={handleSave} dateToUse={date}/>}
            {selectedAud && <OficioBlock dateToUse={date} aud={selectedAud}/>}
          </div>
        </DataContextProvider>
      </AuthContextProvider>
    )
}