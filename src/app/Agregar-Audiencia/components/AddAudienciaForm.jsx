"use client"
import { useState, useContext, useEffect } from 'react';
import styles from './AddAudiencia.module.css'
import { DataContext } from '@/context/DataContext';
import { SelectDate } from '@/app/components/SelectDate';

export function AddAudienciaForm ({dateFunction, date}) {
    const {updateTiposAudiencias, updateByDate, tiposAudiencias, updateDesplegables, addAudiencia, bydate, desplegables} = useContext(DataContext);
    const [hora, setHora] = useState('')
    const [hora2, setHora2] = useState('')
    const [horaProgramada, setHoraProgramada] = useState(45)
    const [sala, setSala] = useState('-')
    const [legajo1, setLegajo1] = useState('MPF-SJ')
    const [legajo2, setLegajo2] = useState('-')
    const [legajo3, setLegajo3] = useState('-')
    const [tipo, setTipo] = useState('')
    const [tipo2, setTipo2] = useState('')
    const [tipo3, setTipo3] = useState('')
    const [colegiado, setColegiado] = useState(false)
    const [juez, setJuez] = useState('-')
    const [juez2, setJuez2] = useState('-')
    const [juez3, setJuez3] = useState('-')
    const [situacion, setSituacion] = useState('')
    
    const [horaError, setHoraError] = useState(false)
    const [horaProgramadaError, setHoraProgramadaError] = useState(false)
    const [salaError, setSalaError] = useState(false)
    const [legajo2Error, setLegajo2Error] = useState(false)
    const [legajo3Error, setLegajo3Error] = useState(false)
    const [tipoError, setTipoError] = useState(false)
    const [juezError, setJuezError] = useState(false)
    const [errorMessage, setErrorMessage] = useState(false)
    
    const [dupliCheck, setDupliCheck] = useState(false)
    
    const errorChecking = () =>{
        (hora && hora2) ? setHoraError(false) : setHoraError(true);
        (sala || sala=='-') ? setSalaError(false) : setSalaError(true);
        (legajo2 && (`${legajo2}`.length < 6)) ? setLegajo2Error(false) : setLegajo2Error(true);
        (legajo3 || legajo3 =='-') ? setLegajo3Error(false) : setLegajo3Error(true);    
        (tipo || tipo == '-' || !desplegables.tipos.includes(tipo)) ? setTipoError(false) : setTipoError(true);
        (horaProgramada || horaProgramada === 0) ? setHoraProgramadaError(false) : setHoraProgramadaError(true);
        if(colegiado){
            ((juez || juez == '-' || desplegables.jueces.includes(juez)) && (juez2 || juez2 == '-' || desplegables.jueces.includes(juez2)) && (juez3 || juez3 == '-' || desplegables.jueces.includes(juez3))) ? setJuezError(false) : setJuezError(true);
        }else{
            (juez || juez == '-' || desplegables.jueces.includes(juez)) ? setJuezError(false) : setJuezError(true);
        }
        if(colegiado){
            ((desplegables.jueces.includes(juez)) && (desplegables.jueces.includes(juez2)) && (desplegables.jueces.includes(juez3))) ? setJuezError(false) : setJuezError(true);
        }else{
            desplegables.jueces.includes(juez) ? setJuezError(false) : setJuezError(true);
        }
        const formattedHora = `${hora && hora.padStart(2,'0')}:${hora2 && hora2.padStart(2,'0')}`;
        const formattedNumeroLeg = `${legajo1}-${legajo2.padStart(5,'0')}-${legajo3}`;
        const isDuplicate = bydate.some(el => el.hora === formattedHora && el.numeroLeg === formattedNumeroLeg);
        setDupliCheck(isDuplicate);
    }
    const addToFirebase = async() =>{
        const newAudiencia = {
            hora: `${hora.padStart(2,'0')}:${hora2.padStart(2,'0')}`,
            horaProgramada: horaProgramada,
            sala: sala,
            numeroLeg: (legajo1 + "-" + legajo2.padStart(5,'0') + "-" + legajo3),
            tipo: tipo,
            tipo2: ((tipo2 == '-') ? '' : tipo2),
            tipo3: ((tipo3 == '-' | tipo2 == '-') ? '' : tipo3),
            juez: (colegiado ? (juez + "+" + juez2 + "+" + juez3) : juez),
            estado: "PROGRAMADA",
            situacion: (situacion ? situacion : '')
        }
        await addAudiencia(newAudiencia, `${date}`)
        document.getElementById('addingForm').reset();
        await updateByDate(date)
    }
    const restore = () =>{
        setHora('');
        setHora2('');
        setSala('-');
        setLegajo1('MPF-SJ');
        setLegajo2('');
        setLegajo3('');
        setTipo('-')
        setTipo2('-')
        setTipo3('-')
        setColegiado(false)
        setJuez('')
        setJuez2('')
        setJuez3('')
        setHoraProgramada(45)
        setSituacion('')
    }
    const handleSubmit = async(event) =>{
        event.preventDefault();
        errorChecking()
        if(!(horaError || salaError || legajo2Error || legajo3Error || tipoError || juezError || dupliCheck || horaProgramadaError)){
            await addToFirebase()
            await restore()
        }
    }
    useEffect(() => {
        if(horaError || salaError || legajo2Error || legajo3Error || tipoError || juezError || dupliCheck){
            setErrorMessage(true)
            setTimeout(function(){
                setErrorMessage(false)
            }, 3000);
            setTimeout(function(){
                setHoraError(false)
                setSalaError(false)
                setLegajo2Error(false)
                setLegajo3Error(false)
                setTipoError(false)
                setJuezError(false)
                setDupliCheck(false)
            }, 10000);
        }
    }, [horaError, salaError, legajo2Error, legajo3Error, tipoError, juezError, dupliCheck])
    useEffect(() => {
        updateTiposAudiencias()
        updateDesplegables()
    }, [])
    return(
        <>
        {errorMessage && 
            (<div className={`${styles.errorMessage}`}>{dupliCheck ? 'AUDIENCIA DUPLICADA' : 'DATOS INSUFICIENTES O INCORRECTOS'}</div>)}
        <form id='addingForm' onSubmit={(event) => handleSubmit(event)} className={`${styles.addAudienciaFormBlock}`}>
            <SelectDate dateFunction={dateFunction} date={date}/>
            <div className={`${styles.inputProgramadaBlock}`}>
                <div className={`${styles.inputHoraProgramada}`}>
                    <p className={`${styles.titleInput}`}>DURACIÓN</p>
                    <input value={horaProgramada} onChange={e => {setHoraProgramada(e.target.value)}}/>
                </div>
                <div className={horaError ? `${styles.inputHoraBlock} ${styles.inputError} ${styles.inputItemBlock}` : ` ${styles.inputHoraBlock} ${styles.inputItemBlock}`}>
                    <p className={`${styles.titleInput}`}>HORA</p>
                    <div className={`${styles.inputTimeBlock}`}>
                        <input placeholder='00' min='0' value={hora} max='24' onChange={e => {setHora(e.target.value)}}/>
                        <p className={`${styles.separatorDots}`}>:</p>
                        <input placeholder='00' min='0' value={hora2} max='59' onChange={e => {setHora2(e.target.value)}}/>
                    </div>
                </div>    
            </div>
        
            <div className={salaError ? `${styles.inputSalaBlock} ${styles.inputItemBlock} ${styles.inputError}` : `${styles.inputSalaBlock} ${styles.inputItemBlock}` }>
                <p className={`${styles.titleInput}`}>SALA</p>
                <span className={`${styles.inputSalaSelectBlock}`}>
                    <input list='sala2' onChange={e => setSala(e.target.value)}/>
                    <datalist id='sala2' className={`${styles.tableCellInput}`}><option>{sala}</option>
                    {desplegables.salas && desplegables.salas.map(el =>(
                        <option key={el} value={el}>{el}</option>
                    ))}</datalist></span>
            </div>
            <div className={`${styles.inputLegajoBlock} ${styles.inputItemBlock}`}>
                <p className={`${styles.titleInput}`}>LEGAJO</p>
                <div className={`${styles.legajoBlock}`}>
                    <input list='legajoPrefijo' value={legajo1} className={`${styles.legajo1}`} onChange={e => setLegajo1(e.target.value)}/>
                    <datalist id='legajoPrefijo' className={`${styles.tableCellInput}`}>
                    {desplegables.legajosPrefijo && desplegables.legajosPrefijo.map(el =>(
                        <option key={el} value={el}>{el}</option>
                    ))}</datalist>
                <input className={legajo2Error ? `${styles.inputAreaError} ${styles.legajo2}` : `${styles.legajo2}` } min='1' max='99999' id="IngresarNumero" placeholder="00000" onChange={e => setLegajo2(e.target.value)}/>
                <input list='anio' className={`${styles.legajo3}`} placeholder="1970" onChange={e => setLegajo3(e.target.value)}/>
                    <datalist id='anio' className={`${styles.tableCellInput}`}>
                    {desplegables.años && desplegables.años.map(el =>(
                        <option key={el} value={el}>{el}</option>
                ))}</datalist></div>
            </div>
            <div className={tipoError ? `${styles.inputTipoBlock} ${styles.inputItemBlock} ${styles.inputError} ` : `${styles.inputTipoBlock} ${styles.inputItemBlock}`}>
                <p className={`${styles.titleInput}`}>TIPO</p>
                <input list="tipo" value={tipo} className={`${styles.tipoInput}`} onChange={(e)=>{setTipo(e.target.value)}}/>
                {(tipo && tipo =='-' || tipo =='') ||
                <input list="tipo" value={tipo2} className={`${styles.tipoInput}`} onChange={(e)=>{setTipo2(e.target.value)}}/>}
                {((tipo && tipo =='-' || tipo =='') || (tipo2 && tipo2 =='-' || tipo2 =='')) ||
                    <input list="tipo" className={`${styles.tipoInput}`} onChange={(e)=>{setTipo3(e.target.value)}}/>}
                <datalist id='tipo'>
                    {desplegables.tipos && desplegables.tipos.sort().map((el) =>{
                        return(
                            <option key={el} value={el}>{el}</option>
                        )
                    })}
                </datalist>
            </div>
            <div className={juezError ? `${styles.inputJuezBlock} ${styles.inputItemBlock} ${styles.inputError}` : `${styles.inputJuezBlock} ${styles.inputItemBlock}`}>
                <p className={`${styles.titleInput}`}>JUEZ</p>
                <div className={`${styles.juecesButtonBlock}`}>
                <button className={`${styles.uniButton}`}  type = "button" id="colegiadoButton" onClick={() => setColegiado(!colegiado)}>{colegiado ? 'COL' : 'UNI'}</button>
                <input list="juez" className={`${styles.juecesSelect1}`} onChange={(e)=>{setJuez(e.target.value)}}/>
                </div>
            {(colegiado) && (
                <>
                <input list="juez" className={`${styles.juecesSelect}`} onChange={(e)=>{setJuez2(e.target.value)}}/>
                <input list="juez" className={`${styles.juecesSelect}`} onChange={(e)=>{setJuez3(e.target.value)}}/>
                </>
            )}
            <datalist id="juez">
                {desplegables.jueces && desplegables.jueces.sort().map((el) =>{
                    return(
                        <option key={el} value={el}></option>
                    )
                })}
            </datalist>
            </div>
            <div className={`${styles.inputItemBlock}`}>
                <p className={`${styles.titleInput}`}>SITUACIÓN</p>
                <input className={`${styles.inputSituacion}`} value={situacion} type="text" id="IngresarComentario" placeholder="opcional" onChange={e => setSituacion(e.target.value)}/>
            </div>
            <div className={`${styles.inputItemBlock}`}><button type="submit" className={`${styles.submitButton}`} onClick={()=>{handleSubmit; errorChecking()}}>AGREGAR</button></div>
        </form>
        </>
    )
}
