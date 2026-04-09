'use client'
import styles from '../Oficios.module.css'
import AudienciasListIndiv from './AudienciasListIndiv'

export default function AudienciasListDisplay({arr, audFunction, dateToUse}) {
    return (
        <div className={styles.audienciasListDisplayBlock}>
            {arr.sort((a, b) => {
                const timeA = a.hora.split(':').join('');
                const timeB = b.hora.split(':').join('');
                if (timeA !== timeB) return timeA - timeB;
                return String(a.numeroLeg || '').localeCompare(String(b.numeroLeg || ''));
            }).map(el => (
                <AudienciasListIndiv key={el.numeroLeg + el.hora} item={el} audFunction={audFunction} dateToUse={dateToUse}/>
            ))}
        </div>
    )
}