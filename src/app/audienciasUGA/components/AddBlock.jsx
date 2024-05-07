import styles from './audiencia.module.css'
import { useState, useContext, useEffect } from 'react'
import { DataContext } from '@/context/DataContext';

export function AddBlock ({date}) {
    const {updateTiposAudiencias, updateByDate, tiposAudiencias, jueces, updateJueces, addAudiencia, updateAños, años} = useContext(DataContext);
    const [hora, setHora] = useState(null)
    const [sala, setSala] = useState(null)
    const [legajo1, setLegajo1] = useState('MPF-SJ')
    const [legajo2, setLegajo2] = useState('')
    const [legajo3, setLegajo3] = useState('')
    const [tipo, setTipo] = useState(null)
    const [tipo2, setTipo2] = useState(null)
    const [colegiado, setColegiado] = useState(false)
    const [juez, setJuez] = useState(null)
    const [juez2, setJuez2] = useState(null)
    const [juez3, setJuez3] = useState(null)
    const [situacion, setSituacion] = useState(null)
    const [horaError, setHoraError] = useState(false)
    const [salaError, setSalaError] = useState(false)
    const [legajo2Error, setLegajo2Error] = useState(false)
    const [legajo3Error, setLegajo3Error] = useState(false)
    const [tipoError, setTipoError] = useState(false)
    const [juezError, setJuezError] = useState(false)

    const errorChecking = () =>{
        setHoraError(false)
        setSalaError(false)
        setLegajo2Error(false)
        setLegajo3Error(false)
        setTipoError(false)
        setJuezError(false)
        hora ? setHoraError(false) : setHoraError(true);
        (sala || sala=='-') ? setSalaError(false) : setSalaError(true);
        (legajo2 && (`${legajo2}`.length < 6)) ? setLegajo2Error(false) : setLegajo2Error(true);
        (legajo3 || legajo3 =='-') ? setLegajo3Error(false) : setLegajo3Error(true);    
        (tipo || tipo == '-') ? setTipoError(false) : setTipoError(true);
        if(colegiado){
            ((juez || juez == '-' ) && (juez2 || juez == '-') && (juez3 || juez == '-')) ? setJuezError(false) : setJuezError(true);
        }else{
            (juez || juez == '-') ? setJuezError(false) : setJuezError(true);
        }
    }
    const restore = () =>{
        setHora(null);
        setSala(null);
        setLegajo1('MPF-SJ');
        setLegajo2('');
        setLegajo3('');
        setTipo(null)
        setTipo2(null)
        setColegiado(false)
        setJuez(null)
        setJuez2(null)
        setJuez3(null)
    }
    const addToFirebase = async() =>{
        const newAudiencia = {
            hora: hora,
            sala: sala,
            numeroLeg: (legajo1 + "-" + legajo2.padStart(5,'0') + "-" + legajo3),
            tipo: tipo,
            tipo2: (tipo2 == '-' ? '' : tipo2),
            juez: (colegiado ? (juez + "+" + juez2 + "+" + juez3) : juez),
            estado: "PROGRAMADA",
            situacion: (situacion ? situacion : '')
        }
        await addAudiencia(newAudiencia, `${date}`)
        document.getElementById('addingForm').reset();
        await updateByDate(date)
    }
    const handleSubmit = async(event) =>{
        event.preventDefault();
        errorChecking()
        console.log(horaError, salaError, legajo2Error,legajo3Error,tipoError,juezError)
        if(!(horaError || salaError || legajo2Error || legajo3Error || tipoError || juezError)){
            await addToFirebase()
            await restore()
        }
    }
    useEffect(() => {
        updateTiposAudiencias()
        updateJueces()
        updateAños()
    }, [])
    return(
        <>
        {(horaError || salaError || legajo2Error || legajo3Error || tipoError || juezError) && 
            (<div className={`${styles.errorMessage}`}>DATOS INSUFICIENTES O INCORRECTOS</div>)}
        <form id='addingForm' onSubmit={(event) => handleSubmit(event)} className={`${styles.addAudienciaRow}`}>
        <span className={`${styles.tableCell} ${styles.tableCellOP}`}></span>
        <span className={horaError ? `${styles.inputHoraBlock} ${styles.inputError} ${styles.tableCell} ${styles.tableHora}` : `${styles.tableCell} ${styles.inputHoraBlock} ${styles.inputItemBlock} ${styles.tableCellHora}`}>
            <input  type="time" id="IngresarHora" onChange={e => {setHora(e.target.value)}}/>
        </span>
        <span className={salaError ? `${styles.inputSalaBlock} ${styles.inputItemBlock} ${styles.inputError} ${styles.tableCell}` : `${styles.inputSalaBlock} ${styles.inputItemBlock}` }>
            <select  onChange={(e)=>{setSala(e.target.value)}}>
                <option value={"-"}>-</option>
                <option value={"1"}>SALA 1</option>
                <option value={"2"}>SALA 2</option>
                <option value={"3"}>SALA 3</option>
                <option value={"4"}>SALA 4</option>
                <option value={"5"}>SALA 5</option>
                <option value={"6"}>SALA 6</option>
                <option value={"7"}>SALA 7</option>
                <option value={"8"}>SALA 8</option>
                <option value={"9"}>SALA 9</option>
                <option value={"10"}>SALA 10</option>
            </select>
        </span>
        <span className={`${styles.inputLegajoBlock} ${styles.inputItemBlock} ${styles.tableCell} ${styles.tableCellLegajo}`}>
            <select onChange={(e)=>{setLegajo1(e.target.value)}}>
                <option value={"MPF-SJ"}>MPF-SJ</option>
                <option value={"OJU-SJ"}>OJU-SJ</option>
            </select>
            <input className={legajo2Error ? `${styles.inputAreaError} ${styles.inputArea}` : `${styles.inputArea}` } type="text" id="IngresarNumero" placeholder="00000" onChange={e => setLegajo2(e.target.value)}/>
            <select className={legajo3Error ? `${styles.inputAreaError} ${styles.inputArea}` : `${styles.inputArea}`} onChange={(e)=>{setLegajo3(e.target.value)}}>
                {años && años.map(el =>{
                    return(
                        <option key={el} value={el}>{el}</option>
                    )
                })}
            </select>
        </span>
        <span className={tipoError ? `${styles.inputTipoBlock} ${styles.inputItemBlock} ${styles.inputError} ${styles.tableCell} ${styles.tableCellTipo}` : `${styles.inputTipoBlock} ${styles.inputItemBlock} ${styles.tableCell} ${styles.tableCellTipo}`}><select onChange={(e)=>{setTipo(e.target.value)}}>
            {tiposAudiencias && tiposAudiencias.sort().map((el) =>{
                return(
                    <option key={el} value={el}>{el}</option>
                )
            })}
        </select>
        <select onChange={(e)=>{setTipo2(e.target.value)}}>
                {tiposAudiencias && tiposAudiencias.sort().map((el) =>{
                    return(
                        <option key={el} value={el}>{el}</option>
                    )
                })}
        </select></span>
        <span className={juezError ? `${styles.inputJuezBlock} ${styles.inputItemBlock} ${styles.inputError} ${styles.tableCell} ${styles.tableCellJuez}` : `${styles.inputJuezBlock} ${styles.inputItemBlock} ${styles.tableCell} ${styles.tableCellJuez}`}>
            <span className={`${styles.juecesButtonBlock}`}>
            <button className={`${styles.colegiadoButton}`} type = "button" id="colegiadoButton" onClick={() => setColegiado(!colegiado)}>{colegiado ? 'COL' : 'UNI'}</button>
            <select className={`${styles.uniSelect}`} onChange={(e)=>{setJuez(e.target.value)}}>
                {jueces && jueces.sort().map((el) =>{
                    return(
                        <option key={el} value={el}>{el.split(' ').slice(1,4).join(' ')}</option>
                    )
                })}
            </select>
            </span>
        {(colegiado) && (
            <>
            <select className={`${styles.juecesSelect}`} onChange={(e)=>{setJuez2(e.target.value)}}>
            {jueces && jueces.sort().map((el) =>{
                return(
                    <option key={el} value={el}>{el.split(' ').slice(1,4).join(' ')}</option>
                )
            })}
            </select>
            <select className={`${styles.juecesSelect}`} onChange={(e)=>{setJuez3(e.target.value)}}>
                {jueces && jueces.sort().map((el) =>{
                    return(
                        <option key={el} value={el}>{el.split(' ').slice(1,4).join(' ')}</option>
                    )
                })}
            </select>
            </>
        )}
        </span>
        <span className={`${styles.inputItemBlock} ${styles.tableCell} ${styles.tableCellSituacion}`}>
            <input className={`${styles.inputArea} ${styles.inputSituacion}`} type="text" id="IngresarComentario" placeholder="opcional" onChange={e => setSituacion(e.target.value)}/>
        </span>
        <span className={`${styles.inputSubmitBlock} ${styles.inputItemBlock}  ${styles.tableCell}  ${styles.tableCellAction}`}><button type="submit" className={`${styles.submitButton}`} onClick={()=>{handleSubmit; errorChecking()}}>AGREGAR</button></span>
        </form>
        </>
    )
}