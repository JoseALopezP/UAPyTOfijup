import { useState, useContext, useEffect } from 'react';
import styles from './AddAudiencia.module.css'
import { DataContext } from '@/context/DataContext';

export function AddAudienciaForm ({date}) {
    const {updateTiposAudiencias, updateByDate, tiposAudiencias, jueces, updateJueces, addAudiencia, updateAños, años, bydate} = useContext(DataContext);
    const [hora, setHora] = useState(null)
    const [hora2, setHora2] = useState(null)
    const [horaProgramada, setHoraProgramada] = useState(45)
    const [sala, setSala] = useState(null)
    const [legajo1, setLegajo1] = useState('MPF-SJ')
    const [legajo2, setLegajo2] = useState('')
    const [legajo3, setLegajo3] = useState('')
    const [tipo, setTipo] = useState('-')
    const [tipo2, setTipo2] = useState('-')
    const [tipo3, setTipo3] = useState('-')
    const [colegiado, setColegiado] = useState(false)
    const [juez, setJuez] = useState(null)
    const [juez2, setJuez2] = useState(null)
    const [juez3, setJuez3] = useState(null)
    const [situacion, setSituacion] = useState(null)
    const [horaError, setHoraError] = useState(false)
    const [horaProgramadaError, setHoraProgramadaError] = useState(false)
    const [salaError, setSalaError] = useState(false)
    const [legajo2Error, setLegajo2Error] = useState(false)
    const [legajo3Error, setLegajo3Error] = useState(false)
    const [tipoError, setTipoError] = useState(false)
    const [juezError, setJuezError] = useState(false)
    const [dupliCheck, setDupliCheck] = useState(false)
    const errorChecking = () =>{
        (hora && hora2) ? setHoraError(false) : setHoraError(true);
        (sala || sala=='-') ? setSalaError(false) : setSalaError(true);
        (legajo2 && (`${legajo2}`.length < 6)) ? setLegajo2Error(false) : setLegajo2Error(true);
        (legajo3 || legajo3 =='-') ? setLegajo3Error(false) : setLegajo3Error(true);    
        (tipo || tipo == '-') ? setTipoError(false) : setTipoError(true);
        (horaProgramada || horaProgramada === 0) ? setHoraProgramadaError(false) : setHoraProgramadaError(true);
        if(colegiado){
            ((juez || juez == '-' ) && (juez2 || juez == '-') && (juez3 || juez == '-')) ? setJuezError(false) : setJuezError(true);
        }else{
            (juez || juez == '-') ? setJuezError(false) : setJuezError(true);
        }
        if(colegiado){
            ((jueces.includes(juez)) && (jueces.includes(juez2)) && (jueces.includes(juez3))) ? setJuezError(false) : setJuezError(true);
        }else{
            jueces.includes(juez) ? setJuezError(false) : setJuezError(true);
        }
        const formattedHora = `${hora.padStart(2,'0')}:${hora2.padStart(2,'0')}`;
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
        setHora(null);
        setHora2(null);
        setSala(null);
        setLegajo1('MPF-SJ');
        setLegajo2('');
        setLegajo3('');
        setTipo('-')
        setTipo2('-')
        setTipo3('-')
        setColegiado(false)
        setJuez(null)
        setJuez2(null)
        setJuez3(null)
        setHoraProgramada(45)
        setSituacion(null)
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
        updateTiposAudiencias()
        updateJueces()
        updateAños()
    }, [])
    return(
        <>
        {(horaError || salaError || legajo2Error || legajo3Error || tipoError || juezError || dupliCheck) && 
            (<div className={`${styles.errorMessage}`}>{dupliCheck ? 'AUDIENCIA DUPLICADA' : 'DATOS INSUFICIENTES O INCORRECTOS'}</div>)}
        <form id='addingForm' onSubmit={(event) => handleSubmit(event)} className={`${styles.addAudienciaBlock}`}>
            <div className={`${styles.inputProgramadaBlock}`}>
                <div className={`${styles.inputHoraProgramada}`}>
                    <p className={`${styles.titleInput}`}>DURACIÓN</p>
                    <input value={horaProgramada} onChange={e => {setHoraProgramada(e.target.value)}}/>
                </div>
                <div className={horaError ? `${styles.inputHoraBlock} ${styles.inputError} ${styles.inputItemBlock}` : ` ${styles.inputHoraBlock} ${styles.inputItemBlock}`}>
                    <p className={`${styles.titleInput}`}>HORA</p>
                    <div className={`${styles.inputTimeBlock}`}>
                        <input placeholder='00' min='0' max='24' onChange={e => {setHora(e.target.value)}}/>
                        <p className={`${styles.separatorDots}`}>:</p>
                        <input placeholder='00' min='0' max='59' onChange={e => {setHora2(e.target.value)}}/>
                    </div>
                </div>    
            </div>
        
            <div className={salaError ? `${styles.inputSalaBlock} ${styles.inputItemBlock} ${styles.inputError}` : `${styles.inputSalaBlock} ${styles.inputItemBlock}` }>
                <p className={`${styles.titleInput}`}>SALA</p>
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
                    <option value={"10"}>SALA 10</option>
                </select>
            </div>
            <div className={`${styles.inputLegajoBlock} ${styles.inputItemBlock}`}>
                <p className={`${styles.titleInput}`}>LEGAJO</p>
                <div className={`${styles.legajoBlock}`}><select className={`${styles.legajo1}`} onChange={(e)=>{setLegajo1(e.target.value)}}>
                    <option value={"MPF-SJ"}>MPF-SJ</option>
                    <option value={"OJU-SJ"}>OJU-SJ</option>
                </select>
                <input className={legajo2Error ? `${styles.inputAreaError} ${styles.legajo2}` : `${styles.legajo2}` } min='1' max='99999' id="IngresarNumero" placeholder="00000" onChange={e => setLegajo2(e.target.value)}/>
                <select className={legajo3Error ? `${styles.inputAreaError} ${styles.legajo3}` : `${styles.legajo3}`} onChange={(e)=>{setLegajo3(e.target.value)}}>
                    {años && años.map(el =>{
                        return(
                            <option key={el} value={el}>{el}</option>
                        )
                    })}
                </select></div>
            </div>
            <div className={tipoError ? `${styles.inputTipoBlock} ${styles.inputItemBlock} ${styles.inputError} ` : `${styles.inputTipoBlock} ${styles.inputItemBlock}`}>
                <p className={`${styles.titleInput}`}>TIPO</p>
                <input list="tipo1" onChange={(e)=>{setTipo(e.target.value)}}/>
                <datalist id='tipo1'>
                    {tiposAudiencias && tiposAudiencias.sort().map((el) =>{
                        return(
                            <option key={el} value={el}>{el}</option>
                        )
                    })}
                </datalist>
                {(tipo && tipo =='-' || tipo =='') ||
                <>
                    <input list="tipo2" onChange={(e)=>{setTipo2(e.target.value)}}/>
                    <datalist id='tipo2'>
                        {tiposAudiencias && tiposAudiencias.sort().map((el) =>{
                            return(
                                <option key={el} value={el}>{el}</option>
                            )
                        })}
                    </datalist>
                </>}
                {((tipo && tipo =='-' || tipo =='') || (tipo2 && tipo2 =='-' || tipo2 =='')) ||
                    <>
                    <input list="tipo3" onChange={(e)=>{setTipo3(e.target.value)}}/>
                    <datalist id='tipo3'>
                        {tiposAudiencias && tiposAudiencias.sort().map((el) =>{
                            return(
                                <option key={el} value={el}>{el}</option>
                            )
                        })}
                    </datalist>
                    </>}
            </div>
            <div className={juezError ? `${styles.inputJuezBlock} ${styles.inputItemBlock} ${styles.inputError}` : `${styles.inputJuezBlock} ${styles.inputItemBlock}`}>
                <p className={`${styles.titleInput}`}>JUEZ</p>
                <div className={`${styles.juecesButtonBlock}`}>
                <button className={`${styles.colegiadoButton}`} type = "button" id="colegiadoButton" onClick={() => setColegiado(!colegiado)}>{colegiado ? 'COL' : 'UNI'}</button>
                <input list="juez1" className={`${styles.uniSelect}`} onChange={(e)=>{setJuez(e.target.value)}}/>
                <datalist id="juez1">
                    {jueces && jueces.sort().map((el) =>{
                        return(
                            <option key={el} value={el}>{el.split(' ').slice(1,4).join(' ')}</option>
                        )
                    })}
                </datalist>
                </div>
            {(colegiado) && (
                <>
                <input list="juez2" className={`${styles.juecesSelect}`} onChange={(e)=>{setJuez2(e.target.value)}}/>
                <datalist id="juez2">
                    {jueces && jueces.sort().map((el) =>{
                        return(
                            <option key={el} value={el}>{el.split(' ').slice(1,4).join(' ')}</option>
                        )
                    })}
                </datalist>
                <input list="juez3" className={`${styles.juecesSelect}`} onChange={(e)=>{setJuez3(e.target.value)}}/>
                <datalist id="juez3">
                    {jueces && jueces.sort().map((el) =>{
                        return(
                            <option key={el} value={el}>{el.split(' ').slice(1,4).join(' ')}</option>
                        )
                    })}
                </datalist>
                </>
            )}
            </div>
            <div className={`${styles.inputItemBlock}`}>
                <input className={`${styles.inputArea} ${styles.inputSituacion}`} type="text" id="IngresarComentario" placeholder="opcional" onChange={e => setSituacion(e.target.value)}/>
            </div>
            <div className={`${styles.inputSubmitBlock} ${styles.inputItemBlock}`}><button type="submit" className={`${styles.submitButton}`} onClick={()=>{handleSubmit; errorChecking()}}>AGREGAR</button></div>
        </form>
        </>
    )
}
