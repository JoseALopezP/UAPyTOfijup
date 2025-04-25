import { useContext, useEffect } from 'react'
import styles from '../ControlUac.module.css'
import { DataContext } from '@/context/DataContext'
import TableIndiv from './tableIndiv'

export default function TableBody({date}){
    const {bydate, updateByDateListener} = useContext(DataContext)
    useEffect(()=>{
        if(date && date.toString().length===8){
            updateByDateListener(date)
        }
    }, [date])
    return (<>
        {bydate && bydate.sort((a,b) => a.hora.split(':').join('') - b.hora.split(':').join('')).map(el=>
            (<TableIndiv item={el} date={date} key={el.numeroLeg}/>)
        )}</>)
}