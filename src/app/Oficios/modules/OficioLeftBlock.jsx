import styles from '../Oficios.module.css'

export default function OficioLeftBlock({dateToUse, aud}) {
    return (
        <div className={styles.oficioLeftBlockContainer}>
            <span className={styles.oficioControlBlock}>
                <h2 className={styles.controlOficioTitle}>CONTROL OFICIO</h2>
                <textarea className={styles.oficioControlTextArea} rows="10">
                    
                </textarea>
            </span>
        </div>
    )
}