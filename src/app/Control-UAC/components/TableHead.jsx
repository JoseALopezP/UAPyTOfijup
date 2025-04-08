import styles from '../ControlUac.module.css'

export default function TableHead(){
    return (
        <div className={`${styles.tableHeadControlUac}`}>
            <span className={`${styles.tableHeadCell} ${styles.tableHeadCellDate}`}>
                <input type='text' maxLength={2} className={`${styles.inputday}`}/>
                <input type='text' maxLength={2} className={`${styles.inputmonth}`}/>
                <input type='text' maxLength={4} className={`${styles.inputyear}`}/>
            </span>
            <span className={`${styles.tableHeadCell} ${styles.tableHeadCellLeg}`}>LEGAJO</span>
            <span className={`${styles.tableHeadCell} ${styles.tableHeadCellTipo}`}>TIPO</span>
            <span className={`${styles.tableHeadCell} ${styles.tableHeadCellJuez}`}>JUEZ</span>
            <span className={`${styles.tableHeadCell} ${styles.tableHeadCellRes}`}>RESULTADO</span>
            <span className={`${styles.tableHeadCell} ${styles.tableHeadCellCom}`}>COMENTARIO</span>
        </div>
    )
}