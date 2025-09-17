import { useContext, useEffect, useState } from 'react'
import styles from './Carga-Juicio.module.css'
import { DataContext } from '@/context/DataContext'

export default function AddJuicioInfo(){
    const {updateDesplegables, desplegables} = useContext(DataContext)
    const [numeroLeg1, setNumeroLeg1] = useState('MPF-SJ')
    const [numeroLeg2, setNumeroLeg2] = useState('')
    const [numeroLeg3, setNumeroLeg3] = useState('')
    const [ufi, setUfi] = useState('')
    const [fechad, setFechad] = useState('')
    const [fecham, setFecham] = useState('')
    const [fechaa, setFechaa] = useState('')
    const [cantBloques, setCantBloques] = useState('')
    const [cantTestigos, setCantTestigos] = useState('')
    const [tipoDelito, setTipoDelito] = useState('')
    const [tipoTribunal, setTipoTribunal] = useState('')
    const [fiscal, setFiscal] = useState('')
    const [defensa, setDefensa] = useState('')
    const [querella, setQuerella] = useState('')
    const [jueces, setJueces] = useState('')

    useEffect(() => {
        updateDesplegables()
    }, []);
    return (
        <section className={`${styles.addJuicioSection}`}>
            <label className={`${styles.cargaLabel}`}>Número de Legajo</label>
            <span className={`${styles.multiInput}`}>
                <input className={`${styles.multiJuicioInput}`} onChange={e => setNumeroLeg1(e.target.value)} value={numeroLeg1} list='legajosPrefijo'/>
                <input className={`${styles.multiJuicioInput}`} onChange={e => setNumeroLeg2(e.target.value)} value={numeroLeg2}/>
                <input className={`${styles.multiJuicioInput}`} onChange={e => setNumeroLeg3(e.target.value)} value={numeroLeg3}/></span>
            <label className={`${styles.cargaLabel}`}>UFI</label>
            <input className={`${styles.juicioInput}`} onChange={e => setUfi(e.target.value)} value={ufi} list='ufi'/>
            <label className={`${styles.cargaLabel}`}>Auto de Apertura</label>
                <span className={`${styles.multiInput}`}><input className={`${styles.multiJuicioInput}`} onChange={e => setFechad(e.target.value)} value={fechad}/>
                <input className={`${styles.multiJuicioInput}`} onChange={e => setFecham(e.target.value)} value={fecham}/>
                <input className={`${styles.multiJuicioInput}`} onChange={e => setFechaa(e.target.value)} value={fechaa}/></span>
            <label className={`${styles.cargaLabel}`}>Cantidad de bloques</label>
            <input className={`${styles.juicioInput}`} onChange={e => setCantBloques(e.target.value)} value={cantBloques}/>
            <label className={`${styles.cargaLabel}`}>Tipo de delito</label>
            <input className={`${styles.juicioInput}`} onChange={e => setTipoDelito(e.target.value)} value={tipoDelito} list='delitosTipos'/>
            <label className={`${styles.cargaLabel}`}>Tipo de tribunal</label>
            <select className={`${styles.juicioInput}`} onChange={e => setTipoTribunal(e.target.value)} value={tipoTribunal}>
                <option key={'UNIPERSONAL'} value={"UNIPERSONAL"}>UNIPERSONAL</option>
                <option key={'COLEGIADO'} value={"COLEGIADO"}>COLEGIADO</option>
            </select>
            <label className={`${styles.cargaLabel}`}>Fiscal</label>
            <input className={`${styles.juicioInput}`} onChange={e => setFiscal(e.target.value)} value={fiscal} list='fiscal'/>
            <label className={`${styles.cargaLabel}`}>Cantidad de testigos</label>
            <input className={`${styles.juicioInput}`} onChange={e => setCantTestigos(e.target.value)} value={cantTestigos}/>
            <label className={`${styles.cargaLabel}`}>Defensa</label>
            <input className={`${styles.juicioInput}`} onChange={e => setDefensa(e.target.value)} value={defensa} list='defensa'/>
            <label className={`${styles.cargaLabel}`}>Querella</label>
            <input className={`${styles.juicioInput}`} onChange={e => setQuerella(e.target.value)} value={querella}/>
            <label className={`${styles.cargaLabel}`}>Jueces</label>
            <input className={`${styles.juicioInput}`} onChange={e => setJueces(e.target.value)} value={jueces} list='jueces'/>
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
            <span>
                <button type='button'>GENERAR</button>
                <button type='button'>COPIAR</button>
            </span>
        </section>
    )
}