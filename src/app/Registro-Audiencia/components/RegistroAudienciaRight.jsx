'use client'
import { useContext, useState, useCallback, useEffect } from 'react';
import { guardarBackup } from '@/utils/localBackup';
import styles from '../RegistroAudiencia.module.css';
import { DataContext } from '@/context/DataContext';
import { checkForResuelvo } from '@/utils/resuelvoUtils';
import { generatePDF } from '@/utils/pdfUtils';
import deepEqual from '@/utils/deepEqual';
import { checkCompletion } from '@/utils/checkCompletion';
import dynamic from "next/dynamic";
const TextEditor = dynamic(
  () => import("./TextEditor"),
  { ssr: false }
)
import RegistroNavBar from './RegistroNavBar';
import { removeHtmlTags } from '@/utils/removeHtmlTags';
import updateRealTimeFunction from '@/firebase/firestore/updateRealTimeFunction';
import HistorialDeVersiones from './HistorialVersiones';
import normalizeHtml from '@/utils/normalizeHtml';

function extractNames(obj) {
    return Object.keys(obj);
}
const cierreModelo = `En este estado, siendo las  horas se dio por terminado el acto, labrándose la presente, dándose por concluida la presente Audiencia, quedando las partes plenamente notificadas de lo resuelto y habiendo quedado ésta íntegramente grabada mediante el sistema de audio y video.`
export default function RegistroAudienciaRight({ setNeedsSaving2, item, dateToUse, resuelvo, setResuelvo, minuta, setMinuta, cierre, setCierre, sala, saeNum, caratula, razonDemora, mpf, ufi, estado, defensa, imputado, tipo, tipo2, tipo3, partes }) {
    const {updateData, updateByDate, modelosMinuta, updateModelosMinuta} = useContext(DataContext)
    const [guardarInc, setGuardarInc] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [modeloSelector, setModeloSelector] = useState('');
    const [resuelvo2, setResuelvo2] = useState('');
    const [minuta2, setMinuta2] = useState('');
    const [cierre2, setCierre2] = useState('');
    const [selectedTab, setSelectedTab] = useState('Cuerpo minuta');
    const [errorDescarga, setErrorDescarga] = useState(false)
    const [checkDescarga, setCheckDescarga] = useState('')
    const [reloadHistorial, setReloadHistorial] = useState(0);
    const [isInitialized, setIsInitialized] = useState(false);
    const updateComparisson = () => {
        setResuelvo(item.resuelvoText || '');
        setResuelvo2(item.resuelvoText || '');
        setMinuta(item.minuta || '');
        setMinuta2(item.minuta || '');
        setCierre(item.cierre || '');
        setCierre2(item.cierre || '');
        setIsInitialized(true);
    };
    const insertarModelo = () =>{
        if(minuta.replace(/<[^>]*>/g, '') !== '' || resuelvo.replace(/<[^>]*>/g, '') !== ''){
            alert("Borre el contenido ya incluído antes de insertar un modelo")
        }else{
            setCierre(cierreModelo);
            setMinuta(modelosMinuta[modeloSelector].cuerpo.replace(/\n/g, '<br>'));
            setResuelvo(modelosMinuta[modeloSelector].resuelvo.replace(/\n/g, '<br>'));
        }
    }
    const updateDataAud = async() =>{
        setGuardando(true)
        if (!deepEqual(resuelvo2, resuelvo) && resuelvo !== undefined && removeHtmlTags(resuelvo) !== '') {
            await updateData(dateToUse, item.numeroLeg, item.hora, 'resuelvoText', resuelvo, (item.aId || false));
            setResuelvo2(resuelvo);
        }
        if (!deepEqual(minuta2, minuta) && minuta !== undefined && removeHtmlTags(minuta) !== '') {
            await updateData(dateToUse, item.numeroLeg, item.hora, 'minuta', minuta, (item.aId || false));
            setMinuta2(minuta);
        }
        if (!deepEqual(cierre2, cierre) && cierre !== undefined && removeHtmlTags(cierre) !== '') {
            await updateData(dateToUse, item.numeroLeg, item.hora, 'cierre', cierre, (item.aId || false));
            setCierre2(cierre);
        }        
        if (checkForResuelvo(item)) {
            await updateData(dateToUse, item.numeroLeg, item.hora, 'horaResuelvo', updateRealTimeFunction(), (item.aId || false));
        }
        await setGuardarInc(false)
        await setGuardando(false)
        await updateByDate(dateToUse)
    }
    const handleSubmit = async (event) => {
        if(event) event.preventDefault();
        await updateDataAud()
    };
    const handleDescargar2 = async() =>{
        await generatePDF(aux, dateToUse)
        await setCheckDescarga('')
    }
    const checkGuardar = useCallback(() => {
        const guardarStatus = !deepEqual(resuelvo2, resuelvo) ||
            !deepEqual(normalizeHtml(minuta2), normalizeHtml(minuta)) ||
            !deepEqual(normalizeHtml(cierre2), normalizeHtml(cierre))
        setGuardarInc(guardarStatus);
        setNeedsSaving2(guardarStatus)
    }, [resuelvo, resuelvo2, minuta, minuta2, cierre, cierre2]);
    const callUpdateModelosMinuta = () =>{
        updateModelosMinuta()
    }
    const handleDescargar = () =>{
        const aux = {
                resuelvoText: resuelvo, minuta: minuta, cierre: cierre, sala: sala, saeNum: saeNum, caratula: caratula, razonDemora: razonDemora,
                mpf: mpf, ufi: ufi, estado: estado, defensa: defensa, imputado: imputado, tipo: tipo, tipo2: tipo2, tipo3: tipo3, partes: partes,
                numeroLeg: item.numeroLeg, operador: item.operador, hora: item.hora, hitos: item.hitos, juez: item.juez
            };
        const aux2 = checkCompletion(aux)
        if(aux2 === 'completo'){
            generatePDF(aux, dateToUse)
        }else{
            alert(aux2)
        }
    }
    useEffect(() => {
    const interval = setInterval(() => {
        const cambios = {};
        if (resuelvo && removeHtmlTags(resuelvo) !== '') { 
        cambios.resuelvoText = resuelvo;
        }
        if (minuta && removeHtmlTags(minuta) !== '') {
        cambios.minuta = minuta;
        }
        if (cierre && removeHtmlTags(cierre) !== '') {
        cambios.cierre = cierre;
        }
        if (Object.keys(cambios).length > 0) {
        guardarBackup(dateToUse, item.numeroLeg, item.hora, cambios);
        setReloadHistorial(prev => prev + 1);
        }
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
    }, [resuelvo, minuta, cierre, dateToUse, item.numeroLeg, item.hora]);
    useEffect(() => {
        if (isInitialized) {
            checkGuardar();
        }
    }, [resuelvo, minuta, cierre, isInitialized]);

    useEffect(() => {
        updateComparisson();
        setGuardarInc(false)
        setGuardando(false)
    }, [item]);
    return (
        <>{checkDescarga !== '' && <div className={`${styles.checkDescargaFalta}`}>
                <p>{checkDescarga}</p>
                <button type='button' className={`${styles.buttonDownload2}`} onClick={() => handleDescargar2()}>DESCARGAR</button>
            </div>}
            <form className={`${styles.controlBlockRight}`} onSubmit={(event) => handleSubmit(event)}>
            {guardarInc && <button className={guardando ? `${styles.inputLeft} ${styles.guardarButton} ${styles.guardandoButton}` : `${styles.inputLeft} ${styles.guardarButton}`} type="submit" id='submit-btn' value="GUARDAR">
                <span className={`${styles.sinGuardar}`}>CAMBIOS SIN GUARDAR</span>
                <span className={`${styles.guardar}`}>GUARDAR</span>
                <span className={`${styles.guardando}`}>GUARDANDO...</span>
            </button>}
            <div className={`${styles.topBlockMinuta}`}>
                <span className={`${styles.insertarModeloBlock}`} onClick={() => callUpdateModelosMinuta()}>
                <select className={`${styles.inputLeft} ${styles.inputModelo}`}
                    onChange={(e) => setModeloSelector(e.target.value)}>
                    <option value={''}></option>
                    {modelosMinuta && extractNames(modelosMinuta).map(mod =>
                        <option key={mod} value={mod}>{mod.split('_').join(' ')}</option>
                    )}
                </select>
                <button type='button' onClick={() => insertarModelo()} className={`${styles.inputLeft} ${styles.insertarButton}`}>INSERTAR MODELO</button></span>
                <HistorialDeVersiones
                fecha={dateToUse}
                legajo={item.numeroLeg}
                hora={item.hora}
                onSeleccionar={(cambios) => {
                    if (confirm("¿Seguro que querés cargar esta versión anterior?")) {
                    if (cambios.minuta) setMinuta(cambios.minuta);
                    if (cambios.resuelvoText) setResuelvo(cambios.resuelvoText);
                    if (cambios.cierre) setCierre(cambios.cierre);
                    }
                }}
                reloadTrigger={reloadHistorial}
                />

                <button type='button' className={`${styles.buttonDownload}`} onClick={() => handleDescargar()}>{item.resuelvo ? 'DESCARGAR MINUTA' : '-'}</button>
            </div>
            <RegistroNavBar navbarList={['Cuerpo minuta', 'Resuelvo', 'Cierre']} selectedTab={selectedTab} setSelectedTab={setSelectedTab}/>
            {selectedTab === 'Cuerpo minuta' &&
                <TextEditor textValue={minuta} setTextValue={setMinuta}/>
            }{selectedTab === 'Resuelvo' &&
                <TextEditor textValue={resuelvo} setTextValue={setResuelvo}/>
            }{selectedTab === 'Cierre' &&
                <TextEditor textValue={cierre} setTextValue={setCierre}/>
            }
        </form></>
    );
}