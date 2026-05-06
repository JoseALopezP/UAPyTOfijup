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
                {bydate && bydate.sort((a, b) => {
                    const timeA = a.hora.split(':').join('');
                    const timeB = b.hora.split(':').join('');
                    if (timeA !== timeB) return timeA - timeB;
                    return String(a.numeroLeg || '').localeCompare(String(b.numeroLeg || ''));
                }).map((el) => {
                    return (
                        <AddAudienciaIndiv date={date} element={el} key={el.numeroLeg + el.hora} />
                    )
                })}
            </div>
        </section>
    )
}

