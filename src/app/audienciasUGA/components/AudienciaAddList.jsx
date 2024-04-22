import { useEffect, useContext} from 'react'
import styles from './audiencia.module.css'
import { DataContext } from '@/context/DataContext';
import { AddBlock } from './AddBlock';
import { AudienciaIndiv } from './AudienciaIndiv';

export function AudienciaAddList ({date}) {
    const {updateByDate, bydate} = useContext(DataContext);
    useEffect(() => {
        updateByDate(date)
    }, []);
    return(
        <section className={`${styles.audienciaListSection}`}>
            <div className={`${styles.audienciaListTable}`}>
                <div className={`${styles.audienciaListTableHead} ${styles.tableRow}`}>
                    <span className={`${styles.tableCell}`}>HORA</span>
                    <span className={`${styles.tableCell}`}>SALA</span>
                    <span className={`${styles.tableCell}`}>LEGAJO</span>
                    <span className={`${styles.tableCell}`}>TIPO DE AUDIENCIA</span>
                    <span className={`${styles.tableCell}`}>JUEZ</span>
                    <span className={`${styles.tableCell}`}>SIT. CORPORAL</span>
                    <span className={`${styles.tableCell}`}>ACCIÓN</span>
                </div>
                <AddBlock date={date}/>
                {bydate && bydate.sort((a,b)=>(a.hora.split(':').join('') - b.hora.split(':').join(''))).map((el)=>{
                    return(
                        <AudienciaIndiv date={date} element={el}/>
                    )
                })}
            </div>
        </section>
    )
}