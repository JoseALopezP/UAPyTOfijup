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
                        <th className={`${styles.tableHeadCell} ${styles.tableCellAdmin}`}>ADMIN</th>
                        <th className={`${styles.tableHeadCell} ${styles.tableCellLeg}`}>LEGAJO</th>
                        <th className={`${styles.tableHeadCell} ${styles.tableCellTipo}`}>TIPO</th>
                        <th className={`${styles.tableHeadCell} ${styles.tableCellJuez}`}>JUEZ</th>
                        <th className={`${styles.tableHeadCell} ${styles.tableCellJuezN}`}>NATURAL</th>
                        <th className={`${styles.tableHeadCell} ${styles.tableCellSituacion}`}>SITUACIÓN</th>
                        <th className={`${styles.tableHeadCell} ${styles.tableCellResultado}`}>RESULTADO</th>
                        <th className={`${styles.tableHeadCell} ${styles.tableCellEstado}`}>FINALIZADA</th>
                    </tr>
                </thead>
                <tbody className={`${styles.tableBody}`}>
                    {today && today.sort((a,b)=>(a.hora.split(':').join('') - b.hora.split(':').join(''))).map((el)=>{
                        return(
                            <tr key={el.numeroLeg + el.hora} className={el.estado == 'FINALIZADA' ? `${styles.tableRow} ${styles.tableRowFinalizada}` : `${styles.tableRow}`}> 
                                <td className={`${styles.tableCellAdmin}`}>{el.admin && el.admin}</td>
                                <td className={`${styles.tableCellLeg}`}>{el.numeroLeg}</td>
                                <td className={`${styles.tableCellTipo}`}>{el.tipo}</td>
                                <td className={`${styles.tableCellJuez}`}>{el.juez.split('+').map(e => <span key={e}>{e}<br/></span>)}</td>
                                <td className={`${styles.tableCellJuezN}`}>{el.juezN && el.juezN.split(' ').map((word, i) => (i == 0) ?  `${word}` + ' ' : word.substring(0, 1))}</td>
                                <td className={`${styles.tableCellSituacion}`}>{el.situacion && el.situacion}</td>
                                <td className={`${styles.tableCellResultado}`}>{el.resultado && el.resultado}</td>
                                <td className={el.estado == 'FINALIZADA' ? `${styles.tableCellEstado} ${styles.tableCellEstadoFINALIZADA}` : `${styles.tableCellEstado}`}>{(el.hitos && el.estado == "FINALIZADA") && el.hitos[el.hitos.length - 1].split('|')[0]}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </section>
    )
}