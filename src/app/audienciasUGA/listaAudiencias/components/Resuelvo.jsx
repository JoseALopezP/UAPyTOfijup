'use client'
import styles from './Resuelvo.module.css'
import { useState, useContext, useEffect } from 'react'
import { DataContext } from '@/context/DataContext';
import { copyResuelvoToClipboard, checkForResuelvo } from '@/utils/resuelvoUtils';

export function Resuelvo({ item }) {
    const [caratula2, setCaratula2] = useState('');
    const [mpf2, setMpf2] = useState([]);
    const [defensa2, setDefensa2] = useState([]);
    const [imputado2, setImputado2] = useState([]);
    const [resuelvo2, setResuelvo2] = useState('');
    const [partes2, setPartes2] = useState([]);
    const { updateDesplegables, desplegables, updateDataToday, updateToday, updateRealTime, realTime} = useContext(DataContext);
    const [caratula, setCaratula] = useState('');
    const [razonDemora, setRazonDemora] = useState('');
    const [razonDemora2, setRazonDemora2] = useState('');
    const [mpf, setMpf] = useState([]);
    const [defensa, setDefensa] = useState([]);
    const [imputado, setImputado] = useState([]);
    const [resuelvo, setResuelvo] = useState('El Sr. Juez MOTIVA Y RESUELVE (Minuto 00:00:00/ 00:00:00 Video 1): ');
    const [partes, setPartes] = useState([]);
    const [guardarInc, setGuardarInc] = useState(false);

    const deepEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    const handleInputChange = (setter, index, key, value) => {
        setter(prev => {
            const partes = [...prev];
            partes[index][key] = value;
            return partes;
        });
    };
    const addNewInput = (setter, template) => {
        setter(prev => [...prev, { ...template, id: prev.length + 1 }]);
    };
    const removeInput = (setter, index) => {
        setter(prev => prev.filter((_, i) => i !== index));
    };
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!deepEqual(caratula2, caratula)) await updateDataToday(item.numeroLeg, item.hora, 'caratula', caratula);
        if (!deepEqual(mpf2, mpf)) await updateDataToday(item.numeroLeg, item.hora, 'mpf', mpf);
        if (!deepEqual(defensa2, defensa)) await updateDataToday(item.numeroLeg, item.hora, 'defensa', defensa);
        if (!deepEqual(imputado2, imputado)) await updateDataToday(item.numeroLeg, item.hora, 'imputado', imputado);
        if (!deepEqual(resuelvo2, resuelvo)) await updateDataToday(item.numeroLeg, item.hora, 'resuelvoText', resuelvo);
        if (!deepEqual(partes2, partes)) await updateDataToday(item.numeroLeg, item.hora, 'partes', partes);
        if (!deepEqual(razonDemora2, razonDemora)) await updateDataToday(item.numeroLeg, item.hora, 'razonDemora', razonDemora);
        await updateToday()
        if(await checkForResuelvo(item)){
            await updateRealTime()
            await updateDataToday(item.numeroLeg, item.hora, 'horaResuelvo', realTime)
        }
    };
    const checkGuardar = () => {
        if (!deepEqual(caratula2, caratula) || !deepEqual(mpf2, mpf) || !deepEqual(defensa2, defensa) || !deepEqual(imputado2, imputado) || !deepEqual(resuelvo2, resuelvo) || !deepEqual(partes2, partes)) {
            setGuardarInc(true);
        } else {
            setGuardarInc(false);
        }
    };
    const checkHoraDiff = () =>{
        const hora1 = parseInt(item.hora.split(':')[0]) * 60 + parseInt(item.hora.split(':')[1])
        const hora2 = parseInt(item.hitos[0].split('|')[0].split(':')[0]) * 60 + parseInt(item.hitos[0].split('|')[0].split(':')[1])
        return hora2 - hora1
    }
    useEffect(() => {
        updateDesplegables();
    }, []);
    useEffect(() => {
        checkGuardar()
    }, [caratula, mpf, defensa, imputado, resuelvo, partes]);
    useEffect(() => {
        if (item.fiscal){
            setMpf(item.fiscal)
            setMpf2(item.fiscal)
        } 
        if (item.imputado){
            setImputado(item.imputado) 
            setImputado2(item.imputado);
        } 
        if (item.defensa){
            setDefensa(item.defensa);
            setDefensa2(item.defensa);
        } 
        if (item.resuelvoText){
            setResuelvo(item.resuelvoText)
            setResuelvo2(item.resuelvoText)
        } 
        if (item.caratula){
            setCaratula(item.caratula)
            setCaratula2(item.caratula)
        } 
        if (item.partes){
            setPartes(item.partes)
            setPartes2(item.partes)
        } 
        if (item.razonDemora){
            setRazonDemora(item.razonDemora)
            setRazonDemora2(item.razonDemora)
        } 
    }, [item]);
    return (
        <div className={`${styles.buttonsBlock} ${styles.buttonsBlockResuelvo}`}>
            <form className={styles.resuelvoForm} onSubmit={(event) => handleSubmit(event)}>
                <label>Carátula</label>
                <input className={`${styles.inputResuelvo} ${styles.inputText} ${styles.inputCaratula} ${styles.inputItem}`}
                    type="text"
                    value={caratula}
                    onChange={(e) => setCaratula(e.target.value)}
                />
                <label>Ministerio Público Fiscal</label>
                {mpf.map((input, index) => (
                    <div key={input.id} className={`${styles.inputRow}`}>
                        <input list='mpf' className={`${styles.inputResuelvo} ${styles.inputResuelvo1} ${styles.inputSelect}`}
                            value={input.nombre}
                            onChange={(e) => handleInputChange(setMpf, index, 'nombre', e.target.value)}/>
                        <datalist id='mpf'>
                            {desplegables.fiscal && desplegables.fiscal.map(option => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </datalist>
                        <button className={`${styles.formButton} ${styles.removeButton}`} type="button" onClick={() => removeInput(setMpf, index)}>QUITAR</button>
                    </div>
                ))}
                <button className={styles.formButton} type="button" onClick={() => addNewInput(setMpf, { nombre: '' })}>+ FISCAL</button>

                <label>Imputados</label>
                {imputado.map((input, index) => (
                    <div key={input.id}  className={input.condenado ? `${styles.condenadoInput} ${styles.inputRow} ${styles.inputRow} ${styles.imputadoCondenado}` : `${styles.imputadoInput} ${styles.inputRow} ${styles.imputadoCondenado}`}>
                        <input className={`${styles.inputResuelvo} ${styles.inputResuelvo2} ${styles.inputText}`}
                            type="text"
                            value={input.nombre}
                            onChange={(e) => handleInputChange(setImputado, index, 'nombre', e.target.value)}
                            placeholder="Nombre"
                        />
                        <input className={`${styles.inputResuelvo} ${styles.inputResuelvo2} ${styles.inputText}`}
                            type="text"
                            value={input.dni}
                            onChange={(e) => handleInputChange(setImputado, index, 'dni', e.target.value)}
                            placeholder="DNI"
                        />
                        <button className={`${styles.formButton} ${styles.removeButton}`} type="button" onClick={() => removeInput(setImputado, index)}>QUITAR</button>
                    </div>
                ))}
                <span className={styles.imputadoButtons}>
                    <button className={`${styles.formButton} ${styles.imputadoButton}`} type="button" onClick={() => addNewInput(setImputado, { nombre: '', dni: '', condenado: false })}>+ IMPUTADO</button>
                    <button className={`${styles.formButton} ${styles.condenadoButton}`} type="button" onClick={() => addNewInput(setImputado, { nombre: '', dni: '', condenado: true })}>+ CONDENADO</button>
                </span>
                <label>Defensa</label>
                {defensa.map((input, index) => (
                    <div key={input.id} className={`${styles.inputRow}`} >
                        <select className={`${styles.inputResuelvo} ${styles.inputResuelvo3} ${styles.inputSelect}`}
                            value={input.tipo}
                            onChange={(e) => handleInputChange(setDefensa, index, 'tipo', e.target.value)}
                        >
                            <option value=""></option>
                            <option value="Oficial">Oficial</option>
                            <option value="Particular">Particular</option>
                        </select>
                        {input.tipo && (
                            input.tipo === 'Oficial' ? (
                                <select className={`${styles.inputResuelvo} ${styles.inputResuelvo3} ${styles.inputSelect}`}
                                    value={input.nombre}
                                    onChange={(e) => handleInputChange(setDefensa, index, 'nombre', e.target.value)}
                                >
                                    <option value=""></option>
                                    {desplegables.defensa && desplegables.defensa.map(option => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input className={`${styles.inputResuelvo} ${styles.inputResuelvo3} ${styles.inputText}`}
                                    type="text"
                                    value={input.nombre}
                                    onChange={(e) => handleInputChange(setDefensa, index, 'nombre', e.target.value)}
                                    placeholder="Nombre"
                                />
                            )
                        )}
                        <select className={`${styles.inputResuelvo} ${styles.inputSelect}`}
                            value={input.imputado}
                            onChange={(e) => handleInputChange(setDefensa, index, 'imputado', e.target.value)}
                        >
                            <option value="">imputado - (opcional)</option>
                            {imputado.map(option => (
                                <option key={option.nombre} value={option.nombre}>
                                    {option.nombre}
                                </option>
                            ))}
                        </select>
                        <button className={`${styles.formButton} ${styles.removeButton}`} type="button" onClick={() => removeInput(setDefensa, index)}>QUITAR</button>
                    </div>
                ))}
                <button className={styles.formButton} type="button" onClick={() => addNewInput(setDefensa, { tipo: '', nombre: '', imputado: '' })}>+ DEFENSA</button>

                <label>Otras Partes</label>
                {partes.map((input, index) => (
                    <div key={input.id} className={`${styles.inputRow}`}>
                        <select className={`${styles.inputResuelvo} ${styles.inputResuelvo2} ${styles.inputSelect}`}
                            value={input.role}
                            onChange={(e) => handleInputChange(setPartes, index, 'role', e.target.value)}
                        >
                            <option value=""></option>
                            <option value="DENUNCIANTE">DENUNCIANTE</option>
                            <option value="TESTIGO">TESTIGO</option>
                            <option value="QUERELLA">QUERELLA</option>
                            <option value="ASESOR DE MENORES">ASESOR DE MENORES</option>
                            <option value="AUXILIAR">AUXILIAR</option>
                            <option value="INTÉRPRETE">INTÉRPRETE</option>
                        </select>
                        <input className={`${styles.inputResuelvo} ${styles.inputResuelvo2} ${styles.inputText}`}
                            type="text"
                            value={input.name}
                            onChange={(e) => handleInputChange(setPartes, index, 'name', e.target.value)}
                            placeholder="Name"
                        />
                        <button className={`${styles.formButton} ${styles.removeButton}`} type="button" onClick={() => removeInput(setPartes, index)}>QUITAR</button>
                    </div>
                ))}
                <button className={styles.formButton} type="button" onClick={() => addNewInput(setPartes, { role: '', name: '' })}>+ PARTE</button>

                <label>Fundamentos y Resolución</label>
                <textarea rows="10" value={resuelvo} onChange={(e) => setResuelvo(e.target.value)} />
                {(item.hora && item.hitos && checkHoraDiff() > 5) &&
                <><label>RAZÓN DEMORA ({checkHoraDiff()}min)</label>
                <select onChange={(e) => setRazonDemora(e.target.value)} className={`${styles.inputResuelvo} ${styles.inputResuelvoDemora}`}>
                    <option value={razonDemora}>{razonDemora.toUpperCase()}</option>
                    <option value={'juez'}>JUEZ</option>
                    <option value={'fiscal'}>FISCAL</option>
                    <option value={'defensa'}>DEFENSA</option>
                    <option value={'imputado'}>IMPUTADO</option>
                    <option value={'audPrevia'}>AUDIENCIA PREVIA</option>
                    <option value={'victima'}>VICTIMA</option>
                    <option value={'querella'}>QUERELLA</option>
                    <option value={'traslado'}>TRASLADO DETENIDO</option>
                    <option value={'problemasTec'}>PROBLEMAS TÉCNICOS</option>
                    <option value={'demoraOp'}>DEMORA OPERADOR</option>
                    <option value={'ofijup'}>OFIJUP</option>
                </select></>}
                {guardarInc && <input className={`${styles.formButton} ${styles.guardarButton}`} type="submit" value="GUARDAR"/>}
            </form>
            <button onClick={() => copyResuelvoToClipboard(item,(new Date()).toLocaleDateString("es-AR",{day: "2-digit", month: "2-digit", year: "numeric"}).split('/').join(''))}>COPIAR</button>
        </div>
    );
}
