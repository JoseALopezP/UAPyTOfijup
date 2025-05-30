'use client'
import styles from '../RegistroAudiencia.module.css';
import { nameTranslate } from '@/utils/traductorNombres';

export default function AudienciaRegistroIndiv({ aud, audFunction, selectedAud }) {
    return (
        <div title={aud.situacion ? aud.situacion : 'No hay situación corporal agregada'} className={selectedAud ? `${styles.listadoAudiencias} ${styles.listadoAudienciasSelected} ${styles[aud.estado]}` : `${styles.listadoAudiencias} ${styles[aud.estado]}`} onClick={() => audFunction(aud)}>
            <div className={styles.block1}>
                <p className={`${styles.text} ${styles.textLegajo}`}>{aud.numeroLeg}</p>
                <span className={styles.block3}>
                    <p className={`${styles.text} ${styles.textEstado}`}>
                        {aud.estado ? aud.estado.split('_').join(' ') : 'PROGRAMADA'}
                    </p>
                </span>
            </div>
            <div className={`${styles.block2} ${styles[aud.estado]}`}>
                <p className={`${styles.text} ${styles.textHora}`}>{aud.hora}</p>
                <p className={`${styles.text} ${styles.textoperador}`}>{nameTranslate(aud.operador)}</p>
            </div>
        </div>
    );
}