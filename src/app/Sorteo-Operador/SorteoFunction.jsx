import { useState } from 'react';
import styles from './sorteoOperador.module.css'

export default function SorteoFunction({selectedList}){
    const [sorteo, setSorteo] = useState([])
    function shuffleArray() {
        const shuffledArray = [...selectedList];
        for (let i = shuffledArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
        }
        setSorteo(shuffledArray)
    }
    return (
        <div className={[styles.sorteoFunctionBlock]}>
            <button className={[styles.sorteoButton]} onClick={() => shuffleArray()}>SORTEAR</button>
            <div className={[styles.listSorteadoBlock]}>
                {sorteo.map((el,i)=>(
                    <span className={[styles.listSorteadoItem]}>{i+1}. {el}</span>
                ))}
            </div>
        </div>
    );
}
