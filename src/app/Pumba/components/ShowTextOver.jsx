'use client'
import styles from '../Pumba.module.css'

export default function ShowTextOver({ text, setExpandValue }) {
    return (
        <><div className={styles.expandBlock}>
            <p>{text}</p>
            <button className={styles.ExpandClose} onClick={() => setExpandValue(false)}>X</button>
        </div></>
    )
}