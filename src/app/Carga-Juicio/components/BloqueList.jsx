import { BloqueJuicio } from './BloqueJuicio'
import styles from './Carga-Juicio.module.css'

export function BloqueList ({array=[{fechaD: '21',fechaM: '09',fechaA: '2025', hora:'16', minuto:'00'},{fechaD: '22',fechaM: '09',fechaA: '2025', hora:'16', minuto:'00'}]}){
    return(
        <section className={`${styles.bloqueListSection}`}>
            <span className={`${styles.timeSelectorBar}`}>
                <label className={`${styles.timeSelectorLabel}`}>Seleccionar horario:</label>
                <select className={`${styles.timeSelector}`}>
                    <option value={'16'}>8</option>
                    <option value={'16'}>16</option>
                </select>
            </span>
            {array && array.map(el => (
                <BloqueJuicio bloque={el} />
            ))}
        </section>
    )
}
