'use client'
import styles from '../MinutaJuicio.module.css'

export default function AudList({list, setSelected, selectedList}) {
    const processSelected = (item) => {
    const isSelected = selectedList.some(s => s.id === item.id);
    if (isSelected) {
        const newList = selectedList.filter(s => s.id !== item.id);
        setSelected(newList);
    } else 
        setSelected([...selectedList, item]);
    }

    const formatDate = (fecha) => {
        if (!fecha) return '';
        // Handle DDMMYYYY format
        if (fecha.length === 8 && !fecha.includes('/')) {
            return `${fecha.slice(0,2)}/${fecha.slice(2,4)}/${fecha.slice(4,8)}`;
        }
        return fecha;
    };

    return (
        <><section className={`${styles.audListBlock}`}>
            {list === null || list === undefined ? (
            <p>Cargando...</p>
        ) : list.length === 0 ? (
            <span className={`${styles.audListIndiv}`}>
                <p>NO SE ENCUENTRAN BLOQUES DE DEBATE</p>
            </span>
        ) : (
            list.map((el, idx) => (
                <span key={el.id || idx} className={selectedList.some(s => s.id === el.id) ? `${styles.audListIndiv} ${styles.audListIndivSelected}` : `${styles.audListIndiv}`} onClick={() => processSelected(el)}>
                    <p>{el.hora} - {formatDate(el.fecha)}</p>
                    <p>{el.tipo}{el.tipo2 ? ` - ${el.tipo2}` : ''}{el.tipo3 ? ` - ${el.tipo3}` : ''}</p>
                </span>
            ))
        )}
        </section></>
    )}