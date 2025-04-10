import styles from '../ControlUac.module.css'

export default function TableIndiv({item}){

    return (
        <div className={`${styles.tableRowControlUac}`}>
            <span className={`${styles.tableCell} ${styles.horaCell}`}>{item.hora}</span>
            <span className={`${styles.tableCell} ${styles.numeroLegCell}`}>{item.numeroLeg}</span>
            <span className={`${styles.tableCell} ${styles.tipoCell}`}>{item.tipo + ' ' + item.tipo2 + ' ' + item.tipo3}</span>
            <span className={`${styles.tableCell} ${styles.juezCell}`}>{item.juez.split('+').map(el => el.split(' ').splice(0,2)).join(' ')}</span>
            <span className={`${styles.tableCell} ${styles.resultCell}`}>{item.resultado && item.resultado}</span>
            <span className={`${styles.tableCell} ${styles.CommentCell}`}>{item.comentario && item.comentario}</span>
        </div>
    )
}