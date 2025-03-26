import styles from '../sorteoOperador.module.css'

export default function SorteoList({sorteoListCurr, setSelectedSorteo, selectedSorteo}) {
    return (
        <div className={styles.sorteoListContainer}>
            {sorteoListCurr ? sorteoListCurr.map(el => { 
                return(<p key={el.title} className={styles.sorteoListIndiv} onClick={() => setSelectedSorteo(el)}>{el.title}</p>
            )}) : <p className={styles.sorteoListIndiv}>No se realizaron sorteos aún</p>}
        </div>
    );
}