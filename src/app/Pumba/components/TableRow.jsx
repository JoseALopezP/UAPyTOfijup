'use client'
import styles from '../Pumba.module.css'
import { useState, useContext, useEffect } from 'react'
import { DataContext } from '@/context New/DataContext';

export default function TableRow({ audData }) {
    const { byDate } = useContext(DataContext);
    const [legajo, setLegajo] = useState(audData.numeroLeg)
    const [audTipo, setAudTipo] = useState('')
    const [tabItem, setTabItem] = useState({})
    useEffect(() => {
        setTabItem(byDate.find((item) => (item.numeroLeg === audData.numeroLeg && item.hora === audData.inicioProgramada)))
    }, [byDate])
    return (
        <><tr key={index}>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyOk}`}>
                <input className={`${styles.inputCell}`} type='text' value={legajo} onChange={(e) => setLegajo(e.target.value)} /></td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyPuma}`}></td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}></td>
            <td className={tiposT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                {audTipo}
                <input className={`${styles.inputCell}`} type='text' value={audTipo} onChange={(e) => setAudTipo(e.target.value)} />
            </td>
            <td></td>
            <td></td>
            <td></td>
        </tr></>
    )
}