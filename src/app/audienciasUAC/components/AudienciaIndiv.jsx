import { useEffect, useContext, useState } from 'react'
import styles from './audiencia.module.css'
import { DataContext } from '@/context/DataContext';

export function AudienciaIndiv ({date, element}) {
    const {updateByDate, jueces, updateData, deleteAudiencia} = useContext(DataContext);
    const [editable, setEditable] = useState(false)
    const [situacion, setSituacion] = useState(null)
    const [admin, setAdmin] = useState(null)
    const [resultado, setResultado] = useState(null)
    const [hora, setHora] = useState(null)
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
            await setDeleteAud(false)
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
            <span className={`${styles.tableCell} ${styles.tableCellAdmin}`}>
                <input type='text' className={`${styles.inputSituacionEdit} ${styles.inputAdmin}`} placeholder={element.admin} onChange={(e)=>{setAdmin(e.target.value)}}></input>
            </span>
            <span className={`${styles.tableCell} ${styles.tableCellHora} ${styles.tableCellHoraIndiv}`}>
                <input  className={`${styles.inputHora} ${styles.inputHoraBlock}`}  type="time" id="IngresarHora" onChange={e => {setHora(e.target.value)}} value={element.hora}/>
            </span>
            <span className={`${styles.tableCell} ${styles.tableCellSala}`}>
                {(element.estado == 'PROGRAMADA') ? <button type="button" className={cancelar ? `${styles.cancelarButton} ${styles.cancelarButtonClicked}` : `${styles.cancelarButton}`} onClick={()=>setCancelar(!cancelar)}>CANCELAR<br/>AUDIENCIA</button> : 
                <>{(element.estado == 'CANCELADA') ? <p className={`${styles.audienciaCancelada}`}>CANCELADA</p>  : <p className={`${styles.audienciaCancelada} ${styles[element.estado]}`}>{element.estado.split('_').join(' ')}</p>}
                </>}
            </span>
            <span className={`${styles.tableCell} ${styles.tableCellLegajo} ${styles.tableCellLegajoIndiv}`}>{element.numeroLeg}</span>
            <span className={`${styles.tableCell} ${styles.tableCellTipoIndiv}`}>{element.tipo}{element.tipo2 && ' + ' + element.tipo2}</span>
            <span className={`${styles.tableCell} ${styles.tableCellJuez} ${styles.tableCellJuezList}`}>{element.juez.split('+').map((e,i)=> <span key={e}>{e.split(' ').slice(1,4).join(' ')} {i == (element.juez.split('+').length - 1) ? '' : '-'}</span>)}</span>
            <span className={`${styles.tableCell} ${styles.tableCellJuezN}`}>
                <select onChange={(e)=>{setJuezN(e.target.value)}}>
                    {element.juezN ? <option key={element.juezN} value={element.juezN}>{element.juezN.split(' ').slice(1,4).map(word => word.substring(0, 1))}</option> : <option></option>}
                    {jueces && jueces.sort().map((el) =>{
                        return(
                            <option key={el} value={el}>{el.split(' ').slice(1,4).join(' ')}</option>
                        )
                    })}
                </select>
            </span>
            <span className={`${styles.tableCell} ${styles.tableCellSituacion} ${styles.tableCellSituacionIndiv}`}>
                <textarea onChange={(e)=>{setSituacion(e.target.value)}} type="text" id="ingresarSituacion" placeholder={element.situacion} className={`${styles.inputSituacionEdit}`}/>
            </span>
            <span className={`${styles.tableCell} ${styles.tableCellResultado} ${styles.tableCellResultadoIndiv}`}>
                <textarea onChange={(e)=>{setResultado(e.target.value)}} type="text" id="ingresarResultado" placeholder={element.resultado} className={`${styles.inputResultadoEdit}`}/>
            </span>
            <span className={`${styles.tableCell} ${styles.deleteButtonBlock} ${styles.tableCellAction}`}>
                <button type="button" className={deleteAud ? `${styles.deleteButton} ${styles.deleteButtonClicked}` : `${styles.deleteButton}`} onClick={()=> setDeleteAud(!deleteAud)}>ELIMINAR</button>
                <button type="submit" className={editable ? `${styles.editButton}` : `${styles.editButton} ${styles.editButtonNot}`}>EDITAR</button>
            </span>
        </form>
    )
}