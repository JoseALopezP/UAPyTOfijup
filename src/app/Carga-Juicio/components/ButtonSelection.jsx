import styles from './Carga-Juicio.module.css'

export function ButtonSelection({newState, onToggle}){
    return(
        <div className={`${styles.buttonSelectionState}`}>
            <span 
                onClick={() => onToggle(true)} 
                className={newState ? `${styles.buttonStateIndiv} ${styles.buttonStateIndivSelected}` : `${styles.buttonStateIndiv}`}
            >
                CARGAR
            </span>
            <span 
                onClick={() => onToggle(false)} 
                className={newState ? `${styles.buttonStateIndiv}` : `${styles.buttonStateIndiv} ${styles.buttonStateIndivSelected}`}
            >
                EDITAR
            </span>
        </div>
    )
}
