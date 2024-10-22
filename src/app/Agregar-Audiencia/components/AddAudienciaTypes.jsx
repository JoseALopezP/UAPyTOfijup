import styles from './AddAudiencia.module.css'

export function AddAudienciaTypes(setTipo1, setTipo2, setTipo3, tipo1, tipo2, tipo3, tiposList) {

    return(
        <span className={`${styles.tableCell} ${styles.tableCellTipo}`}>
            <input list='tipo' className={`${styles.tableCellInput} ${styles.salaSelect}`} value={tipo1} onChange={e => setTipo1(e.target.value)}/>
            <input list='tipo' className={`${styles.tableCellInput} ${styles.salaSelect}`} value={tipo2} onChange={e => setTipo2(e.target.value)}/>
            <input list='tipo' className={`${styles.tableCellInput} ${styles.salaSelect}`} value={tipo3} onChange={e => setTipo3(e.target.value)}/>
            <datalist id='tipo' className={`${styles.tableCellInput}`}>
                {tiposList && tiposList.map(el =>(
                    <option key={el} value={el}>{el}</option>
                ))}</datalist>
        </span>
    )
}