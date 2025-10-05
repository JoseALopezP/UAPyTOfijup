import { Clock } from './Clock'
import styles from './ScheduleTable.module.css'
import { InfoBlock } from './InfoBlock'
import { useEffect, useState } from 'react';
import { useAuthContext } from '@/context New/AuthContext';
import { useRouter } from 'next/navigation';

export function InformationSection ({setFilterValue, filterValue}) {
    const [showInfo2, setShowInfo2] = useState(true);
    return (
        <section className={`${styles.infoSection} ${showInfo2 ? styles.infoSectionNotShow : styles.infoSectionShow}`}>
            <Clock />
            <InfoBlock setFilterValue={setFilterValue} filterValue={filterValue}/>
        </section>
    );
}
