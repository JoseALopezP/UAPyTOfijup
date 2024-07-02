import { useEffect, useContext, useState } from 'react'
import styles from './audiencia.module.css'
import { DataContext } from '@/context/DataContext';
import { checkForResuelvo } from '@/utils/resuelvoUtils';

export function AudienciaIndiv ({date, element}) {
    const {updateByDate, updateData, deleteAudiencia, updateDesplegables, desplegables} = useContext(DataContext);
    const [editable, setEditable] = useState(false)
    const [hora, setHora] = useState(null)
    const [situacion, setSituacion] = useState(null)
    const [situacion2, setSituacion2] = useState(null)
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
            if(!(!situacion | situacion == '-' | situacion == '' | situacion === situacion2)){
                await updateData(date, element.numeroLeg, element.hora, 'situacion', situacion)
                await setSituacion2(element.situacion)
            }
            if(deleteAud){
                await deleteAudiencia(date, element.numeroLeg, element.hora)
            }
            if(hora){
                await updateData(date, element.numeroLeg, element.hora, 'hora', hora)
            }
            await setDeleteAud(false)
            await setEditable(false)
            await updateByDate(date)
        }
    }
    const checkEditing = () =>{
        if((!sala | sala == '-' | sala == element.sala) & (!situacion | situacion == '-' | situacion == '' | situacion == situacion2) & !deleteAud & (!operador | operador == '') & (!hora)){
            setEditable(false)
        }else{
            setEditable(true)
        }
    }
    useEffect(() => {
        checkEditing()
    }, [sala, deleteAud, situacion, hora, operador, situacion2]);
    useEffect(() => {
        setSituacion(element.situacion)
        setSituacion2(element.situacion)
    }, []);
    useEffect(() => {
        updateByDate(date)
        updateDesplegables()
    }, []);
    return(
        <form id='editingForm' onSubmit={(event) => handleSubmit(event)} key={element.numeroLeg + element.hora} className={deleteAud ? `${styles.tableRow} ${styles.audienciaList} ${styles.toDelete}` : `${styles.tableRow} ${styles.audienciaList}`}>
            <span className={`${styles.tableCell} ${styles.tableCellOP} ${styles.tableCellOPIndiv}`}>
                <select className={`${styles.inputSituacionEdit} ${styles.operadorInput}`} onChange={(e)=>{setOperador(e.target.value)}}>
                    <option key={element.operador + 1} value={element.operador}>{nameTranslate(element.operador)}</option>
                    {desplegables.operador && desplegables.operador.map((el)=>{
                        return(
                            <option key={el} value={el}>{nameTranslate(el)}</option>
                        )
                    })}
                </select>
            </span>
            <span className={`${styles.tableCell} ${styles.tableCellHora} ${styles.tableCellHoraIndiv}`}>
                <input  className={`${styles.inputHora} ${styles.inputHoraBlock}`}  type="time" id="IngresarHora" onChange={e => {setHora(e.target.value)}} defaultValue={element.hora}/>
            </span>
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
            <span className={`${styles.tableCell} ${styles.tableCellTipoIndiv}`}>{element.tipo}{element.tipo2 && ' + ' + element.tipo2}{element.tipo3 && ' + ' + element.tipo3}</span>
            <span className={`${styles.tableCell} ${styles.tableCellJuez} ${styles.tableCellJuezList}`}>{element.juez.split('+').map((e,i)=> <span key={e}>{e.split(' ').slice(1,4).join(' ')} {i == (element.juez.split('+').length - 1) ? '' : '-'}</span>)}</span>
            <span className={`${styles.tableCell} ${styles.tableCellSituacion} ${styles.tableCellSituacionIndiv}`}>
                <textarea onChange={(e)=>{setSituacion(e.target.value)}} type="text" id="ingresarSituacion" value={situacion} className={`${styles.inputSituacionEdit}`}/>
            </span>
            <span className={`${styles.tableCell} ${styles.deleteButtonBlock}  ${styles.tableCellAction}`}>
                <button type="button" className={deleteAud ? `${styles.deleteButton} ${styles.deleteButtonClicked}` : `${styles.deleteButton}`} onClick={()=> setDeleteAud(!deleteAud)}>ELIMINAR</button>
                <button type="submit" className={editable ? `${styles.editButton}` : `${styles.editButton} ${styles.editButtonNot}`}>EDITAR</button>
            </span>
        </form>
    )
}