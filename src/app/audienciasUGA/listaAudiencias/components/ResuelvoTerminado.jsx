'use client'
import styles from './Resuelvo.module.css'
import { useState, useContext, useEffect } from 'react'
import { DataContext } from '@/context/DataContext';

export function Resuelvo (item) {
    const {updateDesplegables, desplegables} = useContext(DataContext);
    const [caratula, setCaratula] = useState('')
    const [mpf, setMpf] = useState([{ id: 1, nombre: '' }])
    const [defensa, setDefensa] = useState([{ id: 1, tipo: '', nombre: '', imputado: ''}])
    const [imputado, setImputado] = useState([{ id: 1, dni: '', nombre: ''}])
    const [resuelvo, setResuelvo] = useState('')

    const handleChangesFiscal = (index, e) => {
        const newInputs = [...mpf];
        newInputs[index].nombre = e.target.value;
        setMpf(newInputs);
        const allFilled = newInputs.slice(0, -1).every(input => input.nombre !== '');
        if (allFilled && newInputs[mpf.length - 1].nombre !== '') {
            setMpf([...newInputs, { id: mpf.length + 1, nombre: '' }]);
          }
    }

    const handleChangesImputadoNombre = (index, e) => {
        const newInputs = [...imputado];
        newInputs[index].nombre = e.target.value;
        setImputado(newInputs);
        const allFilled = newInputs.slice(0, -1).every(input => input.nombre !== '');
        if (allFilled && newInputs[imputado.length - 1].nombre !== '') {
            setImputado([...newInputs, { id: imputado.length + 1, nombre: '', dni: ''}]);
          }
    }
    const handleChangesImputadoDni = (index, e) => {
        const newInputs = [...imputado];
        newInputs[index].dni = e.target.value;
        setImputado(newInputs);
        const allFilled = newInputs.slice(0, -1).every(input => input.dni !== '');
        if (allFilled && newInputs[imputado.length - 1].dni !== '') {
            setImputado([...newInputs, { id: imputado.length + 1, nombre: '', dni: ''}]);
          }
    }

    //a terminar facha
    const handleChangesDefensaNombre = (index, e) => {
        const newInputs = [...defensa];
        newInputs[index].dni = e.target.value;
        setDefensa(newInputs);
        const allFilled = newInputs.slice(0, -1).every(input => input.nombre !== '');
        if (allFilled && newInputs[defensa.length - 1].dni !== '') {
            setDefensa([...newInputs, { id: defensa.length + 1, nombre: '', dni: ''}]);
          }
    }
    //a terminar facha
    const handleChangesDefensaTipo = (index, e) => {
        const newInputs = [...defensa];
        newInputs[index].dni = e.target.value;
        setDefensa(newInputs);
        const allFilled = newInputs.slice(0, -1).every(input => input.tipo !== '');
        if (allFilled && newInputs[defensa.length - 1].dni !== '') {
            setDefensa([...newInputs, { id: defensa.length + 1, nombre: '', dni: ''}]);
          }
    }
    //a terminar facha
    const handleChangesDefensaImputado = (index, e) => {
        const newInputs = [...defensa];
        newInputs[index].dni = e.target.value;
        setDefensa(newInputs);
        const allFilled = newInputs.slice(0, -1).every(input => input.imputado !== '');
        if (allFilled && newInputs[defensa.length - 1].dni !== '') {
            setDefensa([...newInputs, { id: defensa.length + 1, nombre: '', dni: ''}]);
          }
    }

    return(
        <><div className={`${styles.buttonsBlock}`}>
        <form className={`${styles.resuelvoForm}`}>
            <label>Carátula</label>
            <input type="text" onChange={(e)=>{setCaratula(e.target.value)}} className={`${styles.inputCaratula} ${styles.inputItem}`}/>
            <label>Ministerio público fiscal</label>
            {mpf.map((input, index) => (
                <select key={input.id} value={input.value} onChange={(e) => handleChangesFiscal(index, e)}>
                <option value="" disabled>{item.fiscal ? item.fiscal[index].nombre : ''}</option>
                {desplegables.fiscal && desplegables.fiscal.map(option => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
                </select>
            ))}
            {imputado.map((input, index) => (
                <>
                    <input key={input.id + 'nombre'} type='text' value={item.imputado && item.imputado[index].dni} onChange={(e) => handleChangesImputadoNombre(index, e)}/>
                    <input key={input.id + 'dni'} type='text' value={item.imputado && item.imputado[index].nombre} onChange={(e) => handleChangesImputadoDni(index, e)}/>
                </>
            ))}
            <label>Defensa</label>
            {defensa.map((input, index) => (
                <>
                <select key={input.id + 'nombre'} type='text' value={item.imputado && item.imputado[index].dni} onChange={(e) => handleChangesDefensaTipo(index, e)}>
                    <option className={`${styles.optionSelect}`}>{item.defensa && item.defensa[index].tipo}</option>
                    <option className={`${styles.optionSelect}`} value={"Oficial"}>Oficial</option>
                    <option className={`${styles.optionSelect}`} value={"Particular"}>Particular</option>
                </select>
                {input.tipo !== '' && <>{input.tipo === 'Oficial' ? 
                <>
                    <select key={input.id} value={input.value} onChange={(e) => handleChangesDefensaNombre(index, e)}>
                        <option value="" disabled>{item.defensa && item.defensa[index].nombre}</option>
                        {desplegables && desplegables.defensa.map(option => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </>:
                <>
                    <input type="text" value={item.defensa && item.defensa[index].nombre} onChange={(e) => handleChangesDefensaNombre(index, e)}/>
                </>}</>}
                {imputado.length > 2 &&
                    <select
                    key={input.id}
                    value={input.value}
                    onChange={(e) => handleChangesDefensaImputado(index, e)}
                    >
                        <option value="" disabled>{item.defensa[index].imputado}</option>
                        {imputado.map(option => (
                            <option key={option.nombre} value={option.nombre}>
                                {option.nombre}
                            </option>
                        ))}
                    </select>
                }
                </>
            ))}

            <label>DNI Imputado</label>
            <input type="nummber"></input>
            <label>Fundamentos y Resolución</label>
            <textarea rows="10"/>
            <input type="submit"/>
        </form>
        </div></>
    )
}