import { Clock } from './Clock'
import styles from './ScheduleTable.module.css'
import { InfoBlock } from './InfoBlock'
import { useState, useEffect } from 'react';

export function InformationSection () {
    const [showInfo, setShowInfo] = useState(true);
    function tick() {
        showInfo ? setShowInfo(false) : setShowInfo(true)
    }
    useEffect(() => {
        const timerID = setInterval(() => tick(), 30000);
        return function cleanup() {
            clearInterval(timerID);
        };
    });
    return(
        <section className={showInfo ? `${styles.infoSection} ${styles.infoSectionNotShow}` : `${styles.infoSection} ${styles.infoSectionShow}`}>
            <Clock/>
            <InfoBlock/>
        </section>
    )
}