import { useContext, useEffect, useState } from 'react';
import OperadorSelector from './OperadorSelector';
import SorteoFunction from './SorteoFunction';
import styles from '../sorteoOperador.module.css'
import { DataContext } from '@/context/DataContext';

export default function SorteoBlock() {
    const { desplegables, updateDesplegables } = useContext(DataContext);
    const [listaOriginal, setListaOriginal] = useState(desplegables.operador || []);
    const [listaSeleccionado, setListaSeleccionado] = useState([]);
    useEffect(() => {
        updateDesplegables();
    }, []);
    useEffect(() => {
        setListaOriginal(desplegables.operador || []);
    }, [desplegables.operador]);
    return (
        <div className={styles.sorteoBlock}>
            <OperadorSelector 
                originalList={listaOriginal}
                originalListFunction={setListaOriginal} 
                selectedList={listaSeleccionado} 
                selectedListFunction={setListaSeleccionado}
            />
            <SorteoFunction selectedList={listaSeleccionado}/>
        </div>
    );
}