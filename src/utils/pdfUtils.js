import { jsPDF } from 'jspdf';
import { generateMinutaSection } from './resuelvoUtils';

export const generatePDF = async (item, date) => {
  PDFGenerator(generateMinutaSection(item, date));
}

export const PDFGenerator = async (sections) => {
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

  const addTextWithLineBreaks = (textLines, initialX, align = 'left') => {
    textLines.forEach(line => {
      if (currentY > (pageHeight - bottomMargin)) {
        doc.addPage();
        currentY = topMargin;
      }
      if (align === 'right') {
        doc.text(line, initialX, currentY, { align: 'right' });
      } else if (align === 'justify') {
        doc.text(20, currentY, line, { maxWidth: 170, align: 'justify' });
      } else {
        doc.text(line, initialX, currentY, { maxWidth: 170, align: 'justify' });
      }
      currentY += lineHeight;
    });
  };

  const processSections = (sections) => {
    sections.forEach((section) => {
      let textWidth = 170;
      if (section.title) {
        textWidth -= doc.getTextWidth(section.title) + 3;
      }
      if (section.right) {
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const textLines = doc.splitTextToSize(section.right, textWidth);
        addTextWithLineBreaks(textLines, doc.internal.pageSize.getWidth() - 20, 'right');
        currentY += sectionSpacingWithoutTitle;
      } else {
        let textLines = doc.splitTextToSize(section.text || '', textWidth);
        if (section.title) {
          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
          if (currentY > (pageHeight - bottomMargin)) {
            doc.addPage();
            currentY = topMargin;
          }
          const title = section.text ? `${section.title}:` : `${section.title}`;
          doc.text(title, 20, currentY);
          const titleWidth = doc.getTextWidth(title) + 3;
          doc.setFont("helvetica", "normal");
  
          if (section.text) {
            const firstLineText = textLines.shift();
            doc.text(firstLineText, 20 + titleWidth, currentY, { maxWidth: textWidth, align: "justify" });
          }
          currentY += lineHeight;
          addTextWithLineBreaks(textLines, 20);
          currentY += sectionSpacingWithTitle;
        } else if (section.text) {
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          addTextWithLineBreaks(textLines, 20, 'justify');
          currentY += sectionSpacingWithoutTitle;
        }
      }
    });
  };
    processSections(sections);
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
    doc.save('document.pdf');
};
