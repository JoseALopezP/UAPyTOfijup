import styles from './RegistroAudiencia.module.css';
import { nameTranslate } from '@/utils/traductorNombres';

export default function AudienciaRegistroIndiv({ aud }) {
    return (
        <div className={styles.listadoAudiencias}>
            <div className={styles.block1}>
                <p className={`${styles.text} ${styles.textLegajo}`}>{aud.numeroLeg}</p>
                <span className={styles.block3}>
                    <p className={`${styles.text} ${styles.textEstado}`}>
                        {aud.hitos ? aud.hitos[aud.hitos.length - 1].split(' | ')[1].split('_').join(' ') : 'PROGRAMADA'}
                    </p>
                </span>
            </div>
            <div className={styles.block2}>
                <p className={`${styles.text} ${styles.textHora}`}>{aud.hora}</p>
                <p className={`${styles.text} ${styles.textoperador}`}>{nameTranslate(aud.operador)}</p>
            </div>
        </div>
    );
}