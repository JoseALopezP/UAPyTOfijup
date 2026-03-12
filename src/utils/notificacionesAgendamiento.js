const formatName = (str) => {
    if (!str) return '';
    return str.trim();
};

const formatLongDate = () => {
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const now = new Date();
    return `San Juan, ${now.getDate()} de ${months[now.getMonth()]} del ${now.getFullYear()}`;
};

export async function descargarPdfNotificacion(opcion, datos) {
    const { PDFGenerator } = await import('./pdfUtils.js');
    
    const {
        destinatarioNombre = '',
        destinatarioDomicilio = '',
        destinatarioLocalidad = '',
        destinatarioTelefono = '',
        legajoFiscal = '',
        caratula = '',
        tipoAudiencia = '',
        fechaAudiencia = '',
        horaAudiencia = '',
        juez = '',
        personasACitar = []
    } = datos || {};

    const formattedName = formatName(destinatarioNombre);
    const fullAddress = `${destinatarioDomicilio}, ${destinatarioLocalidad}`.toLowerCase();

    const sections = [];

    // 1. Fecha a la derecha
    sections.push({ text: formatLongDate(), align: 'right', size: 10, spacing: 10 });

    // 2. Título centrado (con rectángulo muy ajustado)
    sections.push({ text: 'CÉDULA PENAL', align: 'center', size: 18, border: true, bold: true, spacing: 12 });

    // 3. Encabezado y Destinatario
    if (opcion === 'citacionPersonalPolicial') {
        sections.push({ text: `Dirección de Personal D - 1,`, bold: true, size: 12, spacing: 5 });
        
        const introOficio = `Me dirijo a Ud., en Legajo N° ${legajoFiscal} caratulado "${caratula}", con trámite ante la OFICINA JUDICIAL PENAL DE SAN JUAN, sito en calle Rivadavia 473 Este de esta ciudad, a los fines de hacerle saber que tiene que citar a:`;
        sections.push({ text: introOficio, size: 11, bold: false, spacing: 5, align: 'justify' });

        const listaPersonas = personasACitar.length > 0
            ? personasACitar.map(p => `- ${p.nombre.toUpperCase()}, para que se presente el día ${p.fecha} a las ${p.hora}hs,`).join('\n')
            : `- [NOMBRE PERSONA], para que se presente el día [FECHA] a las [HORA]hs,`;
        
        sections.push({ text: listaPersonas, size: 11, bold: true, spacing: 5 });

        const restOfOficio = `Deberán comparecer para audiencia de ${tipoAudiencia} ante la Oficina Judicial Penal por la Unidad de Atención al Público y Trámite (Planta Baja del Edificio Tribunales, sito en calle Rivadavia 473 Este de esta ciudad), con documento de identidad bajo apercibimiento de declarar su rebeldía y librar orden de detención conforme Arts. 131 y 132 del C.P.P. Deberá comparecer acompañado de su abogado de confianza, conforme Art 121 inc 4 del C.P.P, caso contrario se le designará defensor oficial a fin de salvaguardar el debido proceso y su derecho de defensa.`;
        sections.push({ text: restOfOficio, size: 11, bold: true, spacing: 10, align: 'justify' });

        const closureOficio = `Sirva la presente de comunicación y solicito, por este mismo medio, confirmación de recepción correcta de la misma.\n\nConforme Acuerdo de Superintendencia 05 / 2024 y 34 / 2024, se informa que la presente audiencia se asignó al Juez ${juez}.`;
        sections.push({ text: closureOficio, size: 11, bold: true, spacing: 10, align: 'justify' });

    } else {
        sections.push({ text: `Sr. Jefe de Policía`, bold: true, size: 13, spacing: 2 });
        
        const hasPrefix = /^(Sr|Sra)/i.test(formattedName);
        const headerDestinatario = `${hasPrefix ? '' : 'Sra/Sr. '}${formattedName} domiciliada/o en calle ${fullAddress}`;
        
        sections.push({ 
            text: headerDestinatario, 
            bold: true, 
            size: 12, 
            spacing: 8,
            align: 'justify'
        });

        // CUERPO: Me dirijo a Ud...
        const introText = `Me dirijo a Ud., en Legajo Fiscal ${legajoFiscal} Caratulado: ${caratula}, a fin de hacerle saber que deberá comparecer para audiencia de ${tipoAudiencia} el día ${fechaAudiencia} a las ${horaAudiencia} ante la Oficina Judicial Penal por ante la Unidad de Atención al Público y Trámite – Sala de audiencias Penales (Subsuelo del Edificio Tribunales, sito en calle Rivadavia 473 Este de esta ciudad), con documento de identidad bajo apercibimiento de declarar su rebeldía y librar orden de detención conforme Arts. 131 y 132 del C.P.P. Deberá comparecer acompañado de su abogado de confianza, conforme Art 121 inc 4 del C.P.P, caso contrario se le designará defensor oficial a fin de salvaguardar el debido proceso y su derecho de defensa.`;
        sections.push({ text: introText, size: 11, bold: false, spacing: 6, align: 'justify' });

        const restOfBody = `(Cfr. LEY 1851-O ARTÍCULO 206.- Acceso del público: Todas las personas tienen derecho a acceder a la sala de audiencias. No pueden ingresar a la sala de audiencias personas que pudieren afectar la seguridad, orden o higiene de la audiencia,ni los menores de dieciséis (16) años de Edad…)
\nSe informa que la presente audiencia se asignó al Juez Dr. ${juez}.`;
        sections.push({ text: restOfBody, size: 11, bold: true, spacing: 10, align: 'justify' });
    }

    // 5. Avisos finales
    sections.push({ text: 'QUEDA UD. DEBIDAMENTE NOTIFICADO.', align: 'center', bold: true, underline: true, size: 11, spacing: 2 });
    sections.push({ text: 'UNIDAD DE NOTIFICACIONES Y CITACIONES', align: 'center', bold: true, size: 11, spacing: 2 });
    sections.push({ text: 'OFICINA JUDICIAL PENAL', align: 'center', bold: true, size: 11, spacing: 15 });

    // 6. Bloque de firmas y acta
    const contactBlock = `Ante cualquier duda o consulta comunicarse al teléfono 2646 61-3638 o al correo electrónico notificacionofijup@jussanjuan.gov.ar`;
    sections.push({ text: contactBlock, size: 10, bold: true, spacing: 8, minHeight: 60 });

    const notificationLine = `EN EL DÍA ………/……./……, siendo las ...…… HS, NOTIFIQUÉ AL/ LA CIUDADANO/A ……….…………………………………NUMERO DE TELÉFONO CELULAR: ……………………………………….`;
    sections.push({ text: notificationLine, size: 10, bold: true, spacing: 5 });

    sections.push({ text: `En caso de no ser la persona citada:`, size: 10, bold: true, spacing: 2 });
    sections.push({ text: `VÍNCULO CON EL CITADO…………. y DECLARA BAJO JURAMENTO QUE EN EL DOMICILIO QUE SE NOTIFICA RESIDE EL SR/A……………………..`, size: 10, bold: true, spacing: 2, align: 'justify' });
    sections.push({ text: `(MARCAR ÚNICAMENTE LA OPCIÓN QUE CORRESPONDA)`, size: 9, bold: false, spacing: 5 });
    
    // Cuadros SI / NO (Grandes)
    sections.push({ type: 'checkboxes', spacing: 12 });

    // Líneas de firma
    const midSpaces = " ".repeat(48);
    const signatureLine1 = `---------------------------------------------------${midSpaces}-----------------------------------------------------`;
    
    const cargoLeft = "FIRMA, DNI, ACLARACIÓN";
    const cargoRight = "FIRMA, ACLARACIÓN";
    const signatureLine2 = `${cargoLeft}${" ".repeat(64)}${cargoRight}`;
    
    const ownerLeft = "PERSONA NOTIFICADA";
    const ownerRight = "FUNCIONARIO";
    const signatureLine3 = `${ownerLeft}${" ".repeat(68)}${ownerRight}`;
    
    sections.push({ text: signatureLine1 + "\n" + signatureLine2 + "\n" + signatureLine3, size: 10, bold: true, spacing: 15 });

    const finalFooter = `SE REQUIERE QUE UNA VEZ NOTIFICADA LA PRESENTE, SE ENVÍE LA CONSTANCIA CORRESPONDIENTE AL\nCORREO ELECTRÓNICO notificacionofijup@jussanjuan.gov.ar`;
    sections.push({ text: finalFooter, size: 10, bold: true, spacing: 5, align: 'justify' });

    await PDFGenerator(sections, `Notificacion_${legajoFiscal}_${Date.now()}`, true);
}
