import { useContext, useState } from 'react'
import styles from './Carga-Juicio.module.css'
import { DataContext } from '@/context/DataContext'

export default function AddJuicioInfo(){
    const {updateDesplegables, desplegables} = useContext(DataContext)
    const [numeroLeg, setNumeroLeg] = useState('')
    const [ufi, setUfi] = useState('')
    const [fechad, setFechad] = useState('')
    const [fecham, setFecham] = useState('')
    const [fechaa, setFechaa] = useState('')
    const [cantBloques, setCantBloques] = useState('')
    const [cantTestigos, setCantTestigos] = useState('')
    const [tipoDelito, setTipoDelito] = useState('')
    const [tipTribunal, setTipoTribunal] = useState('')
    const [fiscal, setFiscal] = useState('')
    const [defensa, setDefensa] = useState('')
    const [querella, setQuerella] = useState('')
    const [jueces, setJueces] = useState('')

    return (
        <section className={`${styles.addJuicioSection}`}>
            <label>Número de Legajo</label>
            <input onChange={e => setNumeroLeg(e.target.value)}/>
            <label>UFI</label>
            <input onChange={e => setUfi(e.target.value)}/>
            <label>Auto de Apertura</label>
                <span><input onChange={e => setFechad(e.target.value)}/>
                <input onChange={e => setFecham(e.target.value)}/>
                <input onChange={e => setFechaa(e.target.value)}/></span>
            <label>Cantidad de bloques</label>
            <input onChange={e => setCantBloques(e.target.value)}/>
            <label>Tipo de delito</label>
            <input onChange={e => setTipoDelito(e.target.value)}/>
            <label>Tipo de tribunal</label>
            <input onChange={e => setTipoTribunal(e.target.value)}/>
            <label>Fiscal</label>
            <input onChange={e => setFiscal(e.target.value)}/>
            <label>Cantidad de testigos</label>
            <input onChange={e => setCantTestigos(e.target.value)}/>
            <label>Defensa</label>
            <input onChange={e => setDefensa(e.target.value)}/>
            <label>Querella</label>
            <input onChange={e => setQuerella(e.target.value)}/>
            <label>Jueces</label>
            <input onChange={e => setJueces(e.target.value)}/>
        </section>
    )
}