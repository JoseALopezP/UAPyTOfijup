function getMonthName(number){
    const date = new Date(0, number - 1);
    return date.toLocaleString('es-AR', { month: 'long' });
}
function capitalizeFirst(word){
    return word.charAt(0).toUpperCase() + word.slice(1)
}
export function generateResuelvo(item, date){
    const resuelvo = (
        `Lugar y Fecha: San Juan, ${date.split('').splice(0,2).join('')} de ${capitalizeFirst(getMonthName(date.split('').splice(2,2).join('')))} de ${date.split('').splice(4,4).join('')}
        Tipo de Audiencia: ${item.tipo}${item.tipo2 && ' - ' + item.tipo2}${item.tipo3 && ' - ' + item.tipo3}
        Legajo: N° ${item.numeroLeg} Caratulado "${item.caratula}"
        Sala de Audiencias: ${item.sala}
        Hora programada: ${item.hora} horas
        Hora real de inicio: ${item.hitos[0].split(' | ').splice(0,1)} horas
        Juez Interviniente: ${capitalizeFirst(item.juez.toLowerCase())}
        Ministerio Público Fiscal: ${'relleno'}
        Defensa tipo: ${'relleno'} 
        Lista del resto de partes (querella, intérprete, fiscal, etc.)
        Imputado: ${item.imputado}  D.N.I. N°: ${'relleno'}
        Operador: ${item.operador}
        
        Fundamentos y Resolución: ${item.resuelvoText}`
    )
    return resuelvo
}

export function copyResuelvoToClipboard(item, date){
    navigator.clipboard.writeText(generateResuelvo(item, date));
}