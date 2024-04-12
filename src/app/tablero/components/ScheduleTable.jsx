import { useContext, useEffect, useState } from 'react'
import styles from './ScheduleTable.module.css'
import { DataContext } from '@/context/DataContext'

export function ScheduleTable () {
    const {updateToday, today} = useContext(DataContext);
    const {shown, setShown} = useState([]);
    const getMinutes = (dateObject) =>{
        return (parseInt(new Date()).toLocaleTimeString("es-AR",{hourCycle: 'h23', hour: "2-digit"}) * 60 + parseInt(new Date()).toLocaleTimeString("es-AR",{hourCycle: 'h23', minute: "2-digit"}))
    }
    useEffect(() =>{
        updateToday();
        setShown(shown.filter((item) =>{
            const min = getMinutes(new Date())
            const itemMinute = getMinutes(item.hora)
            if((itemMinute - min >  120) | (itemMinute - min <  -60)){
                if(item.estado == 'SUSPENDIDA'){
                    return true
                }else if((itemMinute - min <  -60) & (item.estado == 'INICIADA' | item.estado == 'CUARTO INTERMEDIO' | item.estado == 'EN ESPERA')){
                    return true
                }else{
                    return false
                }
            }else{
                return false
            }
        }));
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
                    {shown.map((el)=>{
                        return(
                            <tr>
                                <td>{el.hora.toLocaleTimeString("es-AR",{hourCycle: 'h23', hour: "2-digit", minute: "2-digit" })}</td>
                                <td>SALA {el.sala}</td>
                                <td>{el.numeroLeg}</td>
                                <td>{el.tipo}</td>
                                <td>{el.juez}</td>
                                <td>{el.estado}</td>
                            </tr>
                        )
                    })}
                    <tr>
                        <td>7:30</td>
                        <td>SALA 5</td>
                        <td>MPF-SJ-04703-2022</td>
                        <td>CONTROL DE DETENCIÓN</td>
                        <td>BARBERA, EUGENIO MAXIMILIANO</td>
                        <td>INICIADA</td>
                    </tr>
                    <tr>
                        <td>7:45</td>
                        <td>SALA 2</td>
                        <td>MPF-SJ-05080-2023</td>
                        <td>SUSPENSIÓN DE JUICIO A PRUEBA</td>
                        <td>REVERENDO, LIDIA</td>
                        <td>DEMORADO</td>
                    </tr>
                    <tr>
                        <td>8:00</td>
                        <td>SALA 3</td>
                        <td>MPF-SJ-00552-2024</td>
                        <td>TRÁMITES DE EJECUCIÓN</td>
                        <td>MEGLIOLI, JUAN GABRIEL</td>
                        <td>SUSPENDIDA</td>
                    </tr>
                    <tr>
                        <td>8:00</td>
                        <td>SALA 6</td>
                        <td>MPF-SJ-04173-2024</td>
                        <td>DEBATE DEL JUICIO ORAL</td> 
                        <td>MOYA, MABEL IRENE <br/>
                            LEON, PABLO LEONARDO <br/>
                            ALLENDE, FLAVIA GABRIELA</td>
                        <td>EN ESPERA</td>
                    </tr>
                </tbody>
            </table>
        </section>
    )
}