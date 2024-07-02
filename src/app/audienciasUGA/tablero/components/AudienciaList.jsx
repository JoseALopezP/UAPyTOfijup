import styles from './AudienciaList.module.css'
import { useContext, useEffect } from 'react';
import { DataContext } from '@/context/DataContext';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext';
import { nameTranslate } from '@/utils/traductorNombres';

export function AudienciaList ({date}) {
    const {updateToday, today, updateRealTime, realTime} = useContext(DataContext);
    const arrLength = 21
    function tick() {
        updateToday();
        updateRealTime()
    }
    useEffect(() =>{
        tick()
        const timerID = setInterval(() => tick(), 30000);
        return function cleanup() {
            clearInterval(timerID);
        };
    }, [])
    const getMinutes = (dateObject) =>{
        if(realTime){
            const nowTime = (parseInt(realTime.split(':')[0]) * 60 + parseInt(realTime.split(':')[1]))
            const timeComparison = parseInt(`${dateObject}`.split(':')[0])*60 + parseInt(`${dateObject}`.split(':')[1])
            return (timeComparison - nowTime)
        }
        
    }
    const { user } = useAuthContext()
    const router = useRouter()
    useEffect(() => {
      if (user == null) router.push("/signin")
    }, [user])
    return(
        <section className={`${styles.tableSection}`}>
            <table className={`${styles.table}`} cellSpacing="0" cellPadding="0">
                <thead className={`${styles.tableHead}`}>
                    <tr>
                        <th className={`${styles.tableCellHora}`}>{realTime}</th>
                        <th className={`${styles.tableCellSala}`}>SALA</th>
                        <th className={`${styles.tableCellOperador}`}>OP</th>
                        <th className={`${styles.tableCellLeg}`}>LEGAJO</th>
                        <th className={`${styles.tableCellTipo}`}>TIPO</th>
                        <th className={`${styles.tableCellJuez}`}>JUEZ</th>
                        <th className={`${styles.tableCellSituacion}`}>SIT</th>
                        <th className={`${styles.tableCellEstado}`}>EST</th>
                    </tr>
                </thead>
                <tbody className={`${styles.tableBody} ${styles.tableBody1}`}>
                    {today && today.sort((a,b)=>(a.hora.split(':').join('') - b.hora.split(':').join(''))).filter(el => (el.resuelvo & (el.hitos && (getMinutes(el.hitos[el.hitos.length - 1].split(' |'))) > -120)) | !el.resuelvo).slice(0,(arrLength - 1)).map((el)=>{
                        return(
                            <tr key={el.numeroLeg + el.hora} className={`${styles.tableRow}`}> 
                                <td className={`${styles.tableCellHora}`}>{el.hora}</td>
                                <td className={`${styles.tableCellSala} ${styles.tableCellSalaIndiv}`}>{el.sala}</td>
                                <td className={`${styles.tableCellOperador}`}>{el.operador && nameTranslate(el.operador)}</td>
                                <td className={`${styles.tableCellLeg}`}>{el.numeroLeg.split('-')[2]}</td>
                                <td className={`${styles.tableCellTipo}`}>{el.tipo.split('').slice(0,15).join('')}{el.tipo.split('').length>14 ? '...' : ''}</td>
                                <td className={`${styles.tableCellJuez}`}>{el.juez && (el.juez.split('+').map(e => <span key={e}>{e.includes('. ') ? e.split('. ')[1].split(' ')[0].split('').slice(0,3).join('') : '' + ' ' + e.includes('. ') ? e.split('. ')[1].split(' ')[1].split('').slice(0,1).join('') : ''}<br/></span>))}</td>
                                <td className={`${styles.tableCellSituacion}`}>{el.situacion && el.situacion}</td>
                                {(el.estado == 'PROGRAMADA' & getMinutes(el.hora) < 0)  ? (<td className={`${styles.DEMORADA} ${styles.tableCellEstado}`}>DEM</td>) : (<>{el.resuelvo ? <td className={`${styles[el.estado]} ${styles.tableCellEstado}`}>SUB</td> : <td className={`${styles[el.estado]} ${styles.tableCellEstado}`}>{el.estado.split('_').join(' ').split('').slice(0,3).join('')}</td>}</>)}
                            </tr>
                        )
                    })}
                </tbody>
            </table>
            <table className={`${styles.table} ${styles.table2}`} cellSpacing="0" cellPadding="0">
                <thead className={`${styles.tableHead}`}>
                    <tr>
                        <th className={`${styles.tableCellHora}`}>{realTime}</th>
                        <th className={`${styles.tableCellSala}`}>SALA</th>
                        <th className={`${styles.tableCellOperador}`}>OP</th>
                        <th className={`${styles.tableCellLeg}`}>LEGAJO</th>
                        <th>TIPO</th>
                        <th className={`${styles.tableCellJuez}`}>JUEZ</th>
                        <th className={`${styles.tableCellSituacion}`}>SIT</th>
                        <th className={`${styles.tableCellEstado}`}>EST</th>
                    </tr>
                </thead>
                <tbody className={`${styles.tableBody} ${styles.tableBody2}`}>
                    {today && today.sort((a,b)=>(a.hora.split(':').join('') - b.hora.split(':').join(''))).filter(el => (el.resuelvo & (el.hitos && (getMinutes(el.hitos[el.hitos.length - 1].split(' |'))) > -120)) | !el.resuelvo).slice((arrLength), (arrLength * 2 - 1)).map((el)=>{
                        return(
                            <tr key={el.numeroLeg + el.hora} className={`${styles.tableRow}`}> 
                                <td className={`${styles.tableCellHora}`}>{el.hora}</td>
                                <td className={`${styles.tableCellSala} ${styles.tableCellSalaIndiv}`}>{el.sala}</td>
                                <td className={`${styles.tableCellOperador}`}>{el.operador && nameTranslate(el.operador)}</td>
                                <td className={`${styles.tableCellLeg}`}>{el.numeroLeg.split('-')[2]}</td>
                                <td className={`${styles.tableCellTipo}`}>{el.tipo.split('').slice(0,15).join('')}{el.tipo.split('').length>14 ? '...' : ''}</td>
                                <td className={`${styles.tableCellJuez}`}>{el.juez && (el.juez.split('+').map(e => <span key={e}>{e.includes('. ') ? e.split('. ')[1].split(' ')[0].split('').slice(0,3).join('') : '' + ' ' + e.includes('. ') ? e.split('. ')[1].split(' ')[1].split('').slice(0,1).join('') : ''}<br/></span>))}</td>
                                <td className={`${styles.tableCellSituacion}`}>{el.situacion && el.situacion}</td>
                                {(el.estado == 'PROGRAMADA' & getMinutes(el.hora) < 0)  ? (<td className={`${styles.DEMORADA} ${styles.tableCellEstado}`}>DEM</td>) : (<>{el.resuelvo ? <td className={`${styles[el.estado]} ${styles.tableCellEstado}`}>SUB</td> : <td className={`${styles[el.estado]} ${styles.tableCellEstado}`}>{el.estado.split('_').join(' ').split('').slice(0,3).join('')}</td>}</>)}
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </section>
    )
}