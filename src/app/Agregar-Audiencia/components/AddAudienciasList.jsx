import { DataContext } from '@/context/DataContext';
import styles from './AddAudiencia.module.css'
import { AddAudienciaTableHead } from './AddAudienciaTableHead';
import { AddAudienciaIndiv } from './AddAudienciaIndiv';
import { useContext, useEffect } from 'react';

export function AddAudienciaList ({date}){
    const {bydate} = useContext(DataContext)
    useEffect(() => {
    }, [DataContext]);
    return(
        <section className={`${styles.audienciaListSection}`}>
            <div className={`${styles.audienciaListTable}`}>
                <AddAudienciaTableHead/>
                {bydate && [...bydate].sort((a, b) => {
                    const timeA = String(a?.hora || '').split(':').join('');
                    const timeB = String(b?.hora || '').split(':').join('');
                    if (timeA !== timeB) {
                        if (!timeA) return 1;
                        if (!timeB) return -1;
                        return Number(timeA) - Number(timeB);
                    }
                    return String(a?.numeroLeg || '').localeCompare(String(b?.numeroLeg || ''));
                }).map((el) => {
                    return (
                        <AddAudienciaIndiv date={date} element={el} key={el.numeroLeg + el.hora} />
                    )
                })}
            </div>
        </section>
    )
}

