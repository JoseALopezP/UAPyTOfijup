'use client'
import styles from '../Oficios.module.css'
import AudienciasListIndiv from './AudienciasListIndiv'

export default function AudienciasListDisplay({arr, audFunction, dateToUse}) {
    return (
        <div className={styles.audienciasListDisplayBlock}>
            {[...arr].sort((a, b) => {
                const timeA = String(a?.hora || '').split(':').join('');
                const timeB = String(b?.hora || '').split(':').join('');
                if (timeA !== timeB) {
                    if (!timeA) return 1;
                    if (!timeB) return -1;
                    return Number(timeA) - Number(timeB);
                }
                return String(a?.numeroLeg || '').localeCompare(String(b?.numeroLeg || ''));
            }).map(el => (
                <AudienciasListIndiv key={el.numeroLeg + el.hora} item={el} audFunction={audFunction} dateToUse={dateToUse}/>
            ))}
        </div>
    )
}