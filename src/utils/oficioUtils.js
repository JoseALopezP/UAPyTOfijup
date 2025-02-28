import { addTextWithLineBreaks } from "./pdfUtils";

function justifyText(doc, text, textWidth, startX, currentY, lineHeight, pageHeight, topMargin, bottomMargin) {
  const words = text.split(" ");
  let line = "";
  const lines = [];

  words.forEach((word) => {
    const testLine = line + word + " ";
    const testLineWidth = doc.getTextWidth(testLine);

    if (testLineWidth > textWidth) {
      lines.push(line.trim());
      line = word + " ";
    } else {
      line = testLine;
    }
  });

  lines.push(line.trim());

  lines.forEach((line) => {
    if (currentY + lineHeight > pageHeight - bottomMargin) {
      doc.addPage();
      currentY = topMargin;
    }

    doc.text(line, startX, currentY);
    currentY += lineHeight;
  });

  return currentY;
}

export const processSectionsOficio = (sections, doc) => {
  let currentY = 10;
  const topMargin = 10;
  const bottomMargin = 10;
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxTextWidth = 170;
  const sectionSpacingWithTitle = 15;
  const sectionSpacingWithoutTitle = 10;
  const lineHeight = 10;

  sections.forEach((section) => {
    if (section.right) {
      doc.setFontSize(12);
      doc.setFont("arial", "normal");
      const textLines = doc.splitTextToSize(section.right, maxTextWidth);
      currentY = addTextWithLineBreaks(textLines, pageWidth - 20, 'right', doc, currentY, pageHeight, topMargin, bottomMargin, lineHeight);
      currentY += sectionSpacingWithoutTitle;
    }

    if (section.title) {
      doc.setFontSize(12);
      doc.setFont("arial", "bold");
      const titleLines = doc.splitTextToSize(section.title, maxTextWidth * 0.4);
      titleLines.forEach((line) => {
        if (currentY + lineHeight > pageHeight - bottomMargin) {
          doc.addPage();
          currentY = topMargin;
        }
        doc.text(line, 20, currentY);
        currentY += lineHeight;
      });
      currentY += sectionSpacingWithoutTitle;
    }

    if (section.text) {
      doc.setFontSize(12);
      doc.setFont("arial", "normal");
      currentY = justifyText(
        doc,
        section.text,
        maxTextWidth,
        20,
        currentY,
        lineHeight,
        pageHeight,
        topMargin,
        bottomMargin
      );
      currentY += sectionSpacingWithTitle;
    }
  });
};
