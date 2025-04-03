import { removeHtmlTags } from "./removeHtmlTags";

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
    const parts = text.split(/<\/?strong>/).map(part => removeHtmlTags(part.trim()));
    return parts.map((part, index) => ({
        text: part,
        bold: index % 2 === 1, // Even indices = normal, odd indices = bold
    }));
}

function extractTimestamp(text) {
    const timestampRegex = /\bminuto\b\s*(\d{2}):(\d{2}):(\d{2})\s*\bvideo\b\s*(\d+)/i;
    const match = text.match(timestampRegex);
    return match ? parseInt(`${match[4]}${match[1]}${match[2]}${match[3]}`) : 0;
}

function resuelvoStructure(juez) {
    if (juez.includes('+')) {
        return "<strong>Fundamentos y Resolución: El Tribunal Colegiado MOTIVA y RESUELVE</strong>";
    } else if (juez.includes('DR.')) {
        return "<strong>Fundamentos y Resolución: El Sr. Juez MOTIVA Y RESUELVE</strong>";
    } else {
        return "<strong>Fundamentos y Resolución: La Sra. Jueza MOTIVA Y RESUELVE</strong>";
    }
}

export const minutaPrep = (item) => {
    const auxMin = splitByTimestamps(item.minuta).map(el => ({
        text: splitNormalBold(el),
        timestamp: extractTimestamp(el) || 0,
    }));

    const auxCie = splitByTimestamps(item.cierre).map(el => ({
        text: splitNormalBold(el),
        timestamp: extractTimestamp(el) || 0,
    }));

    const auxRes = splitByTimestamps(item.resuelvoText, resuelvoStructure(item.juez)).map(el => ({
        text: splitNormalBold(el),
        timestamp: extractTimestamp(el) || 0,
    }));

    const sortedItems = [...auxMin, ...auxRes, ...auxCie].sort((a, b) => a.timestamp - b.timestamp);
    const aux = sortedItems.filter(el => el.timestamp === 0).concat(sortedItems.filter(el => el.timestamp !== 0));

    return aux;
};
