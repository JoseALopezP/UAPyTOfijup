import { jsPDF } from 'jspdf';
import { generateMinutaSection } from './resuelvoUtils';
import '../../public/fonts/arialbd'
import '../../public/fonts/arial'

export const generatePDF = async (item, date) => {
    PDFGenerator(generateMinutaSection(item, date), item.numeroLeg, true);
}

// Exported for oficioUtils.js backward compatibility
export const addTextWithLineBreaks = (textLines, initialX, align = 'left', doc, currentY, pageHeight, topMargin, bottomMargin, lineHeight) => {
    let outY = currentY;
    textLines.forEach(line => {
        if (outY > (pageHeight - bottomMargin)) {
            doc.addPage();
            outY = topMargin;
        }
        doc.text(line, initialX, outY, { align });
        outY += lineHeight;
    });
    return outY;
};

export const PDFGenerator = async (sections, numeroLeg, minutaBool = false) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const headerImage = '/pdf/header.jpg';
    const footerImage = '/pdf/footer.jpg';
    const headerImageOficio = '/pdf/headerOficio.jpg';
    const footerImageOficio = '/pdf/footerOficio.jpg';
    const topMargin = 40;
    const bottomMargin = 40;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const contentWidth = pageWidth - 40; // 20 standard margin on each side
    let currentY = topMargin;
    const lineHeight = 7;
    const sectionSpacingWithTitle = 0;
    const sectionSpacingWithoutTitle = 0;

    const checkPageBreak = (neededHeight) => {
        if (currentY + neededHeight > (pageHeight - bottomMargin)) {
            doc.addPage();
            currentY = topMargin;
            return true;
        }
        return false;
    };

    // ----- ORIGINAL EXACT JUSTIFY ALGORITHM (Used by legacy and newly by notificaciones) -----
    function justifyText(doc, textArray, textWidth, startX, startY, lineHeight, indentFactor = 0.4, paragraphSpacing = lineHeight) {
        if (!Array.isArray(textArray)) {
            textArray = [{ text: textArray }];
        }

        const paragraphs = [];
        let paragraph = [];

        textArray.forEach((segment) => {
            const parts = segment.text.split("\n");
            parts.forEach((part, idx) => {
                if (idx > 0) {
                    paragraphs.push(paragraph);
                    paragraph = [];
                }
                if (part.trim()) {
                    paragraph.push({ text: part.trim(), bold: segment.bold });
                }
            });
        });

        if (paragraph.length) paragraphs.push(paragraph);

        let outY = startY;

        paragraphs.forEach((para) => {
            if (!para.length) {
                outY += lineHeight;
                return;
            }

            const indent = textWidth * indentFactor;

            const paraWords = para.flatMap(seg =>
                seg.text.split(/\s+/).map(word => ({ word, bold: seg.bold }))
            );

            const lines = [];
            let line = [];
            let lineWidth = 0;
            let isFirstLine = true;

            paraWords.forEach(({ word, bold }) => {
                doc.setFont(bold ? "arialbd" : "arial", "normal");
                const wordWidth = doc.getTextWidth(word + " ");
                const maxLineWidth = isFirstLine ? textWidth - indent : textWidth;

                if (lineWidth + wordWidth > maxLineWidth) {
                    lines.push({ words: line, isFirstLine });
                    line = [{ word, bold }];
                    lineWidth = wordWidth;
                    isFirstLine = false;
                } else {
                    line.push({ word, bold });
                    lineWidth += wordWidth;
                }
            });

            if (line.length) {
                lines.push({ words: line, isFirstLine });
            }

            lines.forEach(({ words, isFirstLine }, index) => {
                if (outY > (pageHeight - bottomMargin)) {
                    doc.addPage();
                    outY = topMargin;
                }

                const xStart = isFirstLine ? startX + indent : startX;
                const availableWidth = isFirstLine ? textWidth - indent : textWidth;

                if (index === lines.length - 1) {
                    let x = xStart;
                    words.forEach(({ word, bold }) => {
                        doc.setFont(bold ? "arialbd" : "arial", "normal");
                        doc.text(word, x, outY);
                        x += doc.getTextWidth(word + " ");
                    });
                } else {
                    const totalWordWidth = words.reduce((sum, { word, bold }) => {
                        doc.setFont(bold ? "arialbd" : "arial", "normal");
                        return sum + doc.getTextWidth(word);
                    }, 0);
                    const totalSpaces = words.length - 1;
                    const extraSpace = availableWidth - totalWordWidth;
                    const extraSpacePerGap = totalSpaces > 0 ? extraSpace / totalSpaces : 0;

                    let x = xStart;
                    words.forEach(({ word, bold }, i) => {
                        doc.setFont(bold ? "arialbd" : "arial", "normal");
                        doc.text(word, x, outY);
                        if (i < words.length - 1) {
                            x += doc.getTextWidth(word) + extraSpacePerGap;
                        }
                    });
                }

                outY += lineHeight;
            });

            outY += paragraphSpacing;
        });

        return outY;
    }

    // ----- TIPO 1: NOTIFICACIONES (Con rectángulos y checkboxes y justificado compatible) -----
    const processNotificacionSections = async (sections) => {
        for (const section of sections) {
            const fontSize = section.size || 11;
            doc.setFontSize(fontSize);
            doc.setFont(section.bold ? "arialbd" : "arial", "normal");

            if (section.type === 'checkboxes') {
                checkPageBreak(20);
                const boxSize = 10;
                doc.setFont("arial", "normal");
                doc.text("SI", 30, currentY);
                doc.rect(38, currentY - 7, boxSize, boxSize);
                doc.text("NO", pageWidth - 65, currentY);
                doc.rect(pageWidth - 54, currentY - 7, boxSize, boxSize);
                currentY += (section.spacing || 15);
                continue;
            }

            if (section.align === 'justify' && section.text) {
                // Usa el justificado exacto que tenía Minutas/Oficios
                doc.setFontSize(fontSize);
                const textArray = [{ text: section.text, bold: section.bold }];
                currentY = justifyText(doc, textArray, contentWidth, 20, currentY, fontSize * 0.6, 0, (section.spacing || 5));
                continue;
            }

            const text = section.text || "";
            const lines = doc.splitTextToSize(text, section.border ? contentWidth - 10 : contentWidth);
            const lineHeightPoints = fontSize * 0.6;
            const sectionHeight = lines.length * lineHeightPoints + (section.border ? 10 : 5);

            checkPageBreak(section.minHeight || sectionHeight);

            if (section.border) {
                const titleLine = lines[0];
                const textW = doc.getTextWidth(titleLine);
                const rectW = textW + 8;
                const rectX = (pageWidth - rectW) / 2;
                const rectY = currentY - 6.5;
                const rectH = lineHeightPoints + 1.2;
                doc.rect(rectX, rectY, rectW, rectH);
                currentY += 0.5;
            }

            lines.forEach((line) => {
                let x = 20;
                const lineW = doc.getTextWidth(line);

                if (section.align === 'center') {
                    x = (pageWidth - lineW) / 2;
                } else if (section.align === 'right') {
                    x = pageWidth - 20 - lineW;
                }

                doc.setFont(section.bold ? "arialbd" : "arial", "normal");
                doc.text(line, x, currentY);

                if (section.underline) {
                    doc.line(x, currentY + 1, x + lineW, currentY + 1);
                }

                currentY += lineHeightPoints;
            });

            currentY += (section.spacing || 5);
        }
    };

    // ----- TIPO 2: MINUTAS / RESUELVOS (100% CÓDIGO VIEJO) -----
    const processLegacySections = (sections) => {
        sections.forEach((section) => {
            let textWidth = 170;
            if (section.right) {
                doc.setFontSize(11);
                doc.setFont("arial", "normal");
                const textLines = doc.splitTextToSize(section.right, textWidth);
                currentY = addTextWithLineBreaks(textLines, doc.internal.pageSize.getWidth() - 20, 'right', doc, currentY, pageHeight, topMargin, bottomMargin, lineHeight);
                currentY += sectionSpacingWithoutTitle;
            }
            if (section.title && !section.text) {
                // Title that wraps around paragraphs possibly
                doc.setFontSize(11);
                doc.setFont("arialbd", "normal");
                const titleLines = doc.splitTextToSize(section.title, textWidth * 0.4);
                titleLines.forEach((line) => {
                    if (currentY > (pageHeight - bottomMargin)) {
                        doc.addPage();
                        currentY = topMargin;
                    }
                    justifyText(doc, line, textWidth * 0.45, 20, currentY, 2, 0, 0);
                    currentY += 4;
                });
                const titleWidth = doc.getTextWidth(titleLines[0]) + 3;
                textWidth -= titleWidth;
            }
            if (section.text && !section.title) {
                doc.setFontSize(11);
                doc.setFont("arial", "normal");
                const startX = 20;
                const startY = currentY;
                const indentFactor = minutaBool ? 0 : 0.4;
                const paragraphSpacing = 0;
                let newY = justifyText(doc, section.text, textWidth, startX, startY, lineHeight, indentFactor, paragraphSpacing);
                currentY = newY + sectionSpacingWithTitle;
            }

            if (section.text && section.title) {
                doc.setFontSize(11);
                const leftX = 20;
                const titleColMax = textWidth * 0.4;
                const gap = 2;
                doc.setFont("arialbd", "normal");
                const titleLines = doc.splitTextToSize(section.title, titleColMax);
                let measuredTitleWidth = 0;
                titleLines.forEach(line => {
                    measuredTitleWidth = Math.max(measuredTitleWidth, doc.getTextWidth(line));
                });
                const titleColWidth = Math.min(measuredTitleWidth, titleColMax);
                const textStartX = leftX + titleColWidth + gap;
                const availableTextWidth = textWidth - titleColWidth - gap;
                doc.setFont("arial", "normal");
                const textLines = doc.splitTextToSize(section.text, availableTextWidth);
                const rows = Math.max(titleLines.length, textLines.length);
                for (let i = 0; i < rows; i++) {
                    if (currentY + lineHeight > (pageHeight - bottomMargin)) {
                        doc.addPage();
                        currentY = topMargin;
                    }

                    if (i < titleLines.length) {
                        doc.setFont("arialbd", "normal");
                        doc.text(titleLines[i], leftX, currentY);
                    }
                    if (i < textLines.length) {
                        doc.setFont("arial", "normal");
                        doc.text(textLines[i], textStartX, currentY);
                    }

                    currentY += lineHeight;
                }

                currentY += sectionSpacingWithTitle;
            }
        });
    };

    // Decidir quién procesa: Notificaciones o Legacy
    if (numeroLeg && String(numeroLeg).startsWith('Notificacion')) {
        await processNotificacionSections(sections);
    } else {
        processLegacySections(sections);
    }

    // Header and Footer
    const isOficio = sections.some(s => s.right);
    const headerImg = isOficio ? headerImageOficio : headerImage;
    const footerImg = isOficio ? footerImageOficio : footerImage;

    for (let i = 1; i <= doc.internal.getNumberOfPages(); i++) {
        doc.setPage(i);
        try {
            await doc.addImage(headerImg, 'JPEG', 0, 0, pageWidth, 30);
            const footerWidth = (pageWidth * 2) / 5;
            const footerHeight = (footerWidth / 60) * 20;
            const footerX = pageWidth - footerWidth;
            const footerY = pageHeight - footerHeight;
            await doc.addImage(footerImg, 'JPEG', footerX, footerY, footerWidth, footerHeight);
        } catch (e) {
            console.error("PDF Images not found", e);
        }
    }

    doc.save(numeroLeg + '.pdf');
};