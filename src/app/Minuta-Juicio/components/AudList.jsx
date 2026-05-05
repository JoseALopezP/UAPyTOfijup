'use client'
import styles from '../MinutaJuicio.module.css'

export default function AudList({list, setSelected, selectedList}) {
    const processSelected = (item) => {
        const itemId = item.id || item.aId || `${item.fecha}-${item.hora}`;
        const isSelected = selectedList.some(selectedItem => {
            const sId = selectedItem.id || selectedItem.aId || `${selectedItem.fecha}-${selectedItem.hora}`;
            return sId === itemId;
        });
        if (isSelected) {
            const newList = selectedList.filter(selectedItem => {
                const sId = selectedItem.id || selectedItem.aId || `${selectedItem.fecha}-${selectedItem.hora}`;
                return sId !== itemId;
            });
            setSelected(newList);
        } else {
            setSelected([...selectedList, item]);
        }
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
            list.map((el, i) => {
                const f = String(el.fecha || "00000000");
                const elId = el.id || el.aId || `${el.fecha}-${el.hora}`;
                const isSelected = selectedList.some(selectedItem => {
                    const sId = selectedItem.id || selectedItem.aId || `${selectedItem.fecha}-${selectedItem.hora}`;
                    return sId === elId;
                });
                return (
                <span key={el.id || el.aId || i} className={isSelected ? `${styles.audListIndiv} ${styles.audListIndivSelected}` : `${styles.audListIndiv}`} onClick={() => processSelected(el)}>
                    <p>{el.hora} - {f.substring(0,2)}/{f.substring(2,4)}/{f.substring(4,8)}</p>
                    <p>{el.tipo}</p>
                </span>
                )
            })
        )}
        </section></>
    )}