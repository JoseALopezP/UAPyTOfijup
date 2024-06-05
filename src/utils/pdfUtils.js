import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { useRef } from 'react';

export const generatePDF = async () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const headerImage = 'pdf/header.jpg';
    const footerImage = 'pdf/footer.jpg';
    const sections = [
        { title: "Lugar y Fecha", text: "San Juan, 29 de Abril de 2024." },
        { title: "Tipo de Audiencia", text: "FORMALIZACIÓN DE LA I.P.P. - CONTROL DE DETENCIÓN." },
      { title: "Legajo Nº", text: "MPF-SJ-04906-2024 caratulado “C/ ROSALES RODOLFO DUILIO S/ LIBRAMIENTO DE CHEQUE SIN PROVISIÓN DE FONDOS E/P DE FLORES ROBERTO CEFERINO“." },
      { title: "Sala de Audiencias", text: "6." },
      { title: "Hora programada", text: "07:45 horas." },
      { title: "Hora real de inicio", text: "07:53 horas." },
      { title: "Juez Interviniente", text: "Dr. Mario Guillermo Adárvez." },
      { title: "Ministerio Público Fiscal", text: "Dr. Pablo Francisco Martín. UFI: DELITOS INFORMÁTICOS Y ESTAFAS." },
      { title: "Defensa Particular", text: "Dr. Faustino Gálvez." },
      { title: "Imputado", text: "Rodolfo Duilio, Rosales. D.N.I N°: 13.446.438." },
      { title: "Fecha de detención", text: "26/04/2024, a las 08:30 horas en la División Delitos Central de Policía." },
      { title: "Operador", text: "Nahuel Sosa." },
      { text: "El imputado ratifica la designación de sus abogado defensor y el mismo acepta el cargo. (Minuto 00:01:00 Video 1)." },
      { text: "Ministerio Público Fiscal: (Minuto 00:01:10 Video 1). Realiza el control de legalidad de la detención." },
      { text: "Defensa Técnica: (Minuto 00:04:15 Video 1). No se opone a la legalidad de la detención del imputado. SE DECLARA la legalidad de la detención del imputado. (Minuto 00:04:50 Video 1)." },
      { text: "Ministerio Público Fiscal: (Minuto 00:05:05 Video 1). Refiere el hecho que diera inicio a las actuaciones, consignando las constancias que lo acreditan, ofreciendo la prueba pertinente, calificándolo provisoriamente como constitutivo del delito de “LIBRAMIENTO DE CHEQUE SIN PROVISIÓN DE FONDOS” (ART. 302 INC 2° DEL C.P.) EN CALIDAD DE AUTOR MATERIAL (ART. 45 DEL C.P.), Y EN PERJUICIO DEL CIUDADANO FLORES ROBERTO CEFERINO Y “ESTAFA” (ARTS. 172 Y 296 EN FUNCIÓN DEL ART. 285 DEL C.P.), EN PERJUICIO DEL CIUDADANO BAZÁN MARIO FEDERICO EN CONCURSO IDEAL (ART. 54 C.P.), EN CALIDAD DE AUTOR MATERIAL (ART. 45 DEL C.P.), TODO ELLO EN CONCURSO REAL (ART. 55 C.P.). Solicita como plazo de la I.P.P. el de DIEZ (10) MESES. Solicita como medidas de coerción las establecidas en el Art. 295 inc. 1, 3, 4, 5 y 6 por el plazo de DIEZ (10) MESES." },
      { text: "Sr. Juez cede la palabra al Imputado en virtud a su derecho de ser oído; ante lo cual se abstiene de declarar. (Minuto 00:18:05 Video 1)." },
      { text: "Defensa Técnica: (Minuto 00:18:10 Video 1). No se opone al plazo de la I.P.P. ni al plazo de la misma. Fundamentos y Resolución: Sr. Juez MOTIVA Y RESUELVE (Minuto 00:23:45 / 00:27:09 Video 1) I) TÉNGASE POR FORMALIZADA la investigación penal preparatoria y por iniciado el proceso y téngase por 10 meses de tiempo para su conclusión, en cuanto a las medidas de coerción se refiere y atento a lo expresado se hace cesar en este momento la detención que pesa sobre el señor Rosales y previo la inmediata libertad le hagamos saber las medidas de coerción en función de lo solicitado: En primer lugar como medida de coerción, la promesa de presentarse a proceso las veces que sea citado, segundo se le pone la obligación de comparecer a la Comisaría Novena, una vez por semana por 10 meses en función de la extensión de la investigación penal preparatoria, en cuanto a el inciso cuarto, si usted va a salir del territorio de la Provincia tiene que hacer saber el motivo, la justificación pertinente para hacer análisis y decidir si se autoriza o no se autoriza la salida de la Provincia incluso por cuánto tiempo, en función de eso y guardando un grado de coherencia sobre el inciso quinto del 295 solicitado por Fiscalía no me dando oposición, reténgase la documentación de viaje pertinente y en cuanto al inciso sexto, se le prohíbe señor Rosales acercarse una distancia inferior a 300 metros de donde quiera que se encuentre y del domicilio respectivo del señor Bazán y en cuanto al depósito judicial se refiere Fiscalía el vehículo está a su disposición hasta que se disponga en forma definitiva y se confiará en depósito Judicial con la documentación pertinente al señor Bazán, que también se le confiará en depósito Judicial del vehículo con la documentación pertinente, para poder transitar permaneciendo el vehículo a disposición de Fiscalía como uno de los elementos secuestrados, téngase por notificado tanto a la Defensa, al señor Rosales como a Fiscalía." }
    ];

    let currentY = 50;

    sections.forEach(section => {
      if (section.title) {
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(`${section.title}: `, 20, currentY);
        doc.setFont("helvetica", "normal");
        doc.text(section.text, (30 + section.title.split('').length * 1.7 - section.title.split(' ').length * 2), currentY);
      } else {
        doc.setFontSize(10);
        doc.text(section.text, 10, currentY);
      }
      currentY += 10;
    });
    // Add headers and footers to each page
    for (let i = 1; i <= doc.internal.getNumberOfPages(); i++) {
        doc.setPage(i);
        // Add header
        doc.addImage(headerImage, 'JPEG', 0, 0, doc.internal.pageSize.getWidth(), 30); // Adjust the position and size as needed
        // Add footer
        const footerWidth = (doc.internal.pageSize.getWidth() * 2) / 5; // Calculate the width of the footer image
        const footerHeight = (footerWidth / 60) * 20; // Calculate the height based on the original aspect ratio
        const footerX = doc.internal.pageSize.getWidth() - footerWidth; // Calculate X-coordinate
        const footerY = doc.internal.pageSize.getHeight() - footerHeight; // Adjust the Y-coordinate as needed
        doc.addImage(footerImage, 'JPEG', footerX, footerY, footerWidth, footerHeight); // Adjust the position and size as needed*/
      }
    doc.save('document.pdf');
}