import { Clock } from './Clock'
import styles from './ScheduleTable.module.css'
import { InfoBlock } from './InfoBlock'
import { useContext, useEffect } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { DataContext } from '@/context/DataContext';

export function InformationSection () {
    const {showInfo} = useContext(DataContext);
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