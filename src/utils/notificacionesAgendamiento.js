export function generarCuerpoNotificacion(opcion, datos) {
    const {
        destinatarioNombre = '[NOMBRE DESTINATARIO]',
        destinatarioDomicilio = '[DOMICILIO]',
        destinatarioLocalidad = '[LOCALIDAD/DEPARTAMENTO]',
        destinatarioTelefono = '[TELÉFONO]',
        legajoFiscal = '[N° LEGAJO]',
        caratula = '[CARÁTULA]',
        tipoAudiencia = '[TIPO DE AUDIENCIA]',
        fechaAudiencia = '[FECHA]',
        horaAudiencia = '[HORA]',
        juez = '[JUEZ ASIGNADO]',
        personasACitar = []
    } = datos || {};

    let cuerpo = '';

    switch (opcion) {
        case 'cancelarAudienciaImputadoEnLibertad':
            cuerpo = `Sr. Jefe de Policía
Sra/Sr. ${destinatarioNombre} domiciliada/o en calle ${destinatarioDomicilio},
${destinatarioLocalidad}
Me dirijo a Ud., en Legajo Fiscal ${legajoFiscal} Caratulado: ${caratula}, a los fines de notificarle que fue CANCELADA
la Audiencia de ${tipoAudiencia}
del día ${fechaAudiencia} a las ${horaAudiencia} hs.`;
            break;

        case 'citacionDenunciante':
            cuerpo = `Sr. Jefe de Policía
Sra/Sr. ${destinatarioNombre}
Me dirijo a Ud., en Legajo Fiscal ${legajoFiscal} Caratulado: ${caratula}, a fin de hacerle saber que
deberá comparecer para audiencia de ${tipoAudiencia} el día ${fechaAudiencia} a las ${horaAudiencia} hs ante la Oficina
Judicial Penal por ante la Unidad de Atención al Público y Trámite – Sala de audiencias Penales
(Subsuelo del Edificio Tribunales, sito en calle Rivadavia 473 Este de esta ciudad), con
documento nacional de identidad.
(Cfr. LEY 1851 - O ARTÍCULO 206. - Acceso del público: Todas las personas tienen derecho a
acceder a la sala de audiencias. No pueden ingresar a la sala de audiencias personas que
pudieren afectar la seguridad, orden o higiene de la audiencia, ni los menores de dieciséis (16)
años de Edad...)`;
            break;

        case 'citacionImputadoLibertadVideoconferencia':
            cuerpo = `Sr. Jefe de Policía
Sr/a. ${destinatarioNombre}
Me dirijo a Ud., en Legajo Fiscal ${legajoFiscal} Caratulado: ${caratula}, a fin de
hacerle saber que deberá comparecer para audiencia de ${tipoAudiencia} mediante VIDEOCONFERENCIA el
día ${fechaAudiencia} a las ${horaAudiencia} hs. A tal fin comunicarse al numero de teléfono 2646613638 para enviarle
el link corresponidente link de conexión. Preséntese, con documento de identidad bajo
apercibimiento de declarar su rebeldía y librar orden de detención conforme Arts. 131 y 132 del
C.P.P. Deberá comparecer acompañado de su abogado de confianza, conforme Art 121 inc 4 del
C.P.P, caso contrario se le designará defensor oficial a fin de salvaguardar el debido proceso y
su derecho de defensa.
(Cfr. LEY 1851 - O ARTÍCULO 206. - Acceso del público: Todas las personas tienen derecho a
acceder a la sala de audiencias. No pueden ingresar a la sala de audiencias personas que
pudieren afectar la seguridad, orden o higiene de la audiencia, ni los menores de dieciséis (16)
años de Edad…)
Se informa que la presente audiencia se asignó al Juez ${juez}.`;
            break;

        case 'citacionPersonalPolicial':
            let listaPersonas = personasACitar.length > 0
                ? personasACitar.map(p => `- ${p.nombre}, para que se presente el dia ${p.fecha} a las ${p.hora}hs,`).join('\n')
                : `- [NOMBRE PERSONA], para que se presente el dia [FECHA] a las [HORA]hs,`;

            cuerpo = `Dirección de Personal D - 1,

Me dirijo a Ud., en Legajo N° ${legajoFiscal} caratulado "${caratula}", con trámite ante la OFICINA JUDICIAL PENAL DE SAN JUAN, sito en calle Rivadavia 473 Este de esta ciudad, a los fines de hacerle saber que tiene que citar a:

${listaPersonas}

Deberán comparecer para audiencia de ${tipoAudiencia} ante la Oficina Judicial Penal por la Unidad de Atención al Público y Trámite (Planta Baja del Edificio Tribunales, sito en calle Rivadavia 473 Este de esta ciudad), con documento de identidad bajo apercibimiento de declarar su rebeldía y librar orden de detención conforme Arts. 131 y 132 del C.P.P. Deberá comparecer acompañado de su abogado de confianza, conforme Art 121 inc 4 del C.P.P, caso contrario se le designará defensor oficial a fin de salvaguardar el debido proceso y su derecho de defensa.

Sirva la presente de comunicación y solicito, por este mismo medio, confirmación de recepción correcta de la misma.

Conforme Acuerdo de Superintendencia 05 / 2024 y 34 / 2024, se informa que la presente audiencia se asignó al Juez ${juez}.`;
            break;

        case 'citacionImputadoCedulaPenalEnLibertad':
            cuerpo = `Sr. Jefe de Policía
Sr/a. ${destinatarioNombre}
Teléfono: ${destinatarioTelefono}
Domicilio: ${destinatarioDomicilio}
Me dirijo a Ud., en Legajo Fiscal ${legajoFiscal} Caratulado: ${caratula}, a fin de hacerle saber que deberá comparecer para audiencia de ${tipoAudiencia} el día ${fechaAudiencia} a las ${horaAudiencia} horas ante la Oficina Judicial Penal por ante la Unidad de Atención al Público y Trámite – Sala de audiencias Penales (Subsuelo del Edificio Tribunales, sito en calle Rivadavia 473 Este de esta ciudad), con documento de identidad bajo apercibimiento de declarar su rebeldía y librar orden de detención conforme Arts. 131 y 132 del C.P.P. Deberá comparecer acompañado de su abogado de confianza, conforme Art 121 inc 4 del C.P.P, caso contrario se le designará defensor oficial a fin de salvaguardar el debido proceso y su derecho de defensa.

(Cfr. LEY 1851 - O ARTÍCULO 206. - Acceso del público: Todas las personas tienen derecho a acceder a la sala de audiencias. No pueden ingresar a la sala de audiencias personas que pudieren afectar la seguridad, orden o higiene de la audiencia, ni los menores de dieciséis (16) años de Edad…)

Se informa que la presente audiencia se asignó al Juez Dr. ${juez}.`;
            break;

        default:
            return '';
    }

    if (!cuerpo) return '';

    const fechaHoy = new Date().toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    const encabezado = `                                                                                                     San Juan, ${fechaHoy}

                                               CÉDULA PENAL

`;

    const pieDePagina = `


Ante cualquier duda o consulta comunicarse al teléfono 2646 61-3638 o al correo electrónico notificacionofijup@jussanjuan.gov.ar 	
QUEDA UD. DEBIDAMENTE NOTIFICADO.
UNIDAD DE NOTIFICACIONES Y CITACIONES
OFICINA JUDICIAL PENAL 


EN EL DÍA ………/……./……, siendo las ...…… HS, NOTIFIQUÉ AL/ LA CIUDADANO/A ……….…………………………………NUMERO DE TELÉFONO CELULAR: ……………………………………….
En caso de no ser la persona citada: VÍNCULO CON EL CITADO…………. y DECLARA BAJO JURAMENTO QUE EN EL DOMICILIO QUE SE NOTIFICA RESIDE EL SR/A……………………..



---------------------------------------------------                 -----------------------------------------------------
     FIRMA, DNI, ACLARACIÓN                                          FIRMA, ACLARACIÓN
       PERSONA NOTIFICADA                                                      FUNCIONARIO
`;

    return encabezado + cuerpo + pieDePagina;
}

/**
 * Llama al utilitario de PDFs para generar un archivo descargable.
 */
export async function descargarPdfNotificacion(opcion, datos) {
    // Si tenemos una lista de personas, generamos una única notificación con todas juntas.
    // O si solo es una persona por notificación.
    // Como el req parece ser 1 PDF por configuración
    const { PDFGenerator } = await import('./pdfUtils.js');

    // Generamos el texto completo uniendo todo
    const cuerpoFinal = generarCuerpoNotificacion(opcion, datos);

    if (!cuerpoFinal) return;

    const sections = [
        { text: cuerpoFinal }
    ];

    // minutaBool=true evita la sangría extra en cada párrafo
    await PDFGenerator(sections, `Notificacion_${datos.legajoFiscal}_${Date.now()}`, true);
}
