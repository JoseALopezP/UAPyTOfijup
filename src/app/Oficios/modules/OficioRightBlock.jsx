import { caratulaGenerator } from '@/utils/caratulaUtils'
import { testOficio } from '@/utils/testOficio';
import styles from '../Oficios.module.css'
import GeneradorOficioBlock from './GeneradorOficioBlock';
import { useState } from 'react';
import { removeHtmlTags } from '@/utils/removeHtmlTags';

export default function OficioRightBlock({aud, date}) {
    const [showOficio, setShowOficio] = useState(false)
    const [showStop, setShowStop] = useState(false) 
    const handleShow = () =>{
        if(testOficio(aud)){
            setShowOficio(!showOficio)
        }else{
            setShowStop(true)
            setTimeout(() =>{
                setShowStop(false)
            }, 2000)
        }
    }
    if (!aud) return null;
    return (
        <><div className={styles.oficioRightBlockContainer} >
            {aud && <p className={styles.oficioText}>{aud.estado && caratulaGenerator(aud, date)}</p>}
            {aud.minuta ? <p className={styles.oficioText}>{removeHtmlTags(aud.minuta)}</p> : <p></p>}
            {aud.resuelvoText ? <p className={styles.oficioText}>{removeHtmlTags(aud.resuelvoText)}</p> : <p></p>}
        </div>
        <button className={styles.oficioButton} onClick={() => handleShow()}>{showStop ? 'FALTAN DATOS' : 'GENERAR OFICIO'}</button>
        {showOficio && <GeneradorOficioBlock item={aud} date={date}/>}</>
    )
}