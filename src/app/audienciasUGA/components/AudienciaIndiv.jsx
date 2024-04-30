import { useEffect, useContext, useState } from 'react'
import styles from './audiencia.module.css'
import { DataContext } from '@/context/DataContext';

export function AudienciaIndiv ({date, element}) {
    const {updateByDate, updateData, deleteAudiencia} = useContext(DataContext);
    const [editable, setEditable] = useState(false)
    const [situacion, setSituacion] = useState(null)
    const [operador, setOperador] = useState(null)
    const [sala, setSala] = useState(null)
    const [deleteAud, setDeleteAud] = useState(false)

    const handleSubmit = async(event) =>{
        event.preventDefault();
        if(editable){
            if(!(!sala | sala == '-' | sala == element.sala)){
                await updateData(date, element.numeroLeg, element.hora, 'sala', sala)
            }
            if(!(!operador | operador == '')){
                await updateData(date, element.numeroLeg, element.hora, 'operador', operador)
            }
            if(!(!situacion | situacion == '-' | situacion == '')){
                await updateData(date, element.numeroLeg, element.hora, 'situacion', situacion)
            }
            if(!(!situacion | situacion == '-' | situacion == '')){
                await updateData(date, element.numeroLeg, element.hora, 'situacion', situacion)
            }
            if(deleteAud){
                await deleteAudiencia(date, element.numeroLeg, element.hora)
            }
            await setEditable(false)
            await updateByDate(date)
        }
    }
    const checkEditing = () =>{
        if((!sala | sala == '-' | sala == element.sala) & (!situacion | situacion == '-' | situacion == '') & !deleteAud & (!operador | operador == '')){
            setEditable(false)
        }else{
            setEditable(true)
        }
    }
    useEffect(() => {
        checkEditing()
    }, [sala]);
    useEffect(() => {
        checkEditing()
    }, [deleteAud]);
    useEffect(() => {
        checkEditing()
    }, [situacion]);
    useEffect(() => {
        checkEditing()
    }, [operador]);
    useEffect(() => {
        updateByDate(date)
    }, []);
    return(
        <form id='editingForm' onSubmit={(event) => handleSubmit(event)} key={element.numeroLeg + element.hora} className={deleteAud ? `${styles.tableRow} ${styles.audienciaList} ${styles.toDelete}` : `${styles.tableRow} ${styles.audienciaList}`}>
            <span className={`${styles.tableCell} ${styles.tableCellOP}`}>
                <input type='text' className={`${styles.inputSituacionEdit} ${styles.operadorInput}`} placeholder={element.operador} onChange={(e)=>{setOperador(e.target.value)}}></input>
            </span>
            <span className={`${styles.tableCell} ${styles.tableCellHora}`}>{element.hora}</span>
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
                    <option value={"10"} >SALA 10</option>
                </select>
            </span>
            <span className={`${styles.tableCell} ${styles.tableCellLegajo}`}>{element.numeroLeg}</span>
            <span className={`${styles.tableCell} ${styles.tableCellTipo}`}>{element.tipo}</span>
            <span className={`${styles.tableCell} ${styles.tableCellJuez} ${styles.tableCellJuezList}`}>{element.juez.split('+').map(e => <span key={e}>{e}<br/></span>)}</span>
            <span className={`${styles.tableCell} ${styles.tableCellSituacion} ${styles.tableCellSituacionIndiv}`}>
                <textarea onChange={(e)=>{setSituacion(e.target.value)}} type="text" id="ingresarSituacion" placeholder={element.situacion} className={`${styles.inputSituacionEdit}`}/>
            </span>
            <span className={`${styles.tableCell} ${styles.deleteButtonBlock}  ${styles.tableCellAction}`}>
                <button type="button" className={deleteAud ? `${styles.deleteButton} ${styles.deleteButtonClicked}` : `${styles.deleteButton}`} onClick={()=> setDeleteAud(!deleteAud)}>ELIMINAR</button>
                <button type="submit" className={editable ? `${styles.editButton}` : `${styles.editButton} ${styles.editButtonNot}`}>EDITAR</button>
            </span>
        </form>
    )
}