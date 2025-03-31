import { removeHtmlTags } from "./removeHtmlTags"

function splitByTimestamps(text) {
    const timestampRegex = /(\bminuto\b|\bMinuto\b)\s*(\d{2}:\d{2}:\d{2})(?:\/(\d{2}:\d{2}:\d{2}))?\s*(\bvideo\b|\bVideo\b)\s*(\d+)/g;
    let matches, lastIndex = 0;
    let result = [];
    while ((matches = timestampRegex.exec(text)) !== null) {
        if (matches.index > lastIndex) {
            result.push(text.substring(lastIndex, matches.index).trim());
        }
        result.push(matches[0]);
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


export const minutaPrep = (item) =>{
    let minutaFinal = []
    let cierreFinal = []
    let resuelvofinal = []
    const minutaAux = splitByTimestamps(item.minuta)
    const cierreAux = splitByTimestamps(item.cierre)
    const resuelvoAux = splitByTimestamps(item.resuelvoText)

}