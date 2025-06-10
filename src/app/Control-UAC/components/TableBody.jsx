import { useContext, useEffect, useState, useMemo } from 'react';
import { DataContext } from '@/context/DataContext';
import TableIndiv from './tableIndiv';

export default function TableBody({ date, filterValue }) {
    const { bydate, updateByDateListener } = useContext(DataContext);

    useEffect(() => {
        if (date && typeof date === 'number' && date.toString().length === 8) {
            updateByDateListener(date);
        }
    }, [date, updateByDateListener]);

    const filteredAndSortedData = useMemo(() => {
        if (!bydate) {
            return [];
        }

        const lowerCaseFilterValue = filterValue.toLowerCase();
        const filterWords = lowerCaseFilterValue.split(' ').filter(Boolean);

        const filtered = bydate.filter((sentence) => {
            const hora = sentence.hora ?? '';
            const estado = sentence.estado ?? '';
            const numeroLeg = sentence.numeroLeg ?? '';
            const juez = sentence.juez ?? '';
            const tipo = sentence.tipo ?? '';
            const tipo2 = sentence.tipo2 ?? '';
            const tipo3 = sentence.tipo3 ?? '';

            const searchableText = [
                hora,
                estado,
                numeroLeg,
                juez,
                tipo,
                tipo2,
                tipo3
            ].join(' ').toLowerCase();

            return filterWords.every((word) => searchableText.includes(word));
        });

        return filtered.sort((a, b) => {
            const timeA = parseInt((a.hora ?? '').split(':').join(''), 10);
            const timeB = parseInt((b.hora ?? '').split(':').join(''), 10);
            return timeA - timeB;
        });
    }, [bydate, filterValue]);

    return (
        <>
            {filteredAndSortedData.map((el) => (
                <TableIndiv item={el} date={date} key={el.numeroLeg || JSON.stringify(el)} />
            ))}
        </>
    );
}
