import { useEffect, useState } from 'react'
import styles from './Carga-Juicio.module.css'

export function BloqueJuicio ({bloque, testigos, last, updateArrayAttribute, index}){
    const [option, setOption] = useState(last ? 'LECTURA DE SENTENCIA' : 'DEBATE')
    return(
        <div className={`${styles.bloqueJuicioSection}`}>
            <span className={`${styles.dateTimeJuicio}`}>
                <input className={`${styles.inputDateTime}`} type='text' value={bloque.fecha.slice(0,2)} onChange={e => updateArrayAttribute(index, 'fecha', (e.target.value+bloque.fecha.slice(2,8)))}/>
                <input className={`${styles.inputDateTime}`} value={bloque.fecha.slice(2,4)} onChange={e => updateArrayAttribute(index, 'fecha', (bloque.fecha.slice(0,2) + e.target.value + bloque.fecha.slice(4,8)))}/>
                <input className={`${styles.inputDateTimeDouble}`} value={bloque.fecha.slice(4,8)} onChange={e => updateArrayAttribute(index, 'fecha', (bloque.fecha.slice(0,4) + e.target.value))}/>
                <label className={`${styles.lineSeparator}`}>|</label>
                <input className={`${styles.inputDateTime}`} value={bloque.hora.split(':')[0]} onChange={e => updateArrayAttribute(index, 'hora', `${e.target.value}:${bloque.hora.split(':')[1]}`)}/>
                <input className={`${styles.inputDateTime}`} value={bloque.hora.split(':')[1]} onChange={e => updateArrayAttribute(index, 'hora', `${bloque.hora.split(':')[0]}:${e.target.value}`)}/>
            </span>
            <span className={`${styles.horizontalSeparator}`}></span>
            <span className={`${styles.controlJuicio}`}>
                <span className={`${styles.testigosList}`}>
                    {testigos && testigos.filter(el => (el.fechaD === bloque.fecha.slice(0,2) && el.fechaM === bloque.fecha.slice(2,4) && el.fechaA === bloque.fecha.slice(4,8))).map(el =>(
                        <span className={`${styles.testigoIndiv}`}>{el.completo === true ? <p className={`${styles.completado}`}>&nbsp;⬤</p> : <p className={`${styles.noCompletado}`}>◯</p>}<p>&nbsp;{el.nombre}</p></span>
                    ))}
                </span>
                <span className={`${styles.estadoBlock}`}>
                    <p>BLOQUE 1</p>
                    <p>FINALIZADA</p>
                </span>
            </span>
            <span>
                {testigos && testigos.filter(el => el.fecha.map(aux => aux.fecha.split('-')[0]).includes(bloque.fecha)).map(el =>(
                    <p>{el.nombre}{el.dni ? ' - ' +el.dni : ''}</p>
                ))}
            </span>
            <span>
                <select className={`${styles.bloqueTypeSelector}`} value={option} onChange={e => setOption(e.target.value)}>
                    <option value={'DEBATE'}>DEBATE</option>
                    <option value={'LECTURA DE SENTENCIA'}>LECTURA DE SENTENCIA</option>
                </select>
            </span>
        </div>
    )
}
