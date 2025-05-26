import { removeHtmlTags } from "./removeHtmlTags";

function extractTimestamp(text) {
    const timestampRegex = /\(?\bminuto\b\s*(\d{2}):(\d{2}):(\d{2})(?:\s*\/\s*(\d{2}):(\d{2}):(\d{2}))?\s*\bvideo\b\s*(\d+)\)?/i;
    const match = text.match(timestampRegex);
    if (!match) return null;

    return {
        video: match[7] || "0",
        start: `${match[1]}:${match[2]}:${match[3]}`,
        end: match[4] ? `${match[4]}:${match[5]}:${match[6]}` : null
    };
}

function splitByTimestamps(text) {
    const timestampRegex = /\(?\bminuto\b\s*(\d{2}):(\d{2}):(\d{2})(?:\s*\/\s*(\d{2}):(\d{2}):(\d{2}))?\s*\bvideo\b\s*(\d+)\)?/gi;
    let matches, lastIndex = 0;
    let result = [];

    while ((matches = timestampRegex.exec(text)) !== null) {
        const matchStart = matches.index;
        const matchEnd = timestampRegex.lastIndex;

        if (matchStart > lastIndex) {
            const before = text.substring(lastIndex, matchStart).trim();
            if (before.length) {
                result.push({
                    text: before,
                    timestamp: null
                });
            }
        }
        const cleanMatch = matches[0].replace(/<\/?[^>]+(>|$)/g, "").replace(/[()]/g, "");
        const extractedTimestamp = extractTimestamp(cleanMatch);
        const nextMatch = timestampRegex.exec(text);
        const contentEnd = nextMatch ? nextMatch.index : text.length;
        timestampRegex.lastIndex = matchEnd;

        const content = text.substring(matchEnd, contentEnd).trim();
        if (content.length) {
            result.push({
                text: content,
                timestamp: extractedTimestamp
            });
        }

        lastIndex = contentEnd;
    }

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
        return "<strong><br/>Fundamentos y Resolución:</strong> El Tribunal Colegiado <strong>MOTIVA y RESUELVE</strong>";
    } else if (juez.includes('DR.')) {
        return "<strong><br/>Fundamentos y Resolución:</strong> El Sr. Juez <strong>MOTIVA Y RESUELVE</strong>";
    } else {
        return "<strong><br/>Fundamentos y Resolución:</strong> La Sra. Jueza <strong>MOTIVA Y RESUELVE</strong>";
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
    const auxRes = processText(extractFundamento(item.resuelvoText), true);
    const auxCie = processText(item.cierre);
    const sortedItems = [
        ...auxMin.filter(el => !el.timestamp),
        ...auxRes.filter(el => !el.timestamp),
        ...[...auxMin, ...auxRes]
            .filter(el => el.timestamp)
            .sort((a, b) => {
                const videoA = parseInt(a.timestamp.video, 10);
                const videoB = parseInt(b.timestamp.video, 10);
                if (videoA !== videoB) return videoA - videoB;
                return a.timestamp.start.localeCompare(b.timestamp.start);
            }),
        ...auxCie
    ].map(el => el.timestamp ? {text:[{text:`(Minuto ${el.timestamp.start}${el.timestamp.end ? `/${el.timestamp.end}` : ''} Video ${el.timestamp.video})`, bold: false},...el.text]} : {text:[...el.text]});
    return sortedItems
};
