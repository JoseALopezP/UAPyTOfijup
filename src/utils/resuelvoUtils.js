import { PDFGenerator } from "./pdfUtils";
import { capitalizeFirst } from "./caratulaUtils";
import { getMonthName } from "./caratulaUtils";
import { removeHtmlTags } from "./removeHtmlTags";
import { minutaPrep } from "./minutaPrep";
import { todayFunction } from "./dateUtils";
import { inferGender } from "./genderUtils";

export function listFiscal(arr, ufi) {
    let aux = '';
    arr && arr.forEach((el, i) => {
        const { title, cleanName } = inferGender(el.nombre);
        const ufiText = (ufi && ufi !== "EJECUCIÓN") ? ` UFI:${ufi}` : '';
        aux += `${i > 0 ? '' : 'Ministerio Público Fiscal: '}${title} ${cleanName}${ufiText}${el.asistencia ? '' : ' (ausente)'}${el.presencial ? '' : '(virtual)'}` + (arr.length !== i + 1 ? '\n' : '');
    });
    return aux;
}

export function listDefensa(arr) {
    let aux = '';
    arr && arr.forEach((el, i) => {
        const imputados = (el.imputado && el.imputado.length > 0)
            ? el.imputado
                .map((p, idx) => {
                    const pName = p.nombre || p.name || '';
                    if (idx === 0) return pName?.split(',').join('') || '';
                    if (idx === el.imputado.length - 1) return ` y ${pName?.split(',').join('') || ''}`;
                    return `, ${pName?.split(',').join('') || ''}`;
                })
                .join('')
            : '';

        const { title, cleanName } = inferGender(el.nombre);
        const defensoriaStr = (el.tipo === 'Oficial' && el.defensoria) ? ` - Defensoría Oficial N°${el.defensoria}` : '';

        aux += `Defensa ${el.tipo}: ${title} ${cleanName}${defensoriaStr} ${imputados ? `(En representación de ${imputados})` : ''
            } ${el.asistencia ? '' : '(ausente)'} ${el.presencial ? '' : '(virtual)'
            }${arr.length !== i + 1 ? '\n' : ''}`;
    });
    return aux;
}

export function listRepresentantes(arr, rolText) {
    let aux = '';
    arr && arr.forEach((el, i) => {
        const representados = (el.representa && el.representa.length > 0)
            ? el.representa
                .map((p, idx) => {
                    if (idx === 0) return p.nombre?.split(',').join('') || '';
                    if (idx === el.representa.length - 1) return ` y ${p.nombre?.split(',').join('') || ''}`;
                    return `, ${p.nombre?.split(',').join('') || ''}`;
                })
                .join('')
            : '';
            
        const rol = rolText || el.role || el.tipo || 'Parte'; 
        const name = el.name || el.nombre || '';
        
        aux += `${rol}: ${name} ${representados ? `(En representación de ${representados})` : ''
            } ${el.asistencia ? '' : '(ausente)'} ${el.presencial ? '' : '(virtual)'
            }${arr.length !== i + 1 ? '\n' : ''}`;
    });
    return aux;
}

export function listImputado(arr) {
    let aux = '';
    arr && arr.forEach((el, i) => {
        aux += `${el.condenado ? 'Condenado' : 'Imputado'}: ${el.nombre}  D.N.I. N.°: ${el.dni} ${el.asistencia ? '' : '(ausente)'} ${el.presencial ? '' : '(virtual)'}`;
        if (el.detenido && el.detenido !== '') {
            aux += `\nFecha de detención: ${el.detenido}`;
        }
        if (i < arr.length - 1) aux += '\n';
    });
    return aux;
}

export function listPartes(arr) {
    let groupedRoles = {};
    arr?.forEach(el => {
        const roleName = el.role || 'Parte';
        if (!groupedRoles[roleName]) {
            groupedRoles[roleName] = [];
        }

        const representados = (el.representa && el.representa.length > 0)
            ? el.representa
                .map((p, idx) => {
                    const pName = p.nombre || p.name || '';
                    if (idx === 0) return pName?.split(',').join('') || '';
                    if (idx === el.representa.length - 1) return ` y ${pName?.split(',').join('') || ''}`;
                    return `, ${pName?.split(',').join('') || ''}`;
                })
                .join('')
            : '';

        let personInfo = el.name ? el.name : (el.nombre ? el.nombre : '');
        
        if (representados) {
            personInfo += ` (En representación de ${representados})`;
        }

        if (el.dni) {
            personInfo += ` D.N.I. N.°: ${el.dni}`;
        }

        personInfo += ` ${el.asistencia ? '' : '(ausente)'} ${el.presencial ? '' : '(virtual)'}`;

        if (personInfo.trim() !== '') {
            groupedRoles[roleName].push(personInfo.trim());
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
Hora real de inicio: ${item.hitos?.[0]?.split(' | ')[0] || ''} horas
Juez Interviniente: ${capitalizeFirst(item.juez.toLowerCase())}
${item.mpf && listFiscal(item.mpf, item.ufi)}
${listDefensa(item.defensa)}
${listImputado(item.imputado)}
${Object.entries(listPartes(item.partes)).map(([role, people]) => `${role}: ${people.join(', ')}`).join('\n')}
Operador: ${item.operador}

Fundamentos y Resolución: ${removeHtmlTags(item.resuelvoText)}
    `;
    return resuelvo;
}

export function generateResuelvoSection(item, date) {
    const sections = [
        { title: 'Lugar y Fecha:', text: `San Juan, ${date.slice(0, 2)} de ${capitalizeFirst(getMonthName(date.slice(2, 4)))} de ${date.slice(4, 8)}.` },
        { title: 'Tipo de Audiencia:', text: `${item.tipo}${item.tipo2 ? ' - ' + item.tipo2 : ''}${item.tipo3 ? ' - ' + item.tipo3 : ''}.` },
        { title: 'Legajo:', text: `N° ${item.numeroLeg}${item.saeNum ? ` / ${item.saeNum}` : ''} Caratulado ${item.caratula}.` },
        { title: 'Sala de Audiencias:', text: `${item.sala}.` },
        { title: 'Hora programada:', text: `${item.hora} horas.` },
        { title: 'Hora real de inicio:', text: `${item.hitos?.[0]?.split(' | ')[0] || ''} horas.` },
    ];

    if (item.juez?.split('+').length > 1) {
        sections.push({ title: 'Tribunal Colegiado:', text: item.juez.split('+').map(j => capitalizeFirst(j.toLowerCase())).join('\n') });
    } else {
        const { labelJuez } = inferGender(item.juez);
        sections.push({ title: labelJuez + ':', text: capitalizeFirst(item.juez?.toLowerCase() || '') });
    }
    if (item.mpf && item.mpf.length > 0) {
        let fiscales = item.mpf.map(el => {
            const nombre = el.nombre?.includes(' - ') ? el.nombre.split(' - ')[0] : el.nombre;
            return `${nombre}${el.asistencia ? '' : ' (ausente)'}`;
        });
        let ufiText = item.ufi === "EJECUCIÓN" ? '' : `UFI: ${item.ufi}`;
        sections.push({
            title: 'Ministerio Público Fiscal:',
            text: ` ${fiscales.join('\n ')}${ufiText ? ('\n ' + ufiText) : ''}`
        });
    }
    if (item.defensa) {
        listDefensa(item.defensa).split('\n').forEach(d => sections.push({ title: d.split(':')[0] + ':', text: d.split(':')[1] }));
    }
    if (item.imputado) {
        listImputado(item.imputado).split('\n').forEach(i => {
            if (i.split('detención:')[0] !== "Fecha de ") {
                sections.push({ title: i.split(':')[0] + ':', text: i.split(':')[1] + i.split(':')[2] })
            }
            else {
                if (i.split('detención:')[0] === "Fecha de ") {
                    sections.push({ title: i.split(':')[0] + ':', text: i.split(':')[1] })
                }
            }
        }
        )
    }
    if (item.partes) {
        const groupedPartes = listPartes(item.partes);
        Object.entries(groupedPartes).forEach(([role, people]) => {
            if (role && people) {
                sections.push({
                    title: capitalizeFirst(role.toLowerCase()) + ':',
                    text: people.join('\n')
                });
            }
        });
    }
    sections.push({ title: 'Operador:', text: item.operador });
    sections.push({ title: '' });
    return sections;
}

function juecesPart(jueces) {
    let aux = '';
    const judgesList = jueces?.split('+') || [];
    
    const formatJudge = (name) => {
        const { titleJuez } = inferGender(name);
        return `${titleJuez} ${capitalizeFirst(name.toLowerCase())}`;
    };

    if (judgesList.length > 1) {
        aux = 'el Tribunal Colegiado compuesto por ';
        judgesList.forEach((juez, index) => {
            aux += formatJudge(juez);
            if (index < judgesList.length - 1) {
                if (index === judgesList.length - 2) aux += ' y ';
                else aux += ', ';
            }
        });
    } else {
        aux = formatJudge(jueces);
    }
    return aux;
}

function removeTimeMarks(text) {
    return text.replace(/\(\s*(?:minuto\s*)?\d{1,2}:\d{2}(?::\d{2})?(?:\s*\/\s*\d{1,2}:\d{2}(?::\d{2})?)?\s*(?:video\s*\d+)?\s*\)/gi, "").trim();
}

export async function generateOficioSection(item, date, traslado = '', oficiados, resuelvo, imputadoList) {
    const today = todayFunction();
    const sections = [];
    sections.push({ right: `San Juan, ${today.slice(0, 2)} de ${getMonthName(today.slice(2, 4))} de ${today.slice(4, 8)}.` });
    oficiados.forEach(el => sections.push({ title: el.value, text: '' }));
    sections.push({
        text: `Me dirijo a Uds, en legajo ${item.numeroLeg}${item.saeNum ? ` / ${item.saeNum}` : ''} caratulado ${item.caratula}; a fin de informarles que en Audiencia de ${item.tipo}${item.tipo2 ? ' - ' + item.tipo2 : ''}${item.tipo3 ? ' - ' + item.tipo3 : ''} llevada a cabo ${today === date ? "en el día de la fecha" : `el ${date.slice(0, 1) === '0' ? date.slice(1, 2) : date.slice(0, 2)} de ${getMonthName(date.slice(2, 4))} de ${date.slice(4, 8)}`}, ${juecesPart(item.juez)}, resolvió: ${removeTimeMarks(removeHtmlTags(resuelvo))}
    En la presente audiencia intervinieron: ${juecesPart(item.juez)}. ${(item.mpf && item.mpf.length > 0) ? item.mpf.map(el => ` Ministerio Público Fiscal: ${el.nombre?.split('-')[0] || el.nombre}${item.ufi === "EJECUCIÓN" ? '' : ` UFI: ${item.ufi}`}.`).join(' ') : ''} ${item.defensa.map(el => ` Defensa ${el.tipo}: ${el.nombre}.`).join(' ')} ${item.imputado.map(el => ` ${el.condenado ? 'Condenado:' : 'Imputado:'} ${el.nombre} D.N.I.N°: ${el.dni}.`).join(' ')} ${item.partes ? Object.entries(listPartes(item.partes)).map(([role, people]) => ` ${role}: ${people.join(', ')}.`).join('') : ''} Operador: ${item.operador}. ${traslado !== '' ? `
        `+ traslado : ''}
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
    return item.imputado && item.defensa && item.caratula && item.resuelvoText;
}