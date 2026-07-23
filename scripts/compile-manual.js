import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';

// Basic regex-based Markdown parser
function parseMarkdown(md) {
    let html = md;
    
    // Page breaks
    html = html.replace(/<!-- page-break -->/g, '<div class="page-break"></div>');
    
    // Horizontal rule
    html = html.replace(/^---$/gm, '<hr>');
    
    // Headings
    html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
    html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
    html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Lists
    let inList = false;
    const lines = html.split('\n');
    const processedLines = [];
    
    for (let line of lines) {
        if (line.trim().startsWith('- ')) {
            if (!inList) {
                processedLines.push('<ul>');
                inList = true;
            }
            let itemContent = line.trim().substring(2);
            processedLines.push(`  <li>${itemContent}</li>`);
        } else {
            if (inList) {
                processedLines.push('</ul>');
                inList = false;
            }
            processedLines.push(line);
        }
    }
    if (inList) {
        processedLines.push('</ul>');
    }
    
    html = processedLines.join('\n');
    
    // Tables
    const tableLines = html.split('\n');
    const withTables = [];
    let inTable = false;
    let tableHeaders = [];
    let tableRows = [];
    
    for (let i = 0; i < tableLines.length; i++) {
        const line = tableLines[i].trim();
        if (line.startsWith('|') && line.endsWith('|')) {
            if (!inTable) {
                const nextLine = tableLines[i+1]?.trim() || '';
                if (nextLine.startsWith('|') && nextLine.includes('---')) {
                    inTable = true;
                    tableHeaders = line.split('|').map(s => s.trim()).filter(s => s !== '');
                    i++; // skip separator
                    continue;
                }
            }
            
            if (inTable) {
                const rowCells = line.split('|').map(s => s.trim()).filter(s => s !== '');
                tableRows.push(rowCells);
            }
        } else {
            if (inTable) {
                let tableHtml = '<table>\n<thead>\n<tr>\n';
                for (const h of tableHeaders) {
                    tableHtml += `  <th>${h}</th>\n`;
                }
                tableHtml += '</tr>\n</thead>\n<tbody>\n';
                for (const row of tableRows) {
                    tableHtml += '<tr>\n';
                    for (const cell of row) {
                        tableHtml += `  <td>${cell}</td>\n`;
                    }
                    tableHtml += '</tr>\n';
                }
                tableHtml += '</tbody>\n</table>';
                withTables.push(tableHtml);
                inTable = false;
                tableHeaders = [];
                tableRows = [];
            }
            withTables.push(tableLines[i]);
        }
    }
    if (inTable) {
        let tableHtml = '<table>\n<thead>\n<tr>\n';
        for (const h of tableHeaders) {
            tableHtml += `  <th>${h}</th>\n`;
        }
        tableHtml += '</tr>\n</thead>\n<tbody>\n';
        for (const row of tableRows) {
            tableHtml += '<tr>\n';
            for (const cell of row) {
                tableHtml += `  <td>${cell}</td>\n`;
            }
            tableHtml += '</tr>\n';
        }
        tableHtml += '</tbody>\n</table>';
        withTables.push(tableHtml);
    }
    
    html = withTables.join('\n');
    
    // Links [Text](URL)
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
    
    // Replace mermaid flowchart
    const mermaidRegex = /```mermaid([\s\S]*?)```/g;
    html = html.replace(mermaidRegex, (match, code) => {
        return `
        <div class="flowchart">
            <div class="flow-step">
                <span class="step-num">1</span>
                <span class="step-title">PUMA (Portal Judicial)</span>
                <span class="step-desc">Se publican las notificaciones en estado "A NOTIFICAR".</span>
            </div>
            <div class="flow-arrow">↓</div>
            <div class="flow-step">
                <span class="step-num">2</span>
                <span class="step-title">CONO (Extracción)</span>
                <span class="step-desc">El robot raspa la lista y clasifica según texto y destinatario.</span>
            </div>
            <div class="flow-arrow">↓</div>
            <div class="flow-step">
                <span class="step-num">3</span>
                <span class="step-title">Firestore (Base de Datos)</span>
                <span class="step-desc">Se almacena en colecciones temporales (mails, traslados, etc.).</span>
            </div>
            <div class="flow-arrow">↓</div>
            <div class="flow-step">
                <span class="step-num">4</span>
                <span class="step-title">UAPyTOfijup (Consola Web)</span>
                <span class="step-desc">El operador valida, completa datos y marca como "LISTA".</span>
            </div>
            <div class="flow-arrow">↓</div>
            <div class="flow-step">
                <span class="step-num">5</span>
                <span class="step-title">CONO (Ejecución)</span>
                <span class="step-desc">El robot envía correos, sube constancias a Nextcloud y marca "Enviada" en PUMA.</span>
            </div>
        </div>`;
    });
    
    // Paragraphs
    const blocks = html.split(/\n\n+/);
    const parsedBlocks = blocks.map(block => {
        const trimmed = block.trim();
        if (!trimmed) return '';
        if (trimmed.startsWith('<h') || 
            trimmed.startsWith('<div') || 
            trimmed.startsWith('<hr') || 
            trimmed.startsWith('<ul') || 
            trimmed.startsWith('<table') ||
            trimmed.startsWith('<!--') ||
            trimmed.startsWith('**') ||
            trimmed.startsWith('|')) {
            return trimmed;
        }
        return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`;
    });
    
    return parsedBlocks.filter(b => b !== '').join('\n');
}

async function compile() {
    const docsDir = path.resolve('src/app/Notificaciones/docs');
    const mdPath = path.join(docsDir, 'manual-usuario.md');
    const pdfPath = path.join(docsDir, 'manual-usuario.pdf');
    
    console.log(`Leyendo manual: ${mdPath}`);
    const mdContent = fs.readFileSync(mdPath, 'utf8');
    
    // Remove the main H1 from the body because it goes on the cover page
    let bodyMd = mdContent;
    let title = 'MANUAL DE USUARIO Y OPERACIÓN';
    let subtitle = 'SISTEMA DE AUTOMATIZACIÓN DE NOTIFICACIONES';
    
    const h1Match = mdContent.match(/^# (.*?)$/m);
    if (h1Match) {
        title = h1Match[1];
        bodyMd = mdContent.replace(/^# .*?$/m, '');
    }
    
    const boldSubMatch = bodyMd.match(/^\*\*(.*?)\*\*$/m);
    if (boldSubMatch) {
        subtitle = boldSubMatch[1];
        bodyMd = bodyMd.replace(/^\*\*.*?\*\*$/m, '');
    }
    
    const parsedBody = parseMarkdown(bodyMd);
    
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${title}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
        
        body {
            font-family: 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            color: #1E293B;
            background-color: #FFFFFF;
            line-height: 1.6;
            font-size: 15px;
            margin: 0;
            padding: 0;
        }
        
        .cover {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 95vh;
            text-align: center;
            box-sizing: border-box;
            padding: 80px 40px;
        }
        
        .cover h1 {
            font-size: 32px;
            font-weight: 700;
            color: #0F172A;
            margin-bottom: 10px;
            line-height: 1.3;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: none;
            padding-bottom: 0;
        }
        
        .cover h2 {
            font-size: 18px;
            font-weight: 400;
            color: #475569;
            margin-top: 10px;
            margin-bottom: 40px;
            border-bottom: none;
            padding-bottom: 0;
        }
        
        .cover-accent {
            width: 80px;
            height: 4px;
            background-color: #0F172A;
            margin: 30px 0;
        }
        
        .cover-meta {
            margin-top: auto;
            font-size: 13px;
            color: #64748B;
            line-height: 1.8;
        }
        
        .container {
            padding: 40px 60px;
        }
        
        h1, h2, h3 {
            color: #0F172A;
            font-weight: 600;
            margin-top: 30px;
            margin-bottom: 15px;
        }
        
        h1 {
            font-size: 24px;
            border-bottom: 2px solid #E2E8F0;
            padding-bottom: 8px;
        }
        
        h2 {
            font-size: 20px;
            margin-top: 40px;
            border-bottom: 1px solid #E2E8F0;
            padding-bottom: 6px;
        }
        
        h3 {
            font-size: 16px;
        }
        
        p {
            margin-top: 0;
            margin-bottom: 15px;
            text-align: justify;
        }
        
        strong {
            color: #0F172A;
            font-weight: 600;
        }
        
        ul {
            margin-top: 0;
            margin-bottom: 20px;
            padding-left: 20px;
        }
        
        li {
            margin-bottom: 8px;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            margin-bottom: 25px;
            font-size: 14px;
        }
        
        th, td {
            padding: 10px 12px;
            text-align: left;
            border-bottom: 1px solid #E2E8F0;
        }
        
        th {
            background-color: #F8FAFC;
            color: #0F172A;
            font-weight: 600;
            border-top: 1px solid #E2E8F0;
        }
        
        tr:nth-child(even) td {
            background-color: #F8FAFC;
        }
        
        hr {
            border: 0;
            height: 1px;
            background-color: #E2E8F0;
            margin: 40px 0;
        }
        
        .flowchart {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin: 30px 0;
            background-color: #F8FAFC;
            border: 1px solid #E2E8F0;
            padding: 24px;
            border-radius: 4px;
        }
        
        .flow-step {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            background: #FFFFFF;
            border: 1px solid #CBD5E1;
            padding: 12px 20px;
            border-radius: 4px;
            width: 80%;
            max-width: 400px;
        }
        
        .step-num {
            font-size: 11px;
            background-color: #0F172A;
            color: #FFFFFF;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            margin-bottom: 6px;
        }
        
        .step-title {
            font-weight: 600;
            color: #0F172A;
            font-size: 14px;
        }
        
        .step-desc {
            font-size: 12px;
            color: #64748B;
            margin-top: 4px;
        }
        
        .flow-arrow {
            font-size: 20px;
            color: #94A3B8;
            margin: 8px 0;
            font-weight: bold;
        }
        
        .page-break {
            page-break-before: always;
        }
        
        @page {
            size: A4;
            margin: 20mm;
        }
        
        @media print {
            body {
                font-size: 14px;
            }
            .container {
                padding: 0;
            }
            h1, h2, h3, tr {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="cover">
        <h1>${title}</h1>
        <div class="cover-accent"></div>
        <h2>${subtitle}</h2>
        <div class="cover-meta">
            <strong>Poder Judicial de San Juan</strong><br>
            Oficina Judicial Penal (OFIJUP)<br>
            Unidad de Notificaciones y Citaciones<br>
            <br>
            Fecha: Julio 2026<br>
            Versión: 1.0.0
        </div>
    </div>
    
    <div class="container">
        ${parsedBody}
    </div>
</body>
</html>`;

    const tempHtmlPath = path.join(docsDir, 'manual-temp.html');
    fs.writeFileSync(tempHtmlPath, htmlContent, 'utf8');
    console.log(`HTML temporal guardado en: ${tempHtmlPath}`);
    
    console.log('Iniciando Puppeteer...');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Load local HTML file
    const fileUrl = `file://${tempHtmlPath.replace(/\\/g, '/')}`;
    console.log(`Cargando URL: ${fileUrl}`);
    await page.goto(fileUrl, { waitUntil: 'networkidle0' });
    
    console.log(`Generando PDF: ${pdfPath}`);
    await page.pdf({
        path: pdfPath,
        format: 'A4',
        printBackground: true,
        margin: {
            top: '20mm',
            bottom: '20mm',
            left: '20mm',
            right: '20mm'
        }
    });
    
    await browser.close();
    
    // Clean up temporary HTML file
    fs.unlinkSync(tempHtmlPath);
    console.log('Compilación completada exitosamente.');
}

compile().catch(err => {
    console.error('Error durante la compilación:', err);
    process.exit(1);
});
