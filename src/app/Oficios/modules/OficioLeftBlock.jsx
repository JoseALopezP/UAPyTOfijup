import { useContext, useEffect, useState } from 'react';
import styles from '../Oficios.module.css';
import ControlButtonsBlock from './ControlButtonsBlock';
import { DataContext } from '@/context/DataContext';
import ErroresUgaList from './ErroresUgaList';

export default function OficioLeftBlock({ date, aud }) {
    const { updateData, desplegables } = useContext(DataContext);
    const [control, setControl] = useState(aud.control || '');
    const [resultado, setResultado] = useState(aud.resultado || '');
    const [resultadoSave, setResultadoSave] = useState(false);
    const [auxControl, setAuxControl] = useState(aud.control || '');
    const [errores, setErrores] = useState([]);
    const [errorTipo, setErrorTipo] = useState('');
    const [errorInput, setErrorInput] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        const newError = { tipo: errorTipo, comentario: errorInput, estado: false };
        setErrores((prev) => [...prev, newError]);
        await updateData(date, aud.numeroLeg, aud.hora, 'erroresUga', [...errores, newError]);
        setErrorTipo('');
        setErrorInput('');
    };
    const handleSave = async() =>{
        await updateData(date, aud.numeroLeg, aud.hora, 'resultado', resultado)
        setResultadoSave(false)
    }
    useEffect(() => {
        setControl(aud.control);
        setErrores(aud.erroresUga ? [...aud.erroresUga] : []);
        setAuxControl(aud.control);
    }, [aud]);
    useEffect(()=>{
        if(resultado !== aud.resultado){
            setResultadoSave(true)
        }else{
            setResultadoSave(false)
        }
    },[resultado])
    useEffect(()=>{
        setResultado(aud.resultado)
    },[aud.resultado])
    return (
        <div className={styles.oficioLeftBlockContainer}>
            <span className={styles.oficioControlBlock}>
                <h2 className={styles.controlOficioTitle}>CONTROL OFICIO</h2>
                <textarea
                    className={styles.oficioControlTextArea}
                    rows="8"
                    value={control}
                    onChange={(e) => setControl(e.target.value)}
                />
                <ControlButtonsBlock
                    date={date}
                    aud={aud}
                    control={control}
                    controlFunction={setControl}
                    auxControl={auxControl}
                    setAuxControl={setAuxControl}
                />
            </span>
            <span className={styles.oficioErroresList}>
                <h2 className={styles.controlOficioTitle}>REVISIÓN UGA</h2>
                <ErroresUgaList date={date} aud={aud} errores={errores} setErrores={setErrores} />
                <form className={styles.addErrorBlock} onSubmit={handleSubmit}>
                    <select
                        onChange={(e) => setErrorTipo(e.target.value)}
                        value={errorTipo}
                        className={`${styles.controlOficioErrorInput} ${styles.controlOficioErrorInputTipos}`}
                    >
                        <option></option>
                        {desplegables.tiposErrores.map((el) => (
                            <option key={el} value={el}>
                                {el}
                            </option>
                        ))}
                    </select>
                    <input
                        type="text"
                        onChange={(e) => setErrorInput(e.target.value)}
                        value={errorInput}
                        className={`${styles.controlOficioErrorInput} ${styles.controlOficioErrorInputComent}`}
                    />
                    <button type="submit" className={`${styles.controlOficioErrorInput} ${styles.controlOficioErrorInputAdd}`}>
                        +
                    </button>
                </form>
            </span>
            <span className={styles.resultadoBlock}>
                <h2 className={styles.controlOficioTitle}>Resultado</h2>
                <textarea
                    className={`${styles.oficioControlTextArea} ${styles.resultadoTextArea}`}
                    rows="8"
                    value={resultado}
                    onChange={(e) => setResultado(e.target.value)}
                />
                <button type='button' onClick={() => handleSave()}
                className={resultadoSave ? `${styles.controlOficioButton2} ${styles.controlOficioButton3}` : `${styles.controlOficioButton2} ${styles.controlOficioButton3} ${styles.controlOficioButtonNone}`}>
                    GUARDAR</button>
            </span>
        </div>
    );
}
