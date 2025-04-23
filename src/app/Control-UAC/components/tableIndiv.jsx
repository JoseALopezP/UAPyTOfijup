import { useEffect, useState } from 'react'
import styles from '../ControlUac.module.css'

export default function TableIndiv({item}){
    const [saved, setSaved] = useState(true)
    const [saving, setSaving] = useState(false)
    const [comment, setComment] = useState(item.comentario || '')
    const [result, setResult] = useState(item.resultado || '')
    const handleSave = () =>{

    }
    useEffect(() =>{
        if(comment !== item.comentario || result !== item.resultado)
            setSaved(false)
    }, [comment, result])
    return (
        <div className={`${styles.tableRowControlUac}`}>
            <span className={`${styles.saveButton}`} onClick={() => handleSave()}>{saved ? '-' : (saving ? 'Guardando' : 'Guardar')}</span>
            <div className={`${styles.tableCell} ${styles.numeroLegCell}`} title={item.estado. split('_').join(' ')}>
                <p className={`${styles.horaCellP}`}><strong className={`${styles[item.estado]}`}>⬤</strong> 
                {item.hora}</p>
                <p className={`${styles.numeroLegCellP}`}>
                {item.numeroLeg}</p></div>
            <div className={`${styles.tableCell} ${styles.tipoCell}`}><p className={`${styles.tipoCellP}`}>
                {item.tipo + ' ' + item.tipo2 + ' ' + item.tipo3}</p></div>
            <div className={`${styles.tableCell} ${styles.juezCell}`}><p className={`${styles.juezCellP}`}>
                {item.juez.split('+').map(el => el.split(' ').slice(1,3).join(' ')).join(', ')}</p></div>
            <div className={`${styles.tableCell} ${styles.resultCell}`}>
                <textarea onChange={e => {setResult(e.target.value)}} value={result} className={`${styles.resultCellP}`}/></div>
            <div className={`${styles.tableCell} ${styles.commentCell}`}>
                <textarea onChange={e => {setComment(e.target.value)}} value={comment} className={`${styles.commentCellP}`}/></div>
        </div>
    )
}