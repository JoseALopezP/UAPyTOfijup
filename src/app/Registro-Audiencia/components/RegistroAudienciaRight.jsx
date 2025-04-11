'use client'
import { useContext, useState, useCallback, useEffect } from 'react';
import styles from '../RegistroAudiencia.module.css';
import { DataContext } from '@/context/DataContext';
import { listModelos, modeloMinuta } from '@/utils/modelosUtils';
import { checkForResuelvo } from '@/utils/resuelvoUtils';
import { generatePDF } from '@/utils/pdfUtils';
import deepEqual from '@/utils/deepEqual';
import { checkCompletion } from '@/utils/checkCompletion';
import TextEditor from './TextEditor';
import RegistroNavBar from './RegistroNavBar';
import { removeHtmlTags } from '@/utils/removeHtmlTags';
import updateRealTimeFunction from '@/firebase/firestore/updateRealTimeFunction';

export default function RegistroAudienciaRight({ item, dateToUse }) {
    const {updateData, updateByDate} = useContext(DataContext)
    const [guardarInc, setGuardarInc] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [modeloSelector, setModeloSelector] = useState('');
    const [resuelvo, setResuelvo] = useState('');
    const [resuelvo2, setResuelvo2] = useState('');
    const [minuta, setMinuta] = useState('');
    const [minuta2, setMinuta2] = useState('');
    const [cierre, setCierre] = useState('');
    const [cierre2, setCierre2] = useState('');
    const [selectedTab, setSelectedTab] = useState('Cuerpo minuta');
    const [errorDescarga, setErrorDescarga] = useState(false)
    const [checkDescarga, setCheckDescarga] = useState('')
    const updateComparisson = () => {
        setResuelvo(item.resuelvoText || '');
        setResuelvo2(item.resuelvoText || '');
        setMinuta(item.minuta || '');
        setMinuta2(item.minuta || '');
        setCierre(item.cierre || '');
        setCierre2(item.cierre || '');
    };
    
    const insertarModelo = () =>{
        setCierre(modeloMinuta('cierre'))
        setMinuta(modeloMinuta(modeloSelector).cuerpo)
        setResuelvo(modeloMinuta(modeloSelector).resuelvo)
    }
    const updateDataAud = async() =>{
        setGuardando(true)
        if (!deepEqual(resuelvo2, resuelvo) && resuelvo !== undefined && removeHtmlTags(resuelvo) !== '') {
            await updateData(dateToUse, item.numeroLeg, item.hora, 'resuelvoText', resuelvo);
            setResuelvo2(resuelvo);
        }
        if (!deepEqual(minuta2, minuta) && minuta !== undefined && removeHtmlTags(minuta) !== '') {
            await updateData(dateToUse, item.numeroLeg, item.hora, 'minuta', minuta);
            setMinuta2(minuta);
        }
        if (!deepEqual(cierre2, cierre) && cierre !== undefined && removeHtmlTags(cierre) !== '') {
            await updateData(dateToUse, item.numeroLeg, item.hora, 'cierre', cierre);
            setCierre2(cierre);
        }        
        if (checkForResuelvo(item)) {
            await updateData(dateToUse, item.numeroLeg, item.hora, 'horaResuelvo', updateRealTimeFunction());
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
        await generatePDF(item, dateToUse)
        await setCheckDescarga('')
    }
    const checkGuardar = useCallback(() => {
        const guardarStatus = !deepEqual(resuelvo2, resuelvo) ||
            !deepEqual(minuta2, minuta) ||
            !deepEqual(cierre2, cierre)
        setGuardarInc(guardarStatus);
    }, [resuelvo, resuelvo2, minuta, minuta2, cierre, cierre2]);
    const handleDescargar = () =>{
        switch(checkCompletion(item)){
            case 'mpf':
                setCheckDescarga('Faltan datos fiscal ¿Quiere continuar con la descarga?');
                break;
            case 'defensa':
                setCheckDescarga('Faltan datos de la defensa ¿Quiere continuar con la descarga?');
                break;
            case 'noListo':
                setErrorDescarga(true);
                setInterval(function(){setErrorDescarga(false)},3000)
                break;
            case 'completo':
                generatePDF(item, dateToUse)
            break;
        }
    }
    useEffect(() => {
        const interval = setInterval(() => {
            if(document.getElementById('submit-btn')){
                document.getElementById('submit-btn').click();
            }
        }, 60000);
        return () => clearInterval(interval);
      }, []);
    useEffect(() => {
        checkGuardar();
    }, [resuelvo, minuta, cierre, checkGuardar]);
    useEffect(() => {
        updateComparisson();
    }, [item]);
    useEffect(() => {
        checkGuardar();
    }, [guardarInc]);
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
                <span className={`${styles.insertarModeloBlock}`}>
                <select className={`${styles.inputLeft} ${styles.inputModelo}`}
                    onChange={(e) => setModeloSelector(e.target.value)}>
                    <option value={''}></option>
                    {listModelos.map(mod =>
                        <option key={mod} value={mod}>{mod.split('_').join(' ')}</option>
                    )}
                </select>
                <button type='button' onClick={() => insertarModelo()} className={`${styles.inputLeft} ${styles.insertarButton}`}>INSERTAR MODELO</button></span>
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