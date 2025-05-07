import styles from '../Oficios.module.css'
import OficioLeftBlock from './OficioLeftBlock'
import OficioRightBlock from './OficioRightBlock'

export default function OficioBlock({dateToUse, aud, showList}) {
    return (
        <div className={showList ? `${styles.oficioBlockContainer}` : `${styles.oficioBlockContainer} ${styles.oficioBlockContainerHidden}`}>
            <OficioLeftBlock aud={aud} date={dateToUse}/>
            <OficioRightBlock aud={aud} date={dateToUse} showList={showList}/>
        </div>
    )
}