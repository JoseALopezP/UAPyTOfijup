import { useEffect } from 'react';
import styles from '../sorteoOperador.module.css'

export default function SorteoList({sorteoList, setSelectedSorteo}) {
    
    useEffect(() => {
        console.log(sorteoList)
        }, []);
    return (
        <div className={styles.sorteoListContainer}>
            {sorteoList ? sorteoList.map(el =>{
                <span className={styles.sorteoListIndiv} onClick={() => setSelectedSorteo(el)}><p>{el.title}</p></span>
            }) : <p className={styles.sorteoListIndiv}>No se realizaron sorteos aún</p>}
        </div>
    );
}