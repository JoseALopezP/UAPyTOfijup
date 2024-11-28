import { caratulaGenerator } from '@/utils/caratulaUtils'
import styles from '../Oficios.module.css'
import GeneradorOficioBlock from './generadorOficioBlock';
import { useState } from 'react';

export default function OficioRightBlock({aud, date}) {
    const [showOficio, setShowOficio] = useState(true)
    if (!aud) return null;
    return (
        <><div className={styles.oficioRightBlockContainer} >
            {aud && <p className={styles.oficioText}>{aud.estado && caratulaGenerator(aud, date)}</p>}
            {aud.minuta ? <p className={styles.oficioText}>{aud.minuta}</p> : <p></p>}
            {aud.resuelvo ? <p className={styles.oficioText}>{aud.resuelvo}</p> : <p></p>}
        </div>
        <button className={styles.oficioButton} onClick={() => setShowOficio(!showOficio)}>GENERAR OFICIO</button>
        {showOficio && <GeneradorOficioBlock item={aud} date={date}/>}</>
    )
}