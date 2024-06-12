'use client'
import { useContext, useEffect, useState } from 'react'
import styles from './AudienciaList.module.css'
import { ButtonsAudiencia } from './ButtonsAudiencia';
import { DataContext } from '@/context/DataContext';
import { useAuthContext } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export function AudienciaList () {
    const [operadorF, setOperadorF] = useState('')
    const {updateToday, today, updateRealTime, updateDesplegables, desplegables} = useContext(DataContext);
    function tick() {
        updateToday();
        updateRealTime() 
    }
    useEffect(() =>{
        updateDesplegables()
        tick()
        const timerID = setInterval(() => tick(), 30000);  
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
                        <th><select className={`${styles.operadorList}`} onChange={(e)=>{setOperadorF(e.target.value)}}>
                            <option value={''}>TODOS</option>
                            {desplegables.operador && desplegables.operador.map((el)=>(
                                <option key={el} value={el}>{`${el.split(' ')[el.split(' ').length-1].toUpperCase().split('').splice(0,4).join('')} ${el.split('')[0]}.`}</option>
                            ))}
                        </select></th>
                        <th>LEG</th>
                        <th className={`${styles.tableHeadJuez}`}>JUEZ</th>
                        <th>TIPO</th>
                        <th>SIT</th>
                        <th>EST</th>
                    </tr>
                </thead>
                <tbody className={`${styles.tableBody}`}>
                    {today && today.filter(el => (el.estado != 'CANCELADA' | el.estado != 'REPROGRAMADA')).filter(el => (el.operador == operadorF || operadorF === '')).sort((a,b)=>(a.hora.split(':').join('') - b.hora.split(':').join(''))).map((el =>{
                        return(
                            <ButtonsAudiencia key={el.numeroLeg + el.hora} element={el} date={el}/>
                        )
                    }))}
                </tbody>
            </table>
        </section>
        </>
    )
}