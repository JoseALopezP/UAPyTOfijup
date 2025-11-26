import { useContext, useEffect, useState } from 'react'
import styles from './Carga-Juicio.module.css'
import { DataContext } from '@/context New/DataContext';

export function JuicioSelection({ year, setYear, setPreviousVersion }) {
    const { updateJuicios, juiciosList } = useContext(DataContext);
    useEffect(() => {
        if (year.length === 4) {
            updateJuicios(year)
        }
    }, [year])
    return (
        <section className={`${styles.juicioSelectionBlock}`}>
            <div className={`${styles.dateSelection}`}>
                <input type="text" className={`${styles.dateSelectionInput}`} value={year} onChange={e => setYear(e.target.value)} />
            </div>
            <div>
                {juiciosList && juiciosList.map(juicio => {
                    return (
                        <span onClick={() => setPreviousVersion(juicio)}>
                            <p>{juicio.numeroLeg}</p>
                        </span>
                    )
                })}
            </div>
        </section>
    )
}
