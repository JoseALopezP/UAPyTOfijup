'use client'
import { useContext, useState, useCallback, useEffect } from 'react';
import { saveLocalVersion } from '@/utils/localBackup';
import styles from '../RegistroAudiencia.module.css';
import { DataContext } from '@/context New/DataContext';
import { checkForResuelvo } from '@/utils/resuelvoUtils';
import { generatePDF } from '@/utils/pdfUtils';
import deepEqual from '@/utils/deepEqual';
import { checkCompletion } from '@/utils/checkCompletion';
import dynamic from 'next/dynamic';
const TextEditor = dynamic(() => import('./TextEditor'), { ssr: false });
import RegistroNavBar from './RegistroNavBar';
import { removeHtmlTags } from '@/utils/removeHtmlTags';
import updateRealTimeFunction from '@/firebase new/firestore/updateRealTimeFunction';
import HistorialDeVersiones from './HistorialVersiones';
import normalizeHtml from '@/utils/normalizeHtml';

import { inferGender } from '@/utils/genderUtils';

function extractNames(obj) {
    return Object.keys(obj);
}
const cierreModelo = `En este estado, siendo las  horas se dio por terminado el acto, labrándose la presente, dándose por concluida la presente Audiencia, quedando las partes plenamente notificadas de lo resuelto y habiendo quedado ésta íntegramente grabada mediante el sistema de audio y video.`
export default function RegistroAudienciaRight({ setNeedsSaving2, item, dateToUse, resuelvo, setResuelvo, minuta, setMinuta, cierre, setCierre, sala, saeNum, caratula, razonDemora, mpf, ufi, defensoria, estado, defensa, imputado, tipo, tipo2, tipo3, partes, needsSaving, onGlobalSave, isSaving }) {
    const {updateDataDeep, updateDataOnly, updateByDate, modelosMinuta, updateModelosMinuta, saveAudienciaDebate} = useContext(DataContext)
    const [guardarInc, setGuardarInc] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [modeloSelector, setModeloSelector] = useState('');
    const [selectedTab, setSelectedTab] = useState('Cuerpo minuta');
    const [errorDescarga, setErrorDescarga] = useState(false)
    const [checkDescarga, setCheckDescarga] = useState('')
    const [reloadHistorial, setReloadHistorial] = useState(0);

    // Función para normalizar contenido antes de comparar
    const cleanContent = (html) => {
        if (!html) return '';
        return html
            .replace(/&nbsp;/g, ' ')
            .replace(/<p><br><\/p>/g, '')
            .replace(/<p>\s*<\/p>/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    };

    const insertarModelo = () => {
        if (removeHtmlTags(minuta).trim() !== '' || removeHtmlTags(resuelvo).trim() !== '') {
            alert("Borre el contenido ya incluído antes de insertar un modelo")
        } else {
            const { isMale } = inferGender(item.juez);

            let cuerpo = modelosMinuta[modeloSelector].cuerpo;
            let resuelvoText = modelosMinuta[modeloSelector].resuelvo;

            // Función para reemplazar títulos respetando el género del juez actual
            const fixGender = (text) => {
                if (!text) return text;
                return text
                    .replace(/El Sr\. Juez/g, isMale ? "El Sr. Juez" : "La Sra. Jueza")
                    .replace(/Sr\. Juez/g, isMale ? "Sr. Juez" : "Sra. Jueza")
                    .replace(/La Sra\. Jueza/g, !isMale ? "La Sra. Jueza" : "El Sr. Juez")
                    .replace(/Sra\. Jueza/g, !isMale ? "Sra. Jueza" : "Sr. Juez")
                    .replace(/La Sra\. Juez/g, !isMale ? "La Sra. Jueza" : "El Sr. Juez");
            };

            setCierre(cierreModelo);
            setMinuta(fixGender(cuerpo).replace(/\n/g, '<br>'));
            setResuelvo(fixGender(resuelvoText).replace(/\n/g, '<br>'));
        }
    }

    const checkGuardar = useCallback(() => {
        if (!item) return;

        const hasChanges = 
            cleanContent(resuelvo) !== cleanContent(item.resuelvoText) ||
            cleanContent(minuta) !== cleanContent(item.minuta) ||
            cleanContent(cierre) !== cleanContent(item.cierre);

        setGuardarInc(hasChanges);
        setNeedsSaving2(hasChanges);
    }, [resuelvo, minuta, cierre, item, setNeedsSaving2]);

    const handleSubmit = async () => {
        if (onGlobalSave) await onGlobalSave();
    };
    const handleDescargar2 = async() =>{
        // Nota: 'aux' is not defined here in the provided snippet scope, 
        // original logic kept as reference if available elsewhere
        await generatePDF(aux, dateToUse)
        await setCheckDescarga('')
    }
    const callUpdateModelosMinuta = () =>{
        updateModelosMinuta()
    }
    const handleDescargar = () =>{
        const aux = {
                resuelvoText: resuelvo, minuta: minuta, cierre: cierre, sala: sala, saeNum: saeNum, caratula: caratula, razonDemora: razonDemora,
                mpf: mpf.map(f => f.subrogando ? { ...f, nombre: `${f.nombre} (subrogando a ${ufi})` } : f), 
                ufi: ufi, 
                defensoria: defensoria,
                estado: estado, 
                defensa: defensa.map(d => d.subrogando ? { ...d, nombre: `${d.nombre} (subrogando a ${defensoria})` } : d), 
                imputado: imputado, tipo: tipo, tipo2: tipo2, tipo3: tipo3, partes: partes,
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
        const timeout = setTimeout(() => {
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
                saveLocalVersion({
                    id_audiencia: item.id,
                    minuta: cambios.minuta,
                    resuelvo: cambios.resuelvoText,
                    cierre: cambios.cierre
                });
                setReloadHistorial(prev => prev + 1);
            }
        }, 3000); // 3 seconds debounce
        
        return () => clearTimeout(timeout);
    }, [resuelvo, minuta, cierre, item.id]);

    useEffect(() => {
        checkGuardar();
    }, [resuelvo, minuta, cierre, item, checkGuardar]);

    useEffect(() => {
        setGuardarInc(false)
        setGuardando(false)
    }, [item.id]);

    return (
        <>{checkDescarga !== '' && <div className={`${styles.checkDescargaFalta}`}>
                <p>{checkDescarga}</p>
                <button type='button' className={`${styles.buttonDownload2}`} onClick={() => handleDescargar2()}>DESCARGAR</button>
            </div>}
            <div className={`${styles.controlBlockRight}`}>
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
                id_audiencia={item.id}
                onSeleccionar={(cambios) => {
                    if (confirm("¿Seguro que querés cargar esta versión anterior?")) {
                    if (cambios.minuta) setMinuta(cambios.minuta);
                    if (cambios.resuelvo) setResuelvo(cambios.resuelvo);
                    if (cambios.cierre) setCierre(cambios.cierre);
                    }
                }}
                reloadTrigger={reloadHistorial}
                />

                <button type='button' className={`${styles.buttonDownload}`} onClick={() => handleDescargar()}>{item.resuelvo || item.tipo === "DEBATE DEL JUICIO ORAL" ? 'DESCARGAR MINUTA' : '-'}</button>
            </div>
            <RegistroNavBar navbarList={['Cuerpo minuta', 'Resuelvo', 'Cierre']} selectedTab={selectedTab} setSelectedTab={setSelectedTab} needsSaving={needsSaving} onSave={onGlobalSave} isSaving={isSaving}/>
            {selectedTab === 'Cuerpo minuta' &&
                <TextEditor key={`minuta-${item.id}`} textValue={minuta} setTextValue={setMinuta}/>
            }{selectedTab === 'Resuelvo' &&
                <TextEditor key={`resuelvo-${item.id}`} textValue={resuelvo} setTextValue={setResuelvo}/>
            }{selectedTab === 'Cierre' &&
                <TextEditor key={`cierre-${item.id}`} textValue={cierre} setTextValue={setCierre}/>
            }
        </div></>
    );
}