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

    useEffect(() => {
        updateTiposAudiencias()
        updateJueces()
    }, []);
    return(
        <tr className={`${styles.addAudienciaRow}`}>
            <td><input type="time" id="IngresarNombre" onChange={e => setHora(e.target.value)}/></td>
            <td><select onChange={(e)=>{setSala(e.target.value)}}>
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
                <select onChange={(e)=>{setSala(e.target.value)}}>
                    <option value={"MPF-SJ"}>MPF-SJ</option>
                    <option value={"OJU-SJ"}>OJU-SJ</option>
                </select>
                <input type="text" id="IngresarNombre" placeholder="00000" onChange={e => setHora(e.target.value)}/>
                <input type="text" id="IngresarNombre" placeholder="00000" onChange={e => setHora(e.target.value)}/>
            </td>
            <td><select>
                {tiposAudiencias.sort().map((el) =>{
                    return(
                        <option value={el}>{el}</option>
                    )
                })}
            </select></td>
            <td><select>
                {jueces.sort().map((el) =>{
                    return(
                        <option value={el}>{el}</option>
                    )
                })}
            </select></td>
            <td><button>AGREGAR</button></td>
        </tr>
    )
}