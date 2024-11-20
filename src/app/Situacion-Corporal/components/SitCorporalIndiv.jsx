import styles from '../SituacionCorporal.module.css'

export default function SitCorporalIndiv({aud}) {
    return (
        <form>
            <span className={`${styles.sitIndivValue}`}>{aud.hora}</span>
            <span className={`${styles.sitIndivValue}`}>{aud.numeroLeg}</span>
            <span className={`${styles.sitIndivValue}`}>{aud.numeroLeg}</span>
            <span className={`${styles.sitIndivValue}`}></span>
            <span className={`${styles.sitIndivValue}`}></span>
        </form>
    )
}