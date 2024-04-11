import styles from './audiencia.module.css'

export function AddBlock () {
    return(
        <section className={`${styles.audienciaSection}`}>
            <table>
                <thead>
                    <tr>
                        <th>HORA</th>
                        <th>LEGAJO</th>
                        <th>TIPO DE AUDIENCIA</th>
                        <th>JUEZ</th>
                        <th>ESTADO</th>
                    </tr>
                </thead>
                <tbody>

                </tbody>
            </table>
        </section>
    )
}