import { useState } from 'react'
import styles from '../SituacionCorporal.module.css'
import SitCorporalIndiv from './SitCorporalIndiv'

export default function SitCorporalList({list, date, legSearch}) {
    const [selected, setSelected] = useState(null)
    return (
        <div className={`${styles.sitListBlock}`}>{list.filter(el => el.numeroLeg.includes(legSearch)).map(el =>(
            <SitCorporalIndiv key={el.numeroLeg + el.hora} aud={el} date={date} selected={selected} selectedF={setSelected}/>
        ))}</div>
    )
}