import { useContext, useEffect, useState} from 'react';
import styles from './ScheduleTable.module.css';
import { DataContext } from '@/context/DataContext';

export function ScheduleTable() {
    const { updateToday, today, realTime} = useContext(DataContext);
    const [filerValue, setFilterValue] = useState('')

    useEffect(() => {
        updateToday()
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
                        today
                            .sort((a, b) => a.hora.split(':').join('') - b.hora.split(':').join(''))
                            .map((el, i) => {
                                return (
                                    <tr key={el.numeroLeg} className={`${styles["fila" + el.estado]}`}>
                                        <td>{el.hora}</td>
                                        <td>SALA {el.sala}</td>
                                        <td>{el.numeroLeg}</td>
                                        <td>{el.tipo.split('').slice(0,40).join('')}{el.tipo.split('').length>39 ? '...' : ''}</td>
                                        <td>{el.juez.split('+').map(e => <span key={e}>{e}<br /></span>)}</td>
                                        {(el.estado === 'PROGRAMADA' && (realTime > el.hora)) ? (
                                            <td className={`${styles.DEMORADA}`}>DEMORADA</td>
                                        ) : (
                                            <td className={`${styles[el.estado]}`}>{el.estado.split('_').join(' ')}</td>
                                        )}
                                    </tr>
                                );
                            })}
                </tbody>
            </table>
        </section>
    );
}