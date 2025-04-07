import { useEffect, useContext, useState } from 'react';
import styles from './audiencia.module.css';
import { DataContext } from '@/context/DataContext';
import { AddBlock } from './AddBlock';
import { AudienciaIndiv } from './AudienciaIndiv';
import { useAuthContext } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export function AudienciaAddList() {
    const { updateByDate, bydate } = useContext(DataContext);
    const [dateToUse, setDateToUse] = useState('');
    const { user } = useAuthContext();
    const router = useRouter();

    useEffect(() => {
        if (user == null) router.push("/signin");
    }, [user, router]);
    function tick() {
        if (dateToUse) {
            updateByDate(dateToUse);
        }
    }
    useEffect(() => {
        const handler = setTimeout(() => {
            if (dateToUse) {
                updateByDate(dateToUse);
            }
        }, 1500);
        return () => clearTimeout(handler);
    }, [dateToUse]);
    useEffect(() => {
        const timerID = setInterval(() => tick(), 30000);
        return () => clearInterval(timerID);
    }, [dateToUse]);

    return (
        <section className={styles.audienciaListSection}>
            <div className={styles.audienciaListTable}>
                <div className={`${styles.audienciaListTableHead} ${styles.tableRow}`}>
                    <span className={`${styles.tableCell} ${styles.tableCellOP}`}>PROG.</span>
                    <span className={`${styles.tableCell} ${styles.tableCellHora}`}>HORA</span>
                    <span className={`${styles.tableCell} ${styles.tableCellSala}`}>SALA</span>
                    <span className={`${styles.tableCell} ${styles.tableCellLegajo}`}>LEGAJO</span>
                    <span className={`${styles.tableCell} ${styles.tableCellTipo}`}>
                        <input
                            type='text'
                            value={dateToUse}
                            onChange={e => setDateToUse(e.target.value)}
                        />
                    </span>
                    <span className={`${styles.tableCell} ${styles.tableCellJuez}`}>JUEZ</span>
                    <span className={`${styles.tableCell} ${styles.tableCellSituacion}`}>SIT. CORPORAL</span>
                    <span className={`${styles.tableCell} ${styles.tableCellAction}`}>ACCIÓN</span>
                </div>
                <AddBlock date={dateToUse} />
                {bydate && bydate.sort((a, b) => (a.hora.split(':').join('') - b.hora.split(':').join(''))).map((el) => {
                    return (
                        <AudienciaIndiv date={dateToUse} element={el} key={el.numeroLeg + el.hora} />
                    )
                })}
            </div>
        </section>
    )
}