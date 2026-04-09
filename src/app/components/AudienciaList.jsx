'use client'
import styles from './AudienciaList.module.css'
import { useContext, useEffect } from 'react'
import { DataContext } from '@/context New/DataContext';
import { titillium } from '../ui/fonts';
import { todayFunction } from '@/utils/dateUtils';

export function AudienciaList() {
    const { updateByDate, bydate } = useContext(DataContext);
    useEffect(() => {
        updateByDate(todayFunction())
    }, [])
    return (
        <>
            <section className={titillium.className}>
                <table className={`${styles.table}`} cellSpacing="0" cellPadding="0">
                    <thead>
                        <tr>
                            <th>HORA</th>
                            <th>SALA</th>
                            <th>LEGAJO</th>
                            <th>TIPO DE AUDIENCIA</th>
                            <th>JUEZ</th>
                            <th>OPERADOR</th>
                        </tr>
                    </thead>
                    <tbody className={`${styles.tableBody}`}>
                        {bydate && bydate.sort((a, b) => {
                            const timeA = a.hora.split(':').join('');
                            const timeB = b.hora.split(':').join('');
                            if (timeA !== timeB) return timeA - timeB;
                            return String(a.numeroLeg || '').localeCompare(String(b.numeroLeg || ''));
                        }).map(el =>
                        (<tr key={el.numeroLeg + el.hora}>
                            <td>{el.hora}</td>
                            <td>SALA {el.sala}</td>
                            <td>{el.numeroLeg}</td>
                            <td>{el.tipo}</td>
                            <td>{el.juez}</td>
                            <td>{el.operador}</td>
                        </tr>)
                        )}
                    </tbody>
                </table>
            </section>
        </>
    )
}