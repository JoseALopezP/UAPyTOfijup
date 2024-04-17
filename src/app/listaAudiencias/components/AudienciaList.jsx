'use client'
import { useState } from 'react'
import styles from './AudienciaList.module.css'
import { ButtonsAudiencia } from './ButtonsAudiencia';

export function AudienciaList () {
    const [show, setShow] = useState('');
    function handleShow (valueState) {
        setShow('')
        if(valueState != 'close'){
            setShow(valueState)
        }

    }
    return(
        <>
        {(show != '') && 
        <><button type="button" className={`${styles.stateButton} ${styles.stateButtonCancelar}`} onClick={() => handleShow('close')}>CANCELAR</button>
        <ButtonsAudiencia audienciaState={show}/></>}
        <section className={`${styles.tableSection}`}>
            <table className={`${styles.table}`} cellSpacing="0" cellPadding="0">
                <thead className={`${styles.tableHead}`}>
                    <tr>
                        <th>HORA</th>
                        <th>SALA</th>
                        <th>LEGAJO</th>
                        <th>TIPO DE AUDIENCIA</th>
                        <th>JUEZ</th>
                    </tr>
                </thead>
                <tbody className={`${styles.tableBody}`}>
                    <tr onClick={()=>handleShow('cuarto')}>
                        <td>7:30</td>
                        <td>SALA 5</td>
                        <td>MPF-SJ-04703-2022</td>
                        <td>CONTROL DE DETENCIÓN</td>
                        <td>BARBERA, EUGENIO MAXIMILIANO</td>
                    </tr>
                    <tr onClick={()=>handleShow('iniciada')}>
                        <td>7:45</td>
                        <td>SALA 2</td>
                        <td>MPF-SJ-05080-2023</td>
                        <td>SUSPENSIÓN DE JUICIO A PRUEBA</td>
                        <td>REVERENDO, LIDIA</td>
                    </tr>
                    <tr onClick={()=>handleShow('programada')}>
                        <td>8:00</td>
                        <td>SALA 3</td>
                        <td>MPF-SJ-00552-2024</td>
                        <td>TRÁMITES DE EJECUCIÓN</td>
                        <td>MEGLIOLI, JUAN GABRIEL</td>
                    </tr>
                    <tr onClick={()=>handleShow('programada')}>
                        <td>8:00</td>
                        <td>SALA 6</td>
                        <td>MPF-SJ-04173-2024</td>
                        <td>DEBATE DEL JUICIO ORAL</td> 
                        <td>MOYA, MABEL IRENE <br/>
                            LEON, PABLO LEONARDO <br/>
                            ALLENDE, FLAVIA GABRIELA</td>
                    </tr>
                </tbody>
            </table>
        </section>
        </>
    )
}