'use client'
import styles from '../Pumba.module.css'
import { useState, useContext, useEffect } from 'react'
import { DataContext } from '@/context New/DataContext';

export default function TableRow({ audData, dateToUse }) {
    const { byDate } = useContext(DataContext);
    const [tabItem, setTabItem] = useState({})

    const [legajo, setLegajo] = useState(audData.numeroLeg)
    const [audTipo, setAudTipo] = useState('')
    const [ufi, setUfi] = useState(audData.ufi)
    const [dyhsolicitud, setDyhsolicitud] = useState(audData.dyhsolicitud)
    const [dyhagendamiento, setDyhagendamiento] = useState(audData.dyhagendamiento)
    const [dyhnotificacion, setDyhnotificacion] = useState(audData.fechaNotificacion)
    const [dyhprogramada, setDyhprogramada] = useState(audData.inicioProgramada)
    const [dyhreal, setDyhreal] = useState(audData.inicioReal)
    const [demora, setDemora] = useState((parseInt(audData.inicioReal.split(' ')[1].split(':')[0]) * 60 + parseInt(audData.inicioReal.split(' ')[1].split(':')[1]))) - (parseInt(audData.inicioProgramada.split(' ')[1].split(':')[0]) * 60 + parseInt(audData.inicioProgramada.split(' ')[1].split(':')[1]))

    useEffect(() => {
        setTabItem(byDate.find((item) => (item.numeroLeg === audData.numeroLeg && item.hora === audData.inicioProgramada)))
    }, [byDate])
    return (
        <><tr key={index}>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyOk}`}>
                <input className={`${styles.inputCell}`} type='text' value={legajo} onChange={(e) => setLegajo(e.target.value)} /></td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyPuma}`}>
                {audData.tipo + ' + ' + audData.tipo2 + ' + ' + audData.tipo3}</td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>
                {tabItem.tipo + ' + ' + tabItem.tipo2 + ' + ' + tabItem.tipo3}</td>
            <td className={tiposT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <input className={`${styles.inputCell}`} type='text' value={audTipo} onChange={(e) => setAudTipo(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyPuma}`}>{audData.ufi}</td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>{tabItem.ufi}</td>
            <td className={tiposT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <input className={`${styles.inputCell}`} type='text' value={ufi} onChange={(e) => setUfi(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>{audData.dyhsolicitud}</td>
            <td className={tiposT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <input className={`${styles.inputCell}`} type='text' value={dyhsolicitud} onChange={(e) => setDyhsolicitud(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>{audData.dyhagendamiento}</td>
            <td className={tiposT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <input className={`${styles.inputCell}`} type='text' value={dyhagendamiento} onChange={(e) => setDyhagendamiento(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>{audData.fechaNotificacion}</td>
            <td className={tiposT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <input className={`${styles.inputCell}`} type='text' value={dyhnotificacion} onChange={(e) => setDyhnotificacion(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyPuma}`}>{audData.inicioProgramada}</td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>{dateToUse.slice(0, 2) + '/' + dateToUse.slice(3, 5) + '/' + dateToUse.slice(6, 10) + ' ' + tabItem.hora}</td>
            <td className={tiposT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <input className={`${styles.inputCell}`} type='text' value={dyhprogramada} onChange={(e) => setDyhprogramada(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyPuma}`}>{audData.inicioReal}</td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>{dateToUse.slice(0, 2) + '/' + dateToUse.slice(3, 5) + '/' + dateToUse.slice(6, 10) + ' ' + tabItem.hitos[0].split(' | ')[0]}</td>
            <td className={tiposT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <input className={`${styles.inputCell}`} type='text' value={dyhreal} onChange={(e) => setDyhreal(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyPuma}`}>
                {parseInt((audData.inicioReal.split(' ')[1].split(':')[0]) * 60 + parseInt(audData.inicioReal.split(' ')[1].split(':')[1])) - (parseInt(audData.inicioProgramada.split(' ')[1].split(':')[0]) * 60 + parseInt(audData.inicioProgramada.split(' ')[1].split(':')[1]))}</td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>
                {parseInt((tabItem.hitos[0].split(' | ')[0].split(':')[0]) * 60 + parseInt(tabItem.hitos[0].split(' | ')[0].split(':')[1])) - (parseInt(tabItem.hora.split(':')[0]) * 60 + parseInt(tabItem.hora.split(':')[1]))}</td>
            <td className={tiposT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <input className={`${styles.inputCell}`} type='text' value={demora} onChange={(e) => setDemora(e.target.value)} />
            </td>
            <td></td>
            <td></td>
            <td></td>
        </tr></>
    )
}