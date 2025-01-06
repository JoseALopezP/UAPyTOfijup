'use client'
import styles from './ScheduleTable.module.css'
import { useState, useEffect, useContext } from 'react';
import { DataContext } from '@/context/DataContext'

export function Clock () {
    const {updateRealTime, realTime} = useContext(DataContext);
    async function tick() {
        updateRealTime()
    }
    useEffect(() => {
        tick()
        const timerID = setInterval(() => tick(), 30000);
        return function cleanup() {
            clearInterval(timerID);
        };
    }, []);
    
    return(
        <div className={`${styles.clockBlock}`}>
            <p className={`${styles.clockDigits}`}>{realTime && realTime}</p>
            <img className={`${styles.corteLogo}`} src="/cortelogo.png"/>
        </div>
    )
}

