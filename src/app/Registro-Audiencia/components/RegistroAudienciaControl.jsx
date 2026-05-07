import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import styles from '../RegistroAudiencia.module.css';
import { DataContext } from '@/context/DataContext.js';
import RegistroAudienciaLeft from './RegistroAudienciaLeft.jsx';
import RegistroAudienciaRight from './RegistroAudienciaRight.jsx';
import deepEqual from '@/utils/deepEqual.js';
import { removeHtmlTags } from '@/utils/removeHtmlTags.js';
import updateRealTimeFunction from '@/firebase/firestore/updateRealTimeFunction.js';
import { checkForResuelvo } from '@/utils/resuelvoUtils.js';
import normalizeHtml from '@/utils/normalizeHtml.js';

export default function RegistroAudienciaControl({ aud, dateToUse, isHovered, setNeedsSaving1, setNeedsSaving2, needsSaving1, needsSaving2, refreshAud}) {
    const {updateDesplegables, updateDataOnly, updateDataDeep, updateByDate, updateData} = useContext(DataContext)
    const [isSaving, setIsSaving] = useState(false);
    const [resuelvo, setResuelvo] = useState('');
    const [minuta, setMinuta] = useState('');
    const [operadorAud, setOperadorAud] = useState('')
    const [cierre, setCierre] = useState('');
    const [sala, setSala] = useState('')
    const [saeNum, setSaeNum] = useState('');
    const [caratula, setCaratula] = useState('');
    const [razonDemora, setRazonDemora] = useState('');
    const [mpf, setMpf] = useState([]);
    const [ufi, setUfi] = useState('');
    const [estado, setEstado] = useState('');
    const [defensa, setDefensa] = useState([]);
    const [imputado, setImputado] = useState([]);
    const [tipo, setTipo] = useState('');
    const [tipo2, setTipo2] = useState('');
    const [tipo3, setTipo3] = useState('');
    const [partes, setPartes] = useState([]);
    const [defensoria, setDefensoria] = useState('');

    // ── Snapshots: "último valor guardado/cargado" para comparación precisa ──
    const savedSnapshot = useRef({});

    const buildSnapshot = useCallback(() => ({
        resuelvo, minuta, cierre,
        caratula, saeNum, razonDemora, ufi, estado, defensoria, operadorAud, sala,
        mpf: JSON.parse(JSON.stringify(mpf)),
        defensa: JSON.parse(JSON.stringify(defensa)),
        imputado: JSON.parse(JSON.stringify(imputado)),
        partes: JSON.parse(JSON.stringify(partes)),
        tipo, tipo2, tipo3
    }), [resuelvo, minuta, cierre, caratula, saeNum, razonDemora, ufi, estado, defensoria, operadorAud, sala, mpf, defensa, imputado, partes, tipo, tipo2, tipo3]);

    useEffect(() => {
        if (aud) {
            setResuelvo(aud.resuelvoText || '');
            setMinuta(aud.minuta || '');
            setCierre(aud.cierre || '');
            setOperadorAud(aud.operador || '');
            setSala(aud.sala || '');
            setSaeNum(aud.saeNum || '');
            setCaratula(aud.caratula || '');
            setRazonDemora(aud.razonDemora || '');
            setUfi(aud.ufi || '');
            setEstado(aud.estado || '');
            setMpf(aud.mpf ? JSON.parse(JSON.stringify(aud.mpf)) : []);
            setDefensa(aud.defensa ? JSON.parse(JSON.stringify(aud.defensa)) : []);
            setImputado(aud.imputado ? JSON.parse(JSON.stringify(aud.imputado)) : []);
            setPartes(aud.partes ? JSON.parse(JSON.stringify(aud.partes)) : []);
            setDefensoria(aud.defensoria || '');
            setTipo(aud.tipo || '');
            setTipo2(aud.tipo2 || '');
            setTipo3(aud.tipo3 || '');

            // Inicializar snapshot con valores del documento cargado
            savedSnapshot.current = {
                resuelvo: aud.resuelvoText || '',
                minuta: aud.minuta || '',
                cierre: aud.cierre || '',
                caratula: aud.caratula || '',
                saeNum: aud.saeNum || '',
                razonDemora: aud.razonDemora || '',
                ufi: aud.ufi || '',
                estado: aud.estado || '',
                defensoria: aud.defensoria || '',
                operadorAud: aud.operador || '',
                sala: aud.sala || '',
                mpf: aud.mpf ? JSON.parse(JSON.stringify(aud.mpf)) : [],
                defensa: aud.defensa ? JSON.parse(JSON.stringify(aud.defensa)) : [],
                imputado: aud.imputado ? JSON.parse(JSON.stringify(aud.imputado)) : [],
                partes: aud.partes ? JSON.parse(JSON.stringify(aud.partes)) : [],
                tipo: aud.tipo || '',
                tipo2: aud.tipo2 || '',
                tipo3: aud.tipo3 || '',
            };
        }
    }, [aud]);

    // needsSaving1 es manejado por RegistroAudienciaLeft
    // needsSaving2 es manejado por RegistroAudienciaRight
    // El estado de sala/operador se guarda inmediatamente, no necesita tracking

    // ── Refs para tener siempre el valor actual dentro de callbacks/closures ──
    const minutaRef = useRef(minuta);
    const resuelvoRef = useRef(resuelvo);
    const cierreRef = useRef(cierre);
    const caratulaRef = useRef(caratula);
    const saeNumRef = useRef(saeNum);
    const razonDemoraRef = useRef(razonDemora);
    const ufiRef = useRef(ufi);
    const estadoRef = useRef(estado);
    const defensoriaRef = useRef(defensoria);
    const operadorAudRef = useRef(operadorAud);
    const salaRef = useRef(sala);
    const mpfRef = useRef(mpf);
    const defensaRef = useRef(defensa);
    const imputadoRef = useRef(imputado);
    const partesRef = useRef(partes);
    const tipoRef = useRef(tipo);
    const tipo2Ref = useRef(tipo2);
    const tipo3Ref = useRef(tipo3);

    useEffect(() => { minutaRef.current = minuta; }, [minuta]);
    useEffect(() => { resuelvoRef.current = resuelvo; }, [resuelvo]);
    useEffect(() => { cierreRef.current = cierre; }, [cierre]);
    useEffect(() => { caratulaRef.current = caratula; }, [caratula]);
    useEffect(() => { saeNumRef.current = saeNum; }, [saeNum]);
    useEffect(() => { razonDemoraRef.current = razonDemora; }, [razonDemora]);
    useEffect(() => { ufiRef.current = ufi; }, [ufi]);
    useEffect(() => { estadoRef.current = estado; }, [estado]);
    useEffect(() => { defensoriaRef.current = defensoria; }, [defensoria]);
    useEffect(() => { operadorAudRef.current = operadorAud; }, [operadorAud]);
    useEffect(() => { salaRef.current = sala; }, [sala]);
    useEffect(() => { mpfRef.current = mpf; }, [mpf]);
    useEffect(() => { defensaRef.current = defensa; }, [defensa]);
    useEffect(() => { imputadoRef.current = imputado; }, [imputado]);
    useEffect(() => { partesRef.current = partes; }, [partes]);
    useEffect(() => { tipoRef.current = tipo; }, [tipo]);
    useEffect(() => { tipo2Ref.current = tipo2; }, [tipo2]);
    useEffect(() => { tipo3Ref.current = tipo3; }, [tipo3]);

    const isSavingRef = useRef(false);

    const handleGlobalSave = useCallback(async () => {
        if (!aud || isSavingRef.current) return;
        isSavingRef.current = true;
        setIsSaving(true);
        
        // Capturar valores actuales desde refs (evita stale closures)
        const currentMinuta = minutaRef.current;
        const currentResuelvo = resuelvoRef.current;
        const currentCierre = cierreRef.current;
        const currentCaratula = caratulaRef.current;
        const currentSaeNum = saeNumRef.current;
        const currentRazonDemora = razonDemoraRef.current;
        const currentUfi = ufiRef.current;
        const currentEstado = estadoRef.current;
        const currentDefensoria = defensoriaRef.current;
        const currentOperadorAud = operadorAudRef.current;
        const currentSala = salaRef.current;
        const currentMpf = mpfRef.current;
        const currentDefensa = defensaRef.current;
        const currentImputado = imputadoRef.current;
        const currentPartes = partesRef.current;
        const currentTipo = tipoRef.current;
        const currentTipo2 = tipo2Ref.current;
        const currentTipo3 = tipo3Ref.current;

        const snap = savedSnapshot.current;

        let retries = 3;
        let success = false;
        
        while (retries > 0 && !success) {
            try {
                // ── Guardar Minuta, Resuelvo, Cierre ──
                // Comparar contra snapshot (último guardado), no contra aud (original)
                // Permitir guardar vacío si antes tenía contenido (= borrado legítimo)
                if (normalizeHtml(currentMinuta) !== normalizeHtml(snap.minuta)) {
                    await updateDataOnly(dateToUse, aud.id, 'minuta', currentMinuta);
                }
                if (normalizeHtml(currentResuelvo) !== normalizeHtml(snap.resuelvo)) {
                    await updateDataOnly(dateToUse, aud.id, 'resuelvoText', currentResuelvo);
                }
                if (normalizeHtml(currentCierre) !== normalizeHtml(snap.cierre)) {
                    await updateDataOnly(dateToUse, aud.id, 'cierre', currentCierre);
                }
                
                // ── Guardar Metadatos ──
                if (currentCaratula !== snap.caratula) await updateData(dateToUse, aud.id, 'caratula', currentCaratula);
                if (currentSaeNum !== snap.saeNum) await updateData(dateToUse, aud.id, 'saeNum', currentSaeNum);
                if (currentRazonDemora !== snap.razonDemora) await updateData(dateToUse, aud.id, 'razonDemora', currentRazonDemora);
                if (currentUfi !== snap.ufi) await updateData(dateToUse, aud.id, 'ufi', currentUfi);
                if (currentEstado !== snap.estado) await updateData(dateToUse, aud.id, 'estado', currentEstado);
                if (currentDefensoria !== snap.defensoria) await updateData(dateToUse, aud.id, 'defensoria', currentDefensoria);
                if (currentOperadorAud !== snap.operadorAud) await updateData(dateToUse, aud.id, 'operador', currentOperadorAud);
                if (currentSala !== snap.sala) await updateData(dateToUse, aud.id, 'sala', currentSala);
                
                if (!deepEqual(currentMpf, snap.mpf)) await updateData(dateToUse, aud.id, 'mpf', currentMpf);
                if (!deepEqual(currentDefensa, snap.defensa)) await updateData(dateToUse, aud.id, 'defensa', currentDefensa);
                if (!deepEqual(currentImputado, snap.imputado)) await updateData(dateToUse, aud.id, 'imputado', currentImputado);
                if (!deepEqual(currentPartes, snap.partes)) await updateData(dateToUse, aud.id, 'partes', currentPartes);
                
                if (currentTipo !== snap.tipo || currentTipo2 !== snap.tipo2 || currentTipo3 !== snap.tipo3) {
                    await updateData(dateToUse, aud.id, 'tipo', currentTipo);
                    await updateData(dateToUse, aud.id, 'tipo2', currentTipo2);
                    await updateData(dateToUse, aud.id, 'tipo3', currentTipo3);
                }

                if (checkForResuelvo(aud)) {
                    await updateDataDeep(dateToUse, aud.id, 'horaResuelvo', updateRealTimeFunction());
                }

                // ── Actualizar snapshot con los valores que acabamos de guardar ──
                savedSnapshot.current = {
                    resuelvo: currentResuelvo,
                    minuta: currentMinuta,
                    cierre: currentCierre,
                    caratula: currentCaratula,
                    saeNum: currentSaeNum,
                    razonDemora: currentRazonDemora,
                    ufi: currentUfi,
                    estado: currentEstado,
                    defensoria: currentDefensoria,
                    operadorAud: currentOperadorAud,
                    sala: currentSala,
                    mpf: JSON.parse(JSON.stringify(currentMpf)),
                    defensa: JSON.parse(JSON.stringify(currentDefensa)),
                    imputado: JSON.parse(JSON.stringify(currentImputado)),
                    partes: JSON.parse(JSON.stringify(currentPartes)),
                    tipo: currentTipo,
                    tipo2: currentTipo2,
                    tipo3: currentTipo3,
                };

                await updateByDate(dateToUse);
                if (refreshAud) await refreshAud();

                // ── Resetear flags de cambios pendientes ──
                setNeedsSaving1(false);
                setNeedsSaving2(false);

                success = true;
            } catch (error) {
                console.error(`Error saving all data. Retries left: ${retries - 1}`, error);
                retries -= 1;
                if (retries > 0) {
                    await new Promise(resolve => setTimeout(resolve, 1500)); // wait 1.5s
                } else {
                    alert("Error al guardar los cambios después de varios intentos. Verifique su conexión y reintente.");
                }
            }
        }
        isSavingRef.current = false;
        setIsSaving(false);
    }, [aud, dateToUse, updateDataOnly, updateData, updateDataDeep, updateByDate, refreshAud, setNeedsSaving1, setNeedsSaving2]);

    useEffect(() => {
        const handleAutoSave = () => {
            if (document.visibilityState === 'hidden' && (needsSaving1 || needsSaving2)) {
                handleGlobalSave();
            }
        };

        const handleBlur = () => {
            if (needsSaving1 || needsSaving2) {
                handleGlobalSave();
            }
        };

        const handleBeforeUnload = (e) => {
            if (needsSaving1 || needsSaving2 || isSavingRef.current) {
                e.preventDefault();
                e.returnValue = ''; // Esto activa el diálogo estándar del navegador
            }
        };

        document.addEventListener('visibilitychange', handleAutoSave);
        window.addEventListener('blur', handleBlur);
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            document.removeEventListener('visibilitychange', handleAutoSave);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [handleGlobalSave, needsSaving1, needsSaving2]);


    return (
        <div className={`${styles.controlBlock}`}>
            {aud && <><RegistroAudienciaLeft item={aud} dateToUse={dateToUse} isHovered={isHovered}
                sala={sala} setSala={setSala} 
                operadorAud={operadorAud} setOperadorAud={setOperadorAud}
                saeNum={saeNum} setSaeNum={setSaeNum} 
                caratula={caratula} setCaratula={setCaratula} 
                razonDemora={razonDemora} setRazonDemora={setRazonDemora} 
                mpf={mpf} setMpf={setMpf} 
                ufi={ufi} setUfi={setUfi} 
                estado={estado} setEstado={setEstado} 
                defensa={defensa} setDefensa={setDefensa} 
                defensoria={defensoria} setDefensoria={setDefensoria}
                imputado={imputado} setImputado={setImputado} 
                tipo={tipo} setTipo={setTipo} 
                tipo2={tipo2} setTipo2={setTipo2} 
                tipo3={tipo3} setTipo3={setTipo3} 
                partes={partes} setPartes={setPartes}
                setNeedsSaving1={setNeedsSaving1}
                minuta={minuta} setMinuta={setMinuta}
                cierre={cierre} setCierre={setCierre}
                refreshAud={refreshAud}/>
            <RegistroAudienciaRight item={aud} dateToUse={dateToUse}
                setNeedsSaving2={setNeedsSaving2}
                resuelvo={resuelvo} setResuelvo={setResuelvo}
                minuta={minuta} setMinuta={setMinuta}
                cierre={cierre} setCierre={setCierre}
                sala={sala} saeNum={saeNum} caratula={caratula} razonDemora={razonDemora} mpf={mpf} ufi={ufi} defensoria={defensoria} estado={estado} defensa={defensa} imputado={imputado} tipo={tipo} tipo2={tipo2} tipo3={tipo3} partes={partes}
                needsSaving={needsSaving1 || needsSaving2} onGlobalSave={handleGlobalSave} isSaving={isSaving}
            /></>}
        </div>
    );
}
