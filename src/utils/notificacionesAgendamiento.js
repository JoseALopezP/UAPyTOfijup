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
    sections.push({ text: formatLongDate(), align: 'right', size: 9, spacing: 3 });

    // 2. Título centrado
    sections.push({ text: 'CÉDULA PENAL', align: 'center', size: 15, border: true, bold: true, spacing: 2 });

    const isPolice = opcion === 'citacionPersonalPolicial';

    // 1. HEADER (Sr/Sra... en todos menos policial)
    if (!isPolice) {
        sections.push({ text: `Sr. Jefe de Policía`, bold: true, size: 11, spacing: 2 });
        const hasPrefix = /^(Sr|Sra)/i.test(formattedName);
        let headerDestinatario = `${hasPrefix ? '' : 'Sra/Sr. '}${formattedName} domiciliada/o en calle ${fullAddress}`;
        if (destinatarioTelefono) {
            headerDestinatario += `. Teléfono: ${destinatarioTelefono}`;
        }
        sections.push({ text: headerDestinatario, bold: true, size: 11, spacing: 5, align: 'justify' });
    }

    // 3. Contenido de cuerpo según la opción
    if (opcion === 'citacionPersonalPolicial') {
        sections.push({ text: `Dirección de Personal D-1,`, bold: true, size: 11, spacing: 2 });

        const introText = `Me dirijo a Ud., en Legajo N° ${legajoFiscal} caratulado "${caratula}", con trámite ante la OFICINA JUDICIAL PENAL DE SAN JUAN, sito en calle Rivadavia 473 Este de esta ciudad, a los fines de hacerle saber que tiene que citar a:`;
        sections.push({ text: introText, size: 10, bold: false, spacing: 2, align: 'justify' });

        const listaPersonas = personasACitar.length > 0
            ? personasACitar.map(p => `- ${p.nombre.toUpperCase()}${p.dni ? ` (DNI ${p.dni})` : ''}${p.telefono ? ` - Cel: ${p.telefono}` : ''}, para que se presente el dia ${p.fecha || fechaAudiencia} a las ${p.hora || horaAudiencia}hs,`).join('\n')
            : `- ${formattedName.toUpperCase()}${destinatarioTelefono ? ` - Cel: ${destinatarioTelefono}` : ''}, para que se presente el dia ${fechaAudiencia} a las ${horaAudiencia}hs,`;
        sections.push({ text: listaPersonas, size: 10, bold: true, spacing: 2 });

        const restText = `Deberán comparecer para audiencia de ${tipoAudiencia} ante la Oficina Judicial Penal por la Unidad de Atención al Público y Trámite (Planta Baja del Edificio Tribunales, sito en calle Rivadavia 473 Este de esta ciudad), con documento de identidad bajo apercibimiento de declarar su rebeldía y librar orden de detención conforme Arts. 131 y 132 del C.P.P. Deberá comparecer acompañado de su abogado de confianza, conforme Art 121 inc 4 del C.P.P, caso contrario se le designará defensor oficial a fin de salvaguardar el debido proceso y su derecho de defensa.`;
        sections.push({ text: restText, size: 10, bold: false, spacing: 4, align: 'justify' });

        const p3 = `Sirva la presente de comunicación y solicito, por este mismo medio, confirmación de recepción correcta de la misma.`;
        sections.push({ text: p3, size: 10, bold: false, spacing: 3, align: 'justify' });

        const p4 = `Conforme Acuerdo de Superintendencia 05/2024 y 34/2024, se informa que la presente audiencia se asignó al Juez ${juez}`;
        sections.push({ text: p4, size: 10, bold: false, spacing: 3, align: 'justify' });

        const contactBlock = `Ante cualquier duda o consulta comunicarse al teléfono 2646 61-3638 o al correo electrónico notificacionofijup@jussanjuan.gov.ar`;
        sections.push({ text: contactBlock, size: 9, bold: true, spacing: 4 });

    } else if (opcion === 'cancelarAudienciaImputadoEnLibertad') {
        const introText = `Me dirijo a Ud., en Legajo Fiscal ${legajoFiscal} Caratulado: ${caratula}, a los fines de notificarle que fue CANCELADA la Audiencia de ${tipoAudiencia} del día ${fechaAudiencia} a las ${horaAudiencia}hs.`;
        sections.push({ text: introText, size: 10, bold: false, spacing: 6, align: 'justify' });

    } else if (opcion === 'citacionDenunciante') {
        const introText = `Me dirijo a Ud., en Legajo Fiscal ${legajoFiscal} Caratulado: ${caratula},a fin de hacerle saber que deberá comparecer para audiencia de ${tipoAudiencia} el día ${fechaAudiencia} a las ${horaAudiencia} ante la Oficina Judicial Penal por ante la Unidad de Atención al Público y Trámite – Sala de audiencias Penales (Subsuelo del Edificio Tribunales, sito en calle Rivadavia 473 Este de esta ciudad), con documento nacional de identidad.\n(Cfr. LEY 1851-O ARTÍCULO 206.- Acceso del público: Todas las personas tienen derecho a acceder a la sala de audiencias. No pueden ingresar a la sala de audiencias personas que pudieren afectar la seguridad, orden o higiene de la audiencia,ni los menores de dieciséis (16) años de Edad...)`;
        sections.push({ text: introText, size: 10, bold: false, spacing: 6, align: 'justify' });

    } else if (opcion === 'citacionImputadoLibertadVideoconferencia') {
        const introText = `Me dirijo a Ud., en Legajo Fiscal ${legajoFiscal} Caratulado: ${caratula}, a fin de hacerle saber que deberá comparecer en forma VIRTUAL (VIDEOCONFERENCIA) para audiencia de ${tipoAudiencia} el día ${fechaAudiencia} a las ${horaAudiencia} ante la Oficina Judicial Penal, debiendo conectarse a través del enlace que se le proporcionará oportunamente, con documento de identidad bajo apercibimiento de declarar su rebeldía.`;
        sections.push({ text: introText, size: 10, bold: false, spacing: 6, align: 'justify' });

    } else if (opcion === 'citacionConvenio') {
        const introText = `Me dirijo a Ud., en Legajo Fiscal ${legajoFiscal} Caratulado: ${caratula} ,a fin de hacerle saber que deberá comparecer para audiencia de ${tipoAudiencia} mediante VIDEOCONFERENCIA el día ${fechaAudiencia} a las ${horaAudiencia} hs. A tal fin comunicarse al numero de teléfono 2646613638 para enviarle el link corresponidente link de conexión. Preséntese, con documento de identidad bajo apercibimiento de declarar su rebeldía y librar orden de detención conforme Arts. 131 y 132 del C.P.P. Deberá comparecer acompañado de su abogado de confianza, conforme Art 121 inc 4 del C.P.P, caso contrario se le designará defensor oficial a fin de salvaguardar el debido proceso y su derecho de defensa.\n(Cfr. LEY 1851-O ARTÍCULO 206.- Acceso del público: Todas las personas tienen derecho a acceder a la sala de audiencias. No pueden ingresar a la sala de audiencias personas que pudieren afectar la seguridad, orden o higiene de la audiencia,ni los menores de dieciséis (16) años de Edad…)`;
        sections.push({ text: introText, size: 10, bold: false, spacing: 6, align: 'justify' });

    } else {
        // Opción predeterminada
        const introText = `Me dirijo a Ud., en Legajo Fiscal ${legajoFiscal} Caratulado: ${caratula}, a fin de hacerle saber que deberá comparecer para audiencia de ${tipoAudiencia} el día ${fechaAudiencia} a las ${horaAudiencia} ante la Oficina Judicial Penal por ante la Unidad de Atención al Público y Trámite – Sala de audiencias Penales (Subsuelo del Edificio Tribunales, sito en calle Rivadavia 473 Este de esta ciudad), con documento de identidad bajo apercibimiento de declarar su rebeldía y librar orden de detención conforme Arts. 131 y 132 del C.P.P. Deberá comparecer acompañado de su abogado de confianza, conforme Art 121 inc 4 del C.P.P, caso contrario se le designará defensor oficial a fin de salvaguardar el debido proceso y su derecho de defensa.`;
        sections.push({ text: introText, size: 10, bold: false, spacing: 4, align: 'justify' });
    }

    // 4. Juez común y cierre de cuerpo
    if (!isPolice && opcion !== 'cancelarAudienciaImputadoEnLibertad') {
        const juezText = `Se informa que la presente audiencia se asignó al Juez ${juez}.`;
        sections.push({ text: juezText, size: 10, bold: true, spacing: 3, align: 'justify' });
    }

    // 5. Encabezados "QUEDA DEBIDAMENTE NOTIFICADO"
    sections.push({ text: 'QUEDA UD. DEBIDAMENTE NOTIFICADO.', align: 'center', bold: true, underline: true, size: 10, spacing: 1 });
    sections.push({ text: 'UNIDAD DE NOTIFICACIONES Y CITACIONES', align: 'center', bold: true, size: 10, spacing: 1 });
    sections.push({ text: 'OFICINA JUDICIAL PENAL', align: 'center', bold: true, size: 10, spacing: 3 });

    if (!isPolice) {
        // Mail de contacto común
        const contactBlock = `Ante cualquier duda o consulta comunicarse al teléfono 2646 61-3638 o al correo electrónico notificacionofijup@jussanjuan.gov.ar`;
        sections.push({ text: contactBlock, size: 9, bold: true, spacing: 2 });
    }

    // 6. Acta
    const notificationLine = `EN EL DÍA ………/……./……, siendo las ...…… HS, NOTIFIQUÉ AL/ LA CIUDADANO/A ……….…………………………………NUMERO DE TELÉFONO CELULAR: ……………………………………….`;
    sections.push({ text: notificationLine, size: 9, bold: true, spacing: 2 });

    sections.push({ text: `En caso de no ser la persona citada: VÍNCULO CON EL CITADO…………. y DECLARA BAJO JURAMENTO QUE EN EL DOMICILIO QUE SE NOTIFICA RESIDE EL SR/A……………………..`, size: 9, bold: true, spacing: 1, align: 'justify' });

    if (!isPolice) {
        // En los no-policiales indicamos las checkbox
        sections.push({ text: `(MARCAR ÚNICAMENTE LA OPCIÓN QUE CORRESPONDA)`, size: 8, bold: false, spacing: 4, align: 'center', yOffset: -3 });
        sections.push({ type: 'checkboxes', spacing: 15 });
    } else {
        // Damos un poco de espacio en blanco para reemplazar el hueco de los Checkboxes
        sections.push({ text: "", spacing: 10 });
    }

    // 7. Líneas de firma
    const midSpacesArr = " ".repeat(65);
    const signatureLine1 = `-------------------------------------------${midSpacesArr}--------------------------------------------------`;

    const cargoLeft = "FIRMA, DNI, ACLARACIÓN";
    const cargoRight = "FIRMA, ACLARACIÓN";
    const signatureLine2 = `${cargoLeft}${" ".repeat(71)}${cargoRight}`;

    const ownerLeft = "PERSONA NOTIFICADA";
    const ownerRight = "FUNCIONARIO          ";
    const signatureLine3 = `${ownerLeft}${" ".repeat(76)}${ownerRight}`;

    sections.push({ text: signatureLine1 + "\n" + signatureLine2 + "\n" + signatureLine3, size: 9, bold: true, spacing: 8 });

    const finalFooter = `SE REQUIERE QUE UNA VEZ NOTIFICADA LA PRESENTE, SE ENVÍE LA CONSTANCIA CORRESPONDIENTE AL CORREO ELECTRÓNICO notificacionofijup@jussanjuan.gov.ar`;
    sections.push({ text: finalFooter, size: 9, bold: true, spacing: 2, align: 'justify' });

    await PDFGenerator(sections, `Notificacion_${legajoFiscal}_${Date.now()}`, true);
}
