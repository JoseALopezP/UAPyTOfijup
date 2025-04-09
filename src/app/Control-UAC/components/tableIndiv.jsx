import styles from '../ControlUac.module.css'

export default function TableIndiv({item}){
    return (
        <div className={`${styles.tableRowControlUac}`}>
            <span className={`${styles.tableCell}`}>{item.hora}</span>
            <span className={`${styles.tableCell}`}>{item.numeroLeg}</span>
            <span className={`${styles.tableCell}`}>{item.tipo + ' ' + item.tipo2 + ' ' + item.tipo3}</span>
            <span className={`${styles.tableCell}`}>{item.juez.split('+').join(' ')}</span>
            <span className={`${styles.tableCell}`}>{item.resultado && item.resultado}</span>
            <span className={`${styles.tableCell}`}>{item.comentario && item.comentario}</span>
        </div>
    )
}