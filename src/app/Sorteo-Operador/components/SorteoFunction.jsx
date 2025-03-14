import { useState, useContext } from 'react';
import styles from '../sorteoOperador.module.css'
import { formatDate } from '@/utils/excelUtils';
import { DataContext } from '@/context/DataContext';

export default function SorteoFunction({selectedList, titleSorteo, sorteoListCurr, setSorteoListCurr}){
    const [sorteo, setSorteo] = useState([])
    const { addSorteo } = useContext(DataContext);
    const today = formatDate(new Date())
    function shuffleArray() {
        const shuffledArray = [...selectedList];
        for (let i = shuffledArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
        }
        setSorteo(shuffledArray)
        addSorteo({
            title: titleSorteo,
            sorteo: sorteo
        } , today)
        sorteoListCurr.push({title: titleSorteo, sorteo: sorteo})
    }
    return (
        <div className={[styles.sorteoFunctionBlock]}>
            <button className={[styles.sorteoButton]} onClick={() => shuffleArray()}>SORTEAR</button>
            <div className={[styles.listSorteadoBlock]}>
                {sorteo.map((el,i)=>(
                    <span key={el} className={[styles.listSorteadoItem]}>{i+1}. {el}</span>
                ))}
            </div>
        </div>
    );
}
