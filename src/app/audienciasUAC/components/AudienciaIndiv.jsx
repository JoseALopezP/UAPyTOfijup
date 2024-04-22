import { useEffect, useContext, useState } from 'react'
import styles from './audiencia.module.css'
import { DataContext } from '@/context/DataContext';

export function AudienciaIndiv ({date, element}) {
    const {updateByDate, jueces, updateData} = useContext(DataContext);
    const [editable, setEditable] = useState(false)
    const [situacion, setSituacion] = useState(null)
    const [cancelar, setCancelar] = useState(false)
    const [juezN, setJuezN] = useState(null)
    const handleSubmit = async(event) =>{
        event.preventDefault();
        if(editable){
            if(cancelar){
                await updateData(date, element.numeroLeg, element.hora, 'estado', cancelar)
            }
            if(!(!situacion | situacion == '-' | situacion == '')){
                await updateData(date, element.numeroLeg, element.hora, 'situacion', situacion)
            }
            if(!(!juezN | juezN == '-' | juezN == '' | element.juezN == juezN)){
                await updateData(date, element.numeroLeg, element.hora, 'juezN', juezN)
            }
            await setEditable(false)
            await setCancelar(false)
        }
    }
    const checkEditing = () =>{
        if((!cancelar) & (!situacion | situacion == '-' | situacion == '') & (!juezN | juezN == '-' | juezN == '' | element.juezN == juezN)){
            setEditable(false)
        }else{
            setEditable(true)
        }
    }
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
        <form id='editingForm' onSubmit={(event) => handleSubmit(event)} key={element.numeroLeg + element.hora} className={`${styles.tableRow} ${styles.audienciaList}`}>
            <span className={`${styles.tableCell}`}>{element.hora}</span>
            <span className={`${styles.tableCell} ${styles.tableCellSala}`}>
                {element.estado == 'CANCELADA' ? <p className={`${styles.audienciaCancelada}`}>CANCELADA</p>:
                    <button type="button" className={cancelar ? `${styles.cancelarButton} ${styles.cancelarButtonClicked}` : `${styles.cancelarButton}`} onClick={()=>setCancelar(!cancelar)}>CANCELAR<br/>AUDIENCIA</button>
                }
            </span>
            <span className={`${styles.tableCell}`}>{element.numeroLeg}</span>
            <span className={`${styles.tableCell}`}>{element.tipo}</span>
            <span className={`${styles.tableCell} ${styles.tableCellJuez}`}>{element.juez.split('+').map(e => <span key={e}>{e}<br/></span>)}</span>
            <span className={`${styles.tableCell} ${styles.tableCellJuezN}`}>
                <select onChange={(e)=>{setJuezN(e.target.value)}}>
                    {element.juezN ? <option key={element.juezN} value={element.juezN}>{element.juezN.split(' ').map(word => word.substring(0, 1))}</option> : <option></option>}
                    {jueces && jueces.sort().map((el) =>{
                        return(
                            <option key={el} value={el}>{el.split(' ').map(word => word.substring(0, 1))}</option>
                        )
                    })}
                </select>
            </span>
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