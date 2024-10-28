import styles from './RegistroAudiencia.module.css'
import { useContext, useEffect } from 'react';
import { SelectDate } from '../components/SelectDate';
import AudienciaRegistroIndiv from './AudienciaRegistroIndiv';
import { DataContext} from '@/context/DataContext';

export default function AudienciaList({date, dateFunction}) {
    const {updateByDate, bydate} = useContext(DataContext)
    const tick = () =>{
        updateByDate(date)
    }
    useEffect(() =>{
        tick()
        const timerID = setInterval(() => tick(), 30000);  
        return function cleanup() {
            clearInterval(timerID);
        };
    }, [])
    
    return (
        <container className={[styles.listaBlock]}>
            <SelectDate dateFunction={dateFunction} date={date}/>
            {bydate && bydate.map(el =>(
                <AudienciaRegistroIndiv key={el.numeroLeg+el.hora} aud={el}/>
            ))}
        </container>
    );
}
