'use client'
import { useEffect, useState, useContext } from 'react';
import { DataContext } from '@/context/DataContext';
import styles from '../MinutaJuicio.module.css'

export default function AudList({list, setSelected, selectedList}) {
    const processSelected = (item) =>{
        const index = selectedList.indexOf(item)
        if(index === -1){
            setSelected([...selectedList, item])
        }
    }
    return (
        <><section className={`${styles.audListBlock}`}>
            {list && list.map(el => (
                <span className={`${styles.audListIndiv}`} onClick={() => processSelected(el)}>
                    <p>{el.hora} - {el.fecha.split('').slice(0,2)}/{el.fecha.split('').slice(2,3)}/{el.fecha.split('').slice(4,8)}</p>
                    <p>{el.tipo}</p>
                </span>
            ))}
        </section></>
    )
}