import styles from '../Oficios.module.css'

export default function GeneradorOficioBlock({aud, date}) {
    if (!aud) return null;
    return (
        <form className={styles.generadorOficioForm}>
            
        </form>
    )
}