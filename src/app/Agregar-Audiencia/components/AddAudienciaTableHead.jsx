import styles from './AddAudiencia.module.css'

export function AddAudienciaTableHead() {
    return(
        <div className={`${styles.audienciaListTableHead} ${styles.tableRow}`}>
            <span className={`${styles.tableCell} ${styles.tableCellHora}`}>HORA</span>
            <span className={`${styles.tableCell} ${styles.tableCellSala}`}>SALA</span>
            <span className={`${styles.tableCell} ${styles.tableCellLegajo}`}>LEGAJO</span>
            <span className={`${styles.tableCell}`}>TIPO DE AUDIENCIA</span>
            <span className={`${styles.tableCell} ${styles.tableCellJuez}`}>JUEZ</span>
            <span className={`${styles.tableCell} ${styles.tableCellAction}`}>ACCIÓN</span>
        </div>
    )
}