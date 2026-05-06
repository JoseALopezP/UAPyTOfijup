import { useContext, useEffect, useState } from 'react'
import styles from './Carga-Juicio.module.css'
import { DataContext } from '@/context/DataContext'
import { ButtonSelection } from './ButtonSelection'

export default function AddJuicioInfo({ setBloquesArray, newState, onToggle, setTestigos, setJuicioInfo, juicioInfo }) {
    const { updateDesplegables, desplegables, feriados, updateFeriados, fiscalesList, defensoresOficialesList, juecesList, defensoresParticularesList } = useContext(DataContext)
    const defensoresCombinados = [...(defensoresOficialesList || []), ...(defensoresParticularesList || [])].sort();
    const [numeroLeg1, setNumeroLeg1] = useState('MPF-SJ')
    const [numeroLeg1Error, setNumeroLeg1Error] = useState(true)
    const [numeroLeg2, setNumeroLeg2] = useState(null)
    const [numeroLeg2Error, setNumeroLeg2Error] = useState(true)
    const [numeroLeg3, setNumeroLeg3] = useState(null)
    const [numeroLeg3Error, setNumeroLeg3Error] = useState(true)
    const [ufi, setUfi] = useState('')
    const [ufiError, setUfiError] = useState(true)
    const [fechad, setFechad] = useState(null)
    const [fechadError, setFechadError] = useState(true)
    const [fecham, setFecham] = useState(null)
    const [fechamError, setFechamError] = useState(true)
    const [fechaa, setFechaa] = useState(null)
    const [fechaaError, setFechaaError] = useState(true)
    const [fechah, setFechah] = useState(null)
    const [fechahError, setFechahError] = useState(true)
    const [fechamm, setFechamm] = useState(null)
    const [fechammError, setFechammError] = useState(true)
    const [fechas, setFechas] = useState(null)
    const [fechasError, setFechasError] = useState(true)
    const [fechaid, setFechaid] = useState(null)
    const [fechaidError, setFechaidError] = useState(true)
    const [fechaim, setFechaim] = useState(null)
    const [fechaimError, setFechaimError] = useState(true)
    const [fechaia, setFechaia] = useState(null)
    const [fechaiaError, setFechaiaError] = useState(true)
    const [cantBloques, setCantBloques] = useState(null)
    const [cantBloquesError, setCantBloquesError] = useState(true)
    const [cantTestigos, setCantTestigos] = useState(null)
    const [cantTestigosError, setCantTestigosError] = useState(true)
    const [tipoDelito, setTipoDelito] = useState('')
    const [tipoDelitoError, setTipoDelitoError] = useState(true)
    const [tipoTribunal, setTipoTribunal] = useState('')
    const [fiscal, setFiscal] = useState('')
    const [fiscalError, setFiscalError] = useState(true)
    const [defensa, setDefensa] = useState('')
    const [defensaError, setDefensaError] = useState(true)
    const [defensaCargo, setDefensaCargo] = useState('')
    const [defensaCargoError, setDefensaCargoError] = useState(true)
    const [querella, setQuerella] = useState('')
    const [querellaError, setQuerellaError] = useState(true)
    const [juez1, setJuez1] = useState('')
    const [juez1Error, setJuez1Error] = useState(true)
    const [juez2, setJuez2] = useState('')
    const [juez2Error, setJuez2Error] = useState(true)
    const [juez3, setJuez3] = useState('')
    const [juez3Error, setJuez3Error] = useState(true)
    const [erroresList, setErroresList] = useState('')
    const checkCompletion = () => {
        const aux = []
        listCheck(numeroLeg1, setNumeroLeg1Error, desplegables.legajosPrefijo)
        digitsCheck(numeroLeg2, setNumeroLeg2Error, 5)
        digitsCheck(numeroLeg3, setNumeroLeg3Error, 4)
        listCheck(ufi, setUfiError, desplegables.ufi)
        numberCheck(fechad, setFechadError, 1, 31)
        numberCheck(fecham, setFechamError, 1, 12)
        numberCheck(fechaa, setFechaaError, 20, 2100)
        numberCheck(fechah, setFechahError, 0, 23)
        numberCheck(fechamm, setFechammError, 0, 59)
        numberCheck(fechas, setFechasError, 0, 59)
        numberCheck(cantBloques, setCantBloquesError, 0, 100)
        numberCheck(cantTestigos, setCantTestigosError, 0, 999)
        listCheck(tipoDelito, setTipoDelitoError, desplegables.delitosTipos)
        listCheck(fiscal, setFiscalError, fiscalesList)
        listCheck(defensa, setDefensaError, defensoresCombinados)
        listCheck(defensaCargo, setDefensaCargoError, desplegables.defensorias)
        typeCheck(querella, setQuerellaError, 'string')
        listCheck(juez1, setJuez1Error, juecesList)
        if (tipoTribunal === "COLEGIADO") {
            listCheck(juez2, setJuez2Error, juecesList)
            listCheck(juez3, setJuez3Error, juecesList)
        } else {

            setJuez2Error(true)
            setJuez3Error(true)
        }
        !numeroLeg1Error && aux.push('número de legajo (prefijo) no válido')
        !numeroLeg2Error && aux.push('número de legajo (central) no válido')
        !numeroLeg3Error && aux.push('número de legajo (año) no válido')
        !ufiError && aux.push('UFI no válida')
        !fechadError && aux.push('día auto no válido')
        !fechamError && aux.push('mes auto no válido')
        !fechaaError && aux.push('año auto no válido')
        !fechahError && aux.push('hora auto no válida')
        !fechammError && aux.push('minuto auto no válido')
        !fechasError && aux.push('segundo auto no válido')
        !fechaidError && aux.push('día inicio no válido')
        !fechaimError && aux.push('mes inicio no válido')
        !fechaiaError && aux.push('año inicio no válido')
        !cantBloquesError && aux.push('cantidad de bloques no válido')
        !cantTestigosError && aux.push('cantidad de testigos no válido')
        !tipoDelitoError && aux.push('tipo de delito no válido')
        !fiscalError && aux.push('fiscal no válido')
        !defensaError && aux.push('defensa no válida')
        !querellaError && aux.push('querella no válida')
        !juez1Error && aux.push('juez/presidente no válido')
        !juez2Error && aux.push('juez/vocal 1 no válido')
        !juez3Error && aux.push('juez/vocal 2 no válido')
        if (aux.length > 0) {
            setErroresList(aux.join(', '))
            return (false)
        } else {
            setErroresList('')
            return (true)
        }
    }
    const numberCheck = (value, setter, min, max) => {
        if (value !== null && value !== '' && value >= min && value <= max) {
            setter(true)
        } else {
            setter(false)
        }
    }
    const digitsCheck = (value, setter, count) => {
        if (value !== null && String(value).length === count && !isNaN(value)) {
            setter(true)
        } else {
            setter(false)
        }
    }
    const listCheck = (value, setter, list) => {
        if (list.includes(value)) {
            setter(true)
        } else {
            setter(false)
        }
    }
    const typeCheck = (value, setter, type) => {
        if (typeof value === type) {
            setter(true)
        } else {
            setter(false)
        }
    }
    const changeHandler = (value, setter, errorSetter, errorchecker, check1, check2 = 0) => {
        setter(value)
        errorchecker(value, errorSetter, check1, check2)
    }
    const changeHandlerSplitter = (value, setter, errorSetter, errorchecker, check1, check2, setterCargo, setterCargoError) => {
        const aux = value.split(' - ')[1]
        setter(value)
        errorchecker(value, errorSetter, check1)
        if (check2.includes(aux)) {
            listCheck(aux, setterCargoError, check2)
            setterCargo(aux)
        } else {
            setterCargo('')
        }
    }
    const handleCopiar = () => {
        if (checkCompletion()) {
            const cells = `${numeroLeg1 + '-' + numeroLeg2 + '-' + numeroLeg3}\t${ufi}\t\t${fechad + '/' + fecham + '/' + fechaa + ' ' + fechah + ':' + fechamm + ':' + fechas}\t${fechaid + '/' + fechaim + '/' + fechaia}\t${cantBloques}\t\t\t\t\t\t\t${cantTestigos}\t\t${tipoDelito}\t${tipoTribunal}\t${fiscal}\t${defensa}\t${querella}\t${juez1}\t${tipoTribunal === 'COLEGIADO' ? 'PRESIDENTE' : 'N/A'}` +
                `${tipoTribunal === 'COLEGIADO' && '\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t' + juez2 + 'VOCAL'}` + `${tipoTribunal === 'COLEGIADO' && '\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t' + juez3 + 'VOCAL'}`
            navigator.clipboard.writeText(cells);
        }
    }
    const isHoliday = (dateObj) => {
        const d = String(dateObj.getDate()).padStart(2, '0');
        const m = String(dateObj.getMonth() + 1).padStart(2, '0');
        const y = String(dateObj.getFullYear());
        const dateStr = `${d}${m}${y}`;
        const dayOfWeek = dateObj.getDay();

        // Check weekend
        if (dayOfWeek === 0 || dayOfWeek === 6) return true;

        // Check business holidays (feriados.feriados is likely an array of DDMMYYYY)
        if (feriados && feriados.feriados && Array.isArray(feriados.feriados)) {
            return feriados.feriados.includes(dateStr);
        }
        return false;
    };

    const handleGenerar = () => {
        const aux = []
        const aux2 = []
        if (checkCompletion()) {
            // Use the "Fecha de inicio juicio" as the starting point
            let currentDay = new Date(parseInt(fechaia), parseInt(fechaim) - 1, parseInt(fechaid));

            for (let i = 0; i < parseInt(cantBloques); i++) {
                // Ensure currentDay is a valid business day
                while (isHoliday(currentDay)) {
                    currentDay.setDate(currentDay.getDate() + 1);
                }

                const d = String(currentDay.getDate()).padStart(2, '0');
                const m = String(currentDay.getMonth() + 1).padStart(2, '0');
                const y = String(currentDay.getFullYear());

                const h = String(fechah || '00').padStart(2, '0');
                const mm = String(fechamm || '00').padStart(2, '0');
                const s = String(fechas || '00').padStart(2, '0');

                const formattedLegajo = `${numeroLeg1}-${String(numeroLeg2).padStart(5, "0")}-${numeroLeg3}`;
                aux.push({
                    aId: `${h}${mm}${formattedLegajo}`,
                    audId: `${formattedLegajo}-${crypto.randomUUID().slice(0, 4)}`,
                    hora: `${h}:${mm}`,
                    horaProgramada: 45,
                    sala: " -",
                    numeroLeg: formattedLegajo,
                    tipo: "DEBATE",
                    tipo2: "",
                    tipo3: "",
                    juez: tipoTribunal === "COLEGIADO" ? `${juez1}+${juez2}+${juez3}` : juez1,
                    estado: "PROGRAMADA",
                    estadoBloque: "PROGRAMADO",
                    situacion: "",
                    fecha: `${d}${m}${y}`,
                });

                // Move to the next day for the next block
                currentDay.setDate(currentDay.getDate() + 1);
            }
            setBloquesArray(aux)
            for (let i = 0; i < parseInt(cantTestigos); i++) {
                aux2.push({
                    id: crypto.randomUUID(),
                    nombre: '',
                    dni: '',
                    fecha: []
                })
            }
            setTestigos(aux2)
        }
    }
    useEffect(() => {
        updateDesplegables()
        updateFeriados()
    }, []);

    useEffect(() => {
        // Sync local state to parent juicioInfo for saving
        setJuicioInfo({
            numeroLeg: `${numeroLeg1}-${String(numeroLeg2).padStart(5, "0")}-${numeroLeg3}`,
            ufi: ufi,
            auto: `${String(fechad || '00').padStart(2, '0')}/${String(fecham || '00').padStart(2, '0')}/${String(fechaa || '0000').padStart(4, '0')} ${String(fechah || '00').padStart(2, '0')}:${String(fechamm || '00').padStart(2, '0')}:${String(fechas || '00').padStart(2, '0')}`,
            inicio: `${String(fechaid || '00').padStart(2, '0')}/${String(fechaim || '00').padStart(2, '0')}/${String(fechaia || '0000').padStart(4, '0')}`,
            tipoDelito: tipoDelito,
            tipoTribunal: tipoTribunal,
            fiscal: fiscal,
            defensa: defensa,
            defensoria: defensaCargo,
            querella: querella,
            jueces: tipoTribunal === 'COLEGIADO' ? `${juez1}+${juez2}+${juez3}` : juez1,
            estadoJuicio: 'PROGRAMADO'
        })
    }, [numeroLeg1, numeroLeg2, numeroLeg3, ufi, fechad, fecham, fechaa, fechah, fechamm, fechas, fechaid, fechaim, fechaia, tipoDelito, tipoTribunal, fiscal, defensa, defensaCargo, querella, juez1, juez2, juez3])
    return (
        <section className={`${styles.addJuicioSection}`}>
            <ButtonSelection newState={newState} onToggle={onToggle} />
            <label className={`${styles.cargaLabel}`}>Número de Legajo</label>
            <span className={`${styles.multiInput}`}>
                <input className={numeroLeg1Error ? `${styles.multiJuicioInput}` : `${styles.multiJuicioInput} ${styles.multiJuicioInputWrong}`}
                    onChange={e => changeHandler(e.target.value, setNumeroLeg1, setNumeroLeg1Error, listCheck, desplegables.legajosPrefijo)} value={numeroLeg1} list='legajosPrefijo' />
                <input className={numeroLeg2Error ? `${styles.multiJuicioInput}` : `${styles.multiJuicioInput} ${styles.multiJuicioInputWrong}`}
                    onChange={e => changeHandler(e.target.value, setNumeroLeg2, setNumeroLeg2Error, digitsCheck, 5)}
                    placeholder='00000' value={numeroLeg2} />
                <input className={numeroLeg3Error ? `${styles.multiJuicioInput}` : `${styles.multiJuicioInput} ${styles.multiJuicioInputWrong}`}
                    placeholder='2025' onChange={e => changeHandler(e.target.value, setNumeroLeg3, setNumeroLeg3Error, digitsCheck, 4)} value={numeroLeg3} /></span>
            <label className={`${styles.cargaLabel}`}>Auto de Apertura</label>
            <span className={`${styles.multiInput}`}>
                <input className={fechadError ? `${styles.multiJuicioInput}` : `${styles.multiJuicioInput} ${styles.multiJuicioInputWrong}`}
                    onChange={e => changeHandler(e.target.value, setFechad, setFechadError, numberCheck, 1, 31)}
                    placeholder='05' value={fechad} />
                <input className={fechamError ? `${styles.multiJuicioInput}` : `${styles.multiJuicioInput} ${styles.multiJuicioInputWrong}`}
                    placeholder='02' onChange={e => changeHandler(e.target.value, setFecham, setFechamError, numberCheck, 1, 12)} value={fecham} />
                <input className={fechaaError ? `${styles.multiJuicioInput}` : `${styles.multiJuicioInput} ${styles.multiJuicioInputWrong}`}
                    placeholder='2000' onChange={e => changeHandler(e.target.value, setFechaa, setFechaaError, numberCheck, 20, 2100)} value={fechaa} />
            </span>
            <span className={`${styles.multiInput}`}>
                <input className={fechahError ? `${styles.multiJuicioInput}` : `${styles.multiJuicioInput} ${styles.multiJuicioInputWrong}`}
                    onChange={e => changeHandler(e.target.value, setFechah, setFechahError, numberCheck, 0, 23)}
                    placeholder='hh' value={fechah} />
                <input className={fechammError ? `${styles.multiJuicioInput}` : `${styles.multiJuicioInput} ${styles.multiJuicioInputWrong}`}
                    placeholder='mm' onChange={e => changeHandler(e.target.value, setFechamm, setFechammError, numberCheck, 0, 59)} value={fechamm} />
                <input className={fechasError ? `${styles.multiJuicioInput}` : `${styles.multiJuicioInput} ${styles.multiJuicioInputWrong}`}
                    placeholder='ss' onChange={e => changeHandler(e.target.value, setFechas, setFechasError, numberCheck, 0, 59)} value={fechas} />
            </span>
            <label className={`${styles.cargaLabel}`}>Fecha de inicio juicio</label>
            <span className={`${styles.multiInput}`}>
                <input className={fechaidError ? `${styles.multiJuicioInput}` : `${styles.multiJuicioInput} ${styles.multiJuicioInputWrong}`}
                    onChange={e => changeHandler(e.target.value, setFechaid, setFechaidError, numberCheck, 1, 31)}
                    placeholder='05' value={fechaid} />
                <input className={fechaimError ? `${styles.multiJuicioInput}` : `${styles.multiJuicioInput} ${styles.multiJuicioInputWrong}`}
                    placeholder='02' onChange={e => changeHandler(e.target.value, setFechaim, setFechaimError, numberCheck, 1, 12)} value={fechaim} />
                <input className={fechaiaError ? `${styles.multiJuicioInput}` : `${styles.multiJuicioInput} ${styles.multiJuicioInputWrong}`}
                    placeholder='2000' onChange={e => changeHandler(e.target.value, setFechaia, setFechaiaError, numberCheck, 20, 2100)} value={fechaia} />
            </span>
            <label className={`${styles.cargaLabel}`}>Cantidad de bloques</label>
            <input className={cantBloquesError ? `${styles.juicioInput}` : `${styles.juicioInput} ${styles.juicioInputWrong}`}
                onChange={e => changeHandler(e.target.value, setCantBloques, setCantBloquesError, numberCheck, 0, 100)} value={cantBloques} />
            <label className={`${styles.cargaLabel}`}>Tipo de delito</label>
            <input className={tipoDelitoError ? `${styles.juicioInput}` : `${styles.juicioInput} ${styles.juicioInputWrong}`}
                onChange={e => changeHandler(e.target.value, setTipoDelito, setTipoDelitoError, listCheck, desplegables.delitosTipos)} value={tipoDelito} list='delitosTipos' />
            <label className={`${styles.cargaLabel}`}>Tipo de tribunal</label>
            <select className={`${styles.juicioInput}`} onChange={e => setTipoTribunal(e.target.value)} value={tipoTribunal}>
                <option key={'UNIPERSONAL'} value={"UNIPERSONAL"}>UNIPERSONAL</option>
                <option key={'COLEGIADO'} value={"COLEGIADO"}>COLEGIADO</option>
            </select>
            <label className={`${styles.cargaLabel}`}>Fiscal</label>
            <input className={fiscalError ? `${styles.juicioInput}` : `${styles.juicioInput} ${styles.juicioInputWrong}`}
                onChange={e => changeHandler(e.target.value, setFiscal, setFiscalError, listCheck, fiscalesList)} value={fiscal} list='fiscal'
                onBlur={(e) => { if (e.target.value && fiscalesList && !fiscalesList.includes(e.target.value)) { alert("Por favor, selecciona un nombre de la lista."); setFiscal('') } }}
            />
            <label className={`${styles.cargaLabel}`}>UFI</label>
            <input className={ufiError ? `${styles.juicioInput}` : `${styles.juicioInput} ${styles.juicioInputWrong}`}
                onChange={e => changeHandler(e.target.value, setUfi, setUfiError, listCheck, desplegables.ufi)} value={ufi} list='ufi' />
            <label className={`${styles.cargaLabel}`}>Cantidad de testigos</label>
            <input className={cantTestigosError ? `${styles.juicioInput}` : `${styles.juicioInput} ${styles.juicioInputWrong}`}
                onChange={e => changeHandler(e.target.value, setCantTestigos, setCantTestigosError, numberCheck, 0, 999)} value={cantTestigos} />
            <label className={`${styles.cargaLabel}`}>Defensa</label>
            <input className={defensaError ? `${styles.juicioInput}` : `${styles.juicioInput} ${styles.juicioInputWrong}`}
                onChange={e => changeHandler(e.target.value, setDefensa, setDefensaError, listCheck, defensoresCombinados)} value={defensa} list='defensa'
                onBlur={(e) => { if (e.target.value && defensoresCombinados && !defensoresCombinados.includes(e.target.value)) { alert("Por favor, selecciona un nombre de la lista."); setDefensa('') } }}
            />
            <label className={`${styles.cargaLabel}`}>Defensoria</label>
            <input className={defensaCargoError ? `${styles.juicioInput}` : `${styles.juicioInput} ${styles.juicioInputWrong}`}
                onChange={e => changeHandler(e.target.value, setDefensaCargo, setDefensaCargoError, listCheck, desplegables.defensaCargo)} value={defensaCargo} list='defensorias' />
            <label className={`${styles.cargaLabel}`}>Querella</label>
            <input className={querellaError ? `${styles.juicioInput}` : `${styles.juicioInput} ${styles.juicioInputWrong}`}
                onChange={e => changeHandler(e.target.value, setQuerella, setQuerellaError, typeCheck, 'string')} value={querella} />
            <label className={`${styles.cargaLabel}`}>Jueces</label>
            <input className={juez1Error ? `${styles.juicioInput}` : `${styles.juicioInput} ${styles.juicioInputWrong}`}
                onChange={e => changeHandler(e.target.value, setJuez1, setJuez1Error, listCheck, juecesList)}
                value={juez1} list='jueces' placeholder={tipoTribunal === "COLEGIADO" ? 'presidente' : 'juez'}
                onBlur={(e) => { if (e.target.value && juecesList && !juecesList.includes(e.target.value)) { alert("Por favor, selecciona un nombre de la lista."); setJuez1('') } }}
            />
            {tipoTribunal === "COLEGIADO" &&
                <>
                    <input className={juez2Error ? `${styles.juicioInput}` : `${styles.juicioInput} ${styles.juicioInputWrong}`}
                        onChange={e => changeHandler(e.target.value, setJuez2, setJuez2Error, listCheck, juecesList)} value={juez2} list='jueces'
                        onBlur={(e) => { if (e.target.value && juecesList && !juecesList.includes(e.target.value)) { alert("Por favor, selecciona un nombre de la lista."); setJuez2('') } }}
                    />
                    <input className={juez3Error ? `${styles.juicioInput}` : `${styles.juicioInput} ${styles.juicioInputWrong}`}
                        onChange={e => changeHandler(e.target.value, setJuez3, setJuez3Error, listCheck, juecesList)} value={juez3} list='jueces'
                        onBlur={(e) => { if (e.target.value && juecesList && !juecesList.includes(e.target.value)) { alert("Por favor, selecciona un nombre de la lista."); setJuez3('') } }}
                    />
                </>}
            <datalist id="delitosTipos" className={`${styles.tableCellInput}`}>
                {desplegables.delitosTipos && desplegables.delitosTipos.map((el) => (
                    <option key={el} value={el}>
                        {el}
                    </option>))}
            </datalist>
            <datalist id="defensa" className={`${styles.tableCellInput}`}>
                {defensoresCombinados && defensoresCombinados.map((el) => (
                    <option key={el} value={el}>
                        {el}
                    </option>))}
            </datalist>
            <datalist id="defensorias" className={`${styles.tableCellInput}`}>
                {desplegables.defensorias && desplegables.defensorias.map((el) => (
                    <option key={el} value={el}>
                        {el}
                    </option>))}
                <option key={''} value={''}></option>
            </datalist>
            <datalist id="jueces" className={`${styles.tableCellInput}`}>
                {juecesList && juecesList.map((el) => (
                    <option key={el} value={el}>
                        {el}
                    </option>))}
            </datalist>
            <datalist id="fiscal" className={`${styles.tableCellInput}`}>
                {fiscalesList && fiscalesList.map((el) => (
                    <option key={el} value={el}>
                        {el}
                    </option>))}
            </datalist>
            <datalist id="ufi" className={`${styles.tableCellInput}`}>
                {desplegables.ufi && desplegables.ufi.map((el) => (
                    <option key={el} value={el}>
                        {el}
                    </option>))}
            </datalist>
            <datalist id="legajosPrefijo" className={`${styles.tableCellInput}`}>
                {desplegables.legajosPrefijo && desplegables.legajosPrefijo.map((el) => (
                    <option key={el} value={el}>
                        {el}
                    </option>))}
            </datalist>
            <span className={`${styles.multiInput}`}>
                <button type='button' className={`${styles.juicioButton}`} onClick={() => handleGenerar()} title="Calcula y sugiere la distribución de los bloques de audiencia basándose en la fecha de inicio y feriados.">PRE-GENERAR</button>
                <button type='button' className={`${styles.juicioButton}`} onClick={() => handleCopiar()}>COPIAR</button>
            </span>
            <span className={`${styles.erroresList}`}>{erroresList}</span>
        </section>
    )
}
