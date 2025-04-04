import { removeHtmlTags } from "./removeHtmlTags";

function extractTimestamp(text) {
    const timestampRegex = /\(?\bminuto\b\s*(\d{2}):(\d{2}):(\d{2})(?:\/(\d{2}):(\d{2}):(\d{2}))?\s*\bvideo\b\s*(\d+)\)?/i;
    const match = text.match(timestampRegex);
    if (!match) return null;

    return {
        video: match[7] || "0",
        start: `${match[1]}:${match[2]}:${match[3]}`,
        end: match[4] ? `${match[4]}:${match[5]}:${match[6]}` : null
    };
}

function splitByTimestamps(text) {
    const timestampRegex = /\(?\bminuto\b\s*\d{2}:\d{2}:\d{2}(?:\/\d{2}:\d{2}:\d{2})?\s*\bvideo\b\s*\d+\)?/gi;
    let matches, lastIndex = 0;
    let result = [];

    while ((matches = timestampRegex.exec(text)) !== null) {
        if (matches.index > lastIndex) {
            // Capture text BEFORE the timestamp
            result.push({
                text: text.substring(lastIndex, matches.index).trim(),
                timestamp: null
            });
        }
        
        const extractedTimestamp = extractTimestamp(matches[0].replace(/[()]/g, ""));
        lastIndex = timestampRegex.lastIndex; // Move lastIndex forward
        
        // Instead of capturing the entire remaining text, capture only the part between timestamps
        const nextMatch = timestampRegex.exec(text); // Look ahead for the next timestamp
        timestampRegex.lastIndex = lastIndex; // Reset regex index to continue normally

        result.push({
            text: text.substring(lastIndex, nextMatch ? nextMatch.index : text.length).trim(),
            timestamp: extractedTimestamp
        });

        lastIndex = nextMatch ? nextMatch.index : text.length; // Move lastIndex to next section
    }

    // Capture any trailing text
    if (lastIndex < text.length) {
        result.push({
            text: text.substring(lastIndex).trim(),
            timestamp: null
        });
    }

    return result.filter(part => part.text.length > 0);
}


function splitNormalBold(text) {
    const parts = text.split(/(<strong>|<\/strong>)/).filter(p => p.trim());
    let bold = false;
    return parts.map(part => {
        if (part === "<strong>") {
            bold = true;
            return null;
        } else if (part === "</strong>") {
            bold = false;
            return null;
        }
        return { text: removeHtmlTags(part.trim()), bold };
    }).filter(Boolean);
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
    const processText = (text) => splitByTimestamps(text).map(el => ({
        text: splitNormalBold(el.text),
        timestamp: el.timestamp,
    }));
    
    const auxMin = processText(item.minuta);
    const auxRes = processText(resuelvoStructure(item.juez) + " " + item.resuelvoText);
    const auxCie = processText(item.cierre);
    const sortedItems = [
        ...auxMin.filter(el => !el.timestamp),
        ...auxRes.filter(el => !el.timestamp),
        ...[...auxMin, ...auxRes]
            .filter(el => el.timestamp)
            .sort((a, b) => a.timestamp.start.localeCompare(b.timestamp.start)),
        ...auxCie
    ].map(el => el.timestamp ? {text:[{text:`(Minuto ${el.timestamp.start}${el.timestamp.end && `/${el.timestamp.end}`} Video ${el.timestamp.video})`, bold: false},...el.text]} : {text:[...el.text]});
    console.log(sortedItems)
    return sortedItems
};
