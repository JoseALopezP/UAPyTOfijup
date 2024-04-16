'use client'
import styles from './ScheduleTable.module.css'
import { useState, useEffect } from 'react';

export function Clock () {
    const [date, setDate] = useState(new Date());

    function tick() {
        setDate(new Date());
    }
    useEffect(() => {
    const timerID = setInterval(() => tick(), 30000);
    return function cleanup() {
        clearInterval(timerID);
    };
    });
    
    return(
        <div className={`${styles.clockBlock}`}>
            <p className={`${styles.clockDigits}`}>{date.toLocaleTimeString("es-AR",{hourCycle: 'h23', hour: "2-digit", minute: "2-digit" })}</p>
            <img className={`${styles.corteLogo}`} src="/cortelogo.png"/>
        </div>
    )
}

