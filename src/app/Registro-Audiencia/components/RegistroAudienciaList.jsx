'use client'
import styles from '../RegistroAudiencia.module.css'
import { useContext, useEffect } from 'react';
import { SelectDate } from '../../components/SelectDate';
import AudienciaRegistroIndiv from './AudienciaRegistroIndiv';
import { DataContext} from '@/context New/DataContext';
import { useAuthContext } from '@/context New/AuthContext'
import { useRouter } from 'next/navigation';
import updateRealTimeFunction from '@/firebase new/firestore/updateRealTimeFunction';

export default function RegistroAudienciaList({date, dateFunction, audFunction, selectedAud, setIsHovered, isHovered, needsSaving1, needsSaving2}) {
    const router = useRouter()
    const {updateByDateView, bydateView, updateDesplegables} = useContext(DataContext)
    const { user } = useAuthContext()
    
    useEffect(() => {
        updateDesplegables();
    }, []);
    useEffect(() => {
        updateByDateView(date)
    }, [date]);
    useEffect(() => {
        if (user == null) router.push("/signin")
      }, [user])
    return (
        <><div className={[styles.listaBlock]}>
            <SelectDate dateFunction={dateFunction} date={date}/>
            <div onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} className={[styles.listadoBlock]}>{bydateView && Object.values(bydateView).sort((a, b) => {
                const timeA = (a.hora || '').split(':').join('');
                const timeB = (b.hora || '').split(':').join('');
                if (timeA !== timeB) return timeA - timeB;
                return String(a.numeroLeg || '').localeCompare(String(b.numeroLeg || ''));
            }).map(el => (
                <AudienciaRegistroIndiv key={el.id || el.numeroLeg + el.hora} aud={el} audFunction={audFunction} selectedAud={selectedAud === (el.id || el.numeroLeg + el.hora)} needsSaving1={needsSaving1} needsSaving2={needsSaving2}/>
            ))}</div>
        </div>
        <div className={isHovered ? `${styles.expandBlock} ${styles.expandBlockHovered}` : `${styles.expandBlock}`}>
        <p>{'>'}</p>
        </div></>
    );
}
