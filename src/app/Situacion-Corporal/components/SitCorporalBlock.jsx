import { useContext, useState, useEffect } from 'react'
import styles from '../SituacionCorporal.module.css'
import { DataContext } from '@/context/DataContext'
import { SitCorporalSelectDate } from './SitCorporalSelectDate'
import { todayFunction } from '@/utils/dateUtils'
import SitCorporalList from './SitCorporalList'

export default function SitCorporalBlock() {
    const [dateToUSe, setDateToUse] = useState(null)
    const [legSearch, setLegSearch] = useState('')
    const {updateByDateListener, bydate} = useContext(DataContext)
    const handleSave = (newDate) => {
        setDateToUse(newDate);
        localStorage.setItem('dateToUse', newDate);
    };
    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedData = localStorage.getItem('dateToUse');
            setDateToUse(storedData || todayFunction());
        }
    }, []);
    useEffect(() => {
        let unsubscribe;
        if (updateByDateListener) {
            unsubscribe = updateByDateListener(dateToUSe);
        }
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [dateToUSe]);
    return (
        <div className={`${styles.sitCorporalContainer}`}>
            {dateToUSe && <SitCorporalSelectDate dateFunction={handleSave} date={dateToUSe} legSearch={legSearch} setLegSearch={setLegSearch}/>}
            <SitCorporalList list={bydate} date={dateToUSe} legSearch={legSearch}/>
        </div>
    )
}