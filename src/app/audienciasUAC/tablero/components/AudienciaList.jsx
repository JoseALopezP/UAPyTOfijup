import styles from './AudienciaList.module.css'
import { useContext, useEffect } from 'react';
import { DataContext } from '@/context/DataContext';

export function AudienciaList ({date}) {
    const {updateToday, today} = useContext(DataContext);
    function tick() {
        updateToday();     
    }
    useEffect(() =>{
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
                        <th>LEGAJO</th>
                        <th>TIPO DE AUDIENCIA</th>
                        <th>JUEZ</th>
                        <th>NATURAL</th>
                        <th>SITUACIÓN</th>
                        <th>RESULTADO</th>
                        <th>FINALIZADA</th>
                    </tr>
                </thead>
                <tbody className={`${styles.tableBody}`}>
                    {today && today.sort((a,b)=>(a.hora.split(':').join('') - b.hora.split(':').join(''))).map((el)=>{
                        return(
                            <tr key={el.numeroLeg + el.hora} className={el.estado == 'FINALIZADA' ? `${styles.tableRow}` : `${styles.tableRow} ${styles.tableRowFinalizada}`}> 
                                <td>{el.numeroLeg}</td>
                                <td className={`${styles.tableCellTipo}`}>{el.tipo}</td>
                                <td>{el.juez.split('+').map(e => <span key={e}>{e}<br/></span>)}</td>
                                <td className={`${styles.tableCellJuezN}`}>{el.juezN && el.juezN.split(' ').map((word, i) => (i == 0) ?  `${word}` + ' ' : word.substring(0, 1))}</td>
                                <td>{el.situacion && el.situacion}</td>
                                <td>{el.resultado && el.resultado}</td>
                                <td>{(el.hito && el.estado == "FINALIZADA") && el.hito[el.hito.length() - 1].split('|')[0]}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </section>
    )
}