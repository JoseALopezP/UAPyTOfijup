function getMonthName(number){
    const date = new Date(0, number - 1);
    return date.toLocaleString('es-AR', { month: 'long' });
}
function capitalizeFirst(sentence){
    if (!sentence) return sentence;
    return sentence.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}
function listFiscal(arr){
    let aux = ''
    arr.forEach((el,i) =>{
        aux = `${aux}Ministerio Público Fiscal: ${el.nombre.split(' - ')[0]}  UFI:${el.nombre.split(' - ')[1]} ${(arr.length !== i+1) ? '\n' : ''}`
    })
    return aux
}
function listDefensa(arr){
    let aux = ''
    arr.forEach((el,i) =>{
        aux = `${aux}Defensa ${el.tipo}: ${el.nombre} ${(arr.length !== i+1) ? '\n' : ''}`
    })
    return aux
}
function listImputado(arr){
    let aux = ''
    arr.forEach((el,i) =>{
        aux = `${aux}${el.condenado ? 'Condenado' : 'Imputado'}: ${el.nombre}  D.N.I. N.°:${el.dni} ${(arr.length !== i+1) ? '\n' : ''}`
    })
    return aux
}
function listPartes(arr){
    let aux = ''
    arr.forEach((el,i) =>{
        aux = `${aux}${el.role}: ${el.name} ${(arr.length !== i+1) ? '\n' : ''}`
    })
    return aux
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
${listFiscal(item.mpf)}
${listDefensa(item.defensa)}
${listImputado(item.imputado)}
${listPartes(item.partes)}
Operador: ${item.operador}

Fundamentos y Resolución: ${item.resuelvoText}`
    )
    return resuelvo
}

export function copyResuelvoToClipboard(item, date){
    navigator.clipboard.writeText(generateResuelvo(item, date));
}