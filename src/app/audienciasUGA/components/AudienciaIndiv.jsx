import { useEffect, useContext, useState } from 'react'
import styles from './audiencia.module.css'
import { DataContext } from '@/context/DataContext';

export function AudienciaIndiv ({date, element}) {
    const {updateByDate, updateData} = useContext(DataContext);
    const [editable, setEditable] = useState(false)
    const [situacion, setSituacion] = useState(null)
    const [sala, setSala] = useState(null)

    const handleSubmit = async(event) =>{
        event.preventDefault();
        if(editable){
            if(!(!sala | sala == '-' | sala == element.sala)){
                await updateData(date, element.numeroLeg, element.hora, 'sala', sala)
            }
            if(!(!situacion | situacion == '-' | situacion == '')){
                await updateData(date, element.numeroLeg, element.hora, 'situacion', situacion)
            }
            await setEditable(false)
        }
    }
    const checkEditing = () =>{
        if((!sala | sala == '-' | sala == element.sala) & (!situacion | situacion == '-' | situacion == '')){
            setEditable(false)
        }else{
            setEditable(true)
        }
    }
    const handleDelete = async() =>{
        
    }
    useEffect(() => {
        checkEditing()
    }, [sala]);
    useEffect(() => {
        checkEditing()
    }, [situacion]);
    useEffect(() => {
        updateByDate(date)
    }, []);
    return(
        <form id='editingForm' onSubmit={(event) => handleSubmit(event)} key={element.numeroLeg + element.hora} className={`${styles.tableRow} ${styles.audienciaList}`}>
            <span className={`${styles.tableCell}`}>{element.hora}</span>
            <span className={`${styles.tableCell} ${styles.tableCellSala}`}>
                <select  onChange={(e)=>{setSala(e.target.value)}} className={`${styles.selectSalaEdit}`}>
                    <option>SALA {element.sala}</option>
                    <option value={"1"} >SALA 1</option>
                    <option value={"2"} >SALA 2</option>
                    <option value={"3"} >SALA 3</option>
                    <option value={"4"} >SALA 4</option>
                    <option value={"5"} >SALA 5</option>
                    <option value={"6"} >SALA 6</option>
                    <option value={"7"} >SALA 7</option>
                    <option value={"8"} >SALA 8</option>
                    <option value={"9"} >SALA 9</option>
                </select>
            </span>
            <span className={`${styles.tableCell}`}>{element.numeroLeg}</span>
            <span className={`${styles.tableCell}`}>{element.tipo}</span>
            <span className={`${styles.tableCell} ${styles.tableCellJuez}`}>{element.juez.split('+').map(e => <span key={e}>{e}<br/></span>)}</span>
            <span className={`${styles.tableCell} ${styles.tableCellSituacion}`}>
                <textarea onChange={(e)=>{setSituacion(e.target.value)}} type="text" id="ingresarSituacion" placeholder={element.situacion} className={`${styles.inputSituacionEdit}`}/>
            </span>
            <span className={`${styles.tableCell} ${styles.deleteButtonBlock}`}>
                <button type="button" className={`${styles.deleteButton}`}>ELIMINAR</button>
                <button type="submit" className={editable ? `${styles.editButton}` : `${styles.editButton} ${styles.editButtonNot}`}>EDITAR</button>
            </span>
        </form>
    )
}