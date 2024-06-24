'use client'
import styles from './AudienciaList.module.css'
import { useContext, useEffect } from 'react'
import { DataContext } from '@/context/DataContext';
import { titillium } from '../ui/fonts';

export function AudienciaList () {
    const {updateToday, today} = useContext(DataContext);
    useEffect(() =>{
        updateToday()
    }, [])
    return(
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
                    {today && today.sort((a,b) => a-b).map(el =>
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