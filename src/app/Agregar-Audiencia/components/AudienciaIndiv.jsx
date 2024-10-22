import { useEffect, useContext, useState } from 'react';
import styles from './AddAudiencia.module.css';
import { DataContext } from '@/context/DataContext';
import InputReloj from '@/app/components/InputReloj';

export function AddAudienciaIndiv(element) {
    const { updateByDate, jueces, updateData, deleteAudiencia, desplegables } = useContext(DataContext);
    const [show, setShow] = useState(false)
    const [hora, setHora] = useState(element.hora || '')
    const [minuto, setMinuto] = useState(element.hora || '')
    const [sala, setSala] = useState(element.sala || '')
    const [legajo, setLegajo]= useState(element.numeroLeg || '')
    const [tipo, setTipo]= useState(element.tipo || '')
    const [tipo2, setTipo2]= useState(element.tipo2 || '')
    const [tipo3, setTipo3]= useState(element.tipo3 || '')
    const [juez, setJuez] = useState(element.juez || '')

    const handleLegChange = (value) => {
        
        if((value.split('-').join('').length == 3 || value.split('-').join('').length == 5) && !(value.length < legajo.length)){
            setLegajo(value.toUpperCase() +'-')
        }else{
            if(legajo.length == 4 && (legajo[legajo.length-1] !== '-')){
                setLegajo(legajo.split('').splice((legajo.length-1),0,'-').join(''))
            }else{
                setLegajo(value.toUpperCase())
            }
        }
    }

    return(
        <form onClick={() => setShow(!show)} className={`${styles.tableRow}`}>
            <p className={`${styles.tableCell} ${styles.tableCellState}`}>●</p>
            <span className={`${styles.tableCell} ${styles.tableCellHora}`}><InputReloj horaF={setHora} minutF={setMinuto} hora={hora} minut={minuto}/></span>
            <span className={`${styles.tableCell} ${styles.tableCellSala}`}>
                <input list='sala' className={`${styles.salaSelect}`} onChange={e => setSala(e.target.value)}/>
                    <datalist id='sala' className={`${styles.salaSelect}`}><option>{sala}</option>
                    {desplegables.salas && desplegables.salas.map(el =>(
                        <option key={el} value={el}>SALA {el}</option>
                    ))}</datalist>
            </span>
            <span className={`${styles.tableCell} ${styles.tableCellLegajo}`}>
                <input type='string' value={legajo} onChange={e => handleLegChange(e.target.value)}/>
            </span>
            <span className={`${styles.tableCell} ${styles.tableCellTipo}`}></span>
            <span className={`${styles.tableCell} ${styles.tableCellJuez}`}></span>
            <span className={`${styles.tableCell} ${styles.tableCellAccion}`}><button>X</button></span>
        </form>
    )
}