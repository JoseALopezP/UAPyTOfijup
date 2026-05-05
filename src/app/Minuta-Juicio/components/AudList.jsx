'use client'
import styles from '../MinutaJuicio.module.css'

export default function AudList({list, setSelected, selectedList}) {
    const processSelected = (item) => {
    const isSelected = selectedList.includes(item);
    if (isSelected) {
        const newList = selectedList.filter(selectedItem => selectedItem !== item);
        setSelected(newList);
    } else 
        setSelected([...selectedList, item]);
    }
    return (
        <><section className={`${styles.audListBlock}`}>
            {list === null || list === undefined ? (
            <p>Cargando...</p>
        ) : list.length === 0 ? (
            <span className={`${styles.audListIndiv}`}>
                <p>NO SE ENCUENTRAN BLOQUES</p>
            </span>
        ) : list[0] === 0 ? (
            <span className={`${styles.audListIndiv}`}>
                <p>NO SE ENCUENTRAN BLOQUES</p>
            </span>
        ) : (
            list.map(el => (
                <span className={selectedList.indexOf(el) ? `${styles.audListIndiv} ${styles.audListIndivSelected}` : `${styles.audListIndiv}`} onClick={() => processSelected(el)}>
                    <p>{el.hora} - {el.fecha.split('').slice(0,2)}/{el.fecha.split('').slice(2,4)}/{el.fecha.split('').slice(4,8)}</p>
                    <p>{el.tipo}</p>
                </span>
            ))
        )}
        </section></>
    )}