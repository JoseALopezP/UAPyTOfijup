'use client'
import styles from './AudienciaList.module.css'
import { useEffect, useState, useContext } from 'react'
import { DataContext } from '@/context/DataContext';
import { Resuelvo } from './Resuelvo';

export function ButtonsAudiencia ({element}) {
    const {updateToday, updateData, pushtToArray, updateRealTime, realTime} = useContext(DataContext);
    const [show, setShow] = useState(false)
    const [showResuelvo, setShowResuelvo] = useState(false)
    const [editable, setEditable] = useState(false)
    const [actionAud, setActionAud] = useState(null)
    const [tiempoPedido, setTiempoPedido] = useState(0)
    const [pidiente, setPidiente] = useState(null)
    const [sala, setSala] = useState(null)
    const [resuelvo, setResuelvo] = useState(false)
    const handleSubmit = async(event) =>{
        event.preventDefault();
        await updateRealTime();
        if(actionAud){
            const date = await new Date().toLocaleDateString("es-AR",{day: "2-digit", month: "2-digit", year: "numeric"}).split('/').join('')
            await updateData(date, element.numeroLeg, element.hora, 'estado', actionAud)
            if(actionAud == 'CUARTO_INTERMEDIO'){
                await pushtToArray(date, element.numeroLeg, element.hora, `${realTime} | ${actionAud} | ${tiempoPedido} | ${pidiente}`)
            }else{
                await pushtToArray(date, element.numeroLeg, element.hora, `${realTime} | ${actionAud}`)
            }
            await updateToday()
            await setEditable(false)
            await setActionAud(null)
        }
        if(sala){
            const date = await new Date().toLocaleDateString("es-AR",{day: "2-digit", month: "2-digit", year: "numeric"}).split('/').join('')
            await updateData(date, element.numeroLeg, element.hora, 'sala', sala)
            await updateToday()
            await setEditable(false)
        }
        if(resuelvo){
            const date = await new Date().toLocaleDateString("es-AR",{day: "2-digit", month: "2-digit", year: "numeric"}).split('/').join('')
            await updateData(date, element.numeroLeg, element.hora, 'resuelvo', resuelvo)
            await updateRealTime()
            await updateData(date, element.numeroLeg, element.hora, 'horaMinuta', realTime)
            await updateToday()
            await setResuelvo(false)
            await setEditable(false)
        }
    }
    const checkEditing = () =>{
        if(actionAud || sala || resuelvo){
            setEditable(true)
        }else{
            setEditable(false)
        }
    }
    useEffect(() => {
        checkEditing()
    }, [actionAud]);
    useEffect(() => {
        checkEditing()
    }, [resuelvo]);
    useEffect(() => {
        checkEditing()
    }, [sala]);
    useEffect(() => {
        updateRealTime()
    }, [])
    return(
        <>
        {show &&
        <div className={`${styles.buttonsBlock}`}>
            {showResuelvo ?
            <Resuelvo item={element}/> :
            <><h2 className={`${styles.legajoTitle}`}>{element.numeroLeg}</h2>
            <form onSubmit={(event) => handleSubmit(event)} action="#" className={`${styles.changeBlock}`}>
                
                {(element.estado == 'CUARTO_INTERMEDIO') &&
                <button type="button" className={actionAud == 'EN_CURSO' ? `${styles.stateButton} ${styles.stateButtonIniciar} ${styles.buttonClicked}` : `${styles.stateButton} ${styles.stateButtonFinalizarcuarto}`} onClick={() => actionAud == 'EN_CURSO' ? setActionAud(null) : setActionAud('EN_CURSO')}>FINALIZAR CUARTO INTERMEDIO</button>}
                {(element.estado == 'PROGRAMADA') &&
                <><button type="button" className={actionAud == 'EN_CURSO' ? `${styles.stateButton} ${styles.stateButtonIniciar} ${styles.buttonClicked}` : `${styles.stateButton} ${styles.stateButtonIniciar}`} onClick={() => actionAud == 'EN_CURSO' ? setActionAud(null) : setActionAud('EN_CURSO')}>INICIAR</button>
                <select  onChange={(e)=>{setSala(e.target.value)}} className={`${styles.selectSalaEdit} ${styles.stateButton}`}>
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
                </>}
                {(element.estado == 'EN_CURSO') &&
                    <><button type="button" onClick={() => actionAud == 'FINALIZADA' ? setActionAud(null) : setActionAud('FINALIZADA')} className={actionAud == 'FINALIZADA' ? `${styles.stateButton} ${styles.stateButtonIniciar} ${styles.buttonClicked}` : `${styles.stateButton} ${styles.stateButtonFinalizar}`}>FINALIZAR</button>
                    <button type="button" onClick={() => actionAud == 'CUARTO_INTERMEDIO' ? setActionAud(null) : setActionAud('CUARTO_INTERMEDIO')} className={actionAud == 'CUARTO_INTERMEDIO' ? `${styles.stateButton} ${styles.stateButtonIniciar} ${styles.buttonClicked}` : `${styles.stateButton} ${styles.stateButtonCuarto}`}>CUARTO INTERMEDIO</button>
                    <span className={`${styles.tiempoCuarto}`}><button type='button' className={`${styles.tiempoMenosCuarto}`} onClick={()=>setTiempoPedido(tiempoPedido - 5)}>-</button>
                    <p className={`${styles.tiempoPedido}`}>{tiempoPedido}</p>
                    <button type='button' className={`${styles.tiempoMasCuarto}`} onClick={()=>setTiempoPedido(tiempoPedido + 5)}>+</button>
                    <select name="" id="" onChange={(e)=>{setPidiente(e.target.value)}} className={`${styles.pidienteSelector}`}>
                        <option value={'juez'}>JUEZ</option>
                        <option value={'defensa'}>DEFENSA</option>
                        <option value={'fiscal'}>FISCAL</option>
                        <option value={'otro'}>OTRO</option>
                    </select>
                    </span></>}
                {(element.estado == 'FINALIZADA') &&
                    <>
                    <button type="button" className={actionAud == 'EN_CURSO' ? `${styles.stateButton} ${styles.stateButtonIniciar} ${styles.buttonClicked}` : `${styles.stateButton} ${styles.stateButtonFinalizarcuarto}`} onClick={() => actionAud == 'EN_CURSO' ? setActionAud(null) : setActionAud('EN_CURSO')}>INICIAR NUEVAMENTE</button>
                    {(element.resuelvo) ? <button className={`${styles.stateButton} ${styles.stateButtonSubido}`} type='button'>SUBIDO</button>
                    : <button type="button" className={resuelvo ? `${styles.stateButton} ${styles.stateButtonResuelvo} ${styles.buttonClicked}` : `${styles.stateButton} ${styles.stateButtonResuelvo}`} onClick={() => setResuelvo(!resuelvo)}> RESUELVO SUBIDO</button>
                    }
                    </>
                }
                <button type="submit" className={editable ? `${styles.editButton} ${styles.stateButton}` : `${styles.editButton} ${styles.editButtonNot} ${styles.stateButton}`}>GUARDAR</button>
            </form></>}
            <span className={`${styles.stateButtonBlock}`}>
                <button type="button" onClick={() => setShowResuelvo(!showResuelvo)} className={`${styles.stateButton} ${styles.stateButtonResuelvoBlock}`}>RESUELVO</button>
                <button type="button" onClick={() => setShow(false)} className={`${styles.stateButton} ${styles.stateButtonCerrar}`}>X CERRAR</button>
            </span>
            </div>}
        
        <tr key={element.numeroLeg + element.hora} className={`${styles.tableRow}`} onClick={() => setShow(true)}> 
            <td>{element.hora}</td>
            <td>{element.sala}</td>
            <td>{element.operador && `${element.operador.split(' ')[element.operador.split(' ').length-1].toUpperCase().split('').splice(0,4).join('')} ${element.operador.split('')[0]}.`}</td>
            <td>{element.numeroLeg}</td>
            <td className={`${styles.tableBodyJuez}`}>{element.juez.split('+').map((e,i)=> <span key={e}>{e.split(' ').slice(1,3).join(' ')} {i == (element.juez.split('+').length - 1) ? '' : '-'}</span>)}</td>
            <td className={`${styles.tableCellTipo}`}>{element.tipo}</td>
            <td className={`${styles.tableCellTipo}`}>{element.situacion}</td>
            {((realTime > element.hora) & element.estado == 'PROGRAMADA')  ? (<td className={`${styles.DEMORADA}`}>DEMORADA</td>) : (<>{element.resuelvo ? <td className={`${styles[element.estado]} `}>SUBIDO</td> : <td className={`${styles[element.estado]} `}>{element.estado.split('_').join(' ')}</td>}</>)}
        </tr>
        </>
    )
}

