import { useContext, useState } from 'react'
import styles from '../SituacionCorporal.module.css'
import { DataContext } from '@/context New/DataContext'

export default function SitCorporalIndiv({aud, date, selected, selectedF}) {
    const [sit, setSit] = useState(aud.situacion)
    const {updateData} = useContext(DataContext)
    const handleSave = () =>{
        if(aud.situacion !== sit){
            updateData(date, aud.id, 'situacion', sit);
        }
    }
    return (
        <div className={aud.situacion ? `${styles.sitCorporalIndivBlock} ${styles.sitCorporalIndivBlockFilled}` : `${styles.sitCorporalIndivBlock}`}>
        <div className={`${styles.sitCorporalIndivFirst}`} onClick={() => selectedF((selected !== aud.numeroLeg+aud.hora) && aud.numeroLeg+aud.hora)}>
            <span className={`${styles.sitIndivValue} ${styles.sitIndivHora}`}>{aud.hora}</span>
            <span className={`${styles.sitIndivValue} ${styles.sitIndivLeg}`}>{aud.numeroLeg}</span>
            <span className={`${styles.sitIndivValue} ${styles.sitIndivJuez}`}>{aud.juez.split('+').join(' - ')}</span>
        </div>
        <span className={(aud.numeroLeg+aud.hora === selected) ? `${styles.sitCorporalIndivSecond}` : `${styles.sitCorporalIndivSecondHidden}`}>
            <textarea onChange={e => setSit(e.target.value)} value={sit} rows={2} className={`${styles.textAreaSituacion}`}/>
            <button onClick={() => handleSave()} className={(aud.situacion !== sit) ? `${styles.situacionButton} ${styles.situacionButtonTrue}` : `${styles.situacionButton}`}>GUARDAR</button>
        </span>
        </div>
    )
}