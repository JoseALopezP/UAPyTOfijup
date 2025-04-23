import styles from '../ControlUac.module.css'
import { useState } from 'react'

export default function TableHead({dateFunction, date}){
    const [dia, setDia] = useState(date.substring(0,2))
    const [mes, setMes] = useState(date.substring(2,4))
    const [anio, setAnio] = useState(date.substring(4,8))
    return (
        <div className={`${styles.tableHeadControlUac}`}>
            <span className={`${styles.tableHeadCell} ${styles.tableHeadCellDate}`}>
                <input type='text' maxLength={2} className={`${styles.inputday}`} value={dia} onChange={e => {setDia(e.target.value)}}/>
                <input type='text' maxLength={2} className={`${styles.inputmonth}`} value={mes} onChange={e => {setMes(e.target.value)}}/>
                <input type='text' maxLength={4} className={`${styles.inputyear}`} value={anio} onChange={e => {setAnio(e.target.value)}}/>
                <input type="button" value={'⟳'} className={`${styles.inputSet}`} onClick={() => dateFunction(''+dia.padStart(2,'0')+mes.padStart(2,'0')+anio.padStart(4,'20'))}/>
            </span>
            <span className={`${styles.tableHeadCell} ${styles.tableHeadCellTipo}`}>TIPO</span>
            <span className={`${styles.tableHeadCell} ${styles.tableHeadCellJuez}`}>JUEZ</span>
            <span className={`${styles.tableHeadCell} ${styles.tableHeadCellRes}`}>RESULTADO</span>
            <span className={`${styles.tableHeadCell} ${styles.tableHeadCellCom}`}>COMENTARIO</span>
        </div>
    )
}