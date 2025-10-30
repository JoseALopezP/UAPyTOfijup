import styles from './Carga-Juicio.module.css'

export function ButtonSelection({newState, setNewState}){
    return(
        <div onClick={() => setNewState(!newState)} className={`${styles.buttonSelectionState}`}>
            <span className={newState ? `${styles.buttonStateIndiv} ${styles.buttonStateIndivSelected}` : `${styles.buttonStateIndiv}`}>CARGAR</span>
            <span className={newState ? `${styles.buttonStateIndiv}` : `${styles.buttonStateIndiv} ${styles.buttonStateIndivSelected}`}>EDITAR</span>
        </div>
    )
}
