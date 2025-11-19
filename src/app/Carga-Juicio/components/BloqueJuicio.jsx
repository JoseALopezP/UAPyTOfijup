import { useContext, useEffect, useState } from 'react'
import styles from './Carga-Juicio.module.css'
import { DataContext } from '@/context New/DataContext'

export function BloqueJuicio ({bloque, testigos, last, updateArrayAttribute, index}){
    const [option, setOption] = useState(last ? 'LECTURA DE SENTENCIA' : 'DEBATE')
    const {desplegables} = useContext(DataContext)
    return(
        <div className={`${styles.bloqueJuicioSection}`}>
            <span className={`${styles.dateTimeJuicio}`}>
                <span className={`${styles.dateTimeBloqueLeft}`}><input className={`${styles.inputDateTime}`} type='text' value={bloque.fecha.slice(0,2)} onChange={e => updateArrayAttribute(index, 'fecha', (e.target.value+bloque.fecha.slice(2,8)))}/>
                    <input className={`${styles.inputDateTime}`} value={bloque.fecha.slice(2,4)} onChange={e => updateArrayAttribute(index, 'fecha', (bloque.fecha.slice(0,2) + e.target.value + bloque.fecha.slice(4,8)))}/>
                    <input className={`${styles.inputDateTimeDouble}`} value={bloque.fecha.slice(4,8)} onChange={e => updateArrayAttribute(index, 'fecha', (bloque.fecha.slice(0,4) + e.target.value))}/>
                </span><span className={`${styles.dateTimeBloqueRight}`}>
                    <input className={`${styles.inputDateTime}`} value={bloque.hora.split(':')[0]} onChange={e => updateArrayAttribute(index, 'hora', `${e.target.value}:${bloque.hora.split(':')[1]}`)}/>
                    <input className={`${styles.inputDateTime}`} value={bloque.hora.split(':')[1]} onChange={e => updateArrayAttribute(index, 'hora', `${bloque.hora.split(':')[0]}:${e.target.value}`)}/>
                    <select className={`${styles.inputSalaJuicio}`} onChange={() => (console.log('completar esto'))}>
                        <option>{bloque.sala ? 'SALA'+bloque.sala : ''}</option>
                        {desplegables.salas && desplegables.salas.map(el =>(
                            <option key={el} value={el}>SALA {el}</option>
                        ))}
                    </select>
                </span>
            </span>
            <span className={`${styles.horizontalSeparator}`}></span>
            <span className={`${styles.controlJuicio}`}>
                <span className={`${styles.testigoListBloque}`}>
                    {testigos && testigos.filter(t => t.fecha?.some(f => f.audid === bloque.audId)).map(el =>(
                        <p key={el.audId}>{el.fecha.hora}{el.nombre}{el.dni ? ' - ' +el.dni : ''}</p>
                    ))}
                </span>
                <span className={`${styles.estadoBlock}`}>
                    <p>BLOQUE {index + 1}</p>
                    <p>{bloque.estadoBloque.split('_').join(' ')}</p>
                </span>
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
