import styles from '../SituacionCorporal.module.css'
import SitCorporalIndiv from './SitCorporalIndiv'

export default function SitCorporalList({list}) {
    return (
        <div className={`${styles.sitListBlock}`}>{list.map(el =>(
            <SitCorporalIndiv aud={el} />
        ))}</div>
    )
}