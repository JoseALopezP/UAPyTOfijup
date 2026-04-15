import { useContext, useEffect, useState } from 'react'
import styles from './Carga-Juicio.module.css'
import { DataContext } from '@/context New/DataContext';

export function JuicioSelection({ year, setYear, setPreviousVersion }) {
    const { updateJuicios, juiciosList, deleteJuicio } = useContext(DataContext);
    const handleSearch = () => {
        if (String(year).length === 4) {
            updateJuicios(String(year))
        }
    }
    const handleDelete = async (e, juicioId) => {
        e.stopPropagation(); // Prevents selecting the trial
        if (window.confirm(`¿Está seguro de que desea eliminar el juicio ${juicioId} de Firebase? Esta acción no se puede deshacer.`)) {
            await deleteJuicio(year, juicioId);
        }
    }
    useEffect(() => {
        handleSearch();
    }, [year])
    return (
        <section className={`${styles.juicioSelectionBlock}`}>
            <div className={`${styles.dateSelection}`}>
                <input type="text" className={`${styles.dateSelectionInput}`} value={year} onChange={e => setYear(e.target.value)} placeholder="Año (YYYY)" />
                <button className={`${styles.cargarAnualButton}`} onClick={handleSearch}>CARGAR</button>
            </div>
            <div className={`${styles.juiciosListContainer}`}>
                {juiciosList && juiciosList.length > 0 ? juiciosList.map((juicio, index) => {
                    return (
                        <div key={juicio.id || index} className={`${styles.juicioItem}`} onClick={() => setPreviousVersion(juicio)}>
                            <div className={`${styles.juicioItemHeader}`}>
                                <p className={`${styles.juicioItemLegajo}`}>{juicio.numeroLeg}</p>
                                <button className={`${styles.eliminarJuicioBtn}`} onClick={(e) => handleDelete(e, juicio.id)}>🗑️</button>
                            </div>
                            <p className={`${styles.juicioItemDate}`}>Auto: {juicio.auto?.split(' ')[0] || 'N/A'}</p>
                        </div>
                    )
                }) : <p className={`${styles.noJuiciosText}`}>No hay juicios en {year}</p>}
            </div>
        </section>
    )
}
