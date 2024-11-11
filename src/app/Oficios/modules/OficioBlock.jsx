import styles from '../Oficios.module.css'
import OficioLeftBlock from './OficioLeftBlock'
import OficioRightBlock from './OficioRightBlock'

export default function OficioBlock({dateToUse, aud}) {
    return (
        <div className={styles.oficioBlockContainer}>
            <OficioLeftBlock aud={aud} date={dateToUse}/>
            <OficioRightBlock aud={aud} date={dateToUse}/>
        </div>
    )
}