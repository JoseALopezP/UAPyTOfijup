import { useContext, useEffect, useState } from 'react';
import OperadorSelector from './OperadorSelector';
import SorteoFunction from './SorteoFunction';
import styles from '../sorteoOperador.module.css'
import { DataContext } from '@/context New/DataContext';
import SorteoList from './SorteoList';
import { formatDate } from '@/utils/excelUtils';
import { todayFunction } from '@/utils/dateUtils';

export default function SorteoBlock() {
    const { desplegables, updateDesplegables, getSorteoList, sorteoList } = useContext(DataContext);
    const [listaOriginal, setListaOriginal] = useState(desplegables.operador || []);
    const [listaSeleccionado, setListaSeleccionado] = useState([]);
    const [emptyTitle, setEmptyTitle] = useState(false)
    const [titleSorteo, setTitleSorteo] = useState('')
    const [selectedSorteo, setSelectedSorteo] = useState()
    const [sorteoListCurr, setSorteoListCurr] = useState(sorteoList ? sorteoList : [{title: 'No hay sorteos realizados'}])

    useEffect(() => {
        updateDesplegables();
        getSorteoList(todayFunction())
    }, []);
    useEffect(() => {
        setListaOriginal(desplegables.operador || []);
    }, [desplegables.operador]);
    useEffect(() =>{
        setSorteoListCurr(sorteoList)
    }, [sorteoList])
    return (
        <div className={styles.sorteoBlock}>
            <OperadorSelector 
                originalList={listaOriginal}
                originalListFunction={setListaOriginal} 
                selectedList={listaSeleccionado} 
                selectedListFunction={setListaSeleccionado}
                titleSorteo={titleSorteo}
                setTitleSorteo={setTitleSorteo}
                emptyTitle={emptyTitle}
            />
            <SorteoFunction selectedList={listaSeleccionado} 
                titleSorteo={titleSorteo} 
                sorteoListCurr={sorteoListCurr} 
                setSorteoListCurr={setSorteoListCurr} 
                selectedSorteo={selectedSorteo} 
                setSelectedSorteo={setSelectedSorteo}
                setEmptyTitle={setEmptyTitle}
                setTitleSorteo={setTitleSorteo}/>
            {sorteoListCurr && <SorteoList sorteoListCurr={sorteoListCurr} setSelectedSorteo={setSelectedSorteo}/>}
        </div>
    );
}