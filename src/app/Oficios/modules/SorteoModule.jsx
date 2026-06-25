import { useContext, useEffect, useState } from 'react'
import styles from '../Oficios.module.css'
import { DataContext } from '@/context/DataContext'
import { nameTranslateActuario } from '@/utils/traductorNombres'

export default function SorteoModule({date, arr}) {
    const {updateDesplegables, desplegables, updateData, updateByDate} = useContext(DataContext)
    const [showRaffle, setShowRaffle] = useState(false)
    const [listaOriginal, setListaOriginal] = useState(desplegables.actuario || []);
    const [listaSeleccionado, setListaSeleccionado] = useState([]);
    const [turno, setTurno] = useState(true)
    const handleClickActuarioRemove = (element) => {
        const updatedSelectedList = listaSeleccionado.filter(el => el !== element);
        const updatedOriginalList = [...listaOriginal, element];
        setListaSeleccionado(updatedSelectedList);
        setListaOriginal(updatedOriginalList);
    };
    const handleClickActuarioAdd = (element) => {
        const updatedOriginalList = listaOriginal.filter(el => el !== element);
        const updatedSelectedList = [...listaSeleccionado, element];
        setListaOriginal(updatedOriginalList);
        setListaSeleccionado(updatedSelectedList);
    };
    const handleAsignacion = async () => {
        const sortedArr = [...arr].sort((a, b) => {
            const timeA = String(a?.hora || '').split(':').join('');
            const timeB = String(b?.hora || '').split(':').join('');
            if (timeA !== timeB) {
                if (!timeA) return 1;
                if (!timeB) return -1;
                return Number(timeA) - Number(timeB);
            }
            return String(a?.numeroLeg || '').localeCompare(String(b?.numeroLeg || ''));
        });

        for (const [index, el] of sortedArr.entries()) {
            const hour = parseInt(String(el?.hora || '').split(':')[0], 10);
            if (isNaN(hour)) continue;
            if (turno === true && hour < 14) {
                await updateData(date, el.id, 'actuario', listaSeleccionado[index % listaSeleccionado.length]);
            }
            if (turno === false && hour >= 14) {
                await updateData(date, el.id, 'actuario', listaSeleccionado[index % listaSeleccionado.length]);
            }
        }
        await updateByDate(date)
    };
    useEffect(() => {
        updateDesplegables()
    }, []);
    useEffect(() => {
        setListaOriginal(desplegables.actuario || []);
    }, [desplegables.actuario]);
    return (
        <>
        <button className={styles.buttonRaffle} type='button' onClick={()=> setShowRaffle(!showRaffle)}>SORTEO OFICIO</button>
        {showRaffle && <div className={styles.raffleContainer}>
        <span className={styles.blockTop}>
            <select onChange={e => {setTurno(e.target.value === "true")}}>
                <option value={true}>MAÑANA</option>
                <option value={false}>TARDE</option>
            </select>
        </span>
            <span className={styles.blockLeft}>
                {listaOriginal && listaOriginal.map((el) => (
                    <span key={el} className={styles.actuarioListItem} onClick={() => handleClickActuarioAdd(el)}>
                        {nameTranslateActuario(el)}
                    </span> 
                ))}
            </span>
            <span className={styles.blockRight}>
                {listaSeleccionado && listaSeleccionado.map((el) => (
                    <span key={el} className={styles.actuarioListItem} onClick={() => handleClickActuarioRemove(el)}>
                        {nameTranslateActuario(el)}
                    </span>
                ))}
            </span>
            <span className={styles.blockBottom}>
                <button type='button' onClick={() => handleAsignacion()}>SORTEAR</button>
            </span>
        </div>}
        </>
    )
}
