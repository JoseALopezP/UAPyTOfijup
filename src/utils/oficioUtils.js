import { addTextWithLineBreaks } from "./pdfUtils";

function justifyText(doc, text, textWidth, startX, startY, lineHeight) {
  const words = text.split(" ");
  let line = "";
  let lines = [];
  let currentY = startY;

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
  lines.forEach((line, index) => {
    if (index === lines.length - 1) {
      doc.text(line, startX, currentY);
    } else {
      const wordsInLine = line.split(" ");
      const totalWordWidth = wordsInLine.reduce((sum, word) => sum + doc.getTextWidth(word), 0);
      const totalSpaces = wordsInLine.length - 1;
      const extraSpace = (textWidth - totalWordWidth) / totalSpaces;

      let currentX = startX;
      wordsInLine.forEach((word, i) => {
        doc.text(word, currentX, currentY);
        if (i < wordsInLine.length - 1) {
          currentX += doc.getTextWidth(word) + extraSpace;
        }
      });
    }
    currentY += lineHeight;
  });
}

export const processSectionsOficio = (sections, doc) => {
    sections.forEach((section) => {
      let textWidth = 170;
      if (section.right) {
        doc.setFontSize(10);
        doc.setFont("arial", "normal");
        const textLines = doc.splitTextToSize(section.right, textWidth);
        addTextWithLineBreaks(textLines, doc.internal.pageSize.getWidth() - 20, 'right', doc);
        currentY += sectionSpacingWithoutTitle;
      }
      if (section.title) {
        doc.setFontSize(10);
        doc.setFont("arial", "bold");
        const titleLines = doc.splitTextToSize(section.title, textWidth*.4);
  
        titleLines.forEach((line) => {
          if (currentY > (pageHeight - bottomMargin)) {
            doc.addPage();
            currentY = topMargin;
          }
          doc.text(line, 20, currentY);
          currentY += lineHeight;
        });
  
        const titleWidth = doc.getTextWidth(titleLines[0]) + 3;
        textWidth -= titleWidth;
      }
  
      if (section.text) {
        doc.setFontSize(10);
        doc.setFont("arial", "normal");
      
        const textWidth = 180; // Adjust as per your needs
        const startX = 20;     // Adjust as per your needs
        const startY = currentY; // Adjust as per your needs
        const lineHeight = 10; // Adjust as per your needs
      
        justifyText(doc, section.text, textWidth, startX, startY, lineHeight);
      
        currentY += sectionSpacingWithTitle; // Update currentY after rendering
      }
    });
  };