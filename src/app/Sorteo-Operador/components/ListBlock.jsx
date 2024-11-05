import { useState } from 'react';
import styles from '../sorteoOperador.module.css'
import SorteoFilterBar from './SorteoFilterBar';
import ListFormAudList from './ListFormAudList';

export default function ListBlock() {
    const [filtroValue, setFiltroValue] = useState('')
    const [operadorFilled, setOperadorFilled] = useState('TODOS')
    return (
        <div className={styles.listBlock}>
            <SorteoFilterBar filtroValue={filtroValue} setFiltroValue={setFiltroValue} operadorFilled={operadorFilled} setOperadorFilled={setOperadorFilled}/>
            <ListFormAudList filtroValue={filtroValue} operadorFilled={operadorFilled}/>
        </div>
    );
}