import { useContext, useEffect, useState, useRef } from 'react';
import styles from './ScheduleTable.module.css';
import { DataContext } from '@/context/DataContext';

export function ScheduleTable() {
    const { updateToday, today, realTime, audSize } = useContext(DataContext);
    const [partShow, setPartShow] = useState(false);
    const refPartShow = useRef(partShow);

    const getMinutes = (dateObject) => {
        const nowTime = parseInt(realTime.split(':')[0]) * 60 + parseInt(realTime.split(':')[1]);
        const timeComparison = parseInt(`${dateObject}`.split(':')[0]) * 60 + parseInt(`${dateObject}`.split(':')[1]);
        return timeComparison - nowTime;
    };

    function filterToday() {
        const aux2 = [];
        if (today) {
            today.forEach((item) => {
                switch (item.estado) {
                    case 'EN_CURSO':
                    case 'PROGRAMADA':
                    case 'CUARTO_INTERMEDIO':
                    case 'FINALIZADA':
                        if (getMinutes(item.hora) < 120 && getMinutes(item.hora) > -120) {
                            aux2.push(item);
                        }
                        break;
                    case 'CANCELADA':
                    case 'REPROGRAMADA':
                        aux2.push(item);
                        break;
                }
            });
        }
        return aux2;
    }

    const updateTick = (filtered) => {
        if (filtered.length > audSize) {
            setPartShow(!refPartShow.current);
        } else {
            setPartShow(false);
        }
    };

    function tick() {
        const filtered = filterToday().sort((a, b) => a.hora.split(':').join('') - b.hora.split(':').join(''));
        updateTick(filtered);
        updateToday();
    }

    useEffect(() => {
        refPartShow.current = partShow;
    }, [partShow]);

    useEffect(() => {
        tick();
        const timerID = setInterval(() => tick(), 5000);
        return () => {
            clearInterval(timerID);
        };
    }, []);

    return (
        <section className={`${styles.tableSection}`}>
            <table className={`${styles.table}`} cellSpacing="0" cellPadding="0">
                <thead className={`${styles.tableHead}`}>
                    <tr>
                        <th>HORA</th>
                        <th>SALA</th>
                        <th>LEGAJO</th>
                        <th>TIPO DE AUDIENCIA</th>
                        <th>JUEZ</th>
                        <th>ESTADO</th>
                    </tr>
                </thead>
                <tbody className={`${styles.tableBody}`}>
                    {today &&
                        filterToday()
                            .sort((a, b) => a.hora.split(':').join('') - b.hora.split(':').join(''))
                            .map((el, i) => {
                                const shouldDisplay = partShow ? (i >= audSize) : (i < audSize);
                                if (shouldDisplay) {
                                    return (
                                        <tr key={el.numeroLeg} className={`${styles["fila" + el.estado]}`}>
                                            <td>{el.hora}</td>
                                            <td>SALA {el.sala}</td>
                                            <td>{el.numeroLeg}</td>
                                            <td>{el.tipo}</td>
                                            <td>{el.juez.split('+').map(e => <span key={e}>{e}<br /></span>)}</td>
                                            {(el.estado === 'PROGRAMADA' && (realTime > el.hora)) ? (
                                                <td className={`${styles.DEMORADA}`}>DEMORADA</td>
                                            ) : (
                                                <td className={`${styles[el.estado]}`}>{el.estado.split('_').join(' ')}</td>
                                            )}
                                        </tr>
                                    );
                                }
                                return null;
                            })}
                </tbody>
            </table>
        </section>
    );
}