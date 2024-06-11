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
    arr && arr.forEach((el,i) =>{
        aux = `${aux}Ministerio Público Fiscal: ${el.nombre.split(' - ')[0]}  UFI:${el.nombre.split(' - ')[1]} ${(arr.length !== i+1) ? '\n' : ''}`
    })
    console.log(aux)
    return aux
}
function listDefensa(arr){
    let aux = ''
    arr && arr.forEach((el,i) =>{
        aux = `${aux}Defensa ${el.tipo}: ${el.nombre} ${el.imputado ? `(En representación de ${el.imputado})` : ''} ${(arr.length !== i+1) ? '\n' : ''}`
    })
    return aux
}
function listImputado(arr){
    let aux = ''
    arr && arr.forEach((el,i) =>{
        aux = `${aux}${el.condenado ? 'Condenado' : 'Imputado'}: ${el.nombre}  D.N.I. N.°:${el.dni} ${(arr.length !== i+1) ? '\n' : ''}`
    })
    return aux
}
function listPartes(arr){
    let aux = ''
    arr && arr.forEach((el,i) =>{
        aux = `${aux}${el.role}: ${el.name} ${el.dni ? ` D.N.I. N.°:${el.dni}` : ''} ${(arr.length !== i+1) ? '\n' : ''}`
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

export function generateResuelvoSection(item, date){
    const sections = []
    sections.push({title: 'Lugar y Fecha', text: `San Juan, ${date.split('').splice(0,2).join('')} de ${capitalizeFirst(getMonthName(date.split('').splice(2,2).join('')))} de ${date.split('').splice(4,4).join('')}.`})
    sections.push({title: 'Tipo de Audiencia', text: `${item.tipo}${item.tipo2 && ' - ' + item.tipo2}${item.tipo3 && ' - ' + item.tipo3}.`})
    sections.push({title: 'Legajo', text: `N° ${item.numeroLeg} Caratulado "${item.caratula}".`})
    sections.push({title: 'Sala de Audiencias', text: `${item.sala}.`})
    sections.push({title: 'Hora programada', text: `${item.hora} horas.`})
    sections.push({title: 'Hora real de inicio', text: `${item.hitos[0].split(' | ').splice(0,1)} horas.`})
    if(item.juez.split('+').length > 1){
        sections.push({title: 'Tribunal Colegiado', text: `${item.juez.split('+').map(j => capitalizeFirst(j.toLowerCase())).join('\n')}`})
    }else{
        sections.push({title: 'Juez', text: `${capitalizeFirst(item.juez.toLowerCase())}`})
    }
    if(item.mpf) {listFiscal(item.mpf).split('\n').forEach(f => sections.push({title: `${f.split(':')[0]}`, text: `${f.split('Fiscal:')[1].split('UFI:')[0]} UFI: ${f.split('UFI:')[1]}`}))}
    console.log(listFiscal(item.mpf).split('\n'))
    if(item.defensa) {listDefensa(item.defensa).split('\n').forEach(d => sections.push({title: `${d.split(':')[0]}`, text: `${d.split(':')[1]}`}))}
    if(item.imputado) {listImputado(item.imputado).split('\n').forEach(i => sections.push({title: `${i.split(':')[0]}`, text: `${i.split(':')[1]}`}))}
    if(item.partes) {listPartes(item.partes).split('\n').forEach(p => sections.push({title: `${p.split(':')[0]}`, text: `${p.split(':')[1]}`}))}
    sections.push({title: 'Operador', text: `${item.operador}`})
    sections.push({text: ''})
    return sections
}
function juecesPart(jueces){
    let aux = ''
    if(jueces.split('+').length > 1){
        aux = 'el Tribunal Colegiado compuesto por'
        jueces.split('+').forEach((juez, index) =>{
            aux += (juez.split('.')[0] === 'DR' ? `Sr. Juez ${juez.map(j => capitalizeFirst(j.toLowerCase()))}` : `Sra. Jueza ${juez.map(j => capitalizeFirst(j.toLowerCase()))}`)
            if(index != 2) aux += ', '
        })
    }else{
        aux = (juez.split('.')[0] === 'DR' ? `El Sr. Juez ${juez.map(j => capitalizeFirst(j.toLowerCase()))}` : `La Sra. Jueza ${juez.map(j => capitalizeFirst(j.toLowerCase()))}`)
    }
}
export function generateOficioSection(item, date, traslado, oficiados){
    const sections = []
    sections.push({right: `San Juan, ${date.split('').splice(0,2).join('')} de ${capitalizeFirst(getMonthName(date.split('').splice(2,2).join('')))} de ${date.split('').splice(4,4).join('')}.`})
    oficiados.forEach(el => sections.push({title: `${el}`}))
    oficiados.push({text: `          Me dirijo a Uds, en legajo ${item.numeroLeg} caratulado "${item.caratula}"; a fin de informarles que en Audiencia de ${item.tipo} - ${item.tipo2} - ${item.tipo3} llevada a cabo en el día de la fecha, ${juecesPart(item.juez)}, resolvió: "${item.resuelvo.split('):')[1]}".
          En la presente audiencia intervinieron ${juecesPart(item.juez)}. ${item.mpf.map(el => ` Ministerio Público Fiscal: ${el.nombre.split('-')[0]} UFI: ${el.nombre.split('-')[1]}.`)} ${item.defensa.map(el => ` Defensa ${el.tipo}: ${el.nombre}.`)} ${item.imputado.map(el => ` ${el.condenado ? 'Condenado:' : 'Imputado:'}: ${el.nombre} D.N.I.N°: ${el.dni}.`)} ${item.partes ? item.partes.map(el => ` ${el.role}: ${el.name}.`) : ''}. Operador: ${el.operador}.
          ${traslado}
                            Saluda atte.`})
}
export function generateMinutaSection(item, date){
    const sections = []
    sections.push(...generateResuelvoSection(item,date))
    sections.push({text: item.minuta})
    sections.push({text: item.cierre})
    return sections
}

export function copyResuelvoToClipboard(item, date){
    navigator.clipboard.writeText(generateResuelvo(item, date));
}
export function checkForResuelvo(item){
    if(item.imputado && item.defensa && item.caratula && item.mpf && item.resuelvoText){
        return(true)
    }else{
        return(false)
    }
}