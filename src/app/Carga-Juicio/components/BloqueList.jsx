import { BloqueJuicio } from './BloqueJuicio'
import styles from './Carga-Juicio.module.css'

export function BloqueList ({setBloquesArray, bloquesArray, testigos, setTestigos}){
    function updateArrayAttribute(index, attrName, attrValue) {
        setBloquesArray(prev =>
            prev.map((obj, i) =>
                i === index ? { ...obj, [attrName]: attrValue } : obj
        ))
    }
    function updateAllArrayAttributes(attrName, attrValue) {
        setBloquesArray(prev => prev.map(obj => ({ ...obj, [attrName]: attrValue })))
    }
    function removeBloque(index, audId) {
        if (window.confirm("¿Seguro que desea eliminar este bloque? Esto desvinculará a cualquier testigo asignado al mismo.")) {
            setBloquesArray(prev => prev.filter((_, i) => i !== index));
            if(setTestigos) {
                setTestigos(prev => prev.map(testigo => ({
                    ...testigo,
                    fecha: testigo.fecha ? testigo.fecha.filter(f => f.audid !== audId) : []
                })));
            }
        }
    }
    return(
        <section className={`${styles.bloqueListSection}`}>
            <span className={`${styles.timeSelectorBar}`}>
                <label className={`${styles.timeSelectorLabel}`}>Seleccionar horario:</label>
                <select className={`${styles.timeSelector}`} onChange={e => {updateAllArrayAttributes( 'hora', (e.target.value + ':00'))}}>
                    <option value={'08'}>8</option>
                    <option value={'16'}>16</option>
                </select>
            </span>
            {bloquesArray && bloquesArray.map((el, index) => (
                <BloqueJuicio key={el.audId || index} bloque={el} index={index} last={bloquesArray.length - 1 === index} testigos={testigos} updateArrayAttribute={updateArrayAttribute} removeBloque={() => removeBloque(index, el.audId)}/>
            ))}
        </section>
    )
}
