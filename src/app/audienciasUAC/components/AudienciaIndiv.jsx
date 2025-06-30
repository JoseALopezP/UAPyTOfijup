import { useEffect, useContext, useState } from 'react';
import styles from './audiencia.module.css';
import { DataContext } from '@/context/DataContext';
import { checkForResuelvo } from '@/utils/resuelvoUtils';
import { Oficio } from './Oficio';

export function AudienciaIndiv({ date, element }) {
    const { updateByDate, jueces, updateData, deleteAudiencia } = useContext(DataContext);
    const [oficio, setOficio] = useState(false);
    const [editable, setEditable] = useState(false);
    const [changeButton, setChangeButton] = useState(false);
    const [situacion, setSituacion] = useState(element.situacion || '');
    const [originalSituacion, setOriginalSituacion] = useState(element.situacion || '');
    const [admin, setAdmin] = useState(element.admin || '');
    const [originalAdmin, setOriginalAdmin] = useState(element.admin || '');
    const [resultado, setResultado] = useState(element.resultado || '');
    const [originalResultado, setOriginalResultado] = useState(element.resultado || '');
    const [hora, setHora] = useState(element.hora || '');
    const [originalHora, setOriginalHora] = useState(element.hora || '');
    const [cancelar, setCancelar] = useState(false);
    const [reprogramar, setReprogramar] = useState(false);
    const [juezN, setJuezN] = useState(element.juezN || '');
    const [originalJuezN, setOriginalJuezN] = useState(element.juezN || '');
    const [deleteAud, setDeleteAud] = useState(false);
    const [comentario, setComentario] = useState(element.comentario || '');
    const [control, setControl] = useState('nocontrolado');

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (editable) {
            if (cancelar) {
                await updateData(date, element.numeroLeg, element.hora, 'estado', 'CANCELADA');
            }
            if (reprogramar) {
                await updateData(date, element.numeroLeg, element.hora, 'estado', 'REPROGRAMADA');
            }
            if (situacion !== originalSituacion) {
                await updateData(date, element.numeroLeg, element.hora, 'situacion', situacion);
                setOriginalSituacion(situacion);
            }
            if (admin !== originalAdmin) {
                await updateData(date, element.numeroLeg, element.hora, 'admin', admin);
                setOriginalAdmin(admin);
            }
            if (juezN && originalJuezN !== juezN) {
                await updateData(date, element.numeroLeg, element.hora, 'juezN', juezN);
                setOriginalJuezN(juezN);
            }
            if (deleteAud) {
                await deleteAudiencia(date, element.numeroLeg, element.hora);
            }
            if (resultado !== originalResultado) {
                await updateData(date, element.numeroLeg, element.hora, 'resultado', resultado);
                setOriginalResultado(resultado);
            }
            if (hora !== originalHora) {
                await updateData(date, element.numeroLeg, element.hora, 'hora', hora);
                setOriginalHora(hora);
            }
            if (comentario) {
                await updateData(date, element.numeroLeg, element.hora, 'comentario', comentario);
            }
            if (control !== 'nocontrolado') {
                await updateData(date, element.numeroLeg, element.hora, 'control', control);
                setControl('nocontrolado');
            }
            resetEditableState();
            await updateByDate(date);
        }
    };

    const resetEditableState = () => {
        setEditable(false);
        setDeleteAud(false);
        setCancelar(false);
        setReprogramar(false);
        setChangeButton(false);
    };

    const checkEditing = () => {
        const isEditable = (
            control !== 'nocontrolado' ||
            comentario !== '' ||
            reprogramar ||
            cancelar ||
            resultado !== originalResultado ||
            admin !== originalAdmin ||
            situacion !== originalSituacion ||
            juezN !== originalJuezN ||
            deleteAud ||
            hora !== originalHora
        );
        setEditable(isEditable);
        if (cancelar) setReprogramar(false);
        if (reprogramar) setCancelar(false);
    };

    const openCloseControl = () => {
        setChangeButton(!changeButton);
        setComentario('');
        setControl('nocontrolado');
    };

    useEffect(() => {
        checkEditing();
    }, [deleteAud, comentario, control, admin, resultado, cancelar, reprogramar, juezN, situacion, hora]);

    return(
        <>{oficio ? <Oficio item={element} date={date} func={setOficio}/>: <></>}
        <form id='editingForm' onSubmit={(event) => handleSubmit(event)} key={element.numeroLeg + element.hora} className={deleteAud ? `${styles.tableRow} ${styles.audienciaList} ${styles.toDelete}` : `${styles.tableRow} ${styles.audienciaList}`}>
            {!element.control && <>
                <span className={`${styles.tableCell} ${styles.tableCellAdmin}`}>
                    <input type='text' className={`${styles.inputSituacionEdit} ${styles.inputAdmin}`} placeholder={element.admin} onChange={(e)=>{setAdmin(e.target.value)}}></input>
                    <button type='button' className={changeButton ? `${styles.controlButton} ${styles.controlButtonClicked}` : `${styles.controlButton}`} onClick={()=>openCloseControl()}>CTRL</button>
                </span>
            </>}
            {element.control == 'controlado' && <>
                <span className={`${styles.tableCell} ${styles.tableCellAdmin}`}>
                    <input type='text' className={`${styles.inputSituacionEdit} ${styles.inputAdminChanges}`} placeholder={element.admin} onChange={(e)=>{setAdmin(e.target.value)}}></input>
                    <button type='button' className={changeButton ? `${styles.controlButton} ${styles.controlButtonClicked}` : `${styles.controlButton}`} onClick={()=>openCloseControl()}>CTRL</button>
                </span>
            </>}
            {element.control == 'correcto' && <>
                <span className={`${styles.tableCell} ${styles.tableCellAdmin}`}>
                    <input type='text' className={`${styles.inputSituacionEdit} ${styles.inputAdminCorrect}`} placeholder={element.admin} onChange={(e)=>{setAdmin(e.target.value)}}></input>
                    <button type='button' className={changeButton ? `${styles.controlButton} ${styles.controlButtonClicked}` : `${styles.controlButton}`} onClick={()=>openCloseControl()}>CTRL</button>
                </span>
            </>}
            {changeButton ?
                <>
                <span className={`${styles.tableCell} ${styles.tableCellHora} ${styles.tableCellHoraIndiv} ${styles.tableCellWhiteLeft}`}>
                    <button type='button' onClick={e=>setControl(control == 'nocontrolado' ? 'correcto' : 'nocontrolado')} className={control == 'correcto' ? `${styles.buttonCorrect} ${styles.buttonCorrectClicked}` :`${styles.buttonCorrect}`}>CORRECTO</button>
                </span>
                <span className={`${styles.tableCell} ${styles.tableCellSala} ${styles.tableCellWhiteMiddle}`}>
                    <button type='button' onClick={e=>setControl(control == 'nocontrolado' ? 'controlado' : 'nocontrolado')} className={control == 'controlado' ? `${styles.buttonToChange} ${styles.buttonToChangeClicked}` :`${styles.buttonToChange}`}>CORREGIR</button>
                </span>
                <span className={`${styles.tableCell} ${styles.tableCellLegajo} ${styles.tableCellLegajoIndiv} ${styles.inputComentarioEditCell} ${styles.tableCellWhiteRight}`}>
                    <textarea onChange={(e)=>{setComentario(e.target.value)}} placeholder={element.comentario} className={`${styles.inputComentarioEdit}`} ></textarea>
                </span></>
            :
                <>
                <span className={`${styles.tableCell} ${styles.tableCellHora} ${styles.tableCellHoraIndiv}`}>
                    <input  className={`${styles.inputHora} ${styles.inputHoraBlock}`}  type="time" id="IngresarHora" onChange={e => {setHora(e.target.value)}} defaultValue={element.hora}/>
                </span>
                <span className={`${styles.tableCell} ${styles.tableCellSala}`}>
                    {(element.estado == 'PROGRAMADA') ? <><button type="button" className={cancelar ? `${styles.cancelarButton} ${styles.cancelarButtonClicked}` : `${styles.cancelarButton}`} onClick={()=>setCancelar(!cancelar)}>CANCELAR</button> 
                    <button type="button" className={reprogramar ? `${styles.reprogramarButton} ${styles.reprogramarButtonClicked}` : `${styles.reprogramarButton}`} onClick={()=>setReprogramar(!reprogramar)}>REPROGRAMAR</button> 
                    </>:
                    <>{checkForResuelvo(element) ? <button className={oficio ? `${styles.controlButton} ${styles.controlButtonOficio} ${styles.controlButtonOficioClicked}` : `${styles.controlButton} ${styles.controlButtonOficio}`} onClick={() => setOficio(!oficio)}>OFICIO</button> : <p className={`${styles.audienciaCancelada} ${styles[element.estado]}`}>{element.estado ? element.estado.split('_').join(' ') : ''}</p>}
                    </>}
                </span>
                <span className={`${styles.tableCell} ${styles.tableCellLegajo} ${styles.tableCellLegajoIndiv}`}>{element.numeroLeg}</span></>
            }
            <span className={`${styles.tableCell} ${styles.tableCellTipoIndiv}`}>{element.tipo}{element.tipo2 && ' + ' + element.tipo2}{element.tipo3 && ' + ' + element.tipo3}</span>
            <span className={`${styles.tableCell} ${styles.tableCellJuez} ${styles.tableCellJuezList}`}>{element.juez ? element.juez.split('+(').map((e,i)=> <span key={e}>{e.split(' ').slice(1,4).join(' ')} {i == (element.juez.split('+').length - 1) ? '' : '-'}</span>) : "NA"}</span>
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
                <textarea onChange={(e)=>{setSituacion(e.target.value)}} type="text" id="ingresarSituacion" value={situacion} className={`${styles.inputSituacionEdit}`}/>
            </span>
            <span className={`${styles.tableCell} ${styles.tableCellResultado} ${styles.tableCellResultadoIndiv}`}>
                <textarea onChange={(e)=>{setResultado(e.target.value)}} type="text" id="ingresarResultado" value={resultado} className={`${styles.inputResultadoEdit}`}/>
            </span>
            <span className={`${styles.tableCell} ${styles.deleteButtonBlock} ${styles.tableCellAction}`}>
                <button type="button" className={deleteAud ? `${styles.deleteButton} ${styles.deleteButtonClicked}` : `${styles.deleteButton}`} onClick={()=> setDeleteAud(!deleteAud)}>ELIMINAR</button>
                <button type="submit" className={editable ? `${styles.editButton}` : `${styles.editButton} ${styles.editButtonNot}`}>EDITAR</button>
            </span>
        </form>
        </>
    )
}