import styles from '../ControlUac.module.css'

export default function TableHead(){
    return (
        <div className={`${styles.tableHeadControlUac}`}>
            <span className={`${styles.tableHeadCell}`}>
                <input type='text' className={`${styles.inputday}`}/>
                <input type='text' className={`${styles.inputmonth}`}/>
                <input type='text' className={`${styles.inputyear}`}/>
            </span>
            <span className={`${styles.tableHeadCell}`}>LEGAJO</span>
            <span className={`${styles.tableHeadCell}`}>TIPO</span>
            <span className={`${styles.tableHeadCell}`}>JUEZ</span>
            <span className={`${styles.tableHeadCell}`}>RESULTADO</span>
            <span className={`${styles.tableHeadCell}`}>COMENTARIO</span>
        </div>
    )
}