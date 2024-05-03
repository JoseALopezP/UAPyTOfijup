import { useEffect, useContext} from 'react'
import styles from './audiencia.module.css'
import { DataContext } from '@/context/DataContext';
import { AddBlock } from './AddBlock';
import { AudienciaIndiv } from './AudienciaIndiv';
import { useAuthContext } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export function AudienciaAddList ({date}) {
    const {updateByDate, bydate} = useContext(DataContext);
    useEffect(() => {
        updateByDate(date)
    }, []);
    const { user } = useAuthContext()
    const router = useRouter()
    useEffect(() => {
      if (user == null) router.push("/signin")
    }, [user])
    return(
        <section className={`${styles.audienciaListSection}`}>
            <div className={`${styles.audienciaListTable}`}>
                <div className={`${styles.audienciaListTableHead} ${styles.tableRow}`}>
                    <span className={`${styles.tableCell} ${styles.tableCellAdmin}`}>ADMIN</span>
                    <span className={`${styles.tableCell} ${styles.tableCellHora}`}>HORA</span>
                    <span className={`${styles.tableCell} ${styles.tableCellSala}`}>SALA</span>
                    <span className={`${styles.tableCell} ${styles.tableCellLegajo}`}>LEGAJO</span>
                    <span className={`${styles.tableCell}`}>TIPO DE AUDIENCIA</span>
                    <span className={`${styles.tableCell} ${styles.tableCellJuez}`}>JUEZ</span>
                    <span className={`${styles.tableCell} ${styles.tableCellJuezN}`}>NAT</span>
                    <span className={`${styles.tableCell} ${styles.tableCellSituacion}`}>SIT. CORPORAL</span>
                    <span className={`${styles.tableCell} ${styles.tableCellResultado}`}>RESULT.</span>
                    <span className={`${styles.tableCell} ${styles.tableCellAction}`}>ACCIÓN</span>
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