import { PDFGenerator } from "./pdfUtils";
import { capitalizeFirst } from "./caratulaUtils";
import { getMonthName } from "./caratulaUtils";
import { removeHtmlTags } from "./removeHtmlTags";
import { minutaPrep } from "./minutaPrep";

export function listFiscal(arr, ufi) {
    let aux = '';
    arr && arr.forEach((el, i) => {
        aux += `${i > 1 ? '' : 'Ministerio Público Fiscal: '}${el.nombre.includes(' - ') ? el.nombre.split(' - ')[0] : el.nombre}${ufi === "EJECUCIÓN" ? '' : ` UFI:${ufi}`}${el.asistencia ? '' : ' (ausente)'}` + (arr.length !== i + 1 ? '\n' : '');
    });
    return aux;
}

export function listDefensa(arr) {
    let aux = '';
    arr && arr.forEach((el, i) => {
        aux += `Defensa ${el.tipo}: ${el.nombre} ${el.imputado ? `(En representación de ${el.imputado})` : ''} ${el.asistencia ? '' : '(ausente)'}` + (arr.length !== i + 1 ? '\n' : '');
    });
    return aux;
}

export function listImputado(arr) {
    let aux = '';
    arr && arr.forEach((el, i) => {
        aux += `${el.condenado ? 'Condenado' : 'Imputado'}: ${el.nombre}  D.N.I. N.°: ${el.dni} ${el.asistencia ? '' : '(ausente)'}` + (arr.length !== i + 1 ? '\n' : '');
        if(el.detenido !== ''){
            aux += `\nFecha de detención: ${el.detenido}\n`
        }
    });
    return aux;
}

export function listPartes(arr) {
    let groupedRoles = {};
    arr?.forEach(el => {
        if (!groupedRoles[el.role]) {
            groupedRoles[el.role] = [];
        }
        let personInfo = el.name ? el.name : '';
        if (el.dni) {
            personInfo += ` D.N.I. N.°:${el.dni}`;
        }
        if (personInfo.trim() !== '') {
            groupedRoles[el.role].push(personInfo);
        }
    });
    return groupedRoles;
}


export function generateResuelvo(item, date) {
    const resuelvo = `
Lugar y Fecha: San Juan, ${date.slice(0, 2)} de ${capitalizeFirst(getMonthName(date.slice(2, 4)))} de ${date.slice(4, 8)}
Tipo de Audiencia: ${item.tipo}${item.tipo2 ? ' - ' + item.tipo2 : ''}${item.tipo3 ? ' - ' + item.tipo3 : ''}
Legajo: N° ${item.numeroLeg}${item.saeNum ? ` / ${item.saeNum}` : ''} Caratulado ${item.caratula}
Sala de Audiencias: ${item.sala}
Hora programada: ${item.hora} horas
Hora real de inicio: ${item.hitos[0].split(' | ')[0]} horas
Juez Interviniente: ${capitalizeFirst(item.juez.toLowerCase())}
${item.mpf && listFiscal(item.mpf, item.ufi)}
${listDefensa(item.defensa)}
${listImputado(item.imputado)}
${listPartes(item.partes)}
Operador: ${item.operador}

Fundamentos y Resolución: ${removeHtmlTags(item.resuelvoText)}
    `;
    return resuelvo;
}

export function generateResuelvoSection(item, date) {
    const sections = [
        { title: 'Lugar y Fecha:', text: `San Juan, ${date.slice(0, 2)} de ${capitalizeFirst(getMonthName(date.slice(2, 4)))} de ${date.slice(4, 8)}.`},
        { title: 'Tipo de Audiencia:', text: `${item.tipo}${item.tipo2 ? ' - ' + item.tipo2 : ''}${item.tipo3 ? ' - ' + item.tipo3 : ''}.`},
        { title: 'Legajo:', text: `N° ${item.numeroLeg}${item.saeNum ? ` / ${item.saeNum}` : ''} Caratulado ${item.caratula}.`},
        { title: 'Sala de Audiencias:', text: `${item.sala}.`},
        { title: 'Hora programada:', text: `${item.hora} horas.`},
        { title: 'Hora real de inicio:', text: `${item.hitos[0].split(' | ')[0]} horas.`},
    ];

    if (item.juez.split('+').length > 1) {
        sections.push({ title: 'Tribunal Colegiado:', text: item.juez.split('+').map(j => capitalizeFirst(j.toLowerCase())).join('\n') });
    } else {
        sections.push({ title: item.juez.includes('DR.') ? 'Juez:' : 'Jueza:', text: capitalizeFirst(item.juez.toLowerCase())});
    }
    if (item.mpf) {
        let fiscales = [];
        listFiscal(item.mpf, item.ufi)
          .split('\n')
          .forEach((f, indexF) => {
            if (f.includes('Fiscal:')) {
              fiscales.push(`${f.split('Fiscal:')[1].split('UFI:')[0]}${item.mpf[indexF]?.asistencia ? '' : ' (ausente)'}`);
            }
          });
          let ufiText = item.ufi === "EJECUCIÓN" ? '' : `UFI: ${item.ufi}`;
          sections.push({
            title: 'Ministerio Público Fiscal:',
            text: `${fiscales.join('\n')}${ufiText ? ('\n' + ufiText) : ''}`
          });
      }
    if (item.defensa) {
        listDefensa(item.defensa).split('\n').forEach(d => sections.push({ title: d.split(':')[0]+':', text: d.split(':')[1]}));
    }
    if (item.imputado) {
        listImputado(item.imputado).split('\n').forEach(i => {
            if(i.split('detención:')[0] !== "Fecha de "){
                sections.push({ title: i.split(':')[0]+':', text: i.split(':')[1] + i.split(':')[2]})}
            else{
                if(i.split('detención:')[0] === "Fecha de "){
                    sections.push({title: i.split(':')[0]+':', text: i.split(':')[1]})}
                }
            }
        )}
    if (item.partes) {
        const groupedPartes = listPartes(item.partes);
        Object.entries(groupedPartes).forEach(([role, people]) => {
            if(role && people){
                sections.push({
                    title: capitalizeFirst(role.toLowerCase()) + ':',
                    text: people.join('\n')
                });
            }
        });
    }    
    sections.push({ title: 'Operador:', text: item.operador });
    sections.push({ title: ''});
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

function removeTimeMarks(text) {
    return text.replace(/\(\s*(?:minuto\s*)?\d{1,2}:\d{2}(?::\d{2})?(?:\s*\/\s*\d{1,2}:\d{2}(?::\d{2})?)?\s*(?:video\s*\d+)?\s*\)/gi, "").trim();
}

export async function generateOficioSection(item, date, traslado='', oficiados) {
    const sections = [];
    sections.push({ right: `San Juan, ${date.slice(0, 2)} de ${getMonthName(date.slice(2, 4))} de ${date.slice(4, 8)}.` });
    oficiados.forEach(el => sections.push({ title: el.value, text: '' }));
    sections.push({
        text: `Me dirijo a Uds, en legajo ${item.numeroLeg}${item.saeNum ? ` / ${item.saeNum}` : ''} caratulado ${item.caratula}; a fin de informarles que en Audiencia de ${item.tipo}${item.tipo2 ? ' - ' + item.tipo2 : ''}${item.tipo3 ? ' - ' + item.tipo3 : ''} llevada a cabo en el día de la fecha, ${juecesPart(item.juez)}, resolvió: ${removeTimeMarks(removeHtmlTags(item.resuelvoText))}
    En la presente audiencia intervinieron: ${juecesPart(item.juez)}. ${item.mpf.map(el => ` Ministerio Público Fiscal: ${el.nombre.split('-')[0]}${item.ufi === "EJECUCIÓN" ? '' : ` UFI: ${item.ufi}`}.`).join(' ')} ${item.defensa.map(el => ` Defensa ${el.tipo}: ${el.nombre}.`).join(' ')} ${item.imputado.map(el => ` ${el.condenado ? 'Condenado:' : 'Imputado:'} ${el.nombre} D.N.I.N°: ${el.dni}.`).join(' ')} ${item.partes ? item.partes.map(el => ` ${el.role}: ${el.name}.`).join(' ') : ''} Operador: ${item.operador}.
    ${traslado}
    Saluda atte.`});
    await PDFGenerator(sections, item.numeroLeg);
}

export function generateMinutaSection(item, date) {
    const sections = [...generateResuelvoSection(item, date), ...minutaPrep(item)];
    return sections;
} 

export function copyResuelvoToClipboard(item, date) {
    navigator.clipboard.writeText(generateResuelvo(item, date));
}

export function checkForResuelvo(item) {
    return item.imputado && item.defensa && item.caratula && item.mpf && item.resuelvoText;
}