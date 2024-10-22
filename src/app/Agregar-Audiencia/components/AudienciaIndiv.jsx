import { useEffect, useContext, useState } from 'react';
import styles from './AddAudiencia.module.css';
import { DataContext } from '@/context/DataContext';
import InputReloj from '@/app/components/InputReloj';
import addAudienciaTypes, { AddAudienciaTypes } from './AddAudienciaTypes'

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
    const [juez1, setJuez1] = useState(element.juez && element.juez.split('+')[0] || '')
    const [juez2, setJuez2] = useState(element.juez && element.juez.split('+')[1] || '')
    const [juez3, setJuez3] = useState(element.juez && element.juez.split('+')[2] || '')

    const handleLegChange = (value) => {
        const valueSplit = value.split('-').join('').length
        if((valueSplit == 3 || valueSplit == 5 || valueSplit == 10) && !(value.length < legajo.length)){
            setLegajo(value.toUpperCase() +'-')
        }else{
            if(valueSplit < 15 )
            setLegajo(value.toUpperCase())
        }
    }
    const handleJuezChange = (value, item) =>{
        switch(item){
            case 0: setJuez1(value) 
            break;
            case 1: setJuez2(value)
            break;
            case 2: setJuez3(value)
            break;
        }
        if(juez.split('').includes('+')){
            setJuez(juez1+'+'+juez2+'+'+juez3)
        }else{
            setJuez(value)
        }
    }

    return(
        <form onClick={() => setShow(!show)} className={`${styles.tableRow}`}>
            <span className={`${styles.tableCell} ${styles.tableCellState}`}></span>
            <span className={`${styles.tableCell} ${styles.tableCellHora}`}><InputReloj horaF={setHora} minutF={setMinuto} hora={hora} minut={minuto}/></span>
            <span className={`${styles.tableCell} ${styles.tableCellSala}`}>
                <input list='sala' className={`${styles.tableCellInput} ${styles.salaSelect}`} onChange={e => setSala(e.target.value)}/>
                    <datalist id='sala' className={`${styles.tableCellInput}`}><option>{sala}</option>
                    {desplegables.salas && desplegables.salas.map(el =>(
                        <option key={el} value={el}>SALA {el}</option>
                    ))}</datalist>
            </span>
            <span className={`${styles.tableCell} ${styles.tableCellLegajo}`}>
                <input type='string' className={`${styles.tableCellInput} ${styles.tableCellLegajoInput}`} value={legajo} onChange={e => handleLegChange(e.target.value)}/>
            </span>
            <span className={`${styles.tableCell} ${styles.tableCellTipo}`}>
                <input list='tipo' className={`${styles.tableCellInput} ${styles.tableCellTipoInput}`} value={tipo} onChange={e => setTipo(e.target.value)}/>
                <input list='tipo' className={`${styles.tableCellInput} ${styles.tableCellTipoInput}`} value={tipo2} onChange={e => setTipo2(e.target.value)}/>
                <input list='tipo' className={`${styles.tableCellInput} ${styles.tableCellTipoInput}`} value={tipo3} onChange={e => setTipo3(e.target.value)}/>
                <datalist id='tipo' className={`${styles.tableCellInput}`}>
                    {desplegables.tipos && desplegables.tipos.map(el =>(
                        <option key={el} value={el}>{el}</option>
                    ))}</datalist>
            </span>
            <span className={`${styles.tableCell} ${styles.tableCellJuez}`}>
                <input type='string' className={`${styles.tableCellInput} ${styles.tableCellJuezInput}`} value={juez1} onChange={e => handleJuezChange(e.target.value, 0)}/>
                {juez.split('').includes('+') && <><input type='string' className={`${styles.tableCellInput} ${styles.tableCellJuezInput}`} value={juez2} onChange={e => handleJuezChange(e.target.value, 1)}/>
                <input type='string' className={`${styles.tableCellInput} ${styles.tableCellJuezInput}`} value={juez3} onChange={e => handleJuezChange(e.target.value, 2)}/></>}
            </span>
            <span className={`${styles.tableCell} ${styles.tableCellAccion}`}><button>X</button></span>
        </form>
    )
}