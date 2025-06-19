import { useEffect, useState } from 'react'
import { useContext } from 'react'
import { DataContext } from '@/context/DataContext'
import styles from '../ControlUac.module.css'

export default function TableIndiv({item, date}){
    const [saved, setSaved] = useState(true)
    const [saving, setSaving] = useState(false)
    const [comment, setComment] = useState(item.comentario)
    const [result, setResult] = useState(item.resultado)
    const {updateData} = useContext(DataContext)
    const handleSave = async() =>{
        await setSaving(true)
        if(comment !== item.comentario){
            await updateData(date, item.numeroLeg, item.hora, 'comentario', comment);
        }
        if(result !== item.resultado){
            await updateData(date, item.numeroLeg, item.hora, 'resultado', result);
        }
        await setSaving(false)
        await setSaved(true)
    }
    useEffect(() =>{
        if(comment !== item.comentario || result !== item.resultado)
            setSaved(false)
        else{
            setSaved(true)
        }
    }, [comment, result])
    return (
        <>
        {saved ? <></> : <span className={`${styles.saveButton}`} onClick={() => handleSave()}>{saving ? 'Guardando' : 'Guardar'}</span>}
        <div className={`${styles.tableRowControlUac}`}>
            <div className={`${styles.tableCell} ${styles.numeroLegCell}`} title={item.estado ? item.estado.split('_').join(' ') : ''}>
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
        </div></>
    )
}