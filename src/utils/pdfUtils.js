import { jsPDF } from 'jspdf';
import { generateMinutaSection } from './resuelvoUtils';;

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
  function justifyText(doc, text, textWidth, startX, startY, lineHeight) {
    // Split the text into paragraphs based on line breaks (\n)
    const paragraphs = text.split("\n");
    let currentY = startY;
  
    paragraphs.forEach((paragraph) => {
      // Skip completely empty paragraphs to avoid extra line breaks
      if (paragraph.trim() === "") {
        return;
      }
  
      const words = paragraph.split(" ");
      let line = "";
      let lines = [];
  
      // Construct lines respecting the width
      words.forEach((word) => {
        const testLine = line + word + " ";
        const testLineWidth = doc.getTextWidth(testLine);
  
        if (testLineWidth > textWidth) {
          lines.push(line); // Do not trim to preserve leading spaces
          line = word + " ";
        } else {
          line = testLine;
        }
      });
  
      // Add the remaining line
      if (line.length > 0) {
        lines.push(line);
      }
  
      // Render each line
      lines.forEach((line, index) => {
        if (index === lines.length - 1) {
          // Last line of the paragraph - left-aligned
          doc.text(line, startX, currentY);
        } else {
          // Justify the line
          const wordsInLine = line.split(" ");
          const leadingSpaces = wordsInLine[0].match(/^ +/) || [""]; // Preserve leading spaces
          const totalWordWidth = wordsInLine.reduce((sum, word) => sum + doc.getTextWidth(word), 0);
          const totalSpaces = wordsInLine.length - 1;
          const extraSpace = totalSpaces > 0 ? (textWidth - totalWordWidth) / totalSpaces : 0;
  
          let currentX = startX + doc.getTextWidth(leadingSpaces[0]); // Account for leading spaces
          wordsInLine.forEach((word, i) => {
            doc.text(word, currentX, currentY);
            if (i < wordsInLine.length - 1) {
              currentX += doc.getTextWidth(word) + extraSpace;
            }
          });
        }
        currentY += lineHeight; // Move to the next line
      });
    });
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
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const textLines = doc.splitTextToSize(section.right, textWidth);
        addTextWithLineBreaks(textLines, doc.internal.pageSize.getWidth() - 20, 'right', doc);
        currentY += sectionSpacingWithoutTitle;
      }
      if (section.title) {
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        const titleLines = doc.splitTextToSize(section.title, textWidth);
  
        titleLines.forEach((line) => {
          if (currentY > (pageHeight - bottomMargin)) {
            doc.addPage();
            currentY = topMargin;
          }
          doc.text(line, 20, currentY);
          currentY += lineHeight;
        });
  
        const titleWidth = doc.getTextWidth(titleLines[0]) + 3;
        textWidth -= titleWidth; // Adjust text width for subsequent text
      }
  
      if (section.text) {
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
  
        const textLines = doc.splitTextToSize(section.text, textWidth);
        addTextWithLineBreaks(textLines, 20, 'justify');
        currentY += sectionSpacingWithTitle;
      }
    });
    };
  const processSectionsOficio = (sections, doc) => {
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
      
        const textWidth = 170; // Adjust as per your needs
        const startX = 20;     // Adjust as per your needs
        const startY = currentY; // Adjust as per your needs
        const lineHeight = 10; // Adjust as per your needs
      
        justifyText(doc, section.text, textWidth, startX, startY, lineHeight);
      
        currentY += sectionSpacingWithTitle; // Update currentY after rendering
      }
    });
  };
    if(sections[0].right){
      processSectionsOficio(sections, doc)
    }else{
      processSections(sections, doc);
    }
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
