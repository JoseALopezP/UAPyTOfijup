import { jsPDF } from 'jspdf';
import { generateMinutaSection } from './resuelvoUtils';

export const generatePDF = async (item, date) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const headerImage = '/pdf/header.jpg';
    const footerImage = '/pdf/footer.jpg';
    const sections = generateMinutaSection(item, date)

    const topMargin = 40;
    const bottomMargin = 40;
    const pageHeight = 297;
    let currentY = topMargin;
    const lineHeight = 7;
    const sectionSpacingWithTitle = 1;
    const sectionSpacingWithoutTitle = 6;

    const addTextWithLineBreaks = (textLines, initialX, initialY) => {
      textLines.forEach(line => {
        if (currentY > (pageHeight - bottomMargin)) {
          doc.addPage();
          currentY = topMargin;
        }
        doc.text(line, initialX, currentY);
        currentY += lineHeight;
      });
    };

    sections.forEach((section) => {
      let textLines = doc.splitTextToSize(section.text, 160);
      
      if (section.title) {
        const title = `${section.title}: `;
        const titleWidth = doc.getTextWidth(title);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        if (currentY > (pageHeight - bottomMargin)) {
          doc.addPage();
          currentY = topMargin;
        }
        doc.text(title, 20, currentY);
        doc.setFont("helvetica", "normal");
        const firstLineText = textLines.shift();
        doc.text(firstLineText, 25 + titleWidth, currentY);
        currentY += lineHeight;
        addTextWithLineBreaks(textLines, 20, currentY);
        currentY += sectionSpacingWithTitle;
      } else {
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        addTextWithLineBreaks(textLines, 20, currentY);
        currentY += sectionSpacingWithoutTitle;
      }
    });
    for (let i = 1; i <= doc.internal.getNumberOfPages(); i++) {
        doc.setPage(i);
        await doc.addImage(headerImage, 'JPEG', 0, 0, doc.internal.pageSize.getWidth(), 30);
        const footerWidth = (doc.internal.pageSize.getWidth() * 2) / 5;
        const footerHeight = (footerWidth / 60) * 20;
        const footerX = doc.internal.pageSize.getWidth() - footerWidth;
        const footerY = doc.internal.pageSize.getHeight() - footerHeight;
        await doc.addImage(footerImage, 'JPEG', footerX, footerY, footerWidth, footerHeight);
      }
    doc.save('document.pdf');
}