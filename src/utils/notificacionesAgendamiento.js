import { normalizeName } from './caratulaUtils';
const formatName = (str) => {
    if (!str) return '';
    return normalizeName(str.trim());
};

const formatLongDate = () => {
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const now = new Date();
    return `San Juan, ${now.getDate()} de ${months[now.getMonth()]} del ${now.getFullYear()}`;
};

export async function descargarPdfNotificacion(opcion, datos, returnBuffer = false) {
    const { PDFGenerator } = await import('./pdfUtils.js');
    const { inferGender } = await import('./genderUtils.js');

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
        horaFinAudiencia = '',
        juez = '',
        personasACitar = []
    } = datos || {};

    const formattedName = formatName(destinatarioNombre);
    const fullAddress = `${destinatarioDomicilio}, ${destinatarioLocalidad}`.toLowerCase();

    const sections = [];

    // 1. Fecha a la derecha
    sections.push({ text: formatLongDate(), align: 'right', size: 9, spacing: 3 });

    // 2. Título centrado (no aplica en rechazo)
    const isRechazo = opcion === 'rechazarSolicitud';
    if (!isRechazo) {
        sections.push({ text: 'CÉDULA PENAL', align: 'center', size: 15, border: true, bold: true, spacing: 2 });
    }

    const isPolice = opcion === 'citacionPersonalPolicial';

    // HEADER destinatario (no aplica en rechazo ni en policial)
    if (!isPolice && !isRechazo) {
        sections.push({ text: `Sr. Jefe de Policía`, bold: true, size: 11, spacing: 2 });
        const hasPrefix = /^(Sr|Sra)/i.test(formattedName);
        let headerDestinatario = `${hasPrefix ? '' : 'Sra/Sr. '}${formattedName} domiciliada/o en calle ${fullAddress}`;
        if (destinatarioTelefono) {
            headerDestinatario += `. Teléfono: ${destinatarioTelefono}`;
        }
        sections.push({ text: headerDestinatario, bold: true, size: 11, spacing: 5, align: 'justify' });
    }

    // Número de legajo a la izquierda (solo en rechazo)
    if (isRechazo) {
        sections.push({ text: legajoFiscal, align: 'left', size: 11, bold: true, spacing: 5 });
    }

    // 3. Contenido de cuerpo según la opción
    if (opcion === 'citacionPersonalPolicial') {
        sections.push({ text: `Dirección de Personal D-1,`, bold: true, size: 11, spacing: 2 });

        const introText = `Me dirijo a Ud., en Legajo N° ${legajoFiscal} caratulado "${caratula}", con trámite ante la OFICINA JUDICIAL PENAL DE SAN JUAN, sito en calle Rivadavia 473 Este de esta ciudad, a los fines de hacerle saber que tiene que citar a:`;
        sections.push({ text: introText, size: 10, bold: false, spacing: 2, align: 'justify' });

        const listaPersonas = personasACitar.length > 0
            ? personasACitar.map(p => {
                const hInicio = p.hora || horaAudiencia;
                const hFin = p.horaFin || horaFinAudiencia;
                const horaStr = hFin ? `${hInicio} a ${hFin}` : hInicio;
                const name = normalizeName(p.nombre).toUpperCase();
                return `- ${name}${p.dni ? ` (DNI ${p.dni})` : ''}${p.telefono ? ` - Cel: ${p.telefono}` : ''}, para que se presente el dia ${p.fecha || fechaAudiencia} a las ${horaStr}hs,`;
            }).join('\n')
            : `- ${formattedName.toUpperCase()}${destinatarioTelefono ? ` - Cel: ${destinatarioTelefono}` : ''}, para que se presente el dia ${fechaAudiencia} a las ${horaFinAudiencia ? `${horaAudiencia} a ${horaFinAudiencia}` : horaAudiencia}hs,`;
        sections.push({ text: listaPersonas, size: 10, bold: true, spacing: 2 });

        const restText = `Deberán comparecer para audiencia de ${tipoAudiencia} ante la Oficina Judicial Penal por la Unidad de Atención al Público y Trámite (Planta Baja del Edificio Tribunales, sito en calle Rivadavia 473 Este de esta ciudad), con documento de identidad bajo apercibimiento de declarar su rebeldía y librar orden de detención conforme Arts. 131 y 132 del C.P.P. Deberá comparecer acompañado de su abogado de confianza, conforme Art 121 inc 4 del C.P.P, caso contrario se le designará defensor oficial a fin de salvaguardar el debido proceso y su derecho de defensa.`;
        sections.push({ text: restText, size: 10, bold: false, spacing: 4, align: 'justify' });

        const p3 = `Sirva la presente de comunicación y solicito, por este mismo medio, confirmación de recepción correcta de la misma.`;
        sections.push({ text: p3, size: 10, bold: false, spacing: 3, align: 'justify' });

        const { labelJuez } = inferGender(juez);
        const p4 = `Conforme Acuerdo de Superintendencia 05/2024 y 34/2024, se informa que la presente audiencia se asignó al ${labelJuez} ${juez}`;
        sections.push({ text: p4, size: 10, bold: false, spacing: 3, align: 'justify' });

        const contactBlock = `Ante cualquier duda o consulta comunicarse al teléfono 2646 61-3638 o al correo electrónico notificacionofijup@jussanjuan.gov.ar`;
        sections.push({ text: contactBlock, size: 9, bold: true, spacing: 4 });

    } else if (opcion === 'cancelarAudienciaImputadoEnLibertad') {
        const hRange = horaFinAudiencia ? `${horaAudiencia} a ${horaFinAudiencia}` : horaAudiencia;
        const introText = `Me dirijo a Ud., en Legajo Fiscal ${legajoFiscal} Caratulado: ${caratula}, a los fines de notificarle que fue CANCELADA la Audiencia de ${tipoAudiencia} del día ${fechaAudiencia} a las ${hRange}hs.`;
        sections.push({ text: introText, size: 10, bold: false, spacing: 6, align: 'justify' });

    } else if (opcion === 'citacionDenunciante') {
        const hRange = horaFinAudiencia ? `${horaAudiencia} a ${horaFinAudiencia}` : horaAudiencia;
        const introText = `Me dirijo a Ud., en Legajo Fiscal ${legajoFiscal} Caratulado: ${caratula},a fin de hacerle saber que deberá comparecer para audiencia de ${tipoAudiencia} el día ${fechaAudiencia} a las ${hRange} ante la Oficina Judicial Penal por ante la Unidad de Atención al Público y Trámite – Sala de audiencias Penales (Subsuelo del Edificio Tribunales, sito en calle Rivadavia 473 Este de esta ciudad), con documento nacional de identidad.\n(Cfr. LEY 1851-O ARTÍCULO 206.- Acceso del público: Todas las personas tienen derecho a acceder a la sala de audiencias. No pueden ingresar a la sala de audiencias personas que pudieren afectar la seguridad, orden o higiene de la audiencia,ni los menores de dieciséis (16) años de Edad...)`;
        sections.push({ text: introText, size: 10, bold: false, spacing: 6, align: 'justify' });

    } else if (opcion === 'citacionImputadoLibertadVideoconferencia') {
        const hRange = horaFinAudiencia ? `${horaAudiencia} a ${horaFinAudiencia}` : horaAudiencia;
        const introText = `Me dirijo a Ud., en Legajo Fiscal ${legajoFiscal} Caratulado: ${caratula}, a fin de hacerle saber que deberá comparecer en forma VIRTUAL (VIDEOCONFERENCIA) para audiencia de ${tipoAudiencia} el día ${fechaAudiencia} a las ${hRange} ante la Oficina Judicial Penal, debiendo conectarse a través del enlace que se le proporcionará oportunamente, con documento de identidad bajo apercibimiento de declarar su rebeldía.`;
        sections.push({ text: introText, size: 10, bold: false, spacing: 6, align: 'justify' });

    } else if (opcion === 'citacionConvenio') {
        const hRange = horaFinAudiencia ? `${horaAudiencia} a ${horaFinAudiencia}` : horaAudiencia;
        const introText = `Me dirijo a Ud., en Legajo Fiscal ${legajoFiscal} Caratulado: ${caratula} ,a fin de hacerle saber que deberá comparecer para audiencia de ${tipoAudiencia} mediante VIDEOCONFERENCIA el día ${fechaAudiencia} a las ${hRange} hs. A tal fin comunicarse al numero de teléfono 2646613638 para enviarle el link corresponidente link de conexión. Preséntese, con documento de identidad bajo apercibimiento de declarar su rebeldía y librar orden de detención conforme Arts. 131 y 132 del C.P.P. Deberá comparecer acompañado de su abogado de confianza, conforme Art 121 inc 4 del C.P.P, caso contrario se le designará defensor oficial a fin de salvaguardar el debido proceso y su derecho de defensa.\n(Cfr. LEY 1851-O ARTÍCULO 206.- Acceso del público: Todas las personas tienen derecho a acceder a la sala de audiencias. No pueden ingresar a la sala de audiencias personas que pudieren afectar la seguridad, orden o higiene de la audiencia,ni los menores de dieciséis (16) años de Edad…)`;
        sections.push({ text: introText, size: 10, bold: false, spacing: 6, align: 'justify' });

    } else if (opcion === 'rechazarSolicitud') {
        // Documento de rechazo — sin header de destinatario ni pie de notificación
        // El cuerpo simplificado es: fecha | legajo | párrafo de rechazo
        const solicitante = datos.solicitante || 'MPF'; // 'MPF' o 'DEFENSA'
        const razonRechazo = datos.razonRechazo || 'información faltante';
        const bodyText = `\tAtento a que desde el ${solicitante} solicitan Audiencia, y que dicho pedido se encuentra incompleto ya que carece de ${razonRechazo}, imposibilitando a esta Oficina Judicial Penal realizar la gestión adecuada de lo solicitado, es que se procede a cancelar dicha solicitud conforme lo establecido en Acuerdo de Superintendencia 05/2024. Subsanado o completada la información faltante proceder a realizar nuevamente el pedido a través del Sistema Informático.`;
        sections.push({ text: bodyText, size: 10, bold: false, spacing: 6, align: 'justify' });

    } else {
        // Opción predeterminada
        const hRange = horaFinAudiencia ? `${horaAudiencia} a ${horaFinAudiencia}` : horaAudiencia;
        const introText = `Me dirijo a Ud., en Legajo Fiscal ${legajoFiscal} Caratulado: ${caratula}, a fin de hacerle saber que deberá comparecer para audiencia de ${tipoAudiencia} el día ${fechaAudiencia} a las ${hRange} ante la Oficina Judicial Penal por ante la Unidad de Atención al Público y Trámite – Sala de audiencias Penales (Subsuelo del Edificio Tribunales, sito en calle Rivadavia 473 Este de esta ciudad), con documento de identidad bajo apercibimiento de declarar su rebeldía y librar orden de detención conforme Arts. 131 y 132 del C.P.P. Deberá comparecer acompañado de su abogado de confianza, conforme Art 121 inc 4 del C.P.P, caso contrario se le designará defensor oficial a fin de salvaguardar el debido proceso y su derecho de defensa.`;
        sections.push({ text: introText, size: 10, bold: false, spacing: 4, align: 'justify' });
    }

    // 4. Juez común y cierre de cuerpo (no en rechazo ni cancelación)
    if (!isPolice && !isRechazo && opcion !== 'cancelarAudienciaImputadoEnLibertad') {
        const { labelJuez } = inferGender(juez);
        const juezText = `Se informa que la presente audiencia se asignó al ${labelJuez} ${normalizeName(juez)}.`;
        sections.push({ text: juezText, size: 10, bold: true, spacing: 3, align: 'justify' });
    }

    // 5. Footer según tipo de documento
    if (isRechazo) {
        // Cierre OJP (sin acta de firma del notificador)
        sections.push({ text: 'OFICINA JUDICIAL PENAL', align: 'center', bold: true, size: 10, spacing: 3 });
        sections.push({ text: 'UNIDAD DE ATENCIÓN AL PÚBLICO Y TRÁMITE', align: 'center', bold: true, size: 9, spacing: 2 });
    } else {
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
    }

    const minutaArg = returnBuffer ? 'return_buffer' : true;
    const result = await PDFGenerator(sections, `Notificacion_${legajoFiscal}_${Date.now()}`, minutaArg);

    if (returnBuffer) {
        // Build raw text using only sections with actual text, line breaks as <br>
        const rawText = sections
            .filter(s => s.text)
            .map(s => s.text.replace(/\n/g, '<br>'))
            .join('<br><br>');
        
        return { buffer: result, textoPlano: rawText };
    }
    
    return result;
}
