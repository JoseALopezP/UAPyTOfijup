'use client'
import { useContext, useEffect } from 'react'
import styles from '../Menu.module.css'
import { DataContext } from '@/context New/DataContext'
import { todayFunction } from '@/utils/dateUtils'

export default function MenuImportantDates() {
    const { updateImportantDates, importantDates } = useContext(DataContext)

    useEffect(() => {
        updateImportantDates()
    }, [])

    const getEventsForDate = (date) => {
        if (!importantDates) return { key: '', events: [] };
        const standardKey = date.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" }).split('/').join('');
        const dayOfMonth = date.getDate();
        const t = Math.ceil(dayOfMonth / 7);
        const jsDay = date.getDay();
        const d = jsDay === 0 ? 1 : jsDay + 1;
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const ruleKey = `${t}:${d}:${month}`;
        let events = [];
        if (importantDates[standardKey]) events = [...events, ...importantDates[standardKey]];
        if (importantDates[ruleKey]) events = [...events, ...importantDates[ruleKey]];
        return { key: standardKey, events };
    }
    const renderDates = (start, end) => {
        const datesToRender = [];
        const today = new Date();
        for (let i = start; i <= end; i++) {
            if (i === 0) continue;
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const { key, events } = getEventsForDate(date);
            if (events.length > 0) {
                datesToRender.push(
                    <div key={key}>
                        <strong>{key.slice(0, 2)} / {key.slice(2, 4)}:</strong>
                        {events.map((el, index) => <p key={index}>{el}</p>)}
                    </div>
                );
            }
        }
        return datesToRender.length > 0 ? datesToRender : <p>No hay fechas</p>;
    }
    const todayDate = new Date();
    const { events: todayEvents } = getEventsForDate(todayDate);
    return (
        <div className={`${styles.importantDatesSection}`}>
            <h2 className={`${styles.importantDatesTitle}`}>FECHAS IMPORTANTES</h2>
            <div className={`${styles.importantDatesBody}`}>
                <h3>Hoy es:</h3>
                {todayEvents.length > 0 ? todayEvents.map((el, i) =>
                    <p key={i} className={`${styles.importantDatesToday}`}>{el}</p>
                ) : <p className={`${styles.importantDatesToday}`}>-</p>}
                <div className={`${styles.importantDatesSecondary}`}>
                    <span><h3>Últimos días:</h3>
                        {renderDates(-7, -1)}</span>
                    <span><h3>Próximos días:</h3>
                        {renderDates(1, 6)}</span></div>
            </div>
        </div>
    )
}