import { PDFGenerator } from "./pdfUtils";

function getMonthName(number) {
    const date = new Date(0, number - 1);
    return date.toLocaleString('es-AR', { month: 'long' });
}

function capitalizeFirst(sentence) {
    if (!sentence) return sentence;
    return sentence.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function listFiscal(arr, ufi) {
    let aux = '';
    arr && arr.forEach((el, i) => {
        aux += `Ministerio Público Fiscal: ${el.nombre.split(' - ')[0]}  UFI:${ufi} ${el.asistencia ? '' : '(ausente)'}` + (arr.length !== i + 1 ? '\n' : '');
    });
    return aux;
}

function listDefensa(arr) {
    let aux = '';
    arr && arr.forEach((el, i) => {
        aux += `Defensa ${el.tipo}: ${el.nombre} ${el.imputado ? `(En representación de ${el.imputado})` : ''} ${el.asistencia ? '' : '(ausente)'}` + (arr.length !== i + 1 ? '\n' : '');
    });
    return aux;
}

function listImputado(arr) {
    let aux = '';
    arr && arr.forEach((el, i) => {
        aux += `${el.condenado ? 'Condenado' : 'Imputado'}: ${el.nombre}  D.N.I. N.°: ${el.dni} ${el.asistencia ? '' : '(ausente)'}` + (arr.length !== i + 1 ? '\n' : '');
    });
    return aux;
}

function listPartes(arr) {
    let aux = '';
    arr && arr.forEach((el, i) => {
        aux += `${el.role}: ${el.name} ${el.dni ? ` D.N.I. N.°:${el.dni}` : ''}` + (arr.length !== i + 1 ? '\n' : '');
    });
    return aux;
}

export function generateResuelvo(item, date) {
    const resuelvo = `
Lugar y Fecha: San Juan, ${date.slice(0, 2)} de ${capitalizeFirst(getMonthName(date.slice(2, 4)))} de ${date.slice(4, 8)}
Tipo de Audiencia: ${item.tipo}${item.tipo2 ? ' - ' + item.tipo2 : ''}${item.tipo3 ? ' - ' + item.tipo3 : ''}
Legajo: N° ${item.numeroLeg} Caratulado ${item.caratula}
Sala de Audiencias: ${item.sala}
Hora programada: ${item.hora} horas
Hora real de inicio: ${item.hitos[0].split(' | ')[0]} horas
Juez Interviniente: ${capitalizeFirst(item.juez.toLowerCase())}
${listFiscal(item.mpf, item.ufi)}
${listDefensa(item.defensa)}
${listImputado(item.imputado)}
${listPartes(item.partes)}
Operador: ${item.operador}

Fundamentos y Resolución: ${item.resuelvoText}
    `;
    return resuelvo;
}

export function generateResuelvoSection(item, date) {
    const sections = [
        { title: 'Lugar y Fecha', text: `San Juan, ${date.slice(0, 2)} de ${capitalizeFirst(getMonthName(date.slice(2, 4)))} de ${date.slice(4, 8)}.` },
        { title: 'Tipo de Audiencia', text: `${item.tipo}${item.tipo2 ? ' - ' + item.tipo2 : ''}${item.tipo3 ? ' - ' + item.tipo3 : ''}.` },
        { title: 'Legajo', text: `N° ${item.numeroLeg} Caratulado ${item.caratula}.` },
        { title: 'Sala de Audiencias', text: `${item.sala}.` },
        { title: 'Hora programada', text: `${item.hora} horas.` },
        { title: 'Hora real de inicio', text: `${item.hitos[0].split(' | ')[0]} horas.` },
    ];

    if (item.juez.split('+').length > 1) {
        sections.push({ title: 'Tribunal Colegiado', text: item.juez.split('+').map(j => capitalizeFirst(j.toLowerCase())).join('\n') });
    } else {
        sections.push({ title: 'Juez', text: capitalizeFirst(item.juez.toLowerCase()) });
    }

    if (item.mpf) {
        listFiscal(item.mpf, item.ufi).split('\n').forEach((f, indexF) => sections.push({ title: f.split(':')[0], text: f.split('Fiscal:')[1].split('UFI:')[0] + ` UFI: ${item.ufi}` + (item.mpf[indexF].asistencia ? '' : ' (ausente)')}));
    }
    if (item.defensa) {
        listDefensa(item.defensa).split('\n').forEach(d => sections.push({ title: d.split(':')[0], text: d.split(':')[1]}));
    }
    if (item.imputado) {
        listImputado(item.imputado).split('\n').forEach(i => sections.push({ title: i.split(':')[0], text: i.split(':')[1] + i.split(':')[2]}));
    }
    if (item.partes) {
        listPartes(item.partes).split('\n').forEach(p => sections.push({ title: p.split(':')[0], text: p.split(':')[1] }));
    }
    
    sections.push({ title: 'Operador', text: item.operador });
    sections.push({ text: ' ' });

    return sections;
}

function juecesPart(jueces) {
    let aux = '';
    if (jueces.split('+').length > 1) {
        aux = 'el Tribunal Colegiado compuesto por ';
        jueces.split('+').forEach((juez, index) => {
            aux += juez.split('.')[0] === 'DR' ? `Sr. Juez ${capitalizeFirst(juez.toLowerCase())}` : `Sra. Jueza ${capitalizeFirst(juez.toLowerCase())}`;
            if (index < jueces.split('+').length - 1) aux += ', ';
        });
    } else {
        aux = jueces.split('.')[0] === 'DR' ? `Sr. Juez ${capitalizeFirst(jueces.toLowerCase())}` : `Sra. Jueza ${capitalizeFirst(jueces.toLowerCase())}`;
    }
    return aux;
}

export async function generateOficioSection(item, date, traslado, oficiados) {
    const sections = [];
    sections.push({ right: `San Juan, ${date.slice(0, 2)} de ${capitalizeFirst(getMonthName(date.slice(2, 4)))} de ${date.slice(4, 8)}.` });
    oficiados.forEach(el => sections.push({ title: el.value, text: '' }));
    
    sections.push({
        text: `                                                                         Me dirijo a Uds, en legajo ${item.numeroLeg} caratulado ${item.caratula}; a fin de informarles que en Audiencia de ${item.tipo}${item.tipo2 ? ' - ' + item.tipo2 : ''}${item.tipo3 ? ' - ' + item.tipo3 : ''} llevada a cabo en el día de la fecha, ${juecesPart(item.juez)}, resolvió: ${item.resuelvoText.split('):')[1]}.
        En la presente audiencia intervinieron: ${juecesPart(item.juez)}. ${item.mpf.map(el => ` Ministerio Público Fiscal: ${el.nombre.split('-')[0]} UFI: ${item.ufi}.`).join(' ')} ${item.defensa.map(el => ` Defensa ${el.tipo}: ${el.nombre}.`).join(' ')} ${item.imputado.map(el => ` ${el.condenado ? 'Condenado:' : 'Imputado:'} ${el.nombre} D.N.I.N°: ${el.dni}.`).join(' ')} ${item.partes ? item.partes.map(el => ` ${el.role}: ${el.name}.`).join(' ') : ''} Operador: ${item.operador}.
        ${traslado}
        
                                                                                        Saluda atte.`
    });
    await PDFGenerator(sections);
}

export function generateMinutaSection(item, date) {
    const sections = [];
    sections.push(...generateResuelvoSection(item, date));
    sections.push({ text: item.minuta });
    sections.push({ text: item.resuelvoText });
    sections.push({ text: item.cierre });
    return sections;
}

export function copyResuelvoToClipboard(item, date) {
    navigator.clipboard.writeText(generateResuelvo(item, date));
}

export function checkForResuelvo(item) {
    return item.imputado && item.defensa && item.caratula && item.mpf && item.resuelvoText;
}