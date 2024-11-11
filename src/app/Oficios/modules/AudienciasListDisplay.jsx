'use client'
import styles from '../Oficios.module.css'
import AudienciasListIndiv from './AudienciasListIndiv'

export default function AudienciasListDisplay({arr, audFunction}) {
    return (
        <div className={styles.audienciasListDisplayBlock}>
            {arr.sort((a,b)=>(a.hora.split(':').join('') - b.hora.split(':').join(''))).map(el=>(
                <AudienciasListIndiv key={el.numeroLeg + el.hora} item={el} audFunction={audFunction}/>
            ))}
        </div>
    )
}