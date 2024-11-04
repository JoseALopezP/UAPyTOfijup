import { useContext, useState } from 'react';
import styles from './sorteoOperador.module.css'
import { DataContext } from '@/context/DataContext';

export default function SorteoFilterBar() {
    const {updateToday, today} = useContext(DataContext)
    const [filtroValue, setFiltroValue] = useState('')
    const [filtrarSorteados, setFiltrarSorteados] = useState(false)
    return (
        <div className={styles.sorteoFilterBarBlock}>
            <button className={styles.buttonFilterOption}>OPERADOR</button>
            <button className={styles.buttonFilterOption}>HORA</button>
            <button className={styles.buttonFilterOption}>DURACIÓN</button>
            <button className={styles.buttonFilterOption}>TIPO</button>
            <button className={styles.buttonFilterOption}>JUEZ</button>
        </div>
    );
}