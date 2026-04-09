import { useEffect, useContext, useState } from 'react';
import styles from './audiencia.module.css';
import { DataContext } from '@/context New/DataContext';
import { AudienciaIndiv } from './AudienciaIndiv';

export function AudienciaAddList() {
    const { updateByDateView, bydateView } = useContext(DataContext);
    const [dateToUse, setDateToUse] = useState('');
    useEffect(() => {
        if (!dateToUse) return;
        updateByDateView(dateToUse);
        const interval = setInterval(() => {
            updateByDateView(dateToUse);
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
                        <button className={styles.buttonRefresh} onClick={() => updateByDateView(dateToUse)}>⟳</button>
                    </span>
                    <span className={`${styles.tableCell} ${styles.tableCellJuez}`}>JUEZ</span>
                    <span className={`${styles.tableCell} ${styles.tableCellJuezN}`}>NAT</span>
                    <span className={`${styles.tableCell} ${styles.tableCellSituacion}`}>SIT. CORPORAL</span>
                    <span className={`${styles.tableCell} ${styles.tableCellResultado}`}>RESULT.</span>
                    <span className={`${styles.tableCell} ${styles.tableCellAction}`}>ACCIÓN</span>
                </div>
                {bydateView && Object.values(bydateView)
                    .filter(el => el?.hora)
                    .sort((a, b) => {
                        const timeA = a.hora.split(':').join('');
                        const timeB = b.hora.split(':').join('');
                        if (timeA !== timeB) return timeA - timeB;
                        return String(a.numeroLeg || '').localeCompare(String(b.numeroLeg || ''));
                    })
                    .map(el => (
                        <AudienciaIndiv date={dateToUse} element={el} key={el.id || el.numeroLeg + el.hora} />
                    ))}
            </div>
        </section>
    );
}
