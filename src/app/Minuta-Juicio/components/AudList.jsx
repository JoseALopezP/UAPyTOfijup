'use client'
import { useEffect, useState, useContext } from 'react';
import { DataContext } from '@/context/DataContext';
import styles from '../MinutaJuicio.module.css'

export default function AudList({list, setSelected}) {
    return (
        <><section className={`${styles.audListBlock}`}>
            {list && list.map(el => (
                <span >
                    <p>{el.hora} - {el.fecha.split('').slice(0,2)}/{el.fecha.split('').slice(2,3)}/{el.fecha.split('').slice(4,8)}</p>
                    <p>{el.tipo}</p>
                </span>
            ))}
        </section></>
    )
}