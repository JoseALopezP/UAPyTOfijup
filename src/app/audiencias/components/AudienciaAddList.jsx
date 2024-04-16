import { useEffect, useContext } from 'react'
import styles from './audiencia.module.css'
import { DataContext } from '@/context/DataContext';
import { AddBlock } from './AddBlock';

export function AudienciaAddList () {
    const {updateToday, today} = useContext(DataContext);
    

    useEffect(() => {
        updateToday()
    }, []);
    return(
        <section className={`${styles.audienciaListSection}`}>
            <table className={`${styles.audienciaListTable}`}>
                <thead>
                    <tr>
                        <form>
                        <th>HORA</th>
                        <th>SALA</th>
                        <th>LEGAJO</th>
                        <th>TIPO DE AUDIENCIA</th>
                        <th>JUEZ</th>
                        <th>ACCIÓN</th>
                        </form>
                    </tr>
                </thead>
                <tbody>
                    <AddBlock/>
                    {today.map((el)=>{
                        return(
                            <tr key={el.numeroLeg}> 
                                <td>{el.hora.toDate().toLocaleTimeString("es-AR",{hourCycle: 'h23', hour: "2-digit", minute: "2-digit" })}</td>
                                <td>SALA {el.sala}</td>
                                <td>{el.numeroLeg}</td>
                                <td>{el.tipo}</td>
                                <td>{el.juez.split('+').map(e => <span key={e}>{e}<br/></span>)}</td>
                                <td><button>ELIMINAR</button></td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </section>
    )
}