'use client'
import { useContext, useEffect } from 'react'
import styles from './AudienciaList.module.css'
import { ButtonsAudiencia } from './ButtonsAudiencia';
import { DataContext } from '@/context/DataContext';
import { useAuthContext } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export function AudienciaList () {
    const {updateToday, today, updateRealTime} = useContext(DataContext);
    function tick() {
        updateToday();
        updateRealTime() 
    }
    useEffect(() =>{
        const timerID = setInterval(() => tick(), 5000);  
        return function cleanup() {
            clearInterval(timerID);
        };
    }, [])
    const { user } = useAuthContext()
    const router = useRouter()
    useEffect(() => {
      if (user == null) router.push("/signin")
    }, [user])
    return(
        <>
        <section className={`${styles.tableSection}`}>
            <table className={`${styles.table}`} cellSpacing="0" cellPadding="0">
                <thead className={`${styles.tableHead}`}>
                    <tr>
                        <th>HORA</th>
                        <th>SALA</th>
                        <th>OPERADOR</th>
                        <th>LEGAJO</th>
                        <th>TIPO DE AUDIENCIA</th>
                        <th>ESTADO</th>
                    </tr>
                </thead>
                <tbody className={`${styles.tableBody}`}>
                    {today && today.filter(el => (el.estado != 'CANCELADA' | el.estado != 'REPROGRAMADA')).sort((a,b)=>(a.hora.split(':').join('') - b.hora.split(':').join(''))).map((el =>{
                        return(
                            <ButtonsAudiencia key={el.numeroLeg + el.hora} element={el}/>
                        )
                    }))}
                </tbody>
            </table>
        </section>
        </>
    )
}