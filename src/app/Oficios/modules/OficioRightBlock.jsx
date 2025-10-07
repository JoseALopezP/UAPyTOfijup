import { caratulaGenerator } from '@/utils/caratulaUtils'
import styles from '../Oficios.module.css'
import GeneradorOficioBlock from './GeneradorOficioBlock';
import deepEqual from '@/utils/deepEqual';
import { useCallback, useContext, useEffect, useState } from 'react';
import { removeHtmlTags } from '@/utils/removeHtmlTags';
import TextEditor from '@/app/Registro-Audiencia/components/TextEditor';
import { DataContext } from '@/context New/DataContext';

export default function OficioRightBlock({aud, date}) {
    const {updateData, updateByDate} = useContext(DataContext)
    const [showOficio, setShowOficio] = useState(false)
    const [resuelvo, setResuelvo] = useState('');
    const [minuta, setMinuta] = useState('');
    const [resuelvo2, setResuelvo2] = useState('');
    const [minuta2, setMinuta2] = useState('');
    const [minutaShow, setMinutaShow] = useState('caratula');
    const [guardarInc, setGuardarInc] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const updateComparisson = () => {
        setResuelvo(aud.resuelvoText || '');
        setResuelvo2(aud.resuelvoText || '');
        setMinuta(aud.minuta || '');
        setMinuta2(aud.minuta || '');
    };
    const handleShow = () =>{
        setShowOficio(!showOficio)
 
    }
    const updateDataAud = async() =>{
            setGuardando(true)
            if (!deepEqual(resuelvo2, resuelvo) && resuelvo !== undefined && removeHtmlTags(resuelvo) !== '') {
                await updateData(date, aud.id, 'resuelvoText', resuelvo);
                setResuelvo2(resuelvo);
            }
            if (!deepEqual(minuta2, minuta) && minuta !== undefined && removeHtmlTags(minuta) !== '') {
                await updateData(date, aud.id, 'minuta', minuta);
                setMinuta2(minuta);
            }
            await setGuardarInc(false)
            await setGuardando(false)
            await updateByDate(date)
        }
    useEffect(() => {
        checkGuardar();
    }, [resuelvo, minuta]);
    const checkGuardar = useCallback(() => {
            const guardarStatus = !deepEqual(resuelvo2, resuelvo) ||
                !deepEqual(minuta2, minuta)
            setGuardarInc(guardarStatus);
    }, [resuelvo, resuelvo2, minuta, minuta2]);
    useEffect(() => {
        updateComparisson();
        setGuardando(false)
    }, [aud]);
    if (!aud) return null;
    return (
        <>{guardarInc && 
        <button className={guardando ? `${styles.inputLeft} ${styles.guardarButton} ${styles.guardandoButton}` : `${styles.inputLeft} ${styles.guardarButton}`} onClick={() => updateDataAud()}>
            <span className={`${styles.sinGuardar}`}>CAMBIOS SIN GUARDAR</span>
            <span className={`${styles.guardar}`}>GUARDAR</span>
            <span className={`${styles.guardando}`}>GUARDANDO...</span>
        </button>}
        <div className={styles.oficioRightBlockContainer} >
            <span className={styles.tabsSelector}>
                <button onClick={() => setMinutaShow('caratula')} className={minutaShow === 'caratula' ? `${styles.tab} ${styles.tabSelected}` : `${styles.tab}`}>Carátula</button>
                <button onClick={() => setMinutaShow('minuta')} className={minutaShow === 'minuta' ? `${styles.tab} ${styles.tabSelected}` : `${styles.tab}`}>Minuta</button>
                <button onClick={() => setMinutaShow('resuelvo')} className={minutaShow === 'resuelvo' ? `${styles.tab} ${styles.tabSelected}` : `${styles.tab}`}>Resuelvo</button></span>
            <div className={styles.editSectionOficio}>
                {aud && aud.minuta && minutaShow === 'minuta' && <TextEditor textValue={minuta} setTextValue={setMinuta}/>}
                {aud && aud.estado && minutaShow === 'caratula' && <div className={styles.oficioText}>{caratulaGenerator(aud, date)}</div>}
                {aud.resuelvoText && minutaShow === 'resuelvo' && <TextEditor textValue={resuelvo} setTextValue={setResuelvo}/>}</div>
        </div>
        <button className={styles.oficioButton} onClick={() => handleShow()}>
            OFICIO
        </button>
        {showOficio && <GeneradorOficioBlock item={aud} date={date} resuelvo={resuelvo}/>}</>
    )
}