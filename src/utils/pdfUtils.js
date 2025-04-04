import { jsPDF } from 'jspdf';
import { generateMinutaSection } from './resuelvoUtils';;
import '../../public/fonts/arialbd'
import '../../public/fonts/arial'

export const generatePDF = async (item, date) => {
PDFGenerator(generateMinutaSection(item, date),item.numeroLeg, true);
}

export const PDFGenerator = async (sections, numeroLeg, minutaBool=false) => {
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
const sectionSpacingWithTitle = 0;
const sectionSpacingWithoutTitle = 0;
function justifyText(doc, textArray, textWidth, startX, startY, lineHeight, indentFactor = 0.4, paragraphSpacing = lineHeight) {
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

  paragraphs.forEach((para) => {
    if (!para.length) {
      currentY += lineHeight;
      return;
    }

    const indent = textWidth * indentFactor;
    const paraWords = para.flatMap(seg => seg.text.split(" ").map(word => ({ word, bold: seg.bold })));
    
    const lines = [];
    let line = [];
    let lineWidth = 0;
    let isFirstLine = true;
    const maxWidth = () => isFirstLine ? textWidth - indent : textWidth;

    paraWords.forEach(({ word, bold }) => {
      doc.setFont(bold ? "arialbd" : "arial", "normal");
      const wordWidth = doc.getTextWidth(word + " ");
      if (lineWidth + wordWidth > maxWidth()) {
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
      if (currentY > (pageHeight - bottomMargin)) {
        doc.addPage();
        currentY = topMargin;
      }

      if (index === lines.length - 1) {
        let x = isFirstLine ? startX + indent : startX;
        words.forEach(({ word, bold }, i) => {
          doc.setFont(bold ? "arialbd" : "arial", "normal")
          doc.text(word, x, currentY);
          x += doc.getTextWidth(word + " ");
        });
      } else {
        const totalWordWidth = words.reduce((sum, { word, bold }) => {
          doc.setFont(bold ? "arialbd" : "arial", "normal")
          return sum + doc.getTextWidth(word);
        }, 0);
        const totalSpaces = words.length - 1;
        const extraSpace = maxWidth() - totalWordWidth;
        const extraSpacePerGap = totalSpaces > 0 ? extraSpace / totalSpaces : 0;
        let x = isFirstLine ? startX + indent : startX;

        words.forEach(({ word, bold }, i) => {
          doc.setFont(bold ? "arialbd" : "arial", "normal")
          doc.text(word, x, currentY);
          if (i < words.length - 1) {
            x += doc.getTextWidth(word) + extraSpacePerGap;
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
    if (section.right) {
      doc.setFontSize(11);
      doc.setFont("arial", "normal");
      const textLines = doc.splitTextToSize(section.right, textWidth);
      addTextWithLineBreaks(textLines, doc.internal.pageSize.getWidth() - 20, 'right', doc);
      currentY += sectionSpacingWithoutTitle;
    }
    if (section.title && !section.text) {
    doc.setFontSize(11);
    doc.setFont("arialbd", "normal");
    const titleLines = doc.splitTextToSize(section.title, textWidth * 0.4);
    titleLines.forEach((line, index) => {
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
      if (newY > (pageHeight - bottomMargin)) {
        while (newY > (pageHeight - bottomMargin)) {
          doc.addPage();
          newY -= (pageHeight - bottomMargin);
        }
        currentY = topMargin + newY;
      } else {
        currentY = newY;
      }

      currentY += sectionSpacingWithTitle; 
    }
    if (section.text && section.title) {
      doc.setFontSize(11);
      doc.setFont("arialbd", "normal");
      const titleY = currentY;
      const titleLines = doc.splitTextToSize(section.title, textWidth * 0.4);
      let maxTitleWidth = 0;
      titleLines.forEach((line) => {
        if (currentY > (pageHeight - bottomMargin)) {
          doc.addPage();
          currentY = topMargin;
        }
        doc.text(line, 20, titleY);
        maxTitleWidth = Math.max(maxTitleWidth, doc.getTextWidth(line));
      });
      const availableTextWidth = textWidth - maxTitleWidth - 5;
      const textStartX = 20 + maxTitleWidth + 2;
      doc.setFont("arial", "normal");
      const textLines = doc.splitTextToSize(section.text, availableTextWidth);
      let firstLineY = titleY;
      textLines.forEach((line) => {
        if (firstLineY > (pageHeight - bottomMargin)) {
          doc.addPage();
          firstLineY = topMargin;
        }
        doc.text(line, textStartX, firstLineY);
        firstLineY += lineHeight;
      });

      currentY = firstLineY + sectionSpacingWithTitle;
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