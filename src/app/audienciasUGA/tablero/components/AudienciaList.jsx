import styles from './AudienciaList.module.css'
import { useContext, useEffect } from 'react';
import { DataContext } from '@/context/DataContext';

export function AudienciaList ({date}) {
    const {updateToday, today} = useContext(DataContext);
    function tick() {
        updateToday();     
    }
    useEffect(() =>{
        const timerID = setInterval(() => tick(), 30000);  
        return function cleanup() {
            clearInterval(timerID);
        };
    }, [])
    const getMinutes = (dateObject) =>{
        const nowTime = (parseInt(new Date().toLocaleTimeString("es-AR",{hourCycle: 'h23', hour: "2-digit"})) * 60 + parseInt(new Date().toLocaleTimeString("es-AR",{hourCycle: 'h23', minute: "2-digit"})))
        const timeComparison = parseInt(`${dateObject}`.split(':')[0])*60 + parseInt(`${dateObject}`.split(':')[1])
        return (timeComparison - nowTime)
    }
    return(
        <section className={`${styles.tableSection}`}>
            <table className={`${styles.table}`} cellSpacing="0" cellPadding="0">
                <thead className={`${styles.tableHead}`}>
                    <tr>
                        <th className={`${styles.tableCellHora}`}>HORA</th>
                        <th className={`${styles.tableCellOperador}`}>OPERADOR</th>
                        <th className={`${styles.tableCellLeg}`}>LEGAJO</th>
                        <th>TIPO DE AUDIENCIA</th>
                        <th className={`${styles.tableCellJuez}`}>JUEZ</th>
                        <th>SITUACIÓN</th>
                        <th>ESTADO</th>
                    </tr>
                </thead>
                <tbody className={`${styles.tableBody}`}>
                    {today && today.sort((a,b)=>(a.hora.split(':').join('') - b.hora.split(':').join(''))).map((el)=>{
                        return(
                            <tr key={el.numeroLeg + el.hora} className={`${styles.tableRow}`}> 
                                <td className={`${styles.tableCellHora}`}>{el.hora}</td>
                                <td className={`${styles.tableCellOperador}`}>{el.operador && el.operador}</td>
                                <td className={`${styles.tableCellLeg}`}>{el.numeroLeg}</td>
                                <td className={`${styles.tableCellTipo}`}>{el.tipo}</td>
                                <td className={`${styles.tableCellJuez}`}>{el.juez.split('+').map(e => <span key={e}>{e.split(' ').slice(0,3).join(' ')}<br/></span>)}</td>
                                <td className={`${styles.tableCellSituacion}`}>{el.situacion && el.situacion}</td>
                                {(el.estado == 'PROGRAMADA' & getMinutes(el.hora) < 0)  ? (<td className={`${styles.DEMORADA}`}>DEMORADA</td>) : (<td className={`${styles[el.estado]} `}>{el.estado.split('_').join(' ')}</td>)}
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </section>
    )
}