import styles from './audiencia.module.css'
import { useState, useContext, useEffect } from 'react'
import { DataContext } from '@/context/DataContext';

export function AddBlock () {
    const {updateTiposAudiencias, tiposAudiencias, jueces, updateJueces} = useContext(DataContext);
    const [hora, setHora] = useState(null)
    const [sala, setSala] = useState('')
    const [legajo1, setLegajo1] = useState('')
    const [legajo2, setLegajo2] = useState('')
    const [legajo3, setLegajo3] = useState('')
    const [tipo, setTipo] = useState('')
    const [juez, setJuez] = useState('')

    const [horaError, setHoraError] = useState(false)
    const [salaError, setSalaError] = useState(false)
    const [legajo1Error, setLegajo1Error] = useState(false)
    const [legajo2Error, setLegajo2Error] = useState(false)
    const [legajoError3, setLegajo3Error] = useState(false)
    const [tipoError, setTipoError] = useState(false)
    const [juezError, setJuezError] = useState(false)

    useEffect(() => {
        updateTiposAudiencias()
        updateJueces()
    }, []);

    const errorChecking = () =>{
        hora ? setHoraError(false) : setHoraError(true)
        hora ? setHoraError(false) : setHoraError(true)
        hora ? setHoraError(false) : setHoraError(true)
        hora ? setHoraError(false) : setHoraError(true)
        hora ? setHoraError(false) : setHoraError(true)
        hora ? setHoraError(false) : setHoraError(true)
        hora ? setHoraError(false) : setHoraError(true)
        hora ? setHoraError(false) : setHoraError(true)
    }

    const handleSubmit = async(event) => {
        hora
        event.preventDefault();
        const now = new Date()
        const timestamp = Timestamp.fromDate(now);
        const newGuest = {
            name: name,
            lastName: lastName,
            dni: dni,
            diet: diet
        }
        const data = await {
            "date": timestamp,
            "after": (dinner == 'dcena' ? true : false),
            "guests": [...guests, newGuest]
        }
        await addGuest(data);
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
            </select></td>
            <td><button type="submit" className={`${styles.submitButton}`}>AGREGAR</button></td>
        </tr>
    )
}