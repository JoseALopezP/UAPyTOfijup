import { useContext, useEffect, useState } from 'react';
import { DataContext } from '@/context/DataContext';
import TableIndiv from './tableIndiv';

export default function TableBody({ date, filterValue }) {
    const { bydate, updateByDate } = useContext(DataContext); // <-- importante
    const [todayFiltered, setTodayFiltered] = useState(bydate);
    useEffect(() => {
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
        setTodayFiltered(filteredData);
    }, [filterValue, bydate]);
    useEffect(() => {
        if (!date) return;
        updateByDate(date);
        const interval = setInterval(() => {
            updateByDate(date);
        }, 30000);
        return () => clearInterval(interval);
    }, [date]);

    return (
        <>
            {todayFiltered &&
                todayFiltered
                    .sort((a, b) => {
                        const timeA = String(a?.hora || '').split(':').join('');
                        const timeB = String(b?.hora || '').split(':').join('');
                        if (timeA !== timeB) {
                            if (!timeA) return 1;
                            if (!timeB) return -1;
                            return Number(timeA) - Number(timeB);
                        }
                        return String(a?.numeroLeg || '').localeCompare(String(b?.numeroLeg || ''));
                    })
                    .map((el) => (
                        <TableIndiv item={el} date={date} key={el.numeroLeg} />
                    ))}
        </>
    );
}

