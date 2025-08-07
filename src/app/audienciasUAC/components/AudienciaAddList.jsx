import { useEffect, useContext, useState } from 'react';
import styles from './audiencia.module.css';
import { DataContext } from '@/context/DataContext';
import { AddBlock } from './AddBlock';
import { AudienciaIndiv } from './AudienciaIndiv';

export function AudienciaAddList() {
    const { updateByDate, bydate } = useContext(DataContext);
    const [dateToUse, setDateToUse] = useState('');
    useEffect(() => {
        if (!dateToUse) return;
        updateByDate(dateToUse);
        const interval = setInterval(() => {
            updateByDate(dateToUse);
        }, 30000);
        return () => clearInterval(interval); 
    }, [dateToUse]);
    return (
        <section className={styles.audienciaListSection}>
            <div className={styles.audienciaListTable}>
                <div className={`${styles.audienciaListTableHead} ${styles.tableRow}`}>
                    <span className={`${styles.tableCell} ${styles.tableCellAdmin}`}>PROG.</span>
                    <span className={`${styles.tableCell} ${styles.tableCellHora}`}>HORA</span>
                    <span className={`${styles.tableCell} ${styles.tableCellSala}`}>SALA</span>
                    <span className={`${styles.tableCell} ${styles.tableCellLegajo}`}>LEGAJO</span>
                    <span className={styles.tableCell}>
                        <input
                            type="text"
                            value={dateToUse}
                            onChange={(e) => setDateToUse(e.target.value)}
                        />
                    </span>
                    <span className={`${styles.tableCell} ${styles.tableCellJuez}`}>JUEZ</span>
                    <span className={`${styles.tableCell} ${styles.tableCellJuezN}`}>NAT</span>
                    <span className={`${styles.tableCell} ${styles.tableCellSituacion}`}>SIT. CORPORAL</span>
                    <span className={`${styles.tableCell} ${styles.tableCellResultado}`}>RESULT.</span>
                    <span className={`${styles.tableCell} ${styles.tableCellAction}`}>ACCIÓN</span>
                </div>
                <AddBlock date={dateToUse} />
                {bydate && bydate.sort((a, b) => (a.hora.split(':').join('') - b.hora.split(':').join(''))).map(el => (
                    <AudienciaIndiv date={dateToUse} element={el} key={el.numeroLeg + el.hora} />
                ))}
            </div>
        </section>
    );
}
