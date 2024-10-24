import { DataContext } from '@/context/DataContext';
import styles from './AddAudiencia.module.css'
import { AddAudienciaTableHead } from './AddAudienciaTableHead';
import { AddAudienciaIndiv } from './AudienciaIndiv';
import { useContext } from 'react';

export function AddAudienciaList (dateFunction) {
    const {bydate} = useContext(DataContext)
    return(
        <section className={`${styles.audienciaListSection}`}>
            <div className={`${styles.audienciaListTable}`}>
                <AddAudienciaTableHead/>
                {bydate && bydate.sort((a,b)=>(a.hora.split(':').join('') - b.hora.split(':').join(''))).map((el)=>{
                    return(
                        <AddAudienciaIndiv element={el} key={el.numeroLeg + el.hora}/>
                    )
                })}
            </div>
        </section>
    )
}