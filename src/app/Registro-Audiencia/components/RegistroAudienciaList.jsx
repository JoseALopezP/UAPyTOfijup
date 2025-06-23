'use client'
import styles from '../RegistroAudiencia.module.css'
import { useContext, useEffect } from 'react';
import { SelectDate } from '../../components/SelectDate';
import AudienciaRegistroIndiv from './AudienciaRegistroIndiv';
import { DataContext} from '@/context/DataContext';
import { useAuthContext } from '@/context/AuthContext'
import { useRouter } from 'next/navigation';
import updateRealTimeFunction from '@/firebase/firestore/updateRealTimeFunction';

export default function RegistroAudienciaList({date, dateFunction, audFunction, selectedAud, setIsHovered, isHovered}) {
    const router = useRouter()
    const {updateByDate, bydate} = useContext(DataContext)
    const { user } = useAuthContext()
    updateRealTimeFunction()
    useEffect(() => {
        updateByDate(date)
    }, [date]);
    useEffect(() => {
        if (user == null) router.push("/signin")
      }, [user])
    return (
        <><div className={[styles.listaBlock]}>
            <SelectDate dateFunction={dateFunction} date={date}/>
            <div onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} className={[styles.listadoBlock]}>{bydate && bydate.sort((a, b) => (a.hora.split(':').join('') - b.hora.split(':').join(''))).map(el =>(
                <AudienciaRegistroIndiv key={el.numeroLeg + el.hora} aud={el} audFunction={audFunction} selectedAud={selectedAud===el.numeroLeg+el.hora}/>
            ))}</div>
        </div>
        <div className={isHovered ? `${styles.expandBlock} ${styles.expandBlockHovered}` : `${styles.expandBlock}`}>
        <p>{'>'}</p>
        </div></>
    );
}
