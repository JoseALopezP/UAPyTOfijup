import { useContext, useEffect, useState } from 'react'
import styles from './Carga-Juicio.module.css'
import { DataContext } from '@/context New/DataContext'
import { ButtonSelection } from './buttonSelection'
import { numberCheck, listCheck, typeCheck, changeHandler, changeHandlerSplitter } from '@/utils/inputChecks'

export default function EditExisting({original, newState, setNewState}){
    const {updateDesplegables, desplegables, changeValueJuicio, updateData} = useContext(DataContext)
    const [numeroLeg1, setNumeroLeg1] = useState('MPF-SJ')
    const [numeroLeg1Error, setNumeroLeg1Error] = useState(true) 
    const [numeroLeg2, setNumeroLeg2] = useState(null)
    const [numeroLeg2Error, setNumeroLeg2Error] = useState(true)
    const [numeroLeg3, setNumeroLeg3] = useState(null)
    const [numeroLeg3Error, setNumeroLeg3Error] = useState(true)
    const [ufi, setUfi] = useState('')
    const [ufiError, setUfiError] = useState(true)
    const [fechad, setFechad] = useState(null)
    const [fechadError, setFechadError] = useState(true)
    const [fecham, setFecham] = useState(null)
    const [fechamError, setFechamError] = useState(true)
    const [fechaa, setFechaa] = useState(null)
    const [fechaaError, setFechaaError] = useState(true)
    const [fechah, setFechah] = useState(null)
    const [fechahError, setFechahError] = useState(true)
    const [fechamm, setFechamm] = useState(null)
    const [fechammError, setFechammError] = useState(true)
    const [fechas, setFechas] = useState(null)
    const [fechasError, setFechasError] = useState(true)
    const [fechaid, setFechaid] = useState(null)
    const [fechaidError, setFechaidError] = useState(true)
    const [fechaim, setFechaim] = useState(null)
    const [fechaimError, setFechaimError] = useState(true)
    const [fechaia, setFechaia] = useState(null)
    const [fechaiaError, setFechaiaError] = useState(true)
    const [cantBloques, setCantBloques] = useState(null)
    const [cantBloquesError, setCantBloquesError] = useState(true)
    const [bloques, setBloques] = useState([])
    const [cantTestigos, setCantTestigos] = useState(null)
    const [cantTestigosError, setCantTestigosError] = useState(true)
    const [tipoDelito, setTipoDelito] = useState('')
    const [tipoDelitoError, setTipoDelitoError] = useState(true)
    const [tipoTribunal, setTipoTribunal] = useState('')
    const [fiscal, setFiscal] = useState('')
    const [fiscalError, setFiscalError] = useState(true)
    const [defensa, setDefensa] = useState('')
    const [defensaError, setDefensaError] = useState(true)
    const [defensaCargo, setDefensaCargo] = useState('')
    const [defensaCargoError, setDefensaCargoError] = useState(true)
    const [querella, setQuerella] = useState('')
    const [querellaError, setQuerellaError] = useState(true)
    const [juez1, setJuez1] = useState('')
    const [juez1Error, setJuez1Error] = useState(true)
    const [juez2, setJuez2] = useState('')
    const [juez2Error, setJuez2Error] = useState(true)
    const [juez3, setJuez3] = useState('')
    const [juez3Error, setJuez3Error] = useState(true)
    const [erroresList, setErroresList] = useState('')
    const [changes, setChanges] = useState(false)
    const checkCompletion = () =>{
        const aux = []
        listCheck(numeroLeg1,setNumeroLeg1Error, desplegables.legajosPrefijo)
        numberCheck(numeroLeg2, setNumeroLeg2Error,0,99999)
        numberCheck(numeroLeg3, setNumeroLeg3Error,0,2100)
        listCheck(ufi, setUfiError, desplegables.ufi)
        numberCheck(fechad, setFechadError,1,31)
        numberCheck(fecham, setFechamError,1,12)
        numberCheck(fechaa, setFechaaError,20,2100)
        numberCheck(fechah, setFechahError,0,23)
        numberCheck(fechamm, setFechammError,0,59)
        numberCheck(fechas, setFechasError,0,59)
        numberCheck(cantBloques, setCantBloquesError, 0, 100)
        numberCheck(cantTestigos, setCantTestigosError, 0, 999)
        listCheck(tipoDelito, setTipoDelitoError, desplegables.delitosTipos)
        listCheck(fiscal, setFiscalError, desplegables.fiscal)
        listCheck(defensa, setDefensaError, desplegables.defensa)
        listCheck(defensaCargo, setDefensaCargoError, desplegables.defensorias)
        typeCheck(querella, setQuerellaError, 'string')
        listCheck(juez1, setJuez1Error, desplegables.jueces)
        if(tipoTribunal === "COLEGIADO"){
            listCheck(juez2, setJuez2Error, desplegables.jueces)
            listCheck(juez3, setJuez3Error, desplegables.jueces)
        } else {
            setJuez2Error(true)
            setJuez3Error(true)
        }
        !numeroLeg1Error && aux.push('número de legajo (prefijo) no válido')
        !numeroLeg2Error && aux.push('número de legajo (central) no válido')
        !numeroLeg3Error && aux.push('número de legajo (año) no válido')
        !ufiError && aux.push('UFI no válida')
        !fechadError && aux.push('día auto no válido')
        !fechamError && aux.push('mes auto no válido')
        !fechaaError && aux.push('año auto no válido')
        !fechahError && aux.push('hora auto no válida')
        !fechammError && aux.push('minuto auto no válido')
        !fechasError && aux.push('segundo auto no válido')
        !fechaidError && aux.push('día inicio no válido')
        !fechaimError && aux.push('mes inicio no válido')
        !fechaiaError && aux.push('año inicio no válido')
        !cantBloquesError && aux.push('cantidad de bloques no válido')
        !cantTestigosError && aux.push('cantidad de testigos no válido')
        !tipoDelitoError && aux.push('tipo de delito no válido')
        !fiscalError && aux.push('fiscal no válido')
        !defensaError && aux.push('defensa no válida')
        !querellaError && aux.push('querella no válida')
        !juez1Error && aux.push('juez/presidente no válido')
        !juez2Error && aux.push('juez/vocal 1 no válido')
        !juez3Error && aux.push('juez/vocal 2 no válido')
        if(aux.length > 0){
            setErroresList(aux.join(', '))
            return(false)
        }else{
            setErroresList('')
            return(true)
        }
    }
    const handleCopiar = () =>{
        if(checkCompletion()){
            const cells = `${numeroLeg1 + '-' + numeroLeg2 + '-' + numeroLeg3}\t${ufi}\t\t${fechad+'/'+fecham+'/'+fechaa+' '+fechah+':'+fechamm+':'+fechas}\t${fechaid+'/'+fechaim+'/'+fechaia}\t${cantBloques}\t\t\t\t\t\t\t${cantTestigos}\t\t${tipoDelito}\t${tipoTribunal}\t${fiscal}\t${defensa}\t${querella}\t${juez1}\t${tipoTribunal==='COLEGIADO'?'PRESIDENTE':'N/A'}` +
                `${tipoTribunal === 'COLEGIADO' && '\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t' + juez2 + 'VOCAL'}` + `${tipoTribunal === 'COLEGIADO' && '\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t' + juez3 + 'VOCAL'}`
            navigator.clipboard.writeText(cells);
        }
    }
    const checkDifferenceSave = (saving) =>{
        const fechaI = fechaid+fechaim+fechaia;
        setChanges(false)
        const newNumeroLeg = (numeroLeg1 + '-' + numeroLeg2 + '-' + numeroLeg3)
        if(newNumeroLeg !== original.numeroLeg){
            if(saving){
                changeValueJuicio(fechaI, original.Id, )
                bloques.forEach(el =>{
                    updateData(el.fecha, el.audId, 'numeroLeg', newNumeroLeg)
                })
            }else{
                setChanges(true)
            }
        }
        const newAuto = (`${fechad}${fecham}${fechaa} ${fechah}:${fechamm}:${fechas}`)
        if(newAuto !== original.auto){
            if(saving){
                changeValueJuicio(fechaI, original.id, 'auto', newAuto)
            }else{
                setChanges(true)
            }
        }
        const newInicio = (`${fechaid}${fechaim}${fechaia}`)
        if(newInicio !== original.inicio){
            if(saving){
                changeValueJuicio(fechaI, original.id, 'inicio', newInicio)
            }else{
                setChanges(true)
            }
        }
        if(ufi !== original.ufi){
            if(saving){
                changeValueJuicio(fechaI, original.id, 'ufi', ufi)
            }else{
                setChanges(true)
            }
        }
        if(fiscal !== original.fiscal){
            if(saving){
                changeValueJuicio(fechaI, original.id, 'fiscal', fiscal)
            }else{
                setChanges(true)
            }
        }
        if(tipoDelito !== original.tipoDelito){
            if(saving){
                changeValueJuicio(fechaI, original.id, 'tipoDelito', tipoDelito)
            }else{
                setChanges(true)
            }
        }
        if(defensa !== original.defensa){
            if(saving){
                changeValueJuicio(fechaI, original.id, 'defensa', defensa)
            }else{
                setChanges(true)
            }
        }
        if(defensaCargo !== original.defensoria){
            if(saving){
                changeValueJuicio(fechaI, original.id, 'defensoria', defensaCargo)
            }else{
                setChanges(true)
            }
        }
        const newJueces = `${juez1}+${juez2}+${juez3}` 
        if(newJueces !== original.jueces){
            if(saving){
                changeValueJuicio(fechaI, original.id, 'jueces', newJueces)
            }else{
                setChanges(true)
            }
        }
    }
    useEffect(() => {
        updateDesplegables()
    }, []);
    return (
        <section className={`${styles.addJuicioSection}`}>
            <ButtonSelection newState={newState} setNewState={setNewState}/>
            <label className={`${styles.cargaLabel}`}>Número de Legajo</label>
            <span className={`${styles.multiInput}`}>
                <input className={numeroLeg1Error ? `${styles.multiJuicioInput}` : `${styles.multiJuicioInput} ${styles.multiJuicioInputWrong}`} 
                    onChange={e => changeHandler(e.target.value,setNumeroLeg1,setNumeroLeg1Error,listCheck,desplegables.legajosPrefijo)} value={numeroLeg1} list='legajosPrefijo'/>
                <input className={numeroLeg2Error ? `${styles.multiJuicioInput}` : `${styles.multiJuicioInput} ${styles.multiJuicioInputWrong}`} 
                    onChange={e => changeHandler(e.target.value, setNumeroLeg2, setNumeroLeg2Error, numberCheck,0,99999)} 
                    placeholder='00000' value={numeroLeg2}/>
                <input className={numeroLeg3Error ? `${styles.multiJuicioInput}` : `${styles.multiJuicioInput} ${styles.multiJuicioInputWrong}`} 
                    placeholder='2025' onChange={e => changeHandler(e.target.value, setNumeroLeg3, setNumeroLeg3Error, numberCheck,0,2100)} value={numeroLeg3}/></span>
            <label className={`${styles.cargaLabel}`}>Auto de Apertura</label>
                <span className={`${styles.multiInput}`}>
                    <input className={fechadError ? `${styles.multiJuicioInput}` : `${styles.multiJuicioInput} ${styles.multiJuicioInputWrong}`}
                        onChange={e => changeHandler(e.target.value, setFechad, setFechadError, numberCheck,1,31)} 
                        placeholder='05' value={fechad}/>
                    <input className={fechamError ? `${styles.multiJuicioInput}` : `${styles.multiJuicioInput} ${styles.multiJuicioInputWrong}`}
                        placeholder='02' onChange={e => changeHandler(e.target.value, setFecham, setFechamError, numberCheck,1,12)} value={fecham}/>
                    <input className={fechaaError ? `${styles.multiJuicioInput}` : `${styles.multiJuicioInput} ${styles.multiJuicioInputWrong}`} 
                        placeholder='2000' onChange={e => changeHandler(e.target.value, setFechaa, setFechaaError, numberCheck,20,2100)} value={fechaa}/>
                </span>
                <span className={`${styles.multiInput}`}>
                    <input className={fechahError ? `${styles.multiJuicioInput}` : `${styles.multiJuicioInput} ${styles.multiJuicioInputWrong}`}
                        onChange={e => changeHandler(e.target.value, setFechah, setFechahError, numberCheck,0,23)} 
                        placeholder='hh' value={fechah}/>
                    <input className={fechammError ? `${styles.multiJuicioInput}` : `${styles.multiJuicioInput} ${styles.multiJuicioInputWrong}`}
                        placeholder='mm' onChange={e => changeHandler(e.target.value, setFechamm, setFechammError, numberCheck,0,59)} value={fechamm}/>
                    <input className={fechasError ? `${styles.multiJuicioInput}` : `${styles.multiJuicioInput} ${styles.multiJuicioInputWrong}`} 
                        placeholder='ss' onChange={e => changeHandler(e.target.value, setFechas, setFechasError, numberCheck,0,59)} value={fechas}/>
                </span>
            <label className={`${styles.cargaLabel}`}>Fecha de inicio juicio</label>
                <span className={`${styles.multiInput}`}>
                    <input className={fechaidError ? `${styles.multiJuicioInput}` : `${styles.multiJuicioInput} ${styles.multiJuicioInputWrong}`}
                        onChange={e => changeHandler(e.target.value, setFechaid, setFechaidError, numberCheck,1,31)} 
                        placeholder='05' value={fechaid}/>
                    <input className={fechaimError ? `${styles.multiJuicioInput}` : `${styles.multiJuicioInput} ${styles.multiJuicioInputWrong}`}
                        placeholder='02' onChange={e => changeHandler(e.target.value, setFechaim, setFechaimError, numberCheck,1,12)} value={fechaim}/>
                    <input className={fechaiaError ? `${styles.multiJuicioInput}` : `${styles.multiJuicioInput} ${styles.multiJuicioInputWrong}`} 
                        placeholder='2000' onChange={e => changeHandler(e.target.value, setFechaia, setFechaiaError, numberCheck,20,2100)} value={fechaia}/>
                </span>
            <label className={`${styles.cargaLabel}`}>Cantidad de bloques</label>
            <input className={cantBloquesError ? `${styles.juicioInput}` : `${styles.juicioInput} ${styles.juicioInputWrong}`} 
                onChange={e => changeHandler(e.target.value, setCantBloques, setCantBloquesError, numberCheck, 0, 100)} value={cantBloques}/>
            <label className={`${styles.cargaLabel}`}>Tipo de delito</label>
            <input className={tipoDelitoError ? `${styles.juicioInput}` : `${styles.juicioInput} ${styles.juicioInputWrong}`} 
                onChange={e => changeHandler(e.target.value,setTipoDelito,setTipoDelitoError,listCheck,desplegables.delitosTipos)} value={tipoDelito} list='delitosTipos'/>
            <label className={`${styles.cargaLabel}`}>Tipo de tribunal</label>
            <select className={`${styles.juicioInput}`} onChange={e => setTipoTribunal(e.target.value)} value={tipoTribunal}>
                <option key={'UNIPERSONAL'} value={"UNIPERSONAL"}>UNIPERSONAL</option>
                <option key={'COLEGIADO'} value={"COLEGIADO"}>COLEGIADO</option>
            </select>
            <label className={`${styles.cargaLabel}`}>Fiscal</label>
            <input className={fiscalError ? `${styles.juicioInput}` : `${styles.juicioInput} ${styles.juicioInputWrong}`} 
                onChange={e => changeHandlerSplitter(e.target.value,setFiscal,setFiscalError,listCheck,desplegables.fiscal, desplegables.ufi, setUfi, setUfiError)} value={fiscal} list='fiscal'/>
            <label className={`${styles.cargaLabel}`}>UFI</label>
            <input className={ufiError ? `${styles.juicioInput}` : `${styles.juicioInput} ${styles.juicioInputWrong}`} 
                onChange={e => changeHandler(e.target.value,setUfi,setUfiError,listCheck,desplegables.ufi)} value={ufi} list='ufi'/>
            <label className={`${styles.cargaLabel}`}>Cantidad de testigos</label>
            <input className={cantTestigosError ? `${styles.juicioInput}` : `${styles.juicioInput} ${styles.juicioInputWrong}`} 
                onChange={e => changeHandler(e.target.value, setCantTestigos, setCantTestigosError, numberCheck, 0, 999)} value={cantTestigos}/>
            <label className={`${styles.cargaLabel}`}>Defensa</label>
            <input className={defensaError ? `${styles.juicioInput}` : `${styles.juicioInput} ${styles.juicioInputWrong}`} 
                onChange={e => changeHandlerSplitter(e.target.value,setDefensa,setDefensaError,listCheck,desplegables.defensa, desplegables.defensorias, setDefensaCargo, setDefensaCargoError)} value={defensa} list='defensa'/>
            <label className={`${styles.cargaLabel}`}>Defensoria</label>
            <input className={defensaCargoError ? `${styles.juicioInput}` : `${styles.juicioInput} ${styles.juicioInputWrong}`}
                onChange={e => changeHandler(e.target.value,setDefensaCargo,setDefensaCargoError,listCheck,desplegables.defensaCargo)} value={defensaCargo} list='defensorias'/>
            <label className={`${styles.cargaLabel}`}>Querella</label>
            <input className={querellaError ? `${styles.juicioInput}` : `${styles.juicioInput} ${styles.juicioInputWrong}`} 
                onChange={e => changeHandler(e.target.value,setQuerella,setQuerellaError,typeCheck,'string')} value={querella}/>
            <label className={`${styles.cargaLabel}`}>Jueces</label>
            <input className={juez1Error ? `${styles.juicioInput}` : `${styles.juicioInput} ${styles.juicioInputWrong}`} 
                onChange={e => changeHandler(e.target.value,setJuez1,setJuez1Error,listCheck,desplegables.jueces)} 
                value={juez1} list='jueces' placeholder={tipoTribunal === "COLEGIADO" ? 'presidente' : 'juez'}/>
            {tipoTribunal === "COLEGIADO" &&
                <>
                    <input className={juez2Error ? `${styles.juicioInput}` : `${styles.juicioInput} ${styles.juicioInputWrong}`} 
                        onChange={e => changeHandler(e.target.value,setJuez2,setJuez2Error,listCheck,desplegables.jueces)} value={juez2} list='jueces'/>
                    <input className={juez3Error ? `${styles.juicioInput}` : `${styles.juicioInput} ${styles.juicioInputWrong}`} 
                        onChange={e => changeHandler(e.target.value,setJuez3,setJuez3Error,listCheck,desplegables.jueces)} value={juez3} list='jueces'/>
                </>}
            <datalist id="delitosTipos" className={`${styles.tableCellInput}`}>
                {desplegables.delitosTipos && desplegables.delitosTipos.map((el) => (
                    <option key={el} value={el}>
                    {el}
                    </option>))}
            </datalist>
            <datalist id="defensa" className={`${styles.tableCellInput}`}>
                {desplegables.defensa && desplegables.defensa.map((el) => (
                    <option key={el} value={el}>
                    {el}
                    </option>))}
                {desplegables.defensaParticular && desplegables.defensaParticular.map((el) => (
                    <option key={el} value={el}>
                    {el}
                </option>))}
            </datalist>
            <datalist id="defensorias" className={`${styles.tableCellInput}`}>
                {desplegables.defensorias && desplegables.defensorias.map((el) => (
                    <option key={el} value={el}>
                    {el}
                    </option>))}
                    <option key={''} value={''}></option>
            </datalist>
            <datalist id="jueces" className={`${styles.tableCellInput}`}>
                {desplegables.jueces && desplegables.jueces.map((el) => (
                    <option key={el} value={el}>
                    {el}
                    </option>))}
            </datalist>
            <datalist id="fiscal" className={`${styles.tableCellInput}`}>
                {desplegables.fiscal && desplegables.fiscal.map((el) => (
                    <option key={el} value={el}>
                        {el.split(' - ')[0]}
                    </option>))}
            </datalist>
            <datalist id="ufi" className={`${styles.tableCellInput}`}>
                {desplegables.ufi && desplegables.ufi.map((el) => (
                    <option key={el} value={el}>
                    {el}
                    </option>))}
            </datalist>
            <datalist id="legajosPrefijo" className={`${styles.tableCellInput}`}>
                {desplegables.legajosPrefijo && desplegables.legajosPrefijo.map((el) => (
                    <option key={el} value={el}>
                    {el}
                    </option>))}
            </datalist>
            <span className={`${styles.multiInput}`}>
                <button type='button' className={`${styles.juicioButton}`} onClick={() => handleGenerar()}>GENERAR</button>
                <button type='button' className={`${styles.juicioButton}`} onClick={() => handleCopiar()}>COPIAR</button>
            </span>
            <span className={`${styles.erroresList}`}>{erroresList}</span>
        </section>
    )
}