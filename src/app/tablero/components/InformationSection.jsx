import { Clock } from './Clock'
import styles from './ScheduleTable.module.css'
import { InfoBlock } from './InfoBlock'
import { useState, useEffect } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export function InformationSection () {
    const [showInfo, setShowInfo] = useState(true);
    function tick() {
        showInfo ? setShowInfo(false) : setShowInfo(true)
    }
    useEffect(() => {
        const timerID = setInterval(() => tick(), 60000);
        return function cleanup() {
            clearInterval(timerID);
        };
    });
    const { user } = useAuthContext()
    const router = useRouter()
    useEffect(() => {
      if (user == null) router.push("/signin")
    }, [user])
    return(
        <section className={showInfo ? `${styles.infoSection} ${styles.infoSectionNotShow}` : `${styles.infoSection} ${styles.infoSectionShow}`}>
            <Clock/>
            <InfoBlock/>
        </section>
    )
}