import { removeHtmlTags } from "./removeHtmlTags"

function splitByTimestamps(text, insertText = "") {
    const timestampRegex = /(\bminuto\b|\bMinuto\b)\s*(\d{2}:\d{2}:\d{2})(?:\/(\d{2}:\d{2}:\d{2}))?\s*(\bvideo\b|\bVideo\b)\s*(\d+)/g;
    let matches, lastIndex = 0;
    let result = [];
    
    while ((matches = timestampRegex.exec(text)) !== null) {
        if (matches.index > lastIndex) {
            result.push(text.substring(lastIndex, matches.index).trim());
        }
        result.push(matches[0] + " " + insertText);
        lastIndex = timestampRegex.lastIndex;
    }
    
    if (lastIndex < text.length) {
        result.push(text.substring(lastIndex).trim());
    }
    
    return result.filter(part => part.length > 0);
}

function splitNormalBold(text) {
    const aux = text.split('</strong>')
    if(aux[0].includes('<strong>')){
        return aux.flatMap(str => str.split('<strong>'));
    }else{
        return ['', ...aux.flatMap(str => str.split('<strong>'))]
    }
}
function extractTimestamp(text) {
    const timestampRegex = /\bminuto\b\s*(\d{2}):(\d{2}):(\d{2})\s*\bvideo\b\s*(\d+)/i;
    const match = text.match(timestampRegex);
    return match ? `${match[4]}${match[1]}${match[2]}${match[3]}` : null;
}
function resuelvoStructure(juez){
    if(juez.includes('+')){
        return('<strong>Fundamentos y Resolución: El Tribunal Colegiado MOTIVA y RESUELVE</strong>')
    }else{
        if(juez.includes('DR.')){
            return('<strong>Fundamentos y Resolución: El Sr. Juez MOTIVA Y RESUELVE</strong>')
        }else{
            return('<strong>Fundamentos y Resolución: La Sra. Jueza MOTIVA Y RESUELVE</strong>')
        }
    }
}

export const minutaPrep = (item) =>{
    const aux = []
    const minutaAux = splitByTimestamps(item.minuta).map(el=>{
        aux.push({text: splitNormalBold(el), timestamp: (extractTimestamp(el) || 1)})
    })
    const cierreAux = splitByTimestamps(item.cierre).map(el=>{
        aux.push({text: splitNormalBold(el), timestamp: (extractTimestamp(el) || 1)})
    })
    const resuelvoAux = splitByTimestamps(item.resuelvoText, resuelvoStructure(juez)).forEach(el=>{
        aux.push({text: splitNormalBold(el).map(el2 =>{
            return(resuelvoStructure(el2))
        }), timestamp: (extractTimestamp(el) || 1)})
    })

}