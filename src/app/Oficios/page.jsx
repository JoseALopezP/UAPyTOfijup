'use client'
import styles from './Oficios.module.css'
import { AuthContextProvider} from "@/context New/AuthContext";
import { DataContextProvider } from "@/context/DataContext";
import AudienciasListBlock from './modules/AudienciasListBlock';
import { todayFunction } from '@/utils/dateUtils';
import { useState, useEffect } from 'react';
import OficioBlock from './modules/OficioBlock';

export default function page() {
    const [date, setDate] = useState(null)
    const [selectedAud, setSelectedAud] = useState(null)
    const [showList, setShowList] = useState(true)
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
            {date && <AudienciasListBlock audFunction={setSelectedAud} dateFunction={handleSave} dateToUse={date} setShowList={setShowList} showList={showList}/>}
            {selectedAud && <OficioBlock dateToUse={date} aud={selectedAud} showList={showList}/>}
          </div>
        </DataContextProvider>
      </AuthContextProvider>
    )
}