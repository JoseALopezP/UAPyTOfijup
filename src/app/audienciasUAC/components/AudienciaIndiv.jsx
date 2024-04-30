import { useEffect, useContext, useState } from 'react'
import styles from './audiencia.module.css'
import { DataContext } from '@/context/DataContext';

export function AudienciaIndiv ({date, element}) {
    const {updateByDate, jueces, updateData, deleteAudiencia} = useContext(DataContext);
    const [editable, setEditable] = useState(false)
    const [situacion, setSituacion] = useState(null)
    const [admin, setAdmin] = useState(null)
    const [resultado, setResultado] = useState(null)
    const [cancelar, setCancelar] = useState(false)
    const [juezN, setJuezN] = useState(null)
    const [deleteAud, setDeleteAud] = useState(false)
    const handleSubmit = async(event) =>{
        event.preventDefault();
        if(editable){
            if(cancelar){
                await updateData(date, element.numeroLeg, element.hora, 'estado', 'CANCELADA')
            }
            if(!(!situacion | situacion == '-' | situacion == '')){
                await updateData(date, element.numeroLeg, element.hora, 'situacion', situacion)
            }
            if(!(!admin | admin == '')){
                await updateData(date, element.numeroLeg, element.hora, 'admin', admin)
            }
            if(!(!juezN | juezN == '-' | juezN == '' | element.juezN == juezN)){
                await updateData(date, element.numeroLeg, element.hora, 'juezN', juezN)
            }
            if(deleteAud){
                await deleteAudiencia(date, element.numeroLeg, element.hora)
            }
            if(!(!resultado | resultado == '')){
                await updateData(date, element.numeroLeg, element.hora, 'resultado', resultado)
            }
            await setEditable(false)
            await setCancelar(false)
            await updateByDate(date)
        }
    }
    const checkEditing = () =>{
        if((!cancelar) & (!resultado | resultado == '-' | resultado == '') & (!admin | admin == '') & (!situacion | situacion == '-' | situacion == '') & (!juezN | juezN == '-' | juezN == '' | element.juezN == juezN) & (!deleteAud)){
            setEditable(false)
        }else{
            setEditable(true)
        }
    }
    useEffect(() => {
        checkEditing()
    }, [deleteAud]);
    useEffect(() => {
        checkEditing()
    }, [admin]);
    useEffect(() => {
        checkEditing()
    }, [resultado]);
    useEffect(() => {
        checkEditing()
    }, [cancelar]);
    useEffect(() => {
        checkEditing()
    }, [juezN]);
    useEffect(() => {
        checkEditing()
    }, [situacion]);
    useEffect(() => {
        updateByDate(date)
    }, []);
    return(
        <form id='editingForm' onSubmit={(event) => handleSubmit(event)} key={element.numeroLeg + element.hora} className={deleteAud ? `${styles.tableRow} ${styles.audienciaList} ${styles.toDelete}` : `${styles.tableRow} ${styles.audienciaList}`}>
            <span className={`${styles.tableCell}`}>
                <input type='text' className={`${styles.inputSituacionEdit} ${styles.inputAdmin}`} placeholder={element.admin} onChange={(e)=>{setAdmin(e.target.value)}}></input>
            </span>
            <span className={`${styles.tableCell}`}>{element.hora}</span>
            <span className={`${styles.tableCell} ${styles.tableCellSala}`}>
                {element.estado == 'CANCELADA' ? <p className={`${styles.audienciaCancelada}`}>CANCELADA</p>:
                    <button type="button" className={cancelar ? `${styles.cancelarButton} ${styles.cancelarButtonClicked}` : `${styles.cancelarButton}`} onClick={()=>setCancelar(!cancelar)}>CANCELAR<br/>AUDIENCIA</button>
                }
            </span>
            <span className={`${styles.tableCell} ${styles.tableCellNumeroLeg}`}>{element.numeroLeg}</span>
            <span className={`${styles.tableCell} ${styles.tableCellTipo}`}>{element.tipo}</span>
            <span className={`${styles.tableCell} ${styles.tableCellJuez}`}>{element.juez.split('+').map(e => <span key={e}>{e.split(' ').slice(0, 3).join(' ')}<br/></span>)}</span>
            <span className={`${styles.tableCell} ${styles.tableCellJuezN}`}>
                <select onChange={(e)=>{setJuezN(e.target.value)}}>
                    {element.juezN ? <option key={element.juezN} value={element.juezN}>{element.juezN.split(' ').map(word => word.substring(0, 1))}</option> : <option></option>}
                    {jueces && jueces.sort().map((el) =>{
                        return(
                            <option key={el} value={el}>{el}</option>
                        )
                    })}
                </select>
            </span>
            <span className={`${styles.tableCell} ${styles.tableCellSituacion}`}>
                <textarea onChange={(e)=>{setSituacion(e.target.value)}} type="text" id="ingresarSituacion" placeholder={element.situacion} className={`${styles.inputSituacionEdit}`}/>
            </span>
            <span className={`${styles.tableCell} ${styles.tableCellResultado}`}>
                <textarea onChange={(e)=>{setResultado(e.target.value)}} type="text" id="ingresarResultado" placeholder={element.resultado} className={`${styles.inputResultadoEdit}`}/>
            </span>
            <span className={`${styles.tableCell} ${styles.deleteButtonBlock}`}>
                <button type="button" className={deleteAud ? `${styles.deleteButton} ${styles.deleteButtonClicked}` : `${styles.deleteButton}`} onClick={()=> setDeleteAud(!deleteAud)}>ELIMINAR</button>
                <button type="submit" className={editable ? `${styles.editButton}` : `${styles.editButton} ${styles.editButtonNot}`}>EDITAR</button>
            </span>
        </form>
    )
}