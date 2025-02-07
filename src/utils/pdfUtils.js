import { jsPDF } from 'jspdf';
import { generateMinutaSection } from './resuelvoUtils';;
import '../../public/fonts/arialbd'
import '../../public/fonts/arial'

export const generatePDF = async (item, date) => {
PDFGenerator(generateMinutaSection(item, date),item.numeroLeg);
}

export const PDFGenerator = async (sections, numeroLeg) => {
const doc = new jsPDF('p', 'mm', 'a4');
const headerImage = '/pdf/header.jpg';
const footerImage = '/pdf/footer.jpg';
const headerImageOficio = '/pdf/headerOficio.jpg';
const footerImageOficio = '/pdf/footerOficio.jpg';
const topMargin = 40;
const bottomMargin = 40;
const pageHeight = 297;
let currentY = topMargin;
const lineHeight = 7;
const sectionSpacingWithTitle = 1;
const sectionSpacingWithoutTitle = 0;
function justifyText(doc, text, textWidth, startX, startY, lineHeight, indentFactor = 0.4, paragraphSpacing = lineHeight){
  const paragraphs = text.split("\n");
  paragraphs.forEach((paragraph) => {
    if (paragraph.trim() === "") {
      return;
    }
    const indent = textWidth * indentFactor;
    if (paragraph.includes("Saluda atte.")) {
      doc.text(paragraph, startX + indent, currentY);
      currentY += lineHeight + paragraphSpacing;
      return;
    }

    const words = paragraph.split(" ");
    let line = "";
    let lines = [];
    let isFirstLine = true;

    words.forEach((word) => {
      const testLine = line + word + " ";
      const testLineWidth = doc.getTextWidth(testLine);

      const maxWidth = isFirstLine ? textWidth - indent : textWidth;
      if (testLineWidth > maxWidth) {
        lines.push({ text: line.trim(), isFirstLine });
        line = word + " ";
        isFirstLine = false;
      } else {
        line = testLine;
      }
    });

    if (line.length > 0) {
      lines.push({ text: line.trim(), isFirstLine });
    }
    lines.forEach((lineData, index) => {
      const { text, isFirstLine } = lineData;
      if (currentY > (pageHeight - bottomMargin)) {
        doc.addPage();
        currentY = topMargin;
      }
      if (index === lines.length - 1) {
        const xOffset = isFirstLine ? startX + indent : startX;
        doc.text(text, xOffset, currentY);
      } else {
        const wordsInLine = text.split(" ");
        const totalWordWidth = wordsInLine.reduce((sum, word) => sum + doc.getTextWidth(word), 0);
        const totalSpaces = wordsInLine.length - 1;
        const extraSpace = totalSpaces > 0 ? (isFirstLine ? textWidth - indent : textWidth) - totalWordWidth : 0;

        let currentX = isFirstLine ? startX + indent : startX;
        const extraSpacePerGap = totalSpaces > 0 ? extraSpace / totalSpaces : 0;

        wordsInLine.forEach((word, i) => {
          doc.text(word, currentX, currentY);
          if (i < wordsInLine.length - 1) {
            currentX += doc.getTextWidth(word) + extraSpacePerGap;
          }
        });
      }

      currentY += lineHeight;
    });
    currentY += paragraphSpacing;
  });
  return currentY; 
}

const addTextWithLineBreaks = (textLines, initialX, align = 'left', doc) => {
  textLines.forEach(line => {
    if (currentY > (pageHeight - bottomMargin)) {
      doc.addPage();
      currentY = topMargin;
    }
    doc.text(line, initialX, currentY, { align });
    currentY += lineHeight;
  });
};

const processSections = (sections, doc) => {
  sections.forEach((section) => {
    let textWidth = 170;

    // Handle right-aligned text
    if (section.right) {
      doc.setFontSize(11);
      doc.setFont("arial", "normal");
      const textLines = doc.splitTextToSize(section.right, textWidth);
      addTextWithLineBreaks(textLines, doc.internal.pageSize.getWidth() - 20, 'right', doc);
      currentY += sectionSpacingWithoutTitle;
    }

    // Handle title
    if (section.title) {
  doc.setFontSize(11);
  doc.setFont("arialbd", "normal");

  // Calculate the justified width for titles
  const titleLines = doc.splitTextToSize(section.title, textWidth * 0.4);

  titleLines.forEach((line, index) => {
    if (currentY > (pageHeight - bottomMargin)) {
      doc.addPage();
      currentY = topMargin;
    }

    // Handle justification for the title as well
    justifyText(doc, line, textWidth * 0.45, 20, currentY, 2, 0, 0);
    //justifyText(doc, text, textWidth, startX, startY, lineHeight, indentFactor = 0.4, paragraphSpacing = lineHeight)
    currentY += 4;
  });

  const titleWidth = doc.getTextWidth(titleLines[0]) + 3;
  textWidth -= titleWidth;
}

    // Handle text content
    if (section.text) {
      doc.setFontSize(11);
      doc.setFont("arial", "normal");
      
      const startX = 20;
      const startY = currentY;
      const indentFactor = 0.4;
      const paragraphSpacing = 0;

      // Adjust for overflow of the justified text
      let newY = justifyText(
        doc, 
        section.text, 
        textWidth, 
        startX, 
        startY, 
        lineHeight, 
        indentFactor, 
        paragraphSpacing
      );

      // Handle page break based on newY position
      if (newY > (pageHeight - bottomMargin)) {
        while (newY > (pageHeight - bottomMargin)) {
          doc.addPage();
          newY -= (pageHeight - bottomMargin); // Adjust newY to reflect the overflow
        }
        currentY = topMargin + newY;  // Update currentY correctly after overflow
      } else {
        currentY = newY;
      }

      currentY += sectionSpacingWithTitle; 
    }
  });
};

  processSections(sections, doc);
  if(sections[0].right){
    for (let i = 1; i <= doc.internal.getNumberOfPages(); i++) {
      doc.setPage(i);
      await doc.addImage(headerImageOficio, 'JPEG', 0, 0, doc.internal.pageSize.getWidth(), 30);
      const footerWidth = (doc.internal.pageSize.getWidth() * 2) / 5;
      const footerHeight = (footerWidth / 60) * 20;
      const footerX = doc.internal.pageSize.getWidth() - footerWidth;
      const footerY = doc.internal.pageSize.getHeight() - footerHeight;
      await doc.addImage(footerImageOficio, 'JPEG', footerX, footerY, footerWidth, footerHeight);
    }
  }else{
    for (let i = 1; i <= doc.internal.getNumberOfPages(); i++) {
      doc.setPage(i);
      await doc.addImage(headerImage, 'JPEG', 0, 0, doc.internal.pageSize.getWidth(), 30);
      const footerWidth = (doc.internal.pageSize.getWidth() * 2) / 5;
      const footerHeight = (footerWidth / 60) * 20;
      const footerX = doc.internal.pageSize.getWidth() - footerWidth;
      const footerY = doc.internal.pageSize.getHeight() - footerHeight;
      await doc.addImage(footerImage, 'JPEG', footerX, footerY, footerWidth, footerHeight);
    }
  }
  doc.save(numeroLeg+'.pdf');
};
