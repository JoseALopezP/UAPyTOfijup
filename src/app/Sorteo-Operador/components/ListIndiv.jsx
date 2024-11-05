import styles from '../sorteoOperador.module.css'
import demoraCalculator from '@/utils/demoraCalculator';
import { DataContext } from '@/context/DataContext';
import { nameTranslate } from '@/utils/traductorNombres';

export default function ListIndiv({item}) {
    return (
        <span className={styles.listIndivBlock}>
            <p className={styles.operadorItem}>{nameTranslate(item.operador)}</p>
            <p className={styles.legajoItem}>{item.numeroLeg.split('-SJ-')[1]}</p>
            <p className={styles.horaItem}>{item.hora}</p>
            <p className={styles.tipoItem}>{item.tipo}<br/>{item.tipo2}<br/>{item.tipo3}</p>
            <p className={styles.juezItem}>{item.juez.split('+').join('\n')}</p>
            <p className={styles.demoraItem}>{demoraCalculator(item.tipo+item.tipo2+item.tipo3)}</p>
        </span>
    );
}