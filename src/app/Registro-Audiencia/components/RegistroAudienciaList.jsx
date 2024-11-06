import styles from '../RegistroAudiencia.module.css'
import { useContext, useEffect } from 'react';
import { SelectDate } from '../../components/SelectDate';
import AudienciaRegistroIndiv from './AudienciaRegistroIndiv';
import { DataContext} from '@/context/DataContext';

export default function RegistroAudienciaList({date, dateFunction, audFunction}) {
    const {updateByDateListener, bydate} = useContext(DataContext)
    useEffect(() => {
        const unsubscribe = updateByDateListener(date);
        return () => unsubscribe();
    }, [date]);
    return (
        <div className={[styles.listaBlock]}>
            <SelectDate dateFunction={dateFunction} date={date}/>
            <div className={[styles.listadoBlock]}>{bydate && bydate.map(el =>(
                <AudienciaRegistroIndiv key={el.numeroLeg+el.hora} aud={el} audFunction={audFunction}/>
            ))}</div>
        </div>
    );
}
