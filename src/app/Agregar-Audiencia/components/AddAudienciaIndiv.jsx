import { useEffect, useContext, useState } from 'react';
import styles from './AddAudiencia.module.css';
import { DataContext } from '@/context New/DataContext';
import InputReloj from '@/app/components/InputReloj';

export function AddAudienciaIndiv({date, element}) {
    const { desplegables, updateData, deleteAudiencia, updateDesplegables, updateByDate} = useContext(DataContext);
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
    const [juezBis, setJuezBis] = useState(element.juez || '')
    const [juez1, setJuez1] = useState(element.juez && element.juez.split('+')[0] || '')
    const [juez2, setJuez2] = useState(element.juez && element.juez.split('+')[1] || '')
    const [juez3, setJuez3] = useState(element.juez && element.juez.split('+')[2] || '')
    const [horaBis, setHoraBis] = useState(element.hora.split(':')[0] || '')
    const [minutoBis, setMinutoBis] = useState(element.hora.split(':')[1] || '')
    const [salaBis, setSalaBis] = useState(element.sala || '')
    const [alertSent, setAlertSent] = useState(false)
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
            case 0:
                setJuez1(value)
                if(juez.includes('+')){
                    setJuez(value+'+'+juez.split('+')[1]+'+'+juez.split('+')[2]);
                }else{
                    setJuez(value)
                }
            break;
            case 1: 
                setJuez2(value)
                if(juez.includes('+')){
                    setJuez(juez.split('+')[0]+'+'+value+'+'+juez.split('+')[2]);
                }else{
                    setJuez(value)
                }
            break;
            case 2: 
                setJuez3(value)
                if(juez.includes('+')){
                    setJuez(juez.split('+')[0]+'+'+juez.split('+')[1]+'+'+value);
                }else{
                    setJuez(value)
                }
            break;
        }
    }
    const toggleJuezFormat = () => {
        if (juez.includes('+')) {
            setJuez(juez1);
            setJuez2('');
            setJuez3('');
            setJuez(`${juez1}`)
        } else {
            setJuez2('-');
            setJuez3('-');
            setJuez(`${juez1}+-+-`);
            setCambios(true)
        }
        setCambios(true)
    }
    const checkEditing = () => {
    if (
        del ||
        hora !== horaBis ||
        minuto !== minutoBis ||
        sala !== salaBis ||
        legajo !== legajoBis ||
        tipo !== tipoBis ||
        tipo2 !== tipo2Bis ||
        tipo3 !== tipo3Bis ||
        juez1 !== juez1Bis ||
        juez2 !== juez2Bis ||
        juez3 !== juez3Bis ||
        juez !== juezBis
    ) {
        setCambios(true);
    } else {
        setCambios(false);
    }
};

    const handleSubmit = async(event) =>{
        event.preventDefault();
        if(del && !alertSent){
            alert('Estás por eliminar la audiencia ' + legajo + ' programada a las ' + hora +':'+minuto+ '. Presiona nuevamente guardar de así quererlo.')
            setAlertSent(true)
            return
        }
        if(cambios){
            if((minuto !== minutoBis || hora !== horaBis) && hora !== '' && minuto !== ''){
                await updateData(date, element.id, 'hora', `${hora.replace(/:/g, '')}:${minuto}`);
                setHoraBis(hora)
                setMinutoBis(minuto)}
            if(sala !== salaBis && sala !== ''){
                await updateData(date, element.id, 'sala', sala);
                setSalaBis(sala)}
            if(legajo !== legajoBis && legajo !== ''){
                await updateData(date, element.id, 'numeroLeg', legajo);
                setLegajoBis(legajo)}
            if(tipo !== tipoBis && tipo !== ''){
                await updateData(date, element.id, 'tipo', tipo);
                setTipoBis(tipo)}
            if(tipo2 !== tipo2Bis){
                await updateData(date, element.id, 'tipo2', tipo2);
                setTipo2Bis(tipo2)}
            if(tipo3 !== tipo3Bis){
                await updateData(date, element.id, 'tipo3', tipo3,);
                setTipo3Bis(tipo3)}
            if((juez1 !== juez1Bis || juez2 !== juez2Bis || juez3 !== juez3Bis) && juez !== ''){
                if(juez.includes('+')){
                    (desplegables.jueces.includes(juez1) && (desplegables.jueces.includes(juez2)) && (desplegables.jueces.includes(juez3))) && 
                    await updateData(date, element.id, 'juez', `${juez1}+${juez2}+${juez3}`);
                    setJuez1Bis(juez1)
                    setJuez2Bis(juez2)
                    setJuez3Bis(juez3)
                    setJuezBis(juez)
                }else{
                    desplegables.jueces.includes(juez1) && 
                    await updateData(date, element.id, 'juez', juez1);
                    setJuez1Bis(juez1)
                }}
            if(del){
                await deleteAudiencia(date, element.id);
            }
            setCambios(false)
        }
        setAlertSent(false)
        await updateByDate(date)
    }
    
    useEffect(() => {
        checkEditing();
    }, [minuto, sala, legajo, tipo, tipo2, tipo3, juez1, juez2, juez3, del, juez]);
    useEffect(() => {
        updateDesplegables();
    }, []);

    return(
        <form onSubmit={(event) => handleSubmit(event)} className={`${styles.tableRow}`}>
            {element.estado ? <span className={`${styles.tableCell} ${styles.tableCellState} ${styles[element.estado]}`} title={element.estado.split('_').join(' ')}></span> : 
                <span className={`${styles.tableCell} ${styles.tableCellState} ${styles[element.estado]}`} title={'PROGRAMADA'}></span>}
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
                <button type="button" className={`${styles.colButton}`} onClick={toggleJuezFormat}>{juez.includes('+') ? 
                    <><svg viewBox="0 0 26 26">
                        <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd"><g fill="#212121" fillRule="nonzero">
                        <path d="M17.25,18 C18.4926407,18 19.5,19.0073593 19.5,20.25 L19.5,21.7519766 L19.4921156,21.8604403 C19.1813607,23.9866441 17.2715225,25.0090369 14.0667905,25.0090369 C10.8736123,25.0090369 8.93330141,23.9983408 8.51446278,21.8965776 L8.5,21.75 L8.5,20.25 C8.5,19.0073593 9.50735931,18 10.75,18 L17.25,18 Z M17.25,19.5 L10.75,19.5 C10.3357864,19.5 10,19.8357864 10,20.25 L10,21.670373 C10.2797902,22.870787 11.550626,23.5090369 14.0667905,23.5090369 C16.582858,23.5090369 17.7966388,22.8777026 18,21.6931543 L18,20.25 C18,19.8357864 17.6642136,19.5 17.25,19.5 Z M18.2435553,11.9989081 L23.75,12 C24.9926407,12 26,13.0073593 26,14.25 L26,15.7519766 L25.9921156,15.8604403 C25.6813607,17.9866441 23.7715225,19.0090369 20.5667905,19.0090369 L20.2519278,19.0056708 L20.2519278,19.0056708 C19.9568992,18.2920884 19.4151086,17.7078172 18.7333573,17.3574924 C19.2481703,17.4584023 19.8580822,17.5090369 20.5667905,17.5090369 C23.082858,17.5090369 24.2966388,16.8777026 24.5,15.6931543 L24.5,14.25 C24.5,13.8357864 24.1642136,13.5 23.75,13.5 L18.5,13.5 C18.5,12.9736388 18.4096286,12.468385 18.2435553,11.9989081 Z M4.25,12 L9.75644465,11.9989081 C9.61805027,12.3901389 9.53222663,12.8062147 9.50746303,13.2386463 L9.5,13.5 L4.25,13.5 C3.83578644,13.5 3.5,13.8357864 3.5,14.25 L3.5,15.670373 C3.77979024,16.870787 5.05062598,17.5090369 7.5667905,17.5090369 C8.18886171,17.5090369 8.73132757,17.4704451 9.1985991,17.3944422 C8.5478391,17.7478373 8.03195873,18.3174175 7.74634871,19.0065739 L7.5667905,19.0090369 C4.37361228,19.0090369 2.43330141,17.9983408 2.01446278,15.8965776 L2,15.75 L2,14.25 C2,13.0073593 3.00735931,12 4.25,12 Z M14,10 C15.9329966,10 17.5,11.5670034 17.5,13.5 C17.5,15.4329966 15.9329966,17 14,17 C12.0670034,17 10.5,15.4329966 10.5,13.5 C10.5,11.5670034 12.0670034,10 14,10 Z M14,11.5 C12.8954305,11.5 12,12.3954305 12,13.5 C12,14.6045695 12.8954305,15.5 14,15.5 C15.1045695,15.5 16,14.6045695 16,13.5 C16,12.3954305 15.1045695,11.5 14,11.5 Z M20.5,4 C22.4329966,4 24,5.56700338 24,7.5 C24,9.43299662 22.4329966,11 20.5,11 C18.5670034,11 17,9.43299662 17,7.5 C17,5.56700338 18.5670034,4 20.5,4 Z M7.5,4 C9.43299662,4 11,5.56700338 11,7.5 C11,9.43299662 9.43299662,11 7.5,11 C5.56700338,11 4,9.43299662 4,7.5 C4,5.56700338 5.56700338,4 7.5,4 Z M20.5,5.5 C19.3954305,5.5 18.5,6.3954305 18.5,7.5 C18.5,8.6045695 19.3954305,9.5 20.5,9.5 C21.6045695,9.5 22.5,8.6045695 22.5,7.5 C22.5,6.3954305 21.6045695,5.5 20.5,5.5 Z M7.5,5.5 C6.3954305,5.5 5.5,6.3954305 5.5,7.5 C5.5,8.6045695 6.3954305,9.5 7.5,9.5 C8.6045695,9.5 9.5,8.6045695 9.5,7.5 C9.5,6.3954305 8.6045695,5.5 7.5,5.5 Z" id="🎨-Color">
                        </path></g></g>
                    </svg></> 
                    : 
                    <><svg viewBox="0 0 48 48">
                        <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd"><g fill="#212121" fillRule="nonzero">
                            <path d="M35.7502,28 C38.0276853,28 39.8876578,29.7909151 39.9950978,32.0427546 L40,32.2487 L40,33 C40,36.7555 38.0583,39.5669 35.0798,41.3802 C32.1509,43.1633 28.2139,44 24,44 C19.7861,44 15.8491,43.1633 12.9202,41.3802 C10.0319285,39.6218485 8.11862909,36.9249713 8.00532378,33.3388068 L8,33 L8,32.2489 C8,29.9703471 9.79294995,28.1122272 12.0440313,28.0048972 L12.2499,28 L35.7502,28 Z M35.7502,30.5 L12.2499,30.5 C11.331345,30.5 10.5787597,31.2066575 10.5057976,32.1054618 L10.5,32.2489 L10.5,33 C10.5,35.7444 11.8602,37.8081 14.2202,39.2448 C16.6297,40.7117 20.0677,41.5 24,41.5 C27.9323,41.5 31.3703,40.7117 33.7798,39.2448 C36.0555143,37.8594107 37.4015676,35.8910074 37.4948116,33.2914406 L37.5,33 L37.5,32.2488 C37.5,31.331195 36.7934328,30.5787475 35.8937801,30.5057968 L35.7502,30.5 Z M24,4 C29.5228,4 34,8.47715 34,14 C34,19.5228 29.5228,24 24,24 C18.4772,24 14,19.5228 14,14 C14,8.47715 18.4772,4 24,4 Z M24,6.5 C19.8579,6.5 16.5,9.85786 16.5,14 C16.5,18.1421 19.8579,21.5 24,21.5 C28.1421,21.5 31.5,18.1421 31.5,14 C31.5,9.85786 28.1421,6.5 24,6.5 Z" >
                        </path></g></g></svg></>}</button>
                <input
                            className={`${styles.tableCellInput} ${styles.tableCellJuezInput}`} title={juez1} value={juez1}
                            list="jueces"
                            onChange={e => handleJuezChange(e.target.value, 0)}
                          />
                          {juez.includes('+') && (
                            <>
                              <input
                                list="jueces"
                                className={`${styles.tableCellInput} ${styles.tableCellJuezInput}`} title={juez2} value={juez2}
                                onChange={e => handleJuezChange(e.target.value, 1)}
                              />
                              <input
                                list="jueces"
                                className={`${styles.tableCellInput} ${styles.tableCellJuezInput}`} title={juez3} value={juez3}
                                onChange={e => handleJuezChange(e.target.value, 2)}
                              />
                            </>
                          )}
                          <datalist id="jueces" className={`${styles.tableCellInput}`}>
                            {desplegables.jueces &&
                              desplegables.jueces.map((el) => (
                                <option key={el} value={el}>
                                  {el}
                                </option>
                              ))}</datalist>
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