'use client'
import styles from '../Pumba.module.css'
import { useState, useContext, useEffect, useRef } from 'react'
import { DataContext } from '@/context/DataContext';
import { calculateCuartos, calculateCuartosOtros } from '@/utils/calculators';
import ShowTextOver from './ShowTextOver';
import { removeHtmlTags } from '@/utils/removeHtmlTags';
import { formatDefensa } from '@/utils/genderUtils';

export default function TableRow({ audData, dateToUse, autofillB, index, onStatusChange, forceSave }) {
    const { bydate, desplegables, addUALData, UALData } = useContext(DataContext);
    const [tabItem, setTabItem] = useState({})
    const [toSave, setToSave] = useState(false)
    const [doSave, setDoSAve] = useState(false)
    const hasInitialSync = useRef(false)

    const rowKey = `${audData.numeroLeg}_${audData.inicioProgramada}`;

    useEffect(() => {
        if (onStatusChange) {
            onStatusChange(rowKey, toSave);
        }
    }, [toSave, rowKey]);

    useEffect(() => {
        if (forceSave && toSave) {
            setDoSAve(true);
        }
    }, [forceSave, toSave]);

    const savedData = UALData && Array.isArray(UALData)
        ? (UALData.find(item => item.numeroLeg === audData.numeroLeg && item.inicioProgramada === audData.inicioProgramada) || {})
        : {};

    const [legajo, setLegajo] = useState(savedData.legajo || audData.legajo || '')
    const [audTipo, setAudTipo] = useState(savedData.audTipo || audData.audTipo || '')
    const [ufi, setUfi] = useState(savedData.ufi || '')
    const [dyhsolicitud, setDyhsolicitud] = useState(savedData.dyhsolicitud || audData.dyhsolicitud || '')
    const [dyhagendamiento, setDyhagendamiento] = useState(savedData.dyhagendamiento || audData.dyhagendamiento || '')
    const [dyhnotificacion, setDyhnotificacion] = useState(savedData.dyhnotificacion || audData.fechaNotificacion || '')
    const [dyhprogramada, setDyhprogramada] = useState(savedData.dyhprogramada || (audData.dyhprogramada && (dateToUse.slice(0, 2) + '/' + dateToUse.slice(2, 4) + '/' + dateToUse.slice(6, 8) + ' ' + audData.dyhprogramada)) || '')
    const [dyhreal, setDyhreal] = useState(savedData.dyhreal || (audData.dyhreal && (dateToUse.slice(0, 2) + '/' + dateToUse.slice(2, 4) + '/' + dateToUse.slice(6, 8) + ' ' + audData.dyhreal)) || '')
    const [demora, setDemora] = useState(savedData.demora !== undefined && savedData.demora !== '' ? savedData.demora : (audData.demora || ''))
    const [motivDemora, setMotivDemora] = useState(savedData.motivDemora || audData.motivDemora || '')
    const [observDemora, setObservDemora] = useState(savedData.observDemora || audData.observDemora || '')
    const [duracionProgramada, setDuracionProgramada] = useState(savedData.duracionProgramada !== undefined && savedData.duracionProgramada !== '' ? savedData.duracionProgramada : (audData.duracionProgramada || ''))
    const [durReal, setDurReal] = useState(savedData.durReal !== undefined && savedData.durReal !== '' ? savedData.durReal : (audData.durReal || ''))
    const [cuartoPedido, setCuartoPedido] = useState(savedData.cuartoPedido !== undefined && savedData.cuartoPedido !== '' ? savedData.cuartoPedido : (audData.cuartoPedido || ''))
    const [cuartoReal, setCuartoReal] = useState(savedData.cuartoReal !== undefined && savedData.cuartoReal !== '' ? savedData.cuartoReal : (audData.cuartoReal || ''))
    const [cuartoRealOtros, setCuartoRealOtros] = useState(savedData.cuartoRealOtros !== undefined && savedData.cuartoRealOtros !== '' ? savedData.cuartoRealOtros : (audData.cuartoRealOtros || ''))
    const [dyhfinalizacion, setDyhfinalizacion] = useState(savedData.dyhfinalizacion || (audData.dyhfinalizacion && (dateToUse.slice(0, 2) + '/' + dateToUse.slice(2, 4) + '/' + dateToUse.slice(6, 8) + ' ' + audData.finReal)) || '')
    const [entregaResuelvo, setEntregaResuelvo] = useState(savedData.entregaResuelvo || '')
    const [finalizadaMinuta, setFinalizadaMinuta] = useState(savedData.finalizadaMinuta || (audData.finalizadaMinuta && audData.finalizadaMinuta.split(' ')[1]) || '')
    const [cantImputados, setCantImputados] = useState(savedData.cantImputados !== undefined && savedData.cantImputados !== '' ? savedData.cantImputados : (audData.cantImputados || ''))
    const [tipoVictima, setTipoVictima] = useState(savedData.tipoVictima || audData.tipoVictima || '')
    const [sala, setSala] = useState(savedData.sala || audData.sala || '')
    const [operador, setOperador] = useState(savedData.operador || audData.operador || '')
    const [fiscal, setFiscal] = useState(savedData.fiscal || audData.fiscal || '')
    const [defensa, setDefensa] = useState(savedData.defensa || audData.defensa || '')
    const [juez, setJuez] = useState(savedData.juez || audData.juez || '')
    const [finAudiencia, setFinAudiencia] = useState(savedData.finAudiencia || audData.finAudiencia || '')
    const [resolucion, setResolucion] = useState(savedData.resolucion || audData.resolucion || '')
    const [resultadoControl, setResultadoControl] = useState(savedData.resultadoControl || audData.resultadoControl || '')
    const [indicadorUga, setIndicadorUga] = useState(savedData.indicadorUga || audData.indicadorUga || '')
    const [comentario, setComentario] = useState(savedData.comentario || audData.comentario || '')
    const [completado, setCompletado] = useState(savedData.completado || false)
    const [expandValue, setExpandValue] = useState(false)

    const [legajoT, setLegajoT] = useState(true)
    const [tiposT, setTiposT] = useState(true)
    const [ufiT, setUfiT] = useState(true)
    const [dyhsolicitudT, setDyhsolicitudT] = useState(true)
    const [dyhagendamientoT, setDyhagendamientoT] = useState(true)
    const [dyhnotificacionT, setDyhnotificacionT] = useState(true)
    const [dyhprogramadaT, setDyhprogramadaT] = useState(true)
    const [dyhrealT, setDyhrealT] = useState(true)
    const [demoraT, setDemoraT] = useState(true)
    const [duracionProgramadaT, setDuracionProgramadaT] = useState(true)
    const [durRealT, setDurRealT] = useState(true)
    const [cuartoPedidoT, setCuartoPedidoT] = useState(true)
    const [cuartoRealT, setCuartoRealT] = useState(true)
    const [cuartoRealOtrosT, setCuartoRealOtrosT] = useState(true)
    const [dyhfinalizacionT, setDyhfinalizacionT] = useState(true)
    const [entregaResuelvoT, setEntregaResuelvoT] = useState(true)
    const [finalizadaMinutaT, setFinalizadaMinutaT] = useState(true)
    const [cantImputadosT, setCantImputadosT] = useState(true)
    const [tipoVictimaT, setTipoVictimaT] = useState(true)
    const [salaT, setSalaT] = useState(true)
    const [operadorT, setOperadorT] = useState(true)
    const [fiscalT, setFiscalT] = useState(true)
    const [defensaT, setDefensaT] = useState(true)
    const [juezT, setJuezT] = useState(true)
    const [finAudienciaT, setFinAudienciaT] = useState(true)
    const [resolucionT, setResolucionT] = useState(true)
    const [resultadoControlT, setResultadoControlT] = useState(true)

    const autoFill = () => {
        legajo === '' && (savedData.legajo ? setLegajo(savedData.legajo) : audData.numeroLeg && setLegajo(audData.numeroLeg))
        audTipo === '' && (savedData.audTipo ? setAudTipo(savedData.audTipo) : audData.tipo && setAudTipo(audData.tipo + (audData.tipo2 ? ' ' + audData.tipo2 : '') + (audData.tipo3 ? ' ' + audData.tipo3 : '')))
        ufi === '' && (savedData.ufi ? setUfi(savedData.ufi) : tabItem.ufi && setUfi(tabItem.ufi))
        dyhsolicitud === '' && (savedData.dyhsolicitud ? setDyhsolicitud(savedData.dyhsolicitud) : audData.dyhsolicitud && setDyhsolicitud(audData.dyhsolicitud))
        dyhagendamiento === '' && (savedData.dyhagendamiento ? setDyhagendamiento(savedData.dyhagendamiento) : audData.dyhagendamiento && setDyhagendamiento(audData.dyhagendamiento))
        dyhnotificacion === '' && (savedData.dyhnotificacion ? setDyhnotificacion(savedData.dyhnotificacion) : audData.fechaNotificacion && setDyhnotificacion(audData.fechaNotificacion))
        dyhprogramada === '' && (savedData.dyhprogramada ? setDyhprogramada(savedData.dyhprogramada) : audData.inicioProgramada && setDyhprogramada(dateToUse.slice(0, 2) + '/' + dateToUse.slice(2, 4) + '/' + dateToUse.slice(6, 8) + ' ' + audData.inicioProgramada))
        dyhreal === '' && (savedData.dyhreal ? setDyhreal(savedData.dyhreal) : audData.inicioReal && setDyhreal(dateToUse.slice(0, 2) + '/' + dateToUse.slice(2, 4) + '/' + dateToUse.slice(6, 8) + ' ' + audData.inicioReal))
        demora === '' && (savedData.demora !== undefined && savedData.demora !== '' ? setDemora(savedData.demora) : audData.inicioReal && audData.inicioProgramada && setDemora((parseInt(audData.inicioReal.split(':')[0]) * 60 + parseInt(audData.inicioReal.split(':')[1])) - (parseInt(audData.inicioProgramada.split(':')[0]) * 60 + parseInt(audData.inicioProgramada.split(':')[1]))))
        duracionProgramada === '' && (savedData.duracionProgramada !== undefined && savedData.duracionProgramada !== '' ? setDuracionProgramada(savedData.duracionProgramada) : audData.inicioProgramada && audData.finProgramada && setDuracionProgramada((parseInt(audData.finProgramada.split(':')[0]) * 60 + parseInt(audData.finProgramada.split(':')[1])) - (parseInt(audData.inicioProgramada.split(':')[0]) * 60 + parseInt(audData.inicioProgramada.split(':')[1]))))
        durReal === '' && (savedData.durReal !== undefined && savedData.durReal !== '' ? setDurReal(savedData.durReal) : audData.finReal && audData.inicioReal && setDurReal(parseInt(audData.finReal.split(':')[0]) * 60 + parseInt(audData.finReal.split(':')[1]) - (parseInt(audData.inicioReal.split(':')[0]) * 60 + parseInt(audData.inicioReal.split(':')[1]))))
        cuartoPedido === '' && (savedData.cuartoPedido !== undefined && savedData.cuartoPedido !== '' ? setCuartoPedido(savedData.cuartoPedido) : tabItem.hitos && setCuartoPedido(tabItem.hitos.filter(el => el.includes('CUARTO_INTERMEDIO')).reduce((acc, el) => acc + parseInt(el.split(' | ')[2] || 0), 0)))
        cuartoReal === '' && (savedData.cuartoReal !== undefined && savedData.cuartoReal !== '' ? setCuartoReal(savedData.cuartoReal) : tabItem.hitos && setCuartoReal(calculateCuartos(tabItem.hitos)))
        cuartoRealOtros === '' && (savedData.cuartoRealOtros !== undefined && savedData.cuartoRealOtros !== '' ? setCuartoRealOtros(savedData.cuartoRealOtros) : tabItem.hitos && setCuartoRealOtros(calculateCuartosOtros(tabItem.hitos)))
        dyhfinalizacion === '' && (savedData.dyhfinalizacion ? setDyhfinalizacion(savedData.dyhfinalizacion) : audData.finReal && setDyhfinalizacion(dateToUse.slice(0, 2) + '/' + dateToUse.slice(2, 4) + '/' + dateToUse.slice(6, 8) + ' ' + audData.finReal))
        entregaResuelvo === '' && (savedData.entregaResuelvo ? setEntregaResuelvo(savedData.entregaResuelvo) : tabItem.resuelvo && setEntregaResuelvo(tabItem.resuelvo))
        finalizadaMinuta === '' && (savedData.finalizadaMinuta ? setFinalizadaMinuta(savedData.finalizadaMinuta) : audData.finalizadaMinuta && setFinalizadaMinuta(audData.finalizadaMinuta.split(' ')[1]))
        cantImputados === '' && (savedData.cantImputados !== undefined && savedData.cantImputados !== '' ? setCantImputados(savedData.cantImputados) : audData.intervinientes && setCantImputados(audData.intervinientes.filter(el2 => el2.includes('IMPUTADO')).length))
        sala === '' && (savedData.sala ? setSala(savedData.sala) : tabItem.sala && setSala(tabItem.sala))
        operador === '' && (savedData.operador ? setOperador(savedData.operador) : tabItem.operador && setOperador(tabItem.operador))
        fiscal === '' && (savedData.fiscal ? setFiscal(savedData.fiscal) : tabItem.mpf && tabItem.mpf.length > 0 && setFiscal(tabItem.mpf[0].nombre))
        defensa === '' && (savedData.defensa ? setDefensa(savedData.defensa) : tabItem.defensa && tabItem.defensa.length > 0 && setDefensa(formatDefensa(tabItem.defensa[0])))
        juez === '' && (savedData.juez ? setJuez(savedData.juez) : tabItem.juez && setJuez(tabItem.juez))
        finAudiencia === '' && (savedData.finAudiencia ? setFinAudiencia(savedData.finAudiencia) : audData.finAudiencia && setFinAudiencia(audData.finAudiencia))
    }
    const checkForDiff = () => {
        if (legajo !== tabItem.numeroLeg || legajo === '') setLegajoT(false)
        else setLegajoT(true)
        if (audTipo !== tabItem.tipo + (tabItem.tipo2 ? ' ' + tabItem.tipo2 : '') + (tabItem.tipo3 ? ' ' + tabItem.tipo3 : '') || audTipo === '') setTiposT(false)
        else setTiposT(true)
        if (ufi !== tabItem.ufi || ufi === '') setUfiT(false)
        else setUfiT(true)
        if (dyhsolicitud !== audData.dyhsolicitud || dyhsolicitud === '') setDyhsolicitudT(false)
        else setDyhsolicitudT(true)
        if (dyhagendamiento !== audData.dyhagendamiento || dyhagendamiento === '') setDyhagendamientoT(false)
        else setDyhagendamientoT(true)
        if (dyhnotificacion !== audData.fechaNotificacion || dyhnotificacion === '') setDyhnotificacionT(false)
        else setDyhnotificacionT(true)
        if (dyhprogramada !== (dateToUse.slice(0, 2) + '/' + dateToUse.slice(2, 4) + '/' + dateToUse.slice(6, 8) + ' ' + audData.inicioProgramada) || dyhprogramada === '') setDyhprogramadaT(false)
        else setDyhprogramadaT(true)
        if (dyhreal !== (dateToUse.slice(0, 2) + '/' + dateToUse.slice(2, 4) + '/' + dateToUse.slice(6, 8) + ' ' + audData.inicioReal) || dyhreal === '') setDyhrealT(false)
        else setDyhrealT(true)
        if ((demora - tabItem.demora > 5) || (demora - tabItem.demora < -5) || demora === '') setDemoraT(false)
        else setDemoraT(true)
        if ((duracionProgramada - tabItem.duracionProgramada > 5) || (duracionProgramada - tabItem.duracionProgramada < -5) || duracionProgramada === '') setDuracionProgramadaT(false)
        else setDuracionProgramadaT(true)
        if ((durReal - tabItem.durReal > 5) || (durReal - tabItem.durReal < -5) || durReal === '') setDurRealT(false)
        else setDurRealT(true)
        if (cuartoPedido !== (tabItem.hitos && tabItem.hitos.filter(el => el.includes('CUARTO_INTERMEDIO')).reduce((acc, el) => acc + parseInt(el.split(' | ')[2] || 0), 0)) || cuartoPedido === '') setCuartoPedidoT(false)
        else setCuartoPedidoT(true)
        if (cuartoReal !== (tabItem.hitos && calculateCuartos(tabItem.hitos)) || cuartoReal === '') setCuartoRealT(false)
        else setCuartoRealT(true)
        if (cuartoRealOtros !== (tabItem.hitos && calculateCuartosOtros(tabItem.hitos)) || cuartoRealOtros === '') setCuartoRealOtrosT(false)
        else setCuartoRealOtrosT(true)
        if (dyhfinalizacion !== (dateToUse.slice(0, 2) + '/' + dateToUse.slice(2, 4) + '/' + dateToUse.slice(6, 8) + ' ' + audData.finReal) || dyhfinalizacion === '') setDyhfinalizacionT(false)
        else setDyhfinalizacionT(true)
        if (entregaResuelvo !== tabItem.resuelvo || entregaResuelvo === '') setEntregaResuelvoT(false)
        else setEntregaResuelvoT(true)
        if (cantImputados !== (tabItem.imputado && tabItem.imputado.length) || cantImputados === '') setCantImputadosT(false)
        else setCantImputadosT(true)
        if (tipoVictima !== tabItem.tipoVictima || tipoVictima === '') setTipoVictimaT(false)
        else setTipoVictimaT(true)
        if (sala !== tabItem.sala || sala === '') setSalaT(false)
        else setSalaT(true)
        if (operador === '') setOperadorT(false)
        else setOperadorT(true)
        if (fiscal === '') setFiscalT(false)
        else setFiscalT(true)
        if (defensa === '') setDefensaT(false)
        else setDefensaT(true)
        if (juez === '') setJuezT(false)
        else setJuezT(true)
        if (finAudiencia !== tabItem.finAudiencia || finAudiencia === '') setFinAudienciaT(false)
        else setFinAudienciaT(true)
        if (resolucion !== tabItem.resolucion || resolucion === '') setResolucionT(false)
        else setResolucionT(true)
        if (resultadoControl !== tabItem.resultadoControl || resultadoControl === '') setResultadoControlT(false)
        else setResultadoControlT(true)
    }
    const checkChanges = () => {
        const hasChanges = (
            legajo !== (savedData.legajo || '') ||
            audTipo !== (savedData.audTipo || '') ||
            ufi !== (savedData.ufi || '') ||
            dyhsolicitud !== (savedData.dyhsolicitud || '') ||
            dyhagendamiento !== (savedData.dyhagendamiento || '') ||
            dyhnotificacion !== (savedData.dyhnotificacion || '') ||
            dyhprogramada !== (savedData.dyhprogramada || '') ||
            dyhreal !== (savedData.dyhreal || '') ||
            String(demora) !== String(savedData.demora ?? '') ||
            motivDemora !== (savedData.motivDemora || '') ||
            observDemora !== (savedData.observDemora || '') ||
            String(duracionProgramada) !== String(savedData.duracionProgramada ?? '') ||
            String(durReal) !== String(savedData.durReal ?? '') ||
            String(cuartoPedido) !== String(savedData.cuartoPedido ?? '') ||
            String(cuartoReal) !== String(savedData.cuartoReal ?? '') ||
            String(cuartoRealOtros) !== String(savedData.cuartoRealOtros ?? '') ||
            dyhfinalizacion !== (savedData.dyhfinalizacion || '') ||
            entregaResuelvo !== (savedData.entregaResuelvo || '') ||
            finalizadaMinuta !== (savedData.finalizadaMinuta || '') ||
            String(cantImputados) !== String(savedData.cantImputados ?? '') ||
            tipoVictima !== (savedData.tipoVictima || '') ||
            sala !== (savedData.sala || '') ||
            operador !== (savedData.operador || '') ||
            fiscal !== (savedData.fiscal || '') ||
            defensa !== (savedData.defensa || '') ||
            juez !== (savedData.juez || '') ||
            finAudiencia !== (savedData.finAudiencia || '') ||
            resolucion !== (savedData.resolucion || '') ||
            resultadoControl !== (savedData.resultadoControl || '') ||
            indicadorUga !== (savedData.indicadorUga || '') ||
            comentario !== (savedData.comentario || '') ||
            completado !== (savedData.completado || false)
        )
        if (hasInitialSync.current) {
            setToSave(hasChanges)
        }
    }
    useEffect(() => {
        autoFill()
    }, [autofillB, tabItem, UALData])
    useEffect(() => {
        if (bydate && Array.isArray(bydate)) {
            const found = bydate.find((item) => (item.numeroLeg === audData.numeroLeg && item.hora === audData.inicioProgramada));
            setTabItem(found || {})
        }
    }, [bydate, audData])
    useEffect(() => {
        tabItem && checkForDiff()
    }, [legajo, audTipo, ufi, dyhsolicitud, dyhagendamiento, dyhnotificacion, dyhprogramada, dyhreal, demora, duracionProgramada, durReal, cuartoPedido, cuartoReal, cuartoRealOtros, dyhfinalizacion, entregaResuelvo, cantImputados, tipoVictima, sala, operador, fiscal, defensa, juez, finAudiencia, resolucion, resultadoControl, indicadorUga, comentario, completado, tabItem])
    useEffect(() => {
        if (savedData && Object.keys(savedData).length > 0) {
            setLegajo(savedData.legajo || '')
            setAudTipo(savedData.audTipo || '')
            setUfi(savedData.ufi || '')
            setDyhsolicitud(savedData.dyhsolicitud || '')
            setDyhagendamiento(savedData.dyhagendamiento || '')
            setDyhnotificacion(savedData.dyhnotificacion || '')
            setDyhprogramada(savedData.dyhprogramada || '')
            setDyhreal(savedData.dyhreal || '')
            setDemora(savedData.demora !== undefined && savedData.demora !== '' ? savedData.demora : '')
            setMotivDemora(savedData.motivDemora || '')
            setObservDemora(savedData.observDemora || '')
            setDuracionProgramada(savedData.duracionProgramada !== undefined && savedData.duracionProgramada !== '' ? savedData.duracionProgramada : '')
            setDurReal(savedData.durReal !== undefined && savedData.durReal !== '' ? savedData.durReal : '')
            setCuartoPedido(savedData.cuartoPedido !== undefined && savedData.cuartoPedido !== '' ? savedData.cuartoPedido : '')
            setCuartoReal(savedData.cuartoReal !== undefined && savedData.cuartoReal !== '' ? savedData.cuartoReal : '')
            setCuartoRealOtros(savedData.cuartoRealOtros !== undefined && savedData.cuartoRealOtros !== '' ? savedData.cuartoRealOtros : '')
            setDyhfinalizacion(savedData.dyhfinalizacion || '')
            setEntregaResuelvo(savedData.entregaResuelvo || '')
            setFinalizadaMinuta(savedData.finalizadaMinuta || '')
            setCantImputados(savedData.cantImputados !== undefined && savedData.cantImputados !== '' ? savedData.cantImputados : '')
            setTipoVictima(savedData.tipoVictima || '')
            setSala(savedData.sala || '')
            setOperador(savedData.operador || '')
            setFiscal(savedData.fiscal || '')
            setDefensa(savedData.defensa || '')
            setJuez(savedData.juez || '')
            setFinAudiencia(savedData.finAudiencia || '')
            setResolucion(savedData.resolucion || '')
            setResultadoControl(savedData.resultadoControl || '')
            setIndicadorUga(savedData.indicadorUga || '')
            setComentario(savedData.comentario || '')
            setCompletado(savedData.completado || false)

            hasInitialSync.current = true;
        } else if (UALData && Array.isArray(UALData)) {
            // UALData is loaded but this row is not in it (empty day or new row)
            hasInitialSync.current = true;
        }
    }, [savedData, UALData])
    useEffect(() => {
        checkChanges()
    }, [legajo, audTipo, ufi, dyhsolicitud, dyhagendamiento, dyhnotificacion, dyhprogramada, dyhreal, demora, motivDemora, observDemora, duracionProgramada, durReal, cuartoPedido, cuartoReal, cuartoRealOtros, dyhfinalizacion, entregaResuelvo, finalizadaMinuta, cantImputados, tipoVictima, sala, operador, fiscal, defensa, juez, finAudiencia, resolucion, resultadoControl, indicadorUga, comentario, completado, savedData])
    useEffect(() => {
        const saveRow = async () => {
            if (doSave) {
                const key = `${audData.numeroLeg}_${audData.inicioProgramada}`
                const dataToSave = {
                    numeroLeg: audData.numeroLeg,
                    inicioProgramada: audData.inicioProgramada,
                    legajo, audTipo, ufi, dyhsolicitud, dyhagendamiento, dyhnotificacion,
                    dyhprogramada, dyhreal, demora, motivDemora, observDemora,
                    duracionProgramada, durReal, cuartoPedido, cuartoReal, cuartoRealOtros,
                    dyhfinalizacion, entregaResuelvo, finalizadaMinuta, cantImputados,
                    tipoVictima, sala, operador, fiscal, defensa, juez,
                    finAudiencia, resolucion, resultadoControl, indicadorUga, comentario, completado
                }
                await addUALData(dateToUse, rowKey, dataToSave)
                setDoSAve(false)
                setToSave(false)
            }
        }
        saveRow()
    }, [doSave])
    return (
        <><tr className={completado ? `${styles.tableRow} ${styles.tableRowCompleted}` : `${styles.tableRow}`} key={index}>
            <td className={legajoT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <textarea className={`${styles.inputCell}`} value={legajo} onChange={(e) => setLegajo(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyPuma}`}>
                {audData.tipo + (audData.tipo2 ? ' ' + audData.tipo2 : '') + (audData.tipo3 ? ' ' + audData.tipo3 : '')}</td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>
                {tabItem.tipo + (tabItem.tipo2 ? ' ' + tabItem.tipo2 : '') + (tabItem.tipo3 ? ' ' + tabItem.tipo3 : '')}</td>
            <td className={tiposT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <textarea className={`${styles.inputCell}`} value={audTipo} onChange={(e) => setAudTipo(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyPuma}`}>{audData.ufi}</td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>{tabItem.ufi}</td>
            <td className={ufiT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <textarea className={`${styles.inputCell}`} value={ufi} onChange={(e) => setUfi(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>{audData.dyhsolicitud}</td>
            <td className={dyhsolicitudT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <textarea className={`${styles.inputCell}`} value={dyhsolicitud} onChange={(e) => setDyhsolicitud(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>{audData.dyhagendamiento}</td>
            <td className={dyhagendamientoT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <textarea className={`${styles.inputCell}`} value={dyhagendamiento} onChange={(e) => setDyhagendamiento(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>{audData.fechaNotificacion}</td>
            <td className={dyhnotificacionT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <textarea className={`${styles.inputCell}`} value={dyhnotificacion} onChange={(e) => setDyhnotificacion(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyPuma}`}>{dateToUse.slice(0, 2) + '/' + dateToUse.slice(3, 5) + '/' + dateToUse.slice(6, 10) + ' ' + audData.inicioProgramada}</td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>{dateToUse.slice(0, 2) + '/' + dateToUse.slice(3, 5) + '/' + dateToUse.slice(6, 10) + ' ' + (tabItem.hora || '')}</td>
            <td className={dyhprogramadaT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <textarea className={`${styles.inputCell}`} value={dyhprogramada} onChange={(e) => setDyhprogramada(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyPuma}`}>{dateToUse.slice(0, 2) + '/' + dateToUse.slice(3, 5) + '/' + dateToUse.slice(6, 10) + ' ' + audData.inicioReal}</td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>{tabItem.hitos && tabItem.hitos.length > 0 && (dateToUse.slice(0, 2) + '/' + dateToUse.slice(3, 5) + '/' + dateToUse.slice(6, 10) + ' ' + tabItem.hitos[0].split(' | ')[0])}</td>
            <td className={dyhrealT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <textarea className={`${styles.inputCell}`} value={dyhreal} onChange={(e) => setDyhreal(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyPuma}`}>
                {audData.inicioReal && audData.inicioProgramada && (parseInt(audData.inicioReal.split(':')[0]) * 60 + parseInt(audData.inicioReal.split(':')[1]) - (parseInt(audData.inicioProgramada.split(':')[0]) * 60 + parseInt(audData.inicioProgramada.split(':')[1])))}</td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>
                {tabItem.hitos && tabItem.hitos.length > 0 && tabItem.hora && (parseInt((tabItem.hitos[0].split(' | ')[0].split(':')[0]) * 60 + parseInt(tabItem.hitos[0].split(' | ')[0].split(':')[1])) - (parseInt(tabItem.hora.split(':')[0]) * 60 + parseInt(tabItem.hora.split(':')[1])))}</td>
            <td className={demoraT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <textarea className={`${styles.inputCell}`} value={demora} onChange={(e) => setDemora(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyPuma}`}>
                {audData.motivoDemora}</td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>
                {tabItem.razonDemora}</td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyOk}`}>
                <textarea className={`${styles.inputCell}`} value={motivDemora} onChange={(e) => setMotivDemora(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyOk}`}>
                <textarea className={`${styles.inputCell}`} value={observDemora} onChange={(e) => setObservDemora(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyPuma}`}>
                {audData.finProgramada && audData.inicioProgramada && (parseInt(audData.finProgramada.split(':')[0]) * 60 + parseInt(audData.finProgramada.split(':')[1]) - (parseInt(audData.inicioProgramada.split(':')[0]) * 60 + parseInt(audData.inicioProgramada.split(':')[1])))}</td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>
                {tabItem.horaProgramada}</td>
            <td className={duracionProgramadaT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <textarea className={`${styles.inputCell}`} value={duracionProgramada} onChange={(e) => setDuracionProgramada(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyPuma}`}>
                {audData.finReal && audData.inicioReal && (parseInt(audData.finReal.split(':')[0]) * 60 + parseInt(audData.finReal.split(':')[1]) - (parseInt(audData.inicioReal.split(':')[0]) * 60 + parseInt(audData.inicioReal.split(':')[1])))}</td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>
                {tabItem.hitos && tabItem.hitos.some(el => el.includes('FINALIZADA')) && tabItem.hitos.length > 0 && (parseInt((tabItem.hitos.find(el => el.includes('FINALIZADA')).split(' | ')[0].split(':')[0])) * 60 + parseInt(tabItem.hitos.find(el => el.includes('FINALIZADA')).split(' | ')[0].split(':')[1])) - ((parseInt(tabItem.hitos[0].split(':')[0])) * 60 + parseInt(tabItem.hitos[0].split(':')[1]))}</td>
            <td className={durRealT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <textarea className={`${styles.inputCell}`} value={durReal} onChange={(e) => setDurReal(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>
                {tabItem.hitos && tabItem.hitos.filter(el => el.includes('CUARTO_INTERMEDIO')).reduce((acc, el) => acc + parseInt(el.split(' | ')[2] || 0), 0)}</td>
            <td className={cuartoPedidoT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <textarea className={`${styles.inputCell}`} value={cuartoPedido} onChange={(e) => setCuartoPedido(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>
                {tabItem.hitos && calculateCuartos(tabItem.hitos)}</td>
            <td className={cuartoRealT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <textarea className={`${styles.inputCell}`} value={cuartoReal} onChange={(e) => setCuartoReal(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>
                {tabItem.hitos && calculateCuartosOtros(tabItem.hitos)}</td>
            <td className={cuartoRealOtrosT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <textarea className={`${styles.inputCell}`} value={cuartoRealOtros} onChange={(e) => setCuartoRealOtros(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyPuma}`}>
                {audData.finReal && audData.finReal}</td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>
                {tabItem.hitos && tabItem.hitos.some(el => el.includes('FINALIZADA')) && tabItem.hitos.find(el => el.includes('FINALIZADA')).split(' | ')[0]}</td>
            <td className={dyhfinalizacionT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <textarea className={`${styles.inputCell}`} value={dyhfinalizacion} onChange={(e) => setDyhfinalizacion(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyPuma}`}>
                {tabItem.resuelvo && tabItem.resuelvo}</td>
            <td className={entregaResuelvoT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <textarea className={`${styles.inputCell}`} value={entregaResuelvo} onChange={(e) => setEntregaResuelvo(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyPuma}`}>
                {audData.finalizadaMinuta && audData.finalizadaMinuta.split(' ')[1]}</td>
            <td className={finalizadaMinutaT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <textarea className={`${styles.inputCell}`} value={finalizadaMinuta} onChange={(e) => setFinalizadaMinuta(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyPuma}`}>
                {audData.intervinientes && audData.intervinientes.filter(el => el.includes('IMPUTADO')).length}</td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>
                {tabItem.imputado && tabItem.imputado.length}</td>
            <td className={cantImputadosT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <textarea className={`${styles.inputCell}`} value={cantImputados} onChange={(e) => setCantImputados(e.target.value)} />
            </td>
            <td className={tipoVictimaT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <button className={`${styles.buttonExpand}`} onClick={() => setExpandValue(true)}>+</button>
                <input className={`${styles.inputCell}`} value={tipoVictima} onChange={(e) => setTipoVictima(e.target.value)} list='tipoVictima-list' />
                <datalist id='tipoVictima-list'>
                    {desplegables && desplegables.tipoVictima.map(key => <option key={key} value={key} />)}
                </datalist></td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyPuma}`}>
                {audData.sala && audData.sala}</td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>
                {tabItem.sala && tabItem.sala}</td>
            <td className={salaT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <textarea className={`${styles.inputCell}`} value={sala} onChange={(e) => setSala(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyPuma}`}>
                {audData.operador && audData.operador}</td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>
                {tabItem.operador && tabItem.operador}</td>
            <td className={operadorT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <textarea className={`${styles.inputCell}`} value={operador} onChange={(e) => setOperador(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyPuma}`}>
                {audData.intervinientes && audData.intervinientes.find(el => el.includes('FISCAL')) && audData.intervinientes.find(el => el.includes('FISCAL')).split(': ')[1]}</td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>
                {tabItem.mpf?.[0]?.nombre || ''}</td>
            <td className={fiscalT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <textarea className={`${styles.inputCell}`} value={fiscal} onChange={(e) => setFiscal(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyPuma}`}>
                {audData.intervinientes && audData.intervinientes.find(el => el.includes('DEFENSA'))}</td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>
                {tabItem.defensa && tabItem.defensa.length > 0 && (
                    tabItem.defensa.map((d, idx) => (
                        <div key={idx}>
                            {formatDefensa(d)}
                        </div>
                    ))
                )}
            </td>
            <td className={defensaT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <textarea className={`${styles.inputCell}`} value={defensa} onChange={(e) => setDefensa(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyPuma}`}>
                {audData.juez && audData.juez}</td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyTablero}`}>
                {tabItem.juez && tabItem.juez}</td>
            <td className={juezT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <textarea className={`${styles.inputCell}`} value={juez} onChange={(e) => setJuez(e.target.value)} />
            </td>
            <td className={finAudienciaT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                {expandValue && <ShowTextOver text={(tabItem.caratula + '\n\n' + 'MINUTA:\n' + removeHtmlTags(tabItem.minuta) + '\nRESUELVO:\n' + removeHtmlTags(tabItem.resuelvoText))} setExpandValue={setExpandValue} />}
                <button className={`${styles.buttonExpand}`} onClick={() => setExpandValue(true)}>+</button>
                <input className={`${styles.inputCell}`} type='text' value={finAudiencia}
                    onChange={(e) => setFinAudiencia(e.target.value)}
                    list='finAudiencia-list' />
                <datalist id='finAudiencia-list'>
                    {desplegables && desplegables.finAudiencia.map(key => <option key={key} value={key} />)}
                </datalist>
            </td>
            <td className={resolucionT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
                <input className={`${styles.inputCell}`} value={resolucion}
                    onChange={(e) => setResolucion(e.target.value)}
                    list='resolucion-list' />
                <datalist id='resolucion-list'>
                    {desplegables && desplegables.resolucion.map(key => <option key={key} value={key} />)}
                </datalist>
            </td>
            <td className={resultadoControlT ? `${styles.cellBodyFixed} ${styles.cellBodyOk}` : `${styles.cellBodyFixed} ${styles.cellBodyError}`}>
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
                <textarea className={`${styles.inputCell}`} value={comentario} onChange={(e) => setComentario(e.target.value)} />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyOk}`} style={{ textAlign: 'center' }}>
                <input
                    type="checkbox"
                    checked={completado}
                    onChange={(e) => setCompletado(e.target.checked)}
                    style={{ cursor: 'pointer', width: '20px', height: '20px' }}
                />
            </td>
            <td className={`${styles.cellBodyFixed} ${styles.cellBodyOk}`}>
                <div className={styles.linksWrapper}>
                    <a href={audData.linkAudiencia} className={`${styles.linkTag}`} target='_blank'>audiencia</a>
                    <a href={audData.linkVideo} className={`${styles.linkTag}`} target='_blank'>video</a>
                    <a href={audData.linkMinuta} className={`${styles.linkTag}`} target='_blank'>minuta</a>
                </div>
            </td>
        </tr></>
    )
}
