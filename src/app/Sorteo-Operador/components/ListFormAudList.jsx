import { useEffect, useContext } from 'react';
import styles from '../sorteoOperador.module.css'
import { DataContext } from '@/context/DataContext';
import ListIndiv from './ListIndiv';
import { todayFunction } from '@/utils/dateUtils';

export default function ListFormAudList({filtroValue,operadorFilled}) {
    const { updateByDate, bydate } = useContext(DataContext);
    const sortFunction = (a, b) => {
        let cmp = 0;
        switch (filtroValue) {
            case 'OPERADOR':
                cmp = (!a.operador ? 1 : !b.operador ? -1 : a.operador.localeCompare(b.operador));
                break;
            case 'HORA':
                cmp = (!a.hora ? 1 : !b.hora ? -1 : a.hora.localeCompare(b.hora));
                break;
            case 'TIPO':
                cmp = (!a.tipo ? 1 : !b.tipo ? -1 : a.tipo.localeCompare(b.tipo));
                break;
            case 'JUEZ':
                cmp = (!a.juez ? 1 : !b.juez ? -1 : a.juez.localeCompare(b.juez));
                break;
            default:
                cmp = 0;
        }
        if (cmp !== 0) return cmp;
        return String(a.numeroLeg || '').localeCompare(String(b.numeroLeg || ''));
    };
    const filterFunction = (el) => {
        switch (operadorFilled) {
            case 'TODOS':
                return true;
            case 'S/OPERADOR':
                return !el.operador;
            case 'C/OPERADOR':
                return !!el.operador;
            default:
                return true;
        }
    };
    useEffect(() => {
        updateByDate(todayFunction())
    }, []);
    return (
        <span className={styles.listFormAudListBlock}>
            {bydate && bydate.filter(el => filterFunction(el)).sort((a,b) => sortFunction(a,b)).map(el=>(
                <ListIndiv key={el.numeroLeg} item={el}/>
            ))}
        </span>
    );
}
