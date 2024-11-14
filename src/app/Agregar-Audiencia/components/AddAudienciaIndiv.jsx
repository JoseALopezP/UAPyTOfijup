import { useEffect, useContext, useState } from 'react';
import styles from './AddAudiencia.module.css';
import { DataContext } from '@/context/DataContext';
import InputReloj from '@/app/components/InputReloj';

export function AddAudienciaIndiv({date, element}) {
    const { desplegables, updateData, deleteAudiencia} = useContext(DataContext);
    const [cambios, setCambios] = useState(false)
    const [del, setDel] = useState(false)
    const [hora, setHora] = useState(element.hora.split(':')[0] || '')
    const [minuto, setMinuto] = useState(element.hora.split(':')[1] || '')
    const [sala, setSala] = useState(element.sala || '')
    const [legajo, setLegajo]= useState(element.numeroLeg || '')
    const [tipo, setTipo]= useState(element.tipo || '')
    const [tipo2, setTipo2]= useState(element.tipo2 || '')
    const [tipo3, setTipo3]= useState(element.tipo3 || '')
    const [juez, setJuez] = useState(element.juez || '')
    const [juez1, setJuez1] = useState(element.juez && element.juez.split('+')[0] || '')
    const [juez2, setJuez2] = useState(element.juez && element.juez.split('+')[1] || '')
    const [juez3, setJuez3] = useState(element.juez && element.juez.split('+')[2] || '')
    const [horaBis, setHoraBis] = useState(element.hora.split(':')[0] || '')
    const [minutoBis, setMinutoBis] = useState(element.hora.split(':')[1] || '')
    const [salaBis, setSalaBis] = useState(element.sala || '')
    const [legajoBis, setLegajoBis]= useState(element.numeroLeg || '')
    const [tipoBis, setTipoBis]= useState(element.tipo || '')
    const [tipo2Bis, setTipo2Bis]= useState(element.tipo2 || '')
    const [tipo3Bis, setTipo3Bis]= useState(element.tipo3 || '')
    const [juez1Bis, setJuez1Bis] = useState(element.juez && element.juez.split('+')[0] || '')
    const [juez2Bis, setJuez2Bis] = useState(element.juez && element.juez.split('+')[1] || '')
    const [juez3Bis, setJuez3Bis] = useState(element.juez && element.juez.split('+')[2] || '')

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
    const checkEditing = () =>{
        if(del || hora !== horaBis|| minuto !== minutoBis || sala !== salaBis || legajo !== legajoBis || tipo !== tipoBis || tipo2 !== tipo2Bis || tipo3 !== tipo3Bis || juez1 !== juez1Bis || juez2 !== juez2Bis || juez3 !== juez3Bis){
            setCambios(true)
        }else{
            setCambios(false)
        }
    }
    const handleSubmit = async(event) =>{
        event.preventDefault();
        if(cambios){
            if(minuto !== minutoBis || hora !== horaBis){
                await updateData(date, element.numeroLeg, element.hora, 'hora', `${hora}:${minuto}`);
                setHoraBis(hora)
                setMinutoBis(minuto)}
            if(sala !== salaBis){
                await updateData(date, element.numeroLeg, element.hora, 'sala', sala);
                setSalaBis(sala)}
            if(legajo !== legajoBis){
                await updateData(date, element.numeroLeg, element.hora, 'numeroLeg', legajo);
                setLegajoBis(legajo)}
            if(tipo !== tipoBis){
                await updateData(date, element.numeroLeg, element.hora, 'tipo', tipo);
                setTipoBis(tipo)}
            if(tipo2 !== tipo2Bis){
                await updateData(date, element.numeroLeg, element.hora, 'tipo2', tipo2);
                setTipo2Bis(tipo2)}
            if(tipo3 !== tipo3Bis){
                await updateData(date, element.numeroLeg, element.hora, 'tipo3', tipo3);
                setTipo3Bis(tipo3)}
            if(juez1 !== juez1Bis || juez2 !== juez2Bis || juez3 !== juez3Bis){
                if(element.juez.includes('+')){
                    (desplegables.jueces.includes(juez1) && (desplegables.jueces.includes(juez2)) && (desplegables.jueces.includes(juez3))) && await updateData(date, element.numeroLeg, element.hora, 'juez', `${juez1}+${juez2}+${juez3}`);
                    setJuez1Bis(juez1)
                    setJuez2Bis(juez2)
                    setJuez3Bis(juez3)
                }else{
                    desplegables.jueces.includes(juez1) && await updateData(date, element.numeroLeg, element.hora, 'juez', juez1);
                    setJuez1Bis(juez1)
                }}
            if(del){
                await deleteAudiencia(date, element.numeroLeg, element.hora);
            }
            setCambios(false)
        }
    }
    useEffect(() => {
        checkEditing();
    }, [minuto, sala, legajo, tipo, tipo2, tipo3, juez1, juez2, juez3, del]);

    return(
        <form onSubmit={(event) => handleSubmit(event)} className={`${styles.tableRow}`}>
            <span className={`${styles.tableCell} ${styles.tableCellState} ${styles[element.estado]}`} title={element.estado.split('_').join(' ')}></span>
            <span className={`${styles.tableCell} ${styles.tableCellHora}`}><InputReloj horaF={setHora} minutF={setMinuto} hora={hora} minut={minuto}/></span>
            <span className={`${styles.tableCell} ${styles.tableCellSala}`}>
                <input list='sala' className={`${styles.tableCellInput} ${styles.salaSelect}`} value={sala} onChange={e => setSala(e.target.value)}/>
                    <datalist id='sala' className={`${styles.tableCellInput}`}><option>{sala}</option>
                    {desplegables.salas && desplegables.salas.map(el =>(
                        <option key={el} value={el}>SALA {el}</option>
                    ))}</datalist>
            </span>
            <span className={`${styles.tableCell} ${styles.tableCellLegajo}`}>
                <input type='string' className={`${styles.tableCellInput} ${styles.tableCellLegajoInput}`} value={legajo} onChange={e => handleLegChange(e.target.value)}/>
            </span>
            <span className={`${styles.tableCell} ${styles.tableCellTipo}`}>
                <input list='tipo' className={`${styles.tableCellInput} ${styles.tableCellTipoInput}`} title={tipo} value={tipo} onChange={e => setTipo(e.target.value)}/>
                <input list='tipo' className={`${styles.tableCellInput} ${styles.tableCellTipoInput}`} title={tipo2} value={tipo2} onChange={e => setTipo2(e.target.value)}/>
                <input list='tipo' className={`${styles.tableCellInput} ${styles.tableCellTipoInput}`} title={tipo3} value={tipo3} onChange={e => setTipo3(e.target.value)}/>
                <datalist id='tipo' className={`${styles.tableCellInput}`}>
                    {desplegables.tipos && desplegables.tipos.map(el =>(
                        <option key={el} value={el}>{el}</option>
                    ))}</datalist>
            </span>
            <span className={`${styles.tableCell} ${styles.tableCellJuez}`}>
                <input type='string' className={`${styles.tableCellInput} ${styles.tableCellJuezInput}`} title={juez1} value={juez1} onChange={e => handleJuezChange(e.target.value, 0)}/>
                {juez.split('').includes('+') && <><input type='string' className={`${styles.tableCellInput} ${styles.tableCellJuezInput}`} title={juez2} value={juez2} onChange={e => handleJuezChange(e.target.value, 1)}/>
                <input type='string' className={`${styles.tableCellInput} ${styles.tableCellJuezInput}`} title={juez3} value={juez3} onChange={e => handleJuezChange(e.target.value, 2)}/></>}
            </span>
            <span className={`${styles.tableCell} ${styles.tableCellAccion}`}>
                <button className={del? `${styles.delButton} ${styles.delButtonClicked}`:`${styles.delButton}`} onClick={()=>setDel(!del)} type='button'><svg viewBox="0 0 24 24" fill="none">
                <path d="M4 7H20" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 10L7.70141 19.3578C7.87432 20.3088 8.70258 21 9.66915 21H14.3308C15.2974 21 16.1257 20.3087 16.2986 19.3578L18 10" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg></button>
                <button className={cambios ? `${styles.cambiosButton} ${styles.cambiosButtonClicked}`:`${styles.cambiosButton}`} type='submit'><svg viewBox="0 0 24 24" fill="none">
                    <path fillRule="evenodd" clipRule="evenodd" d="M18.1716 1C18.702 1 19.2107 1.21071 19.5858 1.58579L22.4142 4.41421C22.7893 4.78929 23 5.29799 23 5.82843V20C23 21.6569 21.6569 23 20 23H4C2.34315 23 1 21.6569 1 20V4C1 2.34315 2.34315 1 4 1H18.1716ZM4 3C3.44772 3 3 3.44772 3 4V20C3 20.5523 3.44772 21 4 21L5 21L5 15C5 13.3431 6.34315 12 8 12L16 12C17.6569 12 19 13.3431 19 15V21H20C20.5523 21 21 20.5523 21 20V6.82843C21 6.29799 20.7893 5.78929 20.4142 5.41421L18.5858 3.58579C18.2107 3.21071 17.702 3 17.1716 3H17V5C17 6.65685 15.6569 8 14 8H10C8.34315 8 7 6.65685 7 5V3H4ZM17 21V15C17 14.4477 16.5523 14 16 14L8 14C7.44772 14 7 14.4477 7 15L7 21L17 21ZM9 3H15V5C15 5.55228 14.5523 6 14 6H10C9.44772 6 9 5.55228 9 5V3Z" fill="#0F0F0F"/>
                </svg></button>
            </span>
        </form>
    )
}