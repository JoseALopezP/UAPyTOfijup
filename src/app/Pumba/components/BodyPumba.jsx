'use client'
import styles from '../Pumba.module.css'

export default function BodyPumba({ pumaData }) {
    return (
        <><div className={styles.bodyContainer}>
            <table>
                <thead>
                    <tr>
                        <th>Legajo (Puma)</th>
                        <th>Legajo (tablero)</th>
                        <th>LEGAJO</th>
                        <th>tipos (Puma)</th>
                        <th>tipos (tablero)</th>
                        <th>TIPO DE AUDIENCIA</th>
                        <th>UFI (Puma)</th>
                        <th>UFI (tablero)</th>
                        <th>UFI DE AUDIENCIA</th>
                        <th>Solicitud (Puma)</th>
                        <th>DÍA Y HORA SOLICITUD DE AUDIENCIA</th>
                        <th>Agendamiento (Puma)</th>
                        <th>DÍA Y HORA AGENDAMIENTO DE AUDIENCIA</th>
                        <th>Notificación (Puma)</th>
                        <th>DÍA Y HORA DE NOTIFICACIÓN AUDIENCIA</th>
                        <th>Programada (Puma)</th>
                        <th>Programada (tablero)</th>
                        <th>DÍA Y HORA PROGRAMADA DE AUDIENCIA</th>
                        <th>Inicio (Puma)</th>
                        <th>Inicio (tablero)</th>
                        <th>DÍA Y HORA INICIO REAL DE AUDIENCIA</th>
                        <th>Demora (Puma)</th>
                        <th>Demora (tablero)</th>
                        <th>DEMORA (TIEMPO EN MINUTOS)</th>
                        <th>Motivo (Puma)</th>
                        <th>Motivo (tablero)</th>
                        <th>MOTIVO DEMORA</th>
                        <th>OBSERVACIONES DEMORA OFIJUP</th>
                        <th>Duración Programada (Puma)</th>
                        <th>Duración Programada (tablero)</th>
                        <th>DURACIÓN PROGRAMADA DE AUDIENCIA</th>
                        <th>Duración (Puma)</th>
                        <th>Duración (tablero)</th>
                        <th>DURACIÓN REAL DE AUDIENCIA</th>
                        <th>1/4 pedido (tablero)</th>
                        <th>CUARTO INTERMEDIO TEORICO (EN TIEMPO)</th>
                        <th>1/4 real (tablero)</th>
                        <th>CUARTO INTERMEDIO REAL (EN TIEMPO)</th>
                        <th>1/4 otras partes (tablero)</th>
                        <th>CUARTO INTERMEDIO REAL OTRAS PARTES (EN TIEMPO)</th>
                        <th>Finalización (Puma)</th>
                        <th>Finalización (tablero)</th>
                        <th>DÍA Y HORA FINALIZACIÓN DE AUDIENCIA</th>
                        <th>Resuelvo (tablero)</th>
                        <th>HORARIO ENTREGA RESUELVO</th>
                        <th>Minuta (Puma)</th>
                        <th>Minuta (tablero)</th>
                        <th>HORARIO ENTREGA DE MINUTA</th>
                        <th>Cant. imputados (tablero)</th>
                        <th>Cant. imputados (Puma)</th>
                        <th>CANTIDAD DE IMPORTADOS</th>
                        <th>TIPO DE VÍCTIMA</th>
                        <th>SALA (Puma)</th>
                        <th>SALA (tablero)</th>
                        <th>SALA</th>
                        <th>Operador (Puma)</th>
                        <th>Operador (tablero)</th>
                        <th>OPERADOR</th>
                        <th>Fiscal (Puma)</th>
                        <th>Fiscal (tablero)</th>
                        <th>FISCAL INTERVINIENTE</th>
                        <th>Defensor (Puma)</th>
                        <th>Defensor (tablero)</th>
                        <th>DEFENSOR INTERVINIENTE</th>
                        <th>Juez (Puma)</th>
                        <th>Juez (tablero)</th>
                        <th>JUEZ</th>
                        <th>FIN DE AUDIENCIA</th>
                        <th>RESOLUCIÓN</th>
                        <th>RESULTADOS DE AUDIENCIA CONTROL DE ACUSACIÓN</th>
                        <th>INDICADOR UGA</th>
                        <th>COMENTARIO</th>

                    </tr>
                </thead>
                <tbody>
                    {/*pumaData.map((item, index) => (
                        <tr key={index}>
                            <td>{item.fecha}</td>
                            <td>{item.legajo}</td>
                            <td>{item.minuta}</td>
                        </tr>
                    ))*/}
                </tbody>
            </table>
        </div></>
    )
}