import { BloqueJuicio } from './BloqueJuicio'
import styles from './Carga-Juicio.module.css'

export function BloqueList ({setBloquesArray, bloquesArray}){
    function updateArrayAttribute(arr, attrName, attrValue) {
        setBloquesArray(arr.map(obj => {
            const newObj = { ...obj }; 
            newObj[attrName] = attrValue;
            return newObj;
        }));
    }
    return(
        <section className={`${styles.bloqueListSection}`}>
            <span className={`${styles.timeSelectorBar}`}>
                <label className={`${styles.timeSelectorLabel}`}>Seleccionar horario:</label>
                <select className={`${styles.timeSelector}`} onChange={e => {updateArrayAttribute(bloquesArray, 'hora', e.target.value) ; updateArrayAttribute(bloquesArray, 'minuto', '00')}}>
                    <option value={'8'}>8</option>
                    <option value={'16'}>16</option>
                </select>
            </span>
            {bloquesArray && bloquesArray.map((el, index) => (
                <BloqueJuicio bloque={el} last={bloquesArray.length === (index - 1)}/>
            ))}
        </section>
    )
}
