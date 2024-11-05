import { useEffect, useContext } from 'react';
import styles from '../sorteoOperador.module.css'
import { DataContext } from '@/context/DataContext';
import ListIndiv from './ListIndiv';

export default function ListFormAudList() {
    const { updateToday, today } = useContext(DataContext);
    const sortFunction = (a,b) =>{

    }
    useEffect(() => {
        updateToday()
    }, []);
    return (
        <span className={styles.listFormAudListBlock}>
            {today && today.map(el=>(
                <ListIndiv item={el}/>
            ))}
        </span>
    );
}