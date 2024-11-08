import { useContext, useEffect, useState } from 'react'
import styles from '../Oficios.module.css'
import { DataContext } from '@/context/DataContext'
import { nameTranslateActuario } from '@/utils/traductorNombres'

export default function SorteoModule({date, arr}) {
    const {updateDesplegables, desplegables, updateData} = useContext(DataContext)
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
    const handleAsignacion = async() =>{
        arr.forEach((el, index) => {
            if(turno){
                if(parseInt(el.hora.split(':')[0]) < 14){
                    console.log(date, el.numeroLeg, el.hora, 'actuario', listaSeleccionado[(index % listaSeleccionado.length)])
                    updateData(date, el.numeroLeg, el.hora, 'actuario', listaSeleccionado[(index % listaSeleccionado.length)]);}
            }else{
                if(parseInt(el.hora.split(':')[0]) >= 14){
                    updateData(date, el.numeroLeg, el.hora, 'actuario', listaSeleccionado[(index % listaSeleccionado.length)]);}
            }
        })
    }
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
                <select onChange={e => {setTurno(e.target.value)}}>
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