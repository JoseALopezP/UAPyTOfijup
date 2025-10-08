import { useEffect, useContext } from 'react';
import styles from '../sorteoOperador.module.css'
import { DataContext } from '@/context New/DataContext';
import ListIndiv from './ListIndiv';
import { todayFunction } from '@/utils/dateUtils';

export default function ListFormAudList({filtroValue,operadorFilled}) {
    const { updateByDate, bydate } = useContext(DataContext);
    const sortFunction = (a, b) => {
        switch (filtroValue) {
            case 'OPERADOR':
                return (!a.operador ? 1 : !b.operador ? -1 : a.operador.localeCompare(b.operador));
            case 'HORA':
                return (!a.hora ? 1 : !b.hora ? -1 : a.hora.localeCompare(b.hora));
            case 'TIPO':
                return (!a.tipo ? 1 : !b.tipo ? -1 : a.tipo.localeCompare(b.tipo));
            case 'JUEZ':
                return (!a.juez ? 1 : !b.juez ? -1 : a.juez.localeCompare(b.juez));
            case 'DURACIÓN':
            default:
                return 0;
        }
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