'use client'
import { useState } from 'react'
import styles from './AudienciaList.module.css'
import { useContext } from 'react';

export function AudienciaList ({date}) {
    const {updateToday, today} = useContext(DataContext);
    function tick() {
        updateToday();       
    }
    useEffect(() =>{
        const timerID = setInterval(() => tick(), 5000);  
        return function cleanup() {
            clearInterval(timerID);
        };
    }, [])
    return(
        <>
        {today && today.sort((a,b)=>(a.hora.split(':').join('') - b.hora.split(':').join(''))).map(el =>{

        })}
        </>
    )
}