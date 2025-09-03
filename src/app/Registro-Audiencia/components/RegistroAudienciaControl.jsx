'use client'
import { useContext, useEffect, useState } from 'react';
import styles from '../RegistroAudiencia.module.css';
import { DataContext } from '@/context/DataContext';
import RegistroAudienciaLeft from './RegistroAudienciaLeft';
import RegistroAudienciaRight from './RegistroAudienciaRight';

export default function RegistroAudienciaControl({ aud, dateToUse, isHovered, setNeedsSaving1, setNeedsSaving2}) {
    const {updateDesplegables} = useContext(DataContext)
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
    useEffect(() => {
        updateDesplegables()
    }, [])
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
                imputado={imputado} setImputado={setImputado} 
                tipo={tipo} setTipo={setTipo} 
                tipo2={tipo2} setTipo2={setTipo2} 
                tipo3={tipo3} setTipo3={setTipo3} 
                partes={partes} setPartes={setPartes}
                setNeedsSaving1={setNeedsSaving1}/>
            <RegistroAudienciaRight item={aud} dateToUse={dateToUse}
                setNeedsSaving2={setNeedsSaving2}
                resuelvo={resuelvo} setResuelvo={setResuelvo}
                minuta={minuta} setMinuta={setMinuta}
                cierre={cierre} setCierre={setCierre}
                sala={sala} saeNum={saeNum} caratula={caratula} razonDemora={razonDemora} mpf={mpf} ufi={ufi} estado={estado} defensa={defensa} imputado={imputado} tipo={tipo} tipo2={tipo2} tipo3={tipo3} partes={partes}/></>}
        </div>
    );
}