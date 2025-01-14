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
  function justifyText(
    doc,
    text,
    textWidth,
    startX,
    startY,
    lineHeight,
    indentFactor = 0.4,
    paragraphSpacing = lineHeight
  ) {
    const paragraphs = text.split("\n");
    let currentY = startY;
  
    paragraphs.forEach((paragraph) => {
      if (paragraph.trim() === "") {
        return; // Skip empty lines
      }
  
      const indent = textWidth * indentFactor;
  
      if (paragraph.includes("Saluda atte.")) {
        // Render "Saluda atte." with indentation but without justification
        doc.text(paragraph, startX + indent, currentY);
        currentY += lineHeight + paragraphSpacing; // Move to the next line
        return;
      }
  
      const words = paragraph.split(" ");
      let line = "";
      let lines = [];
      let isFirstLine = true;
  
      // Create lines for the paragraph
      words.forEach((word) => {
        const testLine = line + word + " ";
        const testLineWidth = doc.getTextWidth(testLine);
  
        // Use reduced width for the first line and full width for the rest
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
  
      // Render lines
      lines.forEach((lineData, index) => {
        const { text, isFirstLine } = lineData;
  
        if (index === lines.length - 1) {
          // Last line: Align to the left
          const xOffset = isFirstLine ? startX + indent : startX;
          doc.text(text, xOffset, currentY);
        } else {
          // Justify the text
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
  
      // Add spacing between paragraphs
      currentY += paragraphSpacing;
    });
  
    return currentY; // Return updated Y position
  }
  
  const addTextWithLineBreaks = (textLines, initialX, align = 'left', doc) => {
    textLines.forEach(line => {
      if (currentY > (pageHeight - bottomMargin)) {
        doc.addPage();
        currentY = topMargin;
      }
      if (align === 'right') {
        doc.text(line, initialX, currentY, { align: 'right' });
      } else if (align === 'justify') {
        doc.text(20, currentY, line, { maxWidth: 180, align: 'justify' });
      } else {
        doc.text(line, initialX, currentY, { maxWidth: 180, align: 'justify' });
      }
      currentY += lineHeight;
    });
  };
  const processSections = (sections, doc) => {
    sections.forEach((section) => {
      let textWidth = 170;
      if (section.right) {
        doc.setFontSize(11);
        doc.setFont("arial", "normal");
        const textLines = doc.splitTextToSize(section.right, textWidth);
        addTextWithLineBreaks(textLines, doc.internal.pageSize.getWidth() - 20, 'right', doc);
        currentY += sectionSpacingWithoutTitle;
      }
      if (section.title) {
        doc.setFontSize(11);
        doc.setFont("arialbd", "normal");
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
        doc.setFontSize(11);
        doc.setFont("arial", "normal");
        const textWidth = 170;
        const startX = 20;
        const startY = currentY;
        const lineHeight = 10;
        const indentFactor = 0.4;
        const paragraphSpacing = 0;
        currentY = justifyText(doc, section.text, textWidth, startX, startY, lineHeight, indentFactor, paragraphSpacing
        );
      
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
