'use client'
import styles from './ControlUac.module.css'
import { AuthContextProvider} from "@/context New/AuthContext";
import { DataContextProvider } from "@/context/DataContext";
import TableHead from './components/TableHead';
import { useEffect, useState } from 'react';
import TableBody from './components/TableBody';

export default function page(){
    const [date, setDate] = useState(null)
    const [filterValue, setFilterValue] = useState('')
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
                <TableHead date={date} dateFunction={handleSave} setFilterValue={setFilterValue} filterValue={filterValue}/>
                <TableBody date={date} filterValue={filterValue}/>
            </div>
        </DataContextProvider>
      </AuthContextProvider>
    )
}