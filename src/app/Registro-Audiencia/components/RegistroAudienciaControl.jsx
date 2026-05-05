import { useContext, useEffect, useState } from 'react';
import styles from '../RegistroAudiencia.module.css';
import { DataContext } from '@/context New/DataContext';
import RegistroAudienciaLeft from './RegistroAudienciaLeft';
import RegistroAudienciaRight from './RegistroAudienciaRight';
import deepEqual from '@/utils/deepEqual';
import { removeHtmlTags } from '@/utils/removeHtmlTags';
import updateRealTimeFunction from '@/firebase new/firestore/updateRealTimeFunction';
import { checkForResuelvo } from '@/utils/resuelvoUtils';

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

    const handleGlobalSave = async () => {
        if (!aud || isSaving) return;
        setIsSaving(true);
        
        let retries = 3;
        let success = false;
        
        while (retries > 0 && !success) {
            try {
                // Guardar Minuta, Resuelvo, Cierre
                if (minuta !== (aud.minuta || '') && removeHtmlTags(minuta) !== '') {
                    await updateDataOnly(dateToUse, aud.id, 'minuta', minuta);
                }
                if (resuelvo !== (aud.resuelvoText || '') && removeHtmlTags(resuelvo) !== '') {
                    await updateDataOnly(dateToUse, aud.id, 'resuelvoText', resuelvo);
                }
                if (cierre !== (aud.cierre || '') && removeHtmlTags(cierre) !== '') {
                    await updateDataOnly(dateToUse, aud.id, 'cierre', cierre);
                }
                
                // Guardar Metadatos
                if (caratula !== (aud.caratula || '')) await updateData(dateToUse, aud.id, 'caratula', caratula);
                if (saeNum !== (aud.saeNum || '')) await updateData(dateToUse, aud.id, 'saeNum', saeNum);
                if (razonDemora !== (aud.razonDemora || '')) await updateData(dateToUse, aud.id, 'razonDemora', razonDemora);
                if (ufi !== (aud.ufi || '')) await updateData(dateToUse, aud.id, 'ufi', ufi);
                if (estado !== (aud.estado || '')) await updateData(dateToUse, aud.id, 'estado', estado);
                if (defensoria !== (aud.defensoria || '')) await updateData(dateToUse, aud.id, 'defensoria', defensoria);
                if (operadorAud !== (aud.operador || '')) await updateData(dateToUse, aud.id, 'operador', operadorAud);
                if (sala !== (aud.sala || '')) await updateData(dateToUse, aud.id, 'sala', sala);
                
                if (!deepEqual(mpf, aud.mpf || [])) await updateData(dateToUse, aud.id, 'mpf', mpf);
                if (!deepEqual(defensa, aud.defensa || [])) await updateData(dateToUse, aud.id, 'defensa', defensa);
                if (!deepEqual(imputado, aud.imputado || [])) await updateData(dateToUse, aud.id, 'imputado', imputado);
                if (!deepEqual(partes, aud.partes || [])) await updateData(dateToUse, aud.id, 'partes', partes);
                
                if (tipo !== (aud.tipo || '') || tipo2 !== (aud.tipo2 || '') || tipo3 !== (aud.tipo3 || '')) {
                    await updateData(dateToUse, aud.id, 'tipo', tipo);
                    await updateData(dateToUse, aud.id, 'tipo2', tipo2);
                    await updateData(dateToUse, aud.id, 'tipo3', tipo3);
                }

                if (checkForResuelvo(aud)) {
                    await updateDataDeep(dateToUse, aud.id, 'horaResuelvo', updateRealTimeFunction());
                }

                await updateByDate(dateToUse);
                if (refreshAud) await refreshAud();
                success = true; // Succeeded!
            } catch (error) {
                console.error(`Error saving all data. Retries left: ${retries - 1}`, error);
                retries -= 1;
                if (retries > 0) {
                    await new Promise(resolve => setTimeout(resolve, 60000)); // wait 1m
                } else {
                    alert("Error al guardar los cambios después de varios intentos. Verifique su conexión y reintente.");
                }
            }
        }
        setIsSaving(false);
    };


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