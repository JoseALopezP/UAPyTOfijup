import styles from './audiencia.module.css'
import { useState, useContext, useEffect } from 'react'
import { DataContext } from '@/context/DataContext';

export function AddBlock ({date}) {
    const {updateTiposAudiencias, tiposAudiencias, jueces, updateJueces, addAudiencia, updateAños, años} = useContext(DataContext);
    const [hora, setHora] = useState(null)
    const [sala, setSala] = useState(null)
    const [legajo1, setLegajo1] = useState('MPF-SJ')
    const [legajo2, setLegajo2] = useState('')
    const [legajo3, setLegajo3] = useState('')
    const [tipo, setTipo] = useState(null)
    const [colegiado, setColegiado] = useState(false)
    const [juez, setJuez] = useState(null)
    const [juez2, setJuez2] = useState(null)
    const [juez3, setJuez3] = useState(null)

    const [horaError, setHoraError] = useState(false)
    const [salaError, setSalaError] = useState(false)
    const [legajo2Error, setLegajo2Error] = useState(false)
    const [legajo3Error, setLegajo3Error] = useState(false)
    const [tipoError, setTipoError] = useState(false)
    const [juezError, setJuezError] = useState(false)

    const errorChecking = () =>{
        hora ? setHoraError(false) : setHoraError(true);
        (sala || sala=='-') ? setSalaError(false) : setSalaError(true);
        (`${legajo2}`.length == 5) ? setLegajo2Error(false) : setLegajo2Error(true);
        (legajo3 || legajo3 =='-') ? setLegajo3Error(false) : setLegajo3Error(true);    
        (tipo || tipo == '-') ? setTipoError(false) : setTipoError(true);
        if(colegiado){
            ((juez || tipo == '-') & (juez2 || tipo == '-') & (juez3 || tipo == '-')) ? setJuezError(false) : setJuezError(true);
        }else{
            (juez || tipo == '-') ? setJuezError(false) : setJuezError(true);
        }
    }
    function newFunction(){
        var element = document.getElementById(" form_id ");
         element.reset()
      }

    const addToFirebase = async() =>{
        const newAudiencia = {
            hora: hora,
            sala: sala,
            numeroLeg: (legajo1 + "-" + legajo2.padStart(5,'0') + "-" + legajo3),
            tipo: tipo,
            juez: (colegiado ? (juez + "+" + juez2 + "+" + juez3) : juez),
            estado: "PROGRAMADA",
        }
        await addAudiencia(newAudiencia, `${date}`)
        document.getElementById('addingForm').reset();
    }

    const handleSubmit = async(event) =>{
        event.preventDefault();
        errorChecking()
        console.log(horaError, salaError, legajo2Error,legajo3Error,tipoError,juezError)
        if(!(horaError || salaError || legajo2Error || legajo3Error || tipoError || juezError)){
            await addToFirebase()
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
        <span className={horaError ? `${styles.inputHoraBlock} ${styles.inputItemBlock} ${styles.inputError} ${styles.tableCell}` : `${styles.inputHoraBlock} ${styles.inputItemBlock}`}>
            <input  type="time" id="IngresarHora" onChange={e => {setHora(e.target.value); errorChecking()}}/>
        </span>
        <span className={salaError ? `${styles.inputSalaBlock} ${styles.inputItemBlock} ${styles.inputError} ${styles.tableCell}` : `${styles.inputSalaBlock} ${styles.inputItemBlock}` }>
            <select  onChange={(e)=>{setSala(e.target.value); errorChecking()}}>
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
            </select>
        </span>
        <span className={`${styles.inputLegajoBlock} ${styles.inputItemBlock} ${styles.tableCell}`}>
            <select onChange={(e)=>{setLegajo1(e.target.value)}}>
                <option value={"MPF-SJ"}>MPF-SJ</option>
                <option value={"OJU-SJ"}>OJU-SJ</option>
            </select>
            <input className={legajo2Error ? `${styles.inputAreaError} ${styles.inputArea}` : `${styles.inputArea}` } type="text" id="IngresarNumero" placeholder="00000" onChange={e => setLegajo2(e.target.value)}/>
            <select className={legajo3Error ? `${styles.inputAreaError} ${styles.inputArea}` : `${styles.inputArea}`} onChange={(e)=>{setLegajo3(e.target.value)}}>
                {años.map(el =>{
                    return(
                        <option key={el} value={el}>{el}</option>
                    )
                })}
            </select>
        </span>
        <span className={tipoError ? `${styles.inputTipoBlock} ${styles.inputItemBlock} ${styles.inputError} ${styles.tableCell}` : `${styles.inputTipoBlock} ${styles.inputItemBlock} ${styles.tableCell}`}><select onChange={(e)=>{setTipo(e.target.value)}}>
            {tiposAudiencias.sort().map((el) =>{
                return(
                    <option key={el} value={el}>{el}</option>
                )
            })}
        </select></span>
        <span className={juezError ? `${styles.inputJuezBlock} ${styles.inputItemBlock} ${styles.inputError} ${styles.tableCell}` : `${styles.inputJuezBlock} ${styles.inputItemBlock} ${styles.tableCell}`}>
            <select onChange={(e)=>{setJuez(e.target.value)}}>
            {jueces.sort().map((el) =>{
                return(
                    <option key={el} value={el}>{el}</option>
                )
            })}
        </select>
        {(colegiado) && (
            <>
            <select onChange={(e)=>{setJuez2(e.target.value)}}>
            {jueces.sort().map((el) =>{
                return(
                    <option key={el} value={el}>{el}</option>
                )
            })}
            </select>
            <select onChange={(e)=>{setJuez3(e.target.value)}}>
                {jueces.sort().map((el) =>{
                    return(
                        <option key={el} value={el}>{el}</option>
                    )
                })}
            </select>
            </>
        )}
        </span>
        <span className={`${styles.inputSubmitBlock} ${styles.inputItemBlock}  ${styles.tableCell}`}><button type="submit" className={`${styles.submitButton}`} onClick={()=>{handleSubmit; errorChecking()}}>AGREGAR</button></span>
        </form>
        </>
    )
}