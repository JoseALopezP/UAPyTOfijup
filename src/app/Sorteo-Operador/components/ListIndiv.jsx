import styles from '../sorteoOperador.module.css'
import demoraCalculator from '@/utils/demoraCalculator';
import { DataContext } from '@/context/DataContext';
import { nameTranslate } from '@/utils/traductorNombres';
import { useContext, useEffect, useState } from 'react';

export default function ListIndiv({item}) {
    const {desplegables, updateDataToday} = useContext(DataContext)
    const [operadorAud, setOperadorAud] = useState(item.operador)
    useEffect(() => {
        updateDataToday(item.numeroLeg, item.hora, 'operador', operadorAud);
    }, [operadorAud])
    useEffect(()=>{
        setOperadorAud(item.operador)
    }, [item])
    return (
        <div className={styles.listIndivBlock}>
            <select onChange={(e)=>{setOperadorAud(e.target.value)}} className={styles.operadorItem}>
                <option>{nameTranslate(operadorAud)}</option>
                {desplegables.operador.map(el =>(
                    <option key={el}>{nameTranslate(el)}</option>
                ))}
            </select>
            <p className={styles.horaItem}>{item.hora}</p>
            <p className={styles.legajoItem}>{item.numeroLeg.split('-SJ-')[1]}</p>
            <p className={styles.tipoItem}>{item.tipo}</p>
            <p className={styles.juezItem}>{item.juez.split('+').map(el=>el.split(' ').splice(1,3).join(' ')).join(' ')}</p>
            <p className={styles.demoraItem}>{demoraCalculator(item.tipo+item.tipo2+item.tipo3)}</p>
        </div>
    );
}