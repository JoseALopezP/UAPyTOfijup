import styles from '../RegistroAudiencia.module.css'
import { useContext, useEffect } from 'react';
import { SelectDate } from '../../components/SelectDate';
import AudienciaRegistroIndiv from './AudienciaRegistroIndiv';
import { DataContext} from '@/context/DataContext';
import { useAuthContext } from '@/context/AuthContext'
import { useRouter } from 'next/navigation';

export default function RegistroAudienciaList({date, dateFunction, audFunction}) {
    const router = useRouter()
    const {updateByDateListener, bydate} = useContext(DataContext)
    const { user } = useAuthContext()
    useEffect(() => {
        const unsubscribe = updateByDateListener(date);
        return () => unsubscribe();
    }, [date]);
    useEffect(() => {
        if (user == null) router.push("/signin")
      }, [user])
    return (
        <div className={[styles.listaBlock]}>
            <SelectDate dateFunction={dateFunction} date={date}/>
            <div className={[styles.listadoBlock]}>{bydate && bydate.map(el =>(
                <AudienciaRegistroIndiv key={el.numeroLeg+el.hora} aud={el} audFunction={audFunction}/>
            ))}</div>
        </div>
    );
}
