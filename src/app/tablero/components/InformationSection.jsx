import { Clock } from './Clock'
import styles from './ScheduleTable.module.css'
import { InfoBlock } from './InfoBlock'
import { useEffect, useState } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export function InformationSection () {
    const { user } = useAuthContext();
    const router = useRouter();
    const [showInfo2, setShowInfo2] = useState(true);
    const tick = () => {
        setShowInfo2(prevShowInfo2 => !prevShowInfo2);
    }
    useEffect(() => {
        if (!user) router.push("/signin");
    }, [user, router]);

    useEffect(() => {
        const timerID = setInterval(tick, 30000);
        return () => {
            clearInterval(timerID);
        };
    }, []);

    return (
        <section className={`${styles.infoSection} ${showInfo2 ? styles.infoSectionNotShow : styles.infoSectionShow}`}>
            <Clock />
            <InfoBlock />
        </section>
    );
}