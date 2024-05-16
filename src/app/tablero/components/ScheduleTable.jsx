import { useContext, useEffect, useState } from 'react'
import styles from './ScheduleTable.module.css'
import { DataContext } from '@/context/DataContext'

export function ScheduleTable () {
    const {updateToday, today, realTime} = useContext(DataContext);
    const [part, setPart] = useState(0)
    const [showInfo, setShowInfo] = useState(false)
    const [aux, setAux] = useState([])
    const getMinutes = (dateObject) =>{
        const nowTime = (parseInt(realTime.split(':')[0]) * 60 + parseInt(realTime.split(':')[1]))
        const timeComparison = parseInt(`${dateObject}`.split(':')[0])*60 + parseInt(`${dateObject}`.split(':')[1])
        return (timeComparison - nowTime)
    }
    function filterToday() {
        const aux2 = []
        if(today){
            today.forEach((item, i) =>{
                switch(item.estado){
                    case 'EN_CURSO':
                        if(getMinutes(item.hora) < 120){
                            aux2.push(item)
                        }
                        break;
                    case 'PROGRAMADA':
                        if(getMinutes(item.hora) < 120){
                            aux2.push(item)
                        }
                        break;
                    case 'CUARTO_INTERMEDIO':
                        if(getMinutes(item.hora) < 120){
                            aux2.push(item)
                        }
                        break;
                    case 'CANCELADA':
                        aux2.push(item)
                        break;
                    case 'REPROGRAMADA':
                        aux2.push(item)
                        break;
                    case 'FINALIZADA':
                        if(getMinutes(item.hora) < 120 & getMinutes(item.hora) > -120){
                            aux2.push(item)
                        }
                        break;
                }
            });
        }
        return aux2
    }
    function tick() {
        setShowInfo(!showInfo)  
        updateToday();
    }
    useEffect(() =>{
        tick()
        const timerID = setInterval(() => tick(), 5000);  
        return function cleanup() {
            clearInterval(timerID);
        };
    }, [])
    return(
        <section className={`${styles.tableSection}`}>
            <table className={`${styles.table}`} cellSpacing="0" cellPadding="0">
                <thead className={`${styles.tableHead}`}>
                    <tr>
                        <th>HORA</th>
                        <th>SALA</th>
                        <th>LEGAJO</th>
                        <th>TIPO DE AUDIENCIA</th>
                        <th>JUEZ</th>
                        <th>ESTADO</th>
                    </tr>
                </thead>
                <tbody className={`${styles.tableBody}`}>
                    {today && filterToday().splice(0,10).sort((a,b)=>(a.hora.split(':').join('') - b.hora.split(':').join(''))).map((el)=>{
                        return(
                            <tr key={el.numeroLeg} className={el.estado == 'REPROGRAMADA' && `${styles.filaReprogramada}`}> 
                                <td>{el.hora}</td>
                                <td>SALA {el.sala}</td>
                                <td>{el.numeroLeg}</td>
                                <td>{el.tipo}</td>
                                <td>{el.juez.split('+').map(e => <span key={e}>{e}<br/></span>)}</td>
                                {(el.estado == 'PROGRAMADA' & (realTime > el.hora))  ? (<td className={`${styles.DEMORADA}`}>DEMORADA</td>) : (<td className={`${styles[el.estado]} `}>{el.estado.split('_').join(' ')}</td>)}
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </section>
    )
}