import styles from './audiencia.module.css'
import { useState, useContext, useEffect } from 'react'
import { DataContext } from '@/context/DataContext';

export function AddBlock ({date}) {
    const {updateTiposAudiencias, tiposAudiencias, jueces, updateJueces, addAudiencia} = useContext(DataContext);
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
        sala ? setSalaError(false) : setSalaError(true);
        (`${legajo2}`.length == 5) ? setLegajo2Error(false) : setLegajo2Error(true);
        (`${legajo3}`.length == 4) ? setLegajo3Error(false) : setLegajo3Error(true);    
        tipo ? setTipoError(false) : setTipoError(true);
        if(colegiado){
            (juez || juez2 || juez3) ? setJuezError(false) : setJuezError(true);
        }else{
            juez ? setJuezError(false) : setJuezError(true);
        }
        console.log(horaError, salaError, legajo2Error, legajo3Error, tipoError, juezError)
    }

    const handleSubmit = async() =>{
        errorChecking()
        if(horaError || salaError || legajo2Error || legajo3Error || tipoError || juezError){

        }else{
            const newAudiencia = {
                hora: hora,
                sala: sala,
                numeroLeg: (legajo1 + "-" + legajo2 + "-" + legajo3),
                tipo: tipo,
                juez: (colegiado ? (juez + "+" + juez2 + "+" + juez3) : juez),
                estado: "PROGRAMADA",
            }
            await addAudiencia(newAudiencia, `${date}`)
            console.log('se mandó')
        }
    }

    useEffect(() => {
        updateTiposAudiencias()
        updateJueces()
    }, [])

    return(
        <tr className={`${styles.addAudienciaRow}`}>
            <td className={horaError ? `${styles.inputHoraBlock} ${styles.inputItemBlock} ${styles.inputError}` : `${styles.inputHoraBlock} ${styles.inputItemBlock}`}>
                <input  type="time" id="IngresarHora" onChange={e => setHora(e.target.value)}/>
            </td>
            <td className={salaError ? `${styles.inputSalaBlock} ${styles.inputItemBlock} ${styles.inputError}` : `${styles.inputSalaBlock} ${styles.inputItemBlock}` }>
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
                </select>
            </td>
            <td className={`${styles.inputLegajoBlock} ${styles.inputItemBlock}`}>
                <select onChange={(e)=>{setLegajo1(e.target.value)}}>
                    <option value={"MPF-SJ"}>MPF-SJ</option>
                    <option value={"OJU-SJ"}>OJU-SJ</option>
                </select>
                <input className={legajo2Error ? `${styles.inputAreaError} ${styles.inputArea}` : `${styles.inputArea}` } type="text" id="IngresarNumero" placeholder="00000" onChange={e => setLegajo2(e.target.value)}/>
                <input className={legajo3Error ? `${styles.inputAreaError} ${styles.inputArea}` : `${styles.inputArea}`} type="text" id="IngresarAno" placeholder="0000" onChange={e => setLegajo3(e.target.value)}/>
            </td>
            <td className={tipoError ? `${styles.inputTipoBlock} ${styles.inputItemBlock} ${styles.inputError}` : `${styles.inputTipoBlock} ${styles.inputItemBlock}`}><select onChange={(e)=>{setTipo(e.target.value)}}>
                {tiposAudiencias.sort().map((el) =>{
                    return(
                        <option key={el} value={el}>{el}</option>
                    )
                })}
            </select></td>
            <td className={juezError ? `${styles.inputJuezBlock} ${styles.inputItemBlock} ${styles.inputError}` : `${styles.inputJuezBlock} ${styles.inputItemBlock}`}><select onChange={(e)=>{setJuez(e.target.value)}}>
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
            </td>
            <td className={`${styles.inputSubmitBlock} ${styles.inputItemBlock}`}><button type="submit" className={`${styles.submitButton}`} onClick={handleSubmit}>AGREGAR</button></td>
        </tr>
    )
}