'use client'
import { useState } from 'react'
import styles from './AudienciaList.module.css'
import { ButtonsAudiencia } from './ButtonsAudiencia';
import { useContext } from 'react';

export function AudienciaList () {
    const {updateToday, today} = useContext(DataContext);
    
    const [show, setShow] = useState('');
    function handleShow (valueState) {
        setShow('')
        if(valueState != 'close'){
            setShow(valueState)
        }

    }
    useEffect(() => {
        updateByDate(date)
    }, []);
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
                    {}
                    <tr onClick={()=>handleShow('cuarto')}>
                        <td>7:30</td>
                        <td>SALA 5</td>
                        <td>MPF-SJ-04703-2022</td>
                        <td>CONTROL DE DETENCIÓN</td>
                        <td>BARBERA, EUGENIO MAXIMILIANO</td>
                    </tr>
                </tbody>
            </table>
        </section>
        </>
    )
}