'use client'
import styles from '../Pumba.module.css'
import { useState, useContext, useEffect } from 'react'
import { DataContext } from '@/context New/DataContext';
import { calculateCuartos } from '@/utils/calculators';

export default function TableRow({ audData, dateToUse }) {
    const { byDate, updateDesplegables, desplegables } = useContext(DataContext);
    const [tabItem, setTabItem] = useState({})

    const [legajo, setLegajo] = useState('')
    const [audTipo, setAudTipo] = useState('')
    const [ufi, setUfi] = useState('')
    const [dyhsolicitud, setDyhsolicitud] = useState('')
    const [dyhagendamiento, setDyhagendamiento] = useState('')
    const [dyhnotificacion, setDyhnotificacion] = useState('')
    const [dyhprogramada, setDyhprogramada] = useState('')
    const [dyhreal, setDyhreal] = useState('')
    const [demora, setDemora] = useState('')
    const [motivDemora, setMotivDemora] = useState('')
    const [observDemora, setObservDemora] = useState('')
    const [durReal, setDurReal] = useState('')
    const [cuartoPedido, setCuartoPedido] = useState('')
    const [cuartoReal, setCuartoReal] = useState('')
    const [cuartoRealOtros, setCuartoRealOtros] = useState('')
    const [dyhfinalizacion, setDyhfinalizacion] = useState('')
    const [entregaResuelvo, setEntregaResuelvo] = useState('')
    const [cantImputados, setCantImputados] = useState('')
    const [sala, setSala] = useState('')
    const [operador, setOperador] = useState('')
    const [fiscal, setFiscal] = useState('')
    const [defensa, setDefensa] = useState('')
    const [juez, setJuez] = useState('')
    const [finAudiencia, setFinAudiencia] = useState('')
    const [resolucion, setResolucion] = useState('')
    const [resultadoControl, setResultadoControl] = useState('')
    const [indicadorUga, setIndicadorUga] = useState('')
    const [comentario, setComentario] = useState('')

    useEffect(() => {
        legajo === '' && setLegajo(audData.numeroLeg)
        audTipo === '' && setAudTipo(audData.tipo + ' + ' + audData.tipo2 + ' + ' + audData.tipo3)
        ufi === '' && setUfi(audData.ufi)
        dyhsolicitud === '' && setDyhsolicitud(audData.dyhsolicitud)
        dyhagendamiento === '' && setDyhagendamiento(audData.dyhagendamiento)
        dyhnotificacion === '' && setDyhnotificacion(audData.fechaNotificacion)
        dyhprogramada === '' && setDyhprogramada(audData.inicioProgramada)
        dyhreal === '' && setDyhreal(audData.inicioReal)
        demora === '' && setDemora((parseInt(audData.inicioReal.split(' ')[1].split(':')[0]) * 60 + parseInt(audData.inicioReal.split(' ')[1].split(':')[1]))) - (parseInt(audData.inicioProgramada.split(' ')[1].split(':')[0]) * 60 + parseInt(audData.inicioProgramada.split(' ')[1].split(':')[1]))
        motivDemora === '' && setMotivDemora(audData.motivoDemora)
        observDemora === '' && setObservDemora('')
        durReal === '' && setDurReal(parseInt(audData.finReal.split(':')[0]) * 60 + parseInt(audData.finReal.split(':')[1]) - (parseInt(audData.inicioReal.split(':')[0]) * 60 + parseInt(audData.inicioReal.split(':')[1])))
        cuartoPedido === '' && setCuartoPedido(tabItem.hitos.filter(el => el.includes('CUARTO_INTERMEDIO')).reduce((acc, el) => acc + parseInt(el.split(' | ')[2])))
        cuartoReal === '' && setCuartoReal(calculateCuartos(tabItem.hitos))
        cuartoRealOtros === '' && setCuartoRealOtros(calculateCuartosOtros(tabItem.hitos))
        dyhfinalizacion === '' && setDyhfinalizacion(audData.finReal)
        entregaResuelvo === '' && setEntregaResuelvo(tabItem.horaResuelvo)
        cantImputados === '' && setCantImputados(audData.intervinientes.filter(el => el.includes('IMPUTADO')).length)
        sala === '' && setSala(tabItem.sala)
        operador === '' && setOperador(tabItem.operador)
        fiscal === '' && setFiscal(tabItem.mpf[0].nombre)
        defensa === '' && setDefensa(tabItem.defensa[0].nombre)
        juez === '' && setJuez(tabItem.juez)
        finAudiencia === '' && setFinAudiencia('')
        resolucion === '' && setResolucion('')
        resultadoControl === '' && setResultadoControl('')
        indicadorUga === '' && setIndicadorUga('')
        comentario === '' && setComentario('')
    })
    useEffect(() => {
        updateDesplegables()
    }, [])
    useEffect(() => {
        setTabItem(byDate.find((item) => (item.numeroLeg === audData.numeroLeg && item.hora === audData.inicioProgramada)))
    }, [byDate])
    return (
        <><tr key={index}>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyOk}`}>
                <input className={`${styles.inputCell}`} type='text' value={legajo} onChange={(e) => setLegajo(e.target.value)} /></td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyPuma}`}>
                {audData.tipo + ' + ' + audData.tipo2 + ' + ' + audData.tipo3}</td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>
                {tabItem.tipo + ' + ' + tabItem.tipo2 + ' + ' + tabItem.tipo3}</td>
            <td className={tiposT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <input className={`${styles.inputCell}`} type='text' value={audTipo} onChange={(e) => setAudTipo(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyPuma}`}>{audData.ufi}</td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>{tabItem.ufi}</td>
            <td className={tiposT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <input className={`${styles.inputCell}`} type='text' value={ufi} onChange={(e) => setUfi(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>{audData.dyhsolicitud}</td>
            <td className={tiposT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <input className={`${styles.inputCell}`} type='text' value={dyhsolicitud} onChange={(e) => setDyhsolicitud(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>{audData.dyhagendamiento}</td>
            <td className={tiposT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <input className={`${styles.inputCell}`} type='text' value={dyhagendamiento} onChange={(e) => setDyhagendamiento(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>{audData.fechaNotificacion}</td>
            <td className={tiposT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <input className={`${styles.inputCell}`} type='text' value={dyhnotificacion} onChange={(e) => setDyhnotificacion(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyPuma}`}>{audData.inicioProgramada}</td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>{dateToUse.slice(0, 2) + '/' + dateToUse.slice(3, 5) + '/' + dateToUse.slice(6, 10) + ' ' + tabItem.hora}</td>
            <td className={tiposT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <input className={`${styles.inputCell}`} type='text' value={dyhprogramada} onChange={(e) => setDyhprogramada(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyPuma}`}>{audData.inicioReal}</td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>{dateToUse.slice(0, 2) + '/' + dateToUse.slice(3, 5) + '/' + dateToUse.slice(6, 10) + ' ' + tabItem.hitos[0].split(' | ')[0]}</td>
            <td className={tiposT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <input className={`${styles.inputCell}`} type='text' value={dyhreal} onChange={(e) => setDyhreal(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyPuma}`}>
                {parseInt((audData.inicioReal.split(' ')[1].split(':')[0]) * 60 + parseInt(audData.inicioReal.split(' ')[1].split(':')[1])) - (parseInt(audData.inicioProgramada.split(' ')[1].split(':')[0]) * 60 + parseInt(audData.inicioProgramada.split(' ')[1].split(':')[1]))}</td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>
                {parseInt((tabItem.hitos[0].split(' | ')[0].split(':')[0]) * 60 + parseInt(tabItem.hitos[0].split(' | ')[0].split(':')[1])) - (parseInt(tabItem.hora.split(':')[0]) * 60 + parseInt(tabItem.hora.split(':')[1]))}</td>
            <td className={tiposT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <input className={`${styles.inputCell}`} type='text' value={demora} onChange={(e) => setDemora(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyPuma}`}>
                {audData.motivoDemora}</td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>
                {tabItem.razonDemora}</td>
            <td className={tiposT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <input className={`${styles.inputCell}`} type='text' value={motivDemora} onChange={(e) => setMotivDemora(e.target.value)} />
            </td>
            <td className={tiposT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <input className={`${styles.inputCell}`} type='text' value={observDemora} onChange={(e) => setObservDemora(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyPuma}`}>
                {parseInt(audData.finProgramada.split(':')[0]) * 60 + parseInt(audData.finProgramada.split(':')[1]) - (parseInt(audData.inicioProgramada.split(':')[0]) * 60 + parseInt(audData.inicioProgramada.split(':')[1]))}</td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>
                {tabItem.horaProgramada}</td>
            <td className={tiposT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <input className={`${styles.inputCell}`} type='text' value={motivDemora} onChange={(e) => setMotivDemora(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyPuma}`}>
                {parseInt(audData.finReal.split(':')[0]) * 60 + parseInt(audData.finReal.split(':')[1]) - (parseInt(audData.inicioReal.split(':')[0]) * 60 + parseInt(audData.inicioReal.split(':')[1]))}</td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>
                {parseInt(tabItem.hitos.find(el => el.includes('FINALIZADA').split(' | ')[0].split(':')[0])) * 60 + parseInt(tabItem.hitos.find(el => el.includes('FINALIZADA').split(' | ')[0].split(':')[0])) - (parseInt(tabItem.hitos[0].split(':')[0])) * 60 + parseInt(tabItem.hitos[0].split(':')[1])}</td>
            <td className={tiposT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <input className={`${styles.inputCell}`} type='text' value={durReal} onChange={(e) => setDurReal(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>
                {tabItem.hitos.filter(el => el.includes('CUARTO_INTERMEDIO')).reduce((acc, el) => acc + parseInt(el.split(' | ')[2]))}</td>
            <td className={tiposT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <input className={`${styles.inputCell}`} type='text' value={cuartoPedido} onChange={(e) => setCuartoPedido(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>
                {tabItem.hitos.filter(el => el.includes('FINALIZADA')).reduce((acc, el) => acc + parseInt(el.split(' | ')[2]))}</td>
            <td className={tiposT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <input className={`${styles.inputCell}`} type='text' value={cuartoPedido} onChange={(e) => setCuartoPedido(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>
                {calculateCuartos(tabItem.hitos)}</td>
            <td className={tiposT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <input className={`${styles.inputCell}`} type='text' value={cuartoReal} onChange={(e) => setCuartoReal(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>
                {calculateCuartosOtros(tabItem.hitos)}</td>
            <td className={tiposT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <input className={`${styles.inputCell}`} type='text' value={cuartoRealOtros} onChange={(e) => setCuartoRealOtros(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyPuma}`}>
                {audData.finReal}</td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>
                {tabItem.hitos.find(el => el.includes('FINALIZADA')).split(' | ')[0]}</td>
            <td className={tiposT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <input className={`${styles.inputCell}`} type='text' value={dyhfinalizacion} onChange={(e) => setDyhfinalizacion(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>
                {tabItem.horaResuelvo}</td>
            <td className={tiposT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <input className={`${styles.inputCell}`} type='text' value={entregaResuelvo} onChange={(e) => setEntregaResuelvo(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyPuma}`}>
                {audData.intervinientes.filter(el => el.includes('IMPUTADO')).length}</td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>
                {tabItem.imputado.length}</td>
            <td className={tiposT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <input className={`${styles.inputCell}`} type='text' value={cantImputados} onChange={(e) => setCantImputados(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyPuma}`}>
                {audData.sala}</td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>
                {tabItem.sala}</td>
            <td className={tiposT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <input className={`${styles.inputCell}`} type='text' value={sala} onChange={(e) => setSala(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyPuma}`}>
                {audData.operador}</td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>
                {tabItem.operador}</td>
            <td className={tiposT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <input className={`${styles.inputCell}`} type='text' value={operador} onChange={(e) => setOperador(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyPuma}`}>
                {audData.intervinientes.find(el => el.includes('FISCAL'))}</td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>
                {tabItem.mpf[0].nombre}</td>
            <td className={tiposT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <input className={`${styles.inputCell}`} type='text' value={fiscal} onChange={(e) => setFiscal(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyPuma}`}>
                {audData.intervinientes.find(el => el.includes('DEFENSA'))}</td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>
                {tabItem.defensa[0].nombre}</td>
            <td className={tiposT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <input className={`${styles.inputCell}`} type='text' value={defensa} onChange={(e) => setDefensa(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyPuma}`}>
                {audData.jueces[0]}</td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>
                {tabItem.juez}</td>
            <td className={tiposT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <input className={`${styles.inputCell}`} type='text' value={juez} onChange={(e) => setJuez(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyOk}`}>
                <input className={`${styles.inputCell}`} type='text' value={finAudiencia}
                    onChange={(e) => setFinAudiencia(e.target.value)}
                    list='finAudiencia-list' />
                <datalist id='finAudiencia-list'>
                    {desplegables && desplegables.finAudiencia.map(key => <option key={key} value={key} />)}
                </datalist>
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyOk}`}>
                <input className={`${styles.inputCell}`} type='text' value={resolucion}
                    onChange={(e) => setResolucion(e.target.value)}
                    list='resolucion-list' />
                <datalist id='resolucion-list'>
                    {desplegables && desplegables.resolucion.map(key => <option key={key} value={key} />)}
                </datalist>
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyOk}`}>
                <input className={`${styles.inputCell}`} type='text' value={resultadoControl}
                    onChange={(e) => setResultadoControl(e.target.value)}
                    list='resultadoControl-list' />
                <datalist id='resultadoControl-list'>
                    {desplegables && desplegables.resultadoControl.map(key => <option key={key} value={key} />)}
                </datalist>
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyOk}`}>
                <input className={`${styles.inputCell}`} type='text' value={indicadorUga}
                    onChange={(e) => setIndicadorUga(e.target.value)}
                    list='indicadorUga-list' />
                <datalist id='indicadorUga-list'>
                    {desplegables && desplegables.indicadorUga.map(key => <option key={key} value={key} />)}
                </datalist>
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyOk}`}>
                <input className={`${styles.inputCell}`} type='text' value={comentario} onChange={(e) => setComentario(e.target.value)} />
            </td>
        </tr></>
    )
}