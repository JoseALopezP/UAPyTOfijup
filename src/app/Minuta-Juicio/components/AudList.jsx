'use client'
import { useEffect, useState, useContext } from 'react';
import { DataContext } from '@/context/DataContext';
import styles from '../MinutaJuicio.module.css'

export default function AudList({list, setSelected}) {

    return (
        <><section className={`${styles.audListBlock}`}>
            {list && list.map(el => {
                <span >
                    <p>{el.hora}</p>
                    <p>{el.fecha}</p>
                    <p>{el.tipo}</p>
                </span>
            })}
        </section></>
    )
}