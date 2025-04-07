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
    const timestampRegex = /(?:<[^>]+>\s*)*\(?\bminuto\b\s*\d{2}:\d{2}:\d{2}(?:\/\d{2}:\d{2}:\d{2})?\s*\bvideo\b\s*\d+\)?/gi;
    let matches, lastIndex = 0;
    let result = [];

    while ((matches = timestampRegex.exec(text)) !== null) {
        const matchStart = matches.index;
        const matchEnd = timestampRegex.lastIndex;

        if (matchStart > lastIndex) {
            // Capture content before timestamp (excluding leading tags)
            const before = text.substring(lastIndex, matchStart).trim();
            if (before.length) {
                result.push({
                    text: before,
                    timestamp: null
                });
            }
        }

        // Clean the match to extract timestamp (remove HTML tags from it)
        const cleanMatch = matches[0].replace(/<\/?[^>]+(>|$)/g, "").replace(/[()]/g, "");
        const extractedTimestamp = extractTimestamp(cleanMatch);

        // Look for next match to define the boundary of current segment
        const nextMatch = timestampRegex.exec(text);
        const contentEnd = nextMatch ? nextMatch.index : text.length;
        timestampRegex.lastIndex = matchEnd; // Reset to resume correctly next iteration

        // Capture the content following the timestamp
        const content = text.substring(matchEnd, contentEnd).trim();
        if (content.length) {
            result.push({
                text: content,
                timestamp: extractedTimestamp
            });
        }

        lastIndex = contentEnd;
    }

    // Capture any trailing content
    if (lastIndex < text.length) {
        const tail = text.substring(lastIndex).trim();
        if (tail.length) {
            result.push({
                text: tail,
                timestamp: null
            });
        }
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
        return "\n<strong>Fundamentos y Resolución:</strong> El Tribunal Colegiado <strong>MOTIVA y RESUELVE</strong>";
    } else if (juez.includes('DR.')) {
        return "\n<strong>Fundamentos y Resolución:</strong> El Sr. Juez <strong>MOTIVA Y RESUELVE</strong>";
    } else {
        return "\n<strong>Fundamentos y Resolución:</strong> La Sra. Jueza <strong>MOTIVA Y RESUELVE</strong>";
    }
}
function extractFundamento(text) {
    const regex = new RegExp(
      `<strong>\\s*Fundamentos\\s*y\\s*Resoluci[oó]n\\s*:\\s*</strong>\\s*El\\s*(Tribunal\\s+Colegiado|Sr\\.?\\s+Juez|Sra\\.?\\s+Jueza)\\s*<strong>\\s*MOTIVA\\s*y\\s*RESUELVE\\s*</strong>`,
      'gi'
    );
  
    return text.replace(regex, '');
  }
  
  

export const minutaPrep = (item) => {
    const processText = (text, resBool = false) => splitByTimestamps(text).map(el => ({
        text: splitNormalBold(resBool ? resuelvoStructure(item.juez) + "\n" +  el.text : el.text),
        timestamp: el.timestamp,
    }));
    
    const auxMin = processText(item.minuta);
    console.log(item.resuelvoText)
    const auxRes = processText(extractFundamento(item.resuelvoText), true);
    const auxCie = processText(item.cierre);
    const sortedItems = [
        ...auxMin.filter(el => !el.timestamp),
        ...auxRes.filter(el => !el.timestamp),
        ...[...auxMin, ...auxRes]
            .filter(el => el.timestamp)
            .sort((a, b) => a.timestamp.start.localeCompare(b.timestamp.start)),
        ...auxCie
    ].map(el => el.timestamp ? {text:[{text:`(Minuto ${el.timestamp.start}${el.timestamp.end ? `/${el.timestamp.end}` : ''} Video ${el.timestamp.video})`, bold: false},...el.text]} : {text:[...el.text]});
    return sortedItems
};
