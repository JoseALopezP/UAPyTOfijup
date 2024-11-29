const processSectionsOficio = (sections) => {
    sections.forEach((section) => {
      let textWidth = 170;
      if (section.right) {
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const textLines = doc.splitTextToSize(section.right, textWidth);
        addTextWithLineBreaks(textLines, doc.internal.pageSize.getWidth() - 20, 'right');
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