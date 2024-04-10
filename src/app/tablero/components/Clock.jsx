'use client'
import styles from './ScheduleTable.module.css'
import { useState, useEffect } from 'react';

export function Clock () {
    const [date, setDate] = useState(new Date());

    useEffect(() => {
    const timerID = setInterval(() => tick(), 1000);

    return function cleanup() {
        clearInterval(timerID);
    };
    });

    function tick() {
    setDate(new Date());
    }
    return(
        <div className={`${styles.clockBlock}`}>
            {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
    )
}

