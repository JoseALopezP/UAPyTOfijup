import { BloqueJuicio } from './BloqueJuicio'
import styles from './Carga-Juicio.module.css'

export function BloqueList ({setBloquesArray, bloquesArray, testigos}){
    function updateArrayAttribute(index, attrName, attrValue) {
    setBloquesArray(prev =>
        prev.map((obj, i) =>
            i === index ? { ...obj, [attrName]: attrValue } : obj
        )
    );
    }
    return(
        <section className={`${styles.bloqueListSection}`}>
            <span className={`${styles.timeSelectorBar}`}>
                <label className={`${styles.timeSelectorLabel}`}>Seleccionar horario:</label>
                <select className={`${styles.timeSelector}`} onChange={e => {updateArrayAttribute(bloquesArray, 'hora', (e.target.value + ':00'))}}>
                    <option value={'08'}>8</option>
                    <option value={'16'}>16</option>
                </select>
            </span>
            {bloquesArray && bloquesArray.map((el, index) => (
                <BloqueJuicio key={el.id} bloque={el} index={index} last={bloquesArray.length === (index - 1)} testigos={testigos} updateArrayAttribute={updateArrayAttribute}/>
            ))}
        </section>
    )
}
