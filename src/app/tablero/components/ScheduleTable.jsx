import styles from './ScheduleTable.module.css'

export function ScheduleTable () {
    return(
        <section className={`${styles.tableSection}`}>
            <table className={`${styles.table}`} cellspacing="0" cellpadding="0">
                <thead className={`${styles.tableHead}`}>
                    <tr>
                        <th>HORA</th>
                        <th>LEGAJO</th>
                        <th>TIPO DE AUDIENCIA</th>
                        <th>JUEZ</th>
                        <th>ESTADO</th>
                    </tr>
                </thead>
                <tbody className={`${styles.tableBody}`}>
                    <tr>
                        <td>7:30</td>
                        <td>MPF-SJ-04703-2022</td>
                        <td>CONTROL DE DETENCIÓN</td>
                        <td>BARBERA, EUGENIO MAXIMILIANO</td>
                        <td>INICIADA</td>
                    </tr>
                    <tr>
                        <td>7:45</td>
                        <td>MPF-SJ-05080-2023</td>
                        <td>SUSPENSIÓN DE JUICIO A PRUEBA</td>
                        <td>REVERENDO, LIDIA</td>
                        <td>DEMORADO</td>
                    </tr>
                    <tr>
                        <td>8:00</td>
                        <td>MPF-SJ-00552-2024</td>
                        <td>DEBATE DEL JUICIO ORAL</td>
                        <td>MEGLIOLI, JUAN GABRIEL</td>
                        <td>SUSPENDIDA</td>
                    </tr>
                    <tr>
                        <td>8:00</td>
                        <td>MPF-SJ-04173-2024</td>
                        <td>TRÁMITES DE EJECUCIÓN</td>
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