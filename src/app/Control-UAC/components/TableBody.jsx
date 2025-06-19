import { useContext, useEffect, useState } from 'react'
import { DataContext } from '@/context/DataContext'
import TableIndiv from './tableIndiv'

export default function TableBody({date, filterValue}){
    const {bydate, updateByDateListener} = useContext(DataContext)
    const [todayFiltered, setTodayFiltered] = useState(bydate)
    useEffect(()=>{
        if(date && date.toString().length===8){
            updateByDateListener(date)
        }
    }, [date])
    useEffect(()=>{
        const filteredData = bydate?.filter((sentence) => {
            const searchableText = [
                sentence.hora,
                sentence.estado,
                sentence.numeroLeg,
                sentence.juez,
                sentence.tipo,
                sentence.tipo2,
                sentence.tipo3
            ].join(' ').toLowerCase();
            return filterValue
                .toLowerCase()
                .split(' ')
                .every((word) => searchableText.includes(word));
        });
        setTodayFiltered(filteredData)
    }, [filterValue, bydate])
    return (<>
        {todayFiltered &&
            todayFiltered
            .filter(sentence =>
                filterValue.toLowerCase().split(' ').every(word =>
                    ((sentence.hora+' '+sentence.estado+' '+sentence.numeroLeg+' '+sentence.tipo+' '+sentence.tipo2+' '+sentence.tipo3).toLowerCase().includes(word))
                )
            ).sort((a,b) => a.hora.split(':').join('') - b.hora.split(':').join('')).map(el=>
            (<TableIndiv item={el} date={date} key={el.numeroLeg}/>)
        )}</>)
}