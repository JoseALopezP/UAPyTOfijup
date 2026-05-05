import { useContext, useEffect, useState } from 'react';
import styles from '../RegistroAudiencia.module.css';
import { DataContext } from '@/context New/DataContext';
import RegistroAudienciaLeft from './RegistroAudienciaLeft';
import RegistroAudienciaRight from './RegistroAudienciaRight';
import deepEqual from '@/utils/deepEqual';
import { removeHtmlTags } from '@/utils/removeHtmlTags';
import updateRealTimeFunction from '@/firebase new/firestore/updateRealTimeFunction';
import { checkForResuelvo } from '@/utils/resuelvoUtils';
import { useCallback } from 'react';

export default function RegistroAudienciaControl({ aud, dateToUse, isHovered, setNeedsSaving1, setNeedsSaving2, needsSaving1, needsSaving2, refreshAud}) {
    const {updateDesplegables, updateDataOnly, updateDataDeep, updateByDate, updateData, updateDataBulk} = useContext(DataContext)
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
        }
    }, [aud]);

    // needsSaving1 es manejado por RegistroAudienciaLeft
    // needsSaving2 es manejado por RegistroAudienciaRight
    // El estado de sala/operador se guarda inmediatamente, no necesita tracking

    const handleGlobalSave = useCallback(async () => {
        if (!aud || isSaving) return;
        setIsSaving(true);
        
        let retries = 3;
        let success = false;
        
        while (retries > 0 && !success) {
            try {
                const metadataChanges = {};
                const bodyChanges = {};

                // 1. Recolectar cambios de texto pesado (bodyChanges - solo van a audiencias)
                if (minuta !== (aud.minuta || '') && removeHtmlTags(minuta) !== '') bodyChanges.minuta = minuta;
                if (resuelvo !== (aud.resuelvoText || '') && removeHtmlTags(resuelvo) !== '') bodyChanges.resuelvoText = resuelvo;
                if (cierre !== (aud.cierre || '') && removeHtmlTags(cierre) !== '') bodyChanges.cierre = cierre;

                // 2. Recolectar metadatos (metadataChanges - van a audiencias y audienciasView)
                if (caratula !== (aud.caratula || '')) metadataChanges.caratula = caratula;
                if (saeNum !== (aud.saeNum || '')) metadataChanges.saeNum = saeNum;
                if (razonDemora !== (aud.razonDemora || '')) metadataChanges.razonDemora = razonDemora;
                if (ufi !== (aud.ufi || '')) metadataChanges.ufi = ufi;
                if (estado !== (aud.estado || '')) metadataChanges.estado = estado;
                if (defensoria !== (aud.defensoria || '')) metadataChanges.defensoria = defensoria;
                if (operadorAud !== (aud.operador || '')) metadataChanges.operador = operadorAud;
                if (sala !== (aud.sala || '')) metadataChanges.sala = sala;

                if (!deepEqual(mpf, aud.mpf || [])) metadataChanges.mpf = mpf;
                if (!deepEqual(defensa, aud.defensa || [])) metadataChanges.defensa = defensa;
                if (!deepEqual(imputado, aud.imputado || [])) metadataChanges.imputado = imputado;
                if (!deepEqual(partes, aud.partes || [])) metadataChanges.partes = partes;

                if (tipo !== (aud.tipo || '') || tipo2 !== (aud.tipo2 || '') || tipo3 !== (aud.tipo3 || '')) {
                    metadataChanges.tipo = tipo;
                    metadataChanges.tipo2 = tipo2;
                    metadataChanges.tipo3 = tipo3;
                }

                if (checkForResuelvo(aud)) {
                    metadataChanges.horaResuelvo = updateRealTimeFunction();
                }

                // 3. Ejecutar actualización en bloque si hay cambios
                if (Object.keys(metadataChanges).length > 0 || Object.keys(bodyChanges).length > 0) {
                    await updateDataBulk(dateToUse, aud.id, metadataChanges, bodyChanges);
                }

                // 4. Actualizar estado local
                await updateByDate(dateToUse);
                if (refreshAud) await refreshAud();
                
                success = true; // Todo salió bien
            } catch (error) {
                console.error(`Error en guardado atómico. Reintentos restantes: ${retries - 1}`, error);
                retries -= 1;
                if (retries > 0) {
                    await new Promise(resolve => setTimeout(resolve, 60000)); // espera 1m
                } else {
                    alert("Error al guardar los cambios después de varios intentos. Verifique su conexión y reintente.");
                }
            }
        }
        setIsSaving(false);
    }, [aud, dateToUse, isSaving, minuta, resuelvo, cierre, caratula, saeNum, razonDemora, ufi, estado, defensoria, operadorAud, sala, mpf, defensa, imputado, partes, tipo, tipo2, tipo3, updateDataBulk, updateByDate, refreshAud]);

    // Sistema de Auto-guardado al salir de la pestaña
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden' && (needsSaving1 || needsSaving2) && !isSaving) {
                handleGlobalSave();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [handleGlobalSave, needsSaving1, needsSaving2, isSaving]);


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