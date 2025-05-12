import { caratulaGenerator } from '@/utils/caratulaUtils'
import { testOficio } from '@/utils/testOficio';
import styles from '../Oficios.module.css'
import GeneradorOficioBlock from './GeneradorOficioBlock';
import deepEqual from '@/utils/deepEqual';
import { useCallback, useContext, useEffect, useState } from 'react';
import { removeHtmlTags } from '@/utils/removeHtmlTags';
import TextEditor from '@/app/Registro-Audiencia/components/TextEditor';
import { DataContext } from '@/context/DataContext';

export default function OficioRightBlock({aud, date}) {
    const {updateData} = useContext(DataContext)
    const [showOficio, setShowOficio] = useState(false)
    const [showStop, setShowStop] = useState(false)
    const [resuelvo, setResuelvo] = useState('');
    const [minuta, setMinuta] = useState('');
    const [resuelvo2, setResuelvo2] = useState('');
    const [minuta2, setMinuta2] = useState('');
    const [minutaShow, setMinutaShow] = useState('caratula');
    const [partHover, setPartHover] = useState(false)
    const [guardarInc, setGuardarInc] = useState(false);
    const updateComparisson = () => {
        setResuelvo(aud.resuelvoText || '');
        setResuelvo2(aud.resuelvoText || '');
        setMinuta(aud.minuta || '');
        setMinuta2(aud.minuta || '');
    };
    const handleShow = () =>{
        if(testOficio(aud)){
            setShowOficio(!showOficio)
        }else{
            setShowStop(true)
            setTimeout(() =>{
                setShowStop(false)
            }, 2000)
        }
    }
    const updateDataAud = async() =>{
            setGuardando(true)
            if (!deepEqual(resuelvo2, resuelvo) && resuelvo !== undefined && removeHtmlTags(resuelvo) !== '') {
                await updateData(dateToUse, aud.numeroLeg, aud.hora, 'resuelvoText', resuelvo);
                setResuelvo2(resuelvo);
            }
            if (!deepEqual(minuta2, minuta) && minuta !== undefined && removeHtmlTags(minuta) !== '') {
                await updateData(dateToUse, aud.numeroLeg, aud.hora, 'minuta', minuta);
                setMinuta2(minuta);
            }
            if (checkForResuelvo(aud)) {
                await updateData(dateToUse, aud.numeroLeg, aud.hora, 'horaResuelvo', updateRealTimeFunction());
            }
            await setGuardarInc(false)
            await setGuardando(false)
            await updateByDate(dateToUse)
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
    }, [aud]);
    if (!aud) return null;
    return (
        <><div className={styles.oficioRightBlockContainer} >
            <span className={styles.tabsSelector}>
                <button onClick={() => setMinutaShow('caratula')} className={minutaShow === 'caratula' ? `${styles.tab} ${styles.tabSelected}` : `${styles.tab}`}>Carátula</button>
                <button onClick={() => setMinutaShow('minuta')} className={minutaShow === 'minuta' ? `${styles.tab} ${styles.tabSelected}` : `${styles.tab}`}>Minuta</button>
                <button onClick={() => setMinutaShow('resuelvo')} className={minutaShow === 'resuelvo' ? `${styles.tab} ${styles.tabSelected}` : `${styles.tab}`}>Resuelvo</button></span>
            <div className={styles.editSectionOficio}>{aud.minuta ? (minutaShow ? <TextEditor textValue={minuta} setTextValue={setMinuta}/> : <p></p>) : <p></p>}
            {aud && aud.estado && minutaShow === 'caratula' && <div className={styles.oficioText}>{caratulaGenerator(aud, date)}</div>}
            {aud.resuelvoText ? (minutaShow ? <p></p> :<TextEditor textValue={resuelvo} setTextValue={setResuelvo}/>) : <p></p>}</div>
        </div>
        <button className={styles.oficioButton} onClick={() => handleShow()}>{showStop ? 'FALTAN DATOS' : 'GENERAR OFICIO'}</button>
        {showOficio && <GeneradorOficioBlock item={aud} date={date}/>}</>
    )
}