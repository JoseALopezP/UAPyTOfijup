'use client'
import styles from './AudienciaList.module.css'

export function ButtonsAudiencia ({audienciaState}) {
    return(
        <>
        <div className={`${styles.buttonsBlock}`}>
            {(audienciaState == 'cuarto') &&
            <button className={`${styles.stateButton} ${styles.stateButtonFinalizarcuarto}`}> ⏵ FINALIZAR CUARTO INTERMEDIO</button>}
            {(audienciaState == 'programada') &&
            <><button className={`${styles.stateButton} ${styles.stateButtonIniciar}`}> ⏵ INICIAR</button>
            <button className={`${styles.stateButton} ${styles.stateButtonSuspender}`}> ⏺ SUSPENDER</button>
            <form action="#" className={`${styles.changeBlock}`}>
                <select name="salas" id="SALAS" className={`${styles.salaSelector}`}>
                    <option value="SALA 1">1</option>
                    <option value="SALA 2">2</option>
                    <option value="SALA 3">3</option>
                    <option value="SALA 4">4</option>
                    <option value="SALA 5">5</option>
                    <option value="SALA 6">6</option>
                    <option value="SALA 7">7</option>
                    <option value="SALA 8">8</option>
                    <option value="SALA 9">9</option>
                </select>
                <input type="submit" value="🔀 CAMBIAR SALA" className={`${styles.stateButton} ${styles.stateButtonChange}`}/>
            </form>
            </>}
            {(audienciaState == 'iniciada') &&
            <><button className={`${styles.stateButton} ${styles.stateButtonFinalizar}`}> ⏹ FINALIZAR</button>
            <button className={`${styles.stateButton} ${styles.stateButtonCuarto}`}> ⏸ CUARTO INTERMEDIO</button></>}
        </div>
        </>
    )
}