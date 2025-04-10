import styles from '../ControlUac.module.css'

export default function TableIndiv({item}){

    return (
        <div className={`${styles.tableRowControlUac}`}>
            <div className={`${styles.tableCell} ${styles.horaCell}`}><p className={`${styles.horaCellP}`}>
                {item.hora}</p></div>
            <div className={`${styles.tableCell} ${styles.numeroLegCell}`}><p className={`${styles.numeroLegCellP}`}>
                {item.numeroLeg}</p></div>
            <div className={`${styles.tableCell} ${styles.tipoCell}`}><p className={`${styles.tipoCellP}`}>
                {item.tipo + ' ' + item.tipo2 + ' ' + item.tipo3}</p></div>
            <div className={`${styles.tableCell} ${styles.juezCell}`}><p className={`${styles.juezCellP}`}>
                {item.juez.split('+').map(el => el.split(' ').slice(1,3).join(' ')).join(', ')}</p></div>
            <div className={`${styles.tableCell} ${styles.resultCell}`}><p className={`${styles.resultCellP}`}>
                {item.resultado && item.resultado}</p></div>
            <div className={`${styles.tableCell} ${styles.commentCell}`}><p className={`${styles.commentCellP}`}>
                {item.comentario && item.comentario}</p></div>
        </div>
    )
}