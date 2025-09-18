import { useContext, useEffect, useState } from 'react'
import styles from './Carga-Juicio.module.css'
import { DataContext } from '@/context/DataContext'

export default function AddJuicioInfo(){
    const {updateDesplegables, desplegables} = useContext(DataContext)
    const [numeroLeg1, setNumeroLeg1] = useState('MPF-SJ')
    const [numeroLeg1Error, setNumeroLeg1Error] = useState(false) 
    const [numeroLeg2, setNumeroLeg2] = useState(null)
    const [numeroLeg2Error, setNumeroLeg2Error] = useState(false)
    const [numeroLeg3, setNumeroLeg3] = useState(null)
    const [numeroLeg3Error, setNumeroLeg3Error] = useState(false)
    const [ufi, setUfi] = useState('')
    const [ufiError, setUfiError] = useState(false)
    const [fechad, setFechad] = useState(null)
    const [fechadError, setFechadError] = useState(false)
    const [fecham, setFecham] = useState(null)
    const [fechamError, setFechamError] = useState(false)
    const [fechaa, setFechaa] = useState(null)
    const [fechaaError, setFechaaError] = useState(false)
    const [cantBloques, setCantBloques] = useState(null)
    const [cantBloquesError, setCantBloquesError] = useState(false)
    const [cantTestigos, setCantTestigos] = useState(null)
    const [cantTestigosError, setCantTestigosError] = useState(false)
    const [tipoDelito, setTipoDelito] = useState('')
    const [tipoDelitoError, setTipoDelitoError] = useState(false)
    const [tipoTribunal, setTipoTribunal] = useState('')
    const [tipoTribunalError, setTipoTribunalError] = useState(false)
    const [fiscal, setFiscal] = useState('')
    const [fiscalError, setFiscalError] = useState(false)
    const [defensa, setDefensa] = useState('')
    const [defensaError, setDefensaError] = useState(false)
    const [querella, setQuerella] = useState('')
    const [querellaError, setQuerellaError] = useState(false)
    const [juez1, setJuez1] = useState('')
    const [juez1Error, setJuez1Error] = useState(false)
    const [juez2, setJuez2] = useState('')
    const [juez2Error, setJuez2Error] = useState(false)
    const [juez3, setJuez3] = useState('')
    const [juez3Error, setJuez3Error] = useState(false)
    const numberCheck = (value, setter, min, max) =>{
        if(value >= min && value <= max){
            setter(true)
        }else{
            setter(false)
        }
    }
    const listCheck = (value, setter, list) =>{
        if(list.includes(value)){
            setter(true)
        }else{
            setter(false)
        }
    }
    const typeCheck = (value, setter, type) =>{
        if(value instanceof type){
            setter(true)
        }else{
            setter(false)
        }
    }
    const changeHandler = (value, setter, errorSetter, errorchecker, check1, check2=0) =>{
        setter(value)
        errorchecker(value, errorSetter, check1, check2)
    }
    useEffect(() => {
        updateDesplegables()
    }, []);
    return (
        <section className={`${styles.addJuicioSection}`}>
            <label className={`${styles.cargaLabel}`}>Número de Legajo</label>
            <span className={`${styles.multiInput}`}>
                <input className={numeroLeg1Error ? `${styles.multiJuicioInput}` : `${styles.multiJuicioInput} ${styles.multiJuicioInputWrong}`} 
                    onChange={e => changeHandler(e.target.value,setNumeroLeg1,setNumeroLeg1Error,listCheck,desplegables.legajosPrefijo)} value={numeroLeg1} list='legajosPrefijo'/>
                <input className={numeroLeg2Error ? `${styles.multiJuicioInput}` : `${styles.multiJuicioInput} ${styles.multiJuicioInputWrong}`} 
                    onChange={e => changeHandler(e.target.value, setNumeroLeg2, setNumeroLeg2Error, numberCheck,0,99999)} 
                    placeholder='00000' value={numeroLeg2}/>
                <input className={numeroLeg3Error ? `${styles.multiJuicioInput}` : `${styles.multiJuicioInput} ${styles.multiJuicioInputWrong}`} 
                    placeholder='2025' onChange={e => changeHandler(e.target.value, setNumeroLeg3, setNumeroLeg3Error, numberCheck,0,2100)} value={numeroLeg3}/></span>
            <label className={`${styles.cargaLabel}`}>UFI</label>
            <input className={ufiError ? `${styles.juicioInput}` : `${styles.juicioInput} ${styles.juicioInputWrong}`} 
                onChange={e => changeHandler(e.target.value,setUfi,setUfiError,listCheck,desplegables.ufi)} value={ufi} list='ufi'/>
            <label className={`${styles.cargaLabel}`}>Auto de Apertura</label>
                <span className={`${styles.multiInput}`}>
                <input className={fechadError ? `${styles.multiJuicioInput}` : `${styles.multiJuicioInput} ${styles.multiJuicioInputWrong}`}
                    onChange={e => changeHandler(e.target.value, setFechad, setFechadError, numberCheck,1,31)} 
                    placeholder='05' value={fechad}/>
                <input className={fechamError ? `${styles.multiJuicioInput}` : `${styles.multiJuicioInput} ${styles.multiJuicioInputWrong}`}
                    placeholder='02' onChange={e => changeHandler(e.target.value, setFecham, setFechamError, numberCheck,1,12)} value={fecham}/>
                <input className={fechaaError ? `${styles.multiJuicioInput}` : `${styles.multiJuicioInput} ${styles.multiJuicioInputWrong}`} 
                    placeholder='2000' onChange={e => changeHandler(e.target.value, setFechaa, setFechaaError, numberCheck,20,2100)} value={fechaa}/></span>
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
                onChange={e => changeHandler(e.target.value,setFiscal,setFiscalError,listCheck,desplegables.fiscal)} value={fiscal} list='fiscal'/>
            <label className={`${styles.cargaLabel}`}>Cantidad de testigos</label>
            <input className={cantTestigosError ? `${styles.juicioInput}` : `${styles.juicioInput} ${styles.juicioInputWrong}`} 
                onChange={e => changeHandler(e.target.value, setCantTestigos, setCantBloquesError, numberCheck, 0, 999)} value={cantTestigos}/>
            <label className={`${styles.cargaLabel}`}>Defensa</label>
            <input className={defensaError ? `${styles.juicioInput}` : `${styles.juicioInput} ${styles.juicioInputWrong}`} 
                onChange={e => changeHandler(e.target.value,setDefensa,setDefensaError,listCheck,desplegables.defensa)} value={defensa} list='defensa'/>
            <label className={`${styles.cargaLabel}`}>Querella</label>
            <input className={querellaError ? `${styles.juicioInput}` : `${styles.juicioInput} ${styles.juicioInputWrong}`} 
                onChange={e => changeHandler(e.target.value,setQuerella,setQuerellaError,typeCheck,String)} value={querella}/>
            <label className={`${styles.cargaLabel}`}>Jueces</label>
            <input className={ufiError ? `${styles.juicioInput}` : `${styles.juicioInput} ${styles.juicioInputWrong}`} 
                onChange={e => changeHandler(e.target.value,setJuez1,setJuez1Error,listCheck,desplegables.jueces)} 
                value={juez1} list='jueces' placeholder={tipoTribunal === "COLEGIADO" ? 'presidente' : 'juez'}/>
            {tipoTribunal === "COLEGIADO" &&
                <>
                    <input className={`${styles.juicioInput}`} 
                        onChange={e => changeHandler(e.target.value,setJuez2,setJuez2Error,listCheck,desplegables.jueces)} value={juez2} list='jueces'/>
                    <input className={`${styles.juicioInput}`} 
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
            <datalist id="jueces" className={`${styles.tableCellInput}`}>
                {desplegables.jueces && desplegables.jueces.map((el) => (
                    <option key={el} value={el}>
                    {el}
                    </option>))}
            </datalist>
            <datalist id="fiscal" className={`${styles.tableCellInput}`}>
                {desplegables.fiscal && desplegables.fiscal.map((el) => (
                    <option key={el} value={el}>
                    {el}
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
                <button type='button' className={`${styles.juicioButton}`}>GENERAR</button>
                <button type='button' className={`${styles.juicioButton}`}>COPIAR</button>
            </span>
        </section>
    )
}