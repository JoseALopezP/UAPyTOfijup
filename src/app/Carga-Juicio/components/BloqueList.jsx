import { BloqueJuicio } from './BloqueJuicio'
import styles from './Carga-Juicio.module.css'

export function BloqueList ({array=[{fechaD: '21',fechaM: '09',fechaA: '2025', hora:'16', minuto:'00'}]}){
    return(
        <section className={`${styles.bloqueListSection}`}>
            {array && array.map(el => (
                <BloqueJuicio bloque={el} />
            ))}
        </section>
    )
}
