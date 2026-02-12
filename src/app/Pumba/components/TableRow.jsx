'use client'
import styles from '../Pumba.module.css'
import { useState, useContext, useEffect } from 'react'
import { DataContext } from '@/context New/DataContext';
import { calculateCuartos, calculateCuartosOtros } from '@/utils/calculators';

export default function TableRow({ audData, dateToUse, autofillB, index }) {
    const { bydate, desplegables, pumaData } = useContext(DataContext);
    const [tabItem, setTabItem] = useState({})

    const [tiposT, setTiposT] = useState(true)
    const [legajo, setLegajo] = useState(pumaData.legajo || '')
    const [audTipo, setAudTipo] = useState(pumaData.audTipo || '')
    const [ufi, setUfi] = useState(pumaData.ufi || '')
    const [dyhsolicitud, setDyhsolicitud] = useState(pumaData.dyhsolicitud || '')
    const [dyhagendamiento, setDyhagendamiento] = useState(pumaData.dyhagendamiento || '')
    const [dyhnotificacion, setDyhnotificacion] = useState(pumaData.dyhnotificacion || '')
    const [dyhprogramada, setDyhprogramada] = useState(pumaData.dyhprogramada || '')
    const [dyhreal, setDyhreal] = useState(pumaData.dyhreal || '')
    const [demora, setDemora] = useState(pumaData.demora || '')
    const [motivDemora, setMotivDemora] = useState(pumaData.motivDemora || '')
    const [observDemora, setObservDemora] = useState(pumaData.observDemora || '')
    const [durReal, setDurReal] = useState(pumaData.durReal || '')
    const [cuartoPedido, setCuartoPedido] = useState(pumaData.cuartoPedido || '')
    const [cuartoReal, setCuartoReal] = useState(pumaData.cuartoReal || '')
    const [cuartoRealOtros, setCuartoRealOtros] = useState(pumaData.cuartoRealOtros || '')
    const [dyhfinalizacion, setDyhfinalizacion] = useState(pumaData.dyhfinalizacion || '')
    const [entregaResuelvo, setEntregaResuelvo] = useState(pumaData.entregaResuelvo || '')
    const [cantImputados, setCantImputados] = useState(pumaData.cantImputados || '')
    const [sala, setSala] = useState(pumaData.sala || '')
    const [operador, setOperador] = useState(pumaData.operador || '')
    const [fiscal, setFiscal] = useState(pumaData.fiscal || '')
    const [defensa, setDefensa] = useState(pumaData.defensa || '')
    const [juez, setJuez] = useState(pumaData.juez || '')
    const [finAudiencia, setFinAudiencia] = useState(pumaData.finAudiencia || '')
    const [resolucion, setResolucion] = useState(pumaData.resolucion || '')
    const [resultadoControl, setResultadoControl] = useState(pumaData.resultadoControl || '')
    const [indicadorUga, setIndicadorUga] = useState(pumaData.indicadorUga || '')
    const [comentario, setComentario] = useState(pumaData.comentario || '')

    const autoFill = () => {
        legajo === '' && audData.numeroLeg && setLegajo(audData.numeroLeg)
        audTipo === '' && audData.tipo && setAudTipo(audData.tipo + (audData.tipo2 ? ' + ' + audData.tipo2 : '') + (audData.tipo3 ? ' + ' + audData.tipo3 : ''))
        ufi === '' && audData.ufi && setUfi(audData.ufi)
        dyhsolicitud === '' && audData.dyhsolicitud && setDyhsolicitud(audData.dyhsolicitud)
        dyhagendamiento === '' && audData.dyhagendamiento && setDyhagendamiento(audData.dyhagendamiento)
        dyhnotificacion === '' && audData.fechaNotificacion && setDyhnotificacion(audData.fechaNotificacion)
        dyhprogramada === '' && audData.inicioProgramada && setDyhprogramada(audData.inicioProgramada)
        dyhreal === '' && audData.inicioReal && setDyhreal(audData.inicioReal)
        demora === '' && audData.inicioReal && audData.inicioProgramada && setDemora((parseInt(audData.inicioReal.split(':')[0]) * 60 + parseInt(audData.inicioReal.split(':')[1]))) - (parseInt(audData.inicioProgramada.split(':')[0]) * 60 + parseInt(audData.inicioProgramada.split(':')[1]))
        motivDemora === '' && audData.motivoDemora && setMotivDemora(audData.motivoDemora)
        observDemora === '' && setObservDemora('')
        durReal === '' && audData.finReal && audData.inicioReal && setDurReal(parseInt(audData.finReal.split(':')[0]) * 60 + parseInt(audData.finReal.split(':')[1]) - (parseInt(audData.inicioReal.split(':')[0]) * 60 + parseInt(audData.inicioReal.split(':')[1])))
        cuartoPedido === '' && tabItem.hitos && setCuartoPedido(tabItem.hitos.filter(el => el.includes('CUARTO_INTERMEDIO')).reduce((acc, el) => acc + parseInt(el.split(' | ')[2] || 0), 0))
        cuartoReal === '' && tabItem.hitos && setCuartoReal(calculateCuartos(tabItem.hitos))
        cuartoRealOtros === '' && tabItem.hitos && setCuartoRealOtros(calculateCuartosOtros(tabItem.hitos))
        dyhfinalizacion === '' && audData.finReal && setDyhfinalizacion(audData.finReal)
        entregaResuelvo === '' && tabItem.horaResuelvo && setEntregaResuelvo(tabItem.horaResuelvo)
        cantImputados === '' && audData.intervinientes && setCantImputados(audData.intervinientes.filter(el2 => el2.includes('IMPUTADO')).length)
        sala === '' && tabItem.sala && setSala(tabItem.sala)
        operador === '' && tabItem.operador && setOperador(tabItem.operador)
        fiscal === '' && tabItem.mpf && setFiscal(tabItem.mpf[0].nombre)
        defensa === '' && tabItem.defensa && setDefensa(tabItem.defensa[0].nombre)
        juez === '' && tabItem.juez && setJuez(tabItem.juez)
        finAudiencia === '' && audData.finReal && setFinAudiencia(audData.finReal)
        resolucion === '' && setResolucion('')
        resultadoControl === '' && setResultadoControl('')
        indicadorUga === '' && setIndicadorUga('')
        comentario === '' && setComentario('')
    }
    useEffect(() => {
        autoFill()
    }, [autofillB, tabItem])
    useEffect(() => {
        if (bydate && Array.isArray(bydate)) {
            const found = bydate.find((item) => (item.numeroLeg === audData.numeroLeg && item.hora === audData.inicioProgramada));
            setTabItem(found || {})
        }
    }, [bydate, audData])
    return (
        <><tr key={index}>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyOk}`}>
                <input className={`${styles.inputCell}`} type='text' value={legajo} onChange={(e) => setLegajo(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyPuma}`}>
                {audData.tipo + (audData.tipo2 ? ' + ' + audData.tipo2 : '') + (audData.tipo3 ? ' + ' + audData.tipo3 : '')}</td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>
                {tabItem.tipo + (tabItem.tipo2 ? ' + ' + tabItem.tipo2 : '') + (tabItem.tipo3 ? ' + ' + tabItem.tipo3 : '')}</td>
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
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>{dateToUse.slice(0, 2) + '/' + dateToUse.slice(3, 5) + '/' + dateToUse.slice(6, 10) + ' ' + (tabItem.hora || '')}</td>
            <td className={tiposT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <input className={`${styles.inputCell}`} type='text' value={dyhprogramada} onChange={(e) => setDyhprogramada(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyPuma}`}>{audData.inicioReal}</td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>{tabItem.hitos && tabItem.hitos.length > 0 && (dateToUse.slice(0, 2) + '/' + dateToUse.slice(3, 5) + '/' + dateToUse.slice(6, 10) + ' ' + tabItem.hitos[0].split(' | ')[0])}</td>
            <td className={tiposT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <input className={`${styles.inputCell}`} type='text' value={dyhreal} onChange={(e) => setDyhreal(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyPuma}`}>
                {audData.inicioReal && audData.inicioProgramada && (parseInt(audData.inicioReal.split(':')[0]) * 60 + parseInt(audData.inicioReal.split(':')[1]) - (parseInt(audData.inicioProgramada.split(':')[0]) * 60 + parseInt(audData.inicioProgramada.split(':')[1])))}</td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>
                {tabItem.hitos && tabItem.hitos.length > 0 && tabItem.hora && (parseInt((tabItem.hitos[0].split(' | ')[0].split(':')[0]) * 60 + parseInt(tabItem.hitos[0].split(' | ')[0].split(':')[1])) - (parseInt(tabItem.hora.split(':')[0]) * 60 + parseInt(tabItem.hora.split(':')[1])))}</td>
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
                {audData.finProgramada && audData.inicioProgramada && (parseInt(audData.finProgramada.split(':')[0]) * 60 + parseInt(audData.finProgramada.split(':')[1]) - (parseInt(audData.inicioProgramada.split(':')[0]) * 60 + parseInt(audData.inicioProgramada.split(':')[1])))}</td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>
                {tabItem.horaProgramada}</td>
            <td className={tiposT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <input className={`${styles.inputCell}`} type='text' value={motivDemora} onChange={(e) => setMotivDemora(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyPuma}`}>
                {audData.finReal && audData.inicioReal && (parseInt(audData.finReal.split(':')[0]) * 60 + parseInt(audData.finReal.split(':')[1]) - (parseInt(audData.inicioReal.split(':')[0]) * 60 + parseInt(audData.inicioReal.split(':')[1])))}</td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>
                {tabItem.hitos && tabItem.hitos.some(el => el.includes('FINALIZADA')) && tabItem.hitos.length > 0 && (parseInt((tabItem.hitos.find(el => el.includes('FINALIZADA')).split(' | ')[0].split(':')[0])) * 60 + parseInt(tabItem.hitos.find(el => el.includes('FINALIZADA')).split(' | ')[0].split(':')[1])) - ((parseInt(tabItem.hitos[0].split(':')[0])) * 60 + parseInt(tabItem.hitos[0].split(':')[1]))}</td>
            <td className={tiposT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <input className={`${styles.inputCell}`} type='text' value={durReal} onChange={(e) => setDurReal(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>
                {tabItem.hitos && tabItem.hitos.filter(el => el.includes('CUARTO_INTERMEDIO')).reduce((acc, el) => acc + parseInt(el.split(' | ')[2] || 0), 0)}</td>
            <td className={tiposT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <input className={`${styles.inputCell}`} type='text' value={cuartoPedido} onChange={(e) => setCuartoPedido(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>
                {tabItem.hitos && tabItem.hitos.filter(el => el.includes('FINALIZADA')).reduce((acc, el) => acc + parseInt(el.split(' | ')[2] || 0), 0)}</td>
            <td className={tiposT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <input className={`${styles.inputCell}`} type='text' value={cuartoPedido} onChange={(e) => setCuartoPedido(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>
                {tabItem.hitos && calculateCuartos(tabItem.hitos)}</td>
            <td className={tiposT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <input className={`${styles.inputCell}`} type='text' value={cuartoReal} onChange={(e) => setCuartoReal(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>
                {tabItem.hitos && calculateCuartosOtros(tabItem.hitos)}</td>
            <td className={tiposT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <input className={`${styles.inputCell}`} type='text' value={cuartoRealOtros} onChange={(e) => setCuartoRealOtros(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyPuma}`}>
                {audData.finReal && audData.finReal}</td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>
                {tabItem.hitos && tabItem.hitos.some(el => el.includes('FINALIZADA')) && tabItem.hitos.find(el => el.includes('FINALIZADA')).split(' | ')[0]}</td>
            <td className={tiposT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <input className={`${styles.inputCell}`} type='text' value={dyhfinalizacion} onChange={(e) => setDyhfinalizacion(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>
                {tabItem.horaResuelvo && tabItem.horaResuelvo}</td>
            <td className={tiposT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <input className={`${styles.inputCell}`} type='text' value={entregaResuelvo} onChange={(e) => setEntregaResuelvo(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyPuma}`}>
                {audData.intervinientes && audData.intervinientes.filter(el => el.includes('IMPUTADO')).length}</td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>
                {tabItem.imputado && tabItem.imputado.length}</td>
            <td className={tiposT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <input className={`${styles.inputCell}`} type='text' value={cantImputados} onChange={(e) => setCantImputados(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyPuma}`}>
                {audData.sala && audData.sala}</td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>
                {tabItem.sala && tabItem.sala}</td>
            <td className={tiposT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <input className={`${styles.inputCell}`} type='text' value={sala} onChange={(e) => setSala(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyPuma}`}>
                {audData.operador && audData.operador}</td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>
                {tabItem.operador && tabItem.operador}</td>
            <td className={tiposT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <input className={`${styles.inputCell}`} type='text' value={operador} onChange={(e) => setOperador(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyPuma}`}>
                {audData.intervinientes && audData.intervinientes.find(el => el.includes('FISCAL'))}</td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>
                {tabItem.mpf && tabItem.mpf[0].nombre}</td>
            <td className={tiposT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <input className={`${styles.inputCell}`} type='text' value={fiscal} onChange={(e) => setFiscal(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyPuma}`}>
                {audData.intervinientes && audData.intervinientes.find(el => el.includes('DEFENSA'))}</td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>
                {tabItem.defensa && tabItem.defensa[0].nombre}</td>
            <td className={tiposT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <input className={`${styles.inputCell}`} type='text' value={defensa} onChange={(e) => setDefensa(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyPuma}`}>
                {audData.jueces && audData.jueces[0]}</td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>
                {tabItem.juez && tabItem.juez}</td>
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