'use client'
import styles from './ControlUac.module.css'
import { AuthContextProvider} from "@/context/AuthContext";
import { DataContextProvider } from "@/context/DataContext";
import TableHead from './components/TableHead';
import { useEffect, useState } from 'react';
import TableBody from './components/TableBody';

export default function page(){
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
            <div className={`${styles.tableControlUac}`}>
                <TableHead date={date} dateFunction={handleSave}/>
                <TableBody date={date} />
            </div>
        </DataContextProvider>
      </AuthContextProvider>
    )
}