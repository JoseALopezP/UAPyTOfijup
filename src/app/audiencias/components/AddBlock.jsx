import styles from './audiencia.module.css'
import { useState, useContext, useEffect } from 'react'
import { DataContext } from '@/context/DataContext';

export function AddBlock () {
    const {updateTiposAudiencias, tiposAudiencias, jueces, updateJueces} = useContext(DataContext);
    const [hora, setHora] = useState(null)
    const [sala, setSala] = useState(null)
    const [legajo1, setLegajo1] = useState(null)
    const [legajo2, setLegajo2] = useState(null)
    const [legajo3, setLegajo3] = useState(null)
    const [tipo, setTipo] = useState(null)
    const [colegiado, setColegiado] = useState(false)
    const [juez, setJuez] = useState(null)
    const [juez2, setJuez2] = useState(null)
    const [juez3, setJuez3] = useState(null)

    const [horaError, setHoraError] = useState(false)
    const [salaError, setSalaError] = useState(false)
    const [legajo2Error, setLegajo2Error] = useState('')
    const [legajoError3, setLegajo3Error] = useState('')
    const [tipoError, setTipoError] = useState(false)
    const [juezError, setJuezError] = useState(false)

    useEffect(() => {
        updateTiposAudiencias()
        updateJueces()
    }, []);

    const errorChecking = () =>{
        hora ? setHoraError(false) : setHoraError(true)
        sala ? setSalaError(false) : setSalaError(true)
        (legajo2.length != 5)? setLegajo2Error(false) : setLegajo2Error(true)
        (legajo3.length != 4) ? setLegajo3Error(false) : setLegajo3Error(true)
        tipo ? setTipoError(false) : setTipoError(true)
        if(colegiado){
            (juez | juez2 | juez3) ? setJuezError(false) : setJuezError(true)
        }else{
            juez ? setJuezError(false) : setJuezError(true)
        }
        
    }

    const handleSubmit = async(event) => {
        event.preventDefault();
        const now = new Date()
        const timestamp = Timestamp.fromDate(now);
        const data = {
            estado: 'PROGRAMADA',
            hora: hora,
            juez: juez,
            numeroLeg: legajo1+'-'+legajo2+'-'+legajo3,
            sala: sala,
            tipo: tipo
        }
        await addGuest(data, date);
        setSentStatus(false);
        setleft(left -1)
    }


    return(
        <tr className={`${styles.addAudienciaRow}`}>
            <td><input type="time" id="IngresarNombre" onChange={e => setHora(e.target.value)}/></td>
            <td><select onChange={(e)=>{setSala(e.target.value)}}>
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
            <td className={`${styles.legajoInput}`}>
                <select onChange={(e)=>{setLegajo1(e.target.value)}}>
                    <option value={"MPF-SJ"}>MPF-SJ</option>
                    <option value={"OJU-SJ"}>OJU-SJ</option>
                </select>
                <input type="text" id="IngresarNombre" placeholder="00000" onChange={e => setLegajo2(e.target.value)}/>
                <input type="text" id="IngresarNombre" placeholder="0000" onChange={e => setLegajo3(e.target.value)}/>
            </td>
            <td><select onChange={(e)=>{setTipo(e.target.value)}}>
                {tiposAudiencias.sort().map((el) =>{
                    return(
                        <option value={el}>{el}</option>
                    )
                })}
            </select></td>
            <td><select onChange={(e)=>{setJuez(e.target.value)}}>
                {jueces.sort().map((el) =>{
                    return(
                        <option value={el}>{el}</option>
                    )
                })}
            </select>
            {(colegiado) && (
                <>
                <select onChange={(e)=>{setJuez2(e.target.value)}}>
                {jueces.sort().map((el) =>{
                    return(
                        <option value={el}>{el}</option>
                    )
                })}
                </select>
                <select onChange={(e)=>{setJuez3(e.target.value)}}>
                    {jueces.sort().map((el) =>{
                        return(
                            <option value={el}>{el}</option>
                        )
                    })}
                </select>
                </>
            )}
            </td>
            <td><button type="submit" className={`${styles.submitButton}`}>AGREGAR</button></td>
        </tr>
    )
}