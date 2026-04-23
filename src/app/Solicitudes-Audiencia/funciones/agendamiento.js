import puppeteer from 'puppeteer';
import { getBrowserPath } from '../../../utils/browserPath.js';

const LOGIN_URL = "http://10.107.1.184:8092/site/login?urlBack=http%3A%2F%2F10.107.1.184%3A8094%2F";

async function login(page) {
    page.setDefaultTimeout(60000);
    page.setDefaultNavigationTimeout(60000);
    await page.goto(LOGIN_URL, { waitUntil: "domcontentloaded" });
    await page.type("#loginform-username", "20423341980");
    await page.type("#loginform-password", "Marzo24");
    await page.click('button[name="login-button"]');
    await page.waitForSelector('a[href="/audiencia/agenda"]', { visible: true, timeout: 60000 });
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Inyecta un overlay en el browser visible y espera que el usuario elija.
 * Devuelve true si eligió "Continuar", false si eligió "Cancelar agendamiento".
 */
async function confirmarConUsuario(page, mensaje) {
    await page.evaluate((msg) => {
        window.__puppet_decision__ = undefined;
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:99999;display:flex;align-items:center;justify-content:center;font-family:sans-serif;';
        overlay.innerHTML = `
            <div style="background:#fff;padding:30px;border-radius:8px;max-width:540px;text-align:center;box-shadow:0 4px 24px rgba(0,0,0,0.35);">
                <p style="margin:0 0 24px;font-size:15px;line-height:1.6;">${msg}</p>
                <button id="__puppet_ok__"     style="margin:6px;padding:10px 26px;background:#5cb85c;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:14px;">Continuar</button>
                <button id="__puppet_cancel__" style="margin:6px;padding:10px 26px;background:#d9534f;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:14px;">Cancelar agendamiento</button>
            </div>`;
        document.body.appendChild(overlay);
        document.getElementById('__puppet_ok__').onclick = () => { window.__puppet_decision__ = 'ok'; overlay.remove(); };
        document.getElementById('__puppet_cancel__').onclick = () => { window.__puppet_decision__ = 'cancel'; overlay.remove(); };
    }, mensaje);

    // Esperar hasta 2 minutos a que el usuario decida
    await page.waitForFunction(() => window.__puppet_decision__ !== undefined, { timeout: 120000 });
    const decision = await page.evaluate(() => {
        const d = window.__puppet_decision__;
        delete window.__puppet_decision__;
        return d;
    });
    return decision === 'ok';
}

/**
 * Agrega un item a un Select2 múltiple.
 * Hace click en el input de búsqueda, tipea el texto, espera el dropdown y presiona Enter.
 */
async function select2Agregar(page, searchInputSelector, texto) {
    await page.click(searchInputSelector);
    await new Promise(r => setTimeout(r, 200));
    await page.type(searchInputSelector, texto, { delay: 40 });
    await page.waitForSelector('.select2-results__option', { visible: true, timeout: 6000 }).catch(() => null);
    await new Promise(r => setTimeout(r, 300));
    await page.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 400));
}

/**
 * Setea un datepicker krajee directamente en el input (vía JS + fallback por tipo).
 */
async function setDatepicker(page, inputId, value) {
    // Cerrar cualquier datepicker abierto primero
    await page.keyboard.press('Escape');
    await page.evaluate((id, val) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.value = val;
        el.dispatchEvent(new Event('change', { bubbles: true }));
        el.dispatchEvent(new Event('input', { bubbles: true }));
    }, inputId, value);
    await new Promise(r => setTimeout(r, 200));
}

/**
 * Setea un bootstrap-timepicker haciendo click + triple selección + type.
 */
async function setTimepicker(page, inputId, value) {
    await page.click(`#${inputId}`);
    await new Promise(r => setTimeout(r, 150));
    // Triple click para seleccionar todo el contenido previo
    await page.click(`#${inputId}`, { clickCount: 3 });
    await page.keyboard.type(value, { delay: 50 });
    await page.keyboard.press('Tab');  // confirma el valor en el timepicker
    await new Promise(r => setTimeout(r, 300));
}

// ─────────────────────────────────────────────────────────────────────────────
// Agregar partes al legajo
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Navega al legajo indicado y agrega cada parte de `partes` haciendo:
 *  1. click en ".modalButtonAgregarParte"
 *  2. seleccionar el motivo en el Select2 #parte-id_motivo_vinculacion
 *  3. esperar que cargue la grilla de personas
 *  4. filtrar por apellido (primer campo de texto del thead de filtros)
 *  5. click en el 3er td de la primera fila del tbody (evita el ícono de expansión)
 *  6. click en #boton-submit
 * @param {Page}   page
 * @param {string} linkLeg  - URL del legajo
 * @param {Array<{motivo:string, nombre:string}>} partes
 * @param {Function} log
 */
async function agregarPartesAlLegajo(page, linkLeg, partes, log) {
    log(`Navegando al legajo para agregar ${partes.length} parte/s: ${linkLeg}`);
    await page.goto(linkLeg, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // El tab "Partes" es el activo por defecto — verificar que esté cargado
    await page.waitForSelector('.modalButtonAgregarParte', { visible: true, timeout: 60000 });

    for (const { motivo, nombre } of partes) {
        log(`  → Agregando parte: motivo="${motivo}" | nombre="${nombre}"`);

        // Primer apellido para filtrar (antes de la coma si hay)
        const apellido = nombre.split(',')[0].trim();

        // 1. Abrir modal
        await page.click('.modalButtonAgregarParte');
        await page.waitForSelector('#parte-id_motivo_vinculacion', { timeout: 10000 });
        await new Promise(r => setTimeout(r, 500));

        // 2. Seleccionar motivo en Select2 (single select)
        log(`     Seleccionando motivo: "${motivo}"`);
        await page.click('#parte-id_motivo_vinculacion + span .select2-selection--single');
        await page.waitForSelector('.select2-dropdown .select2-search__field', { visible: true, timeout: 5000 });
        await page.type('.select2-dropdown .select2-search__field', motivo, { delay: 40 });
        await page.waitForSelector('.select2-results__option', { visible: true, timeout: 5000 });
        await page.keyboard.press('Enter');
        await new Promise(r => setTimeout(r, 600));

        // 3. Esperar que cargue la grilla de personas
        await page.waitForSelector('#grillaPersonas-filters', { visible: true, timeout: 10000 });
        await new Promise(r => setTimeout(r, 400));

        // 4. Filtrar por apellido (primer input de texto visible en la fila de filtros)
        log(`     Buscando apellido: "${apellido}"`);
        const filterInput = await page.$('#grillaPersonas-filters input[type="text"]');
        if (filterInput) {
            await filterInput.click({ clickCount: 3 });
            await filterInput.type(apellido, { delay: 40 });
            await filterInput.press('Enter');
        }

        // Esperar resultados
        await page.waitForFunction(
            () => {
                const tbody = document.querySelector('#grillaPersonas-pjax tbody');
                return tbody && !tbody.querySelector('.kv-loader');
            },
            { timeout: 10000 }
        ).catch(() => null);
        await new Promise(r => setTimeout(r, 500));
        const primerResultado = await page.$('#grillaPersonas-pjax tbody tr:first-child td:nth-child(3)');
        if (!primerResultado) {
            log(`     ⚠️  Sin resultados para "${apellido}" con motivo "${motivo}". Saltando.`);
            await page.keyboard.press('Escape');
            await new Promise(r => setTimeout(r, 300));
            continue;
        }
        await primerResultado.click();
        await new Promise(r => setTimeout(r, 300));

        await page.waitForSelector('#boton-submit', { visible: true, timeout: 5000 });
        await page.click('#boton-submit');

        await page.waitForFunction(
            () => !document.querySelector('.modal.in #parte-id_motivo_vinculacion'),
            { timeout: 15000 }
        ).catch(() => null);
        await new Promise(r => setTimeout(r, 600));

        log(`     ✅ Parte agregada: "${nombre}" como "${motivo}"`);
    }

    log('Partes del legajo actualizadas.');
}

// ─────────────────────────────────────────────────────────────────────────────
// Subir documentos (Notificaciones)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sube documentos al legajo
 * @param {Page} page
 * @param {string} linkLeg
 * @param {Array<{path:string, descripcion:string}>} documentos
 * @param {Function} log
 */
async function subirDocumentosLegajo(page, linkLeg, documentos, log) {
    if (!documentos || documentos.length === 0) return;
    log(`Subiendo ${documentos.length} documento(s) al legajo...`);

    // Ensure we are in the legajo page
    if (!page.url().includes(linkLeg)) {
        log(`Navegando al legajo: ${linkLeg}`);
        await page.goto(linkLeg, { waitUntil: 'domcontentloaded', timeout: 30000 });
    }

    log(`  → Abriendo pestaña Documentos`);
    await page.click('a[href="#documentos"][data-toggle="tab"]');
    await page.waitForSelector('.modalButtonAgregarDocumento', { visible: true, timeout: 60000 });

    for (const doc of documentos) {
        log(`  → Subiendo: ${doc.descripcion}`);
        await page.click('.modalButtonAgregarDocumento');
        
        await page.waitForSelector('#documento-form-id', { visible: true, timeout: 60000 });
        await new Promise(r => setTimeout(r, 600));

        log(`     Cargando archivo en input...`);
        // Nos aseguramos que el input de tipo file existe en el DOM y esperamos a que el elemento sea interactuable
        await page.waitForSelector('input[type="file"][id="documento-documento"]', { timeout: 10000 });
        const fileInput = await page.$('input[type="file"][id="documento-documento"]');
        await fileInput.uploadFile(doc.path);
        
        // Esperar a que el nombre del archivo se muestre en el caption para asegurar que se cargó (el Krajee lo hace)
        await page.waitForFunction(
            () => {
                const el = document.querySelector('.file-caption-name');
                return el && el.value.length > 0;
            },
            { timeout: 10000 }
        ).catch(() => null);

        log(`     Archivo cargado en input...`);
        
        // state -> PROCESAL (using exact text search for Select2)
        log(`     Seleccionando estado Procesal...`);
        await page.click('#documento-estado + span .select2-selection--single');
        await page.waitForSelector('.select2-dropdown .select2-search__field', { visible: true, timeout: 5000 });
        await page.type('.select2-dropdown .select2-search__field', 'Procesal', { delay: 40 });
        await page.waitForSelector('.select2-results__option', { visible: true, timeout: 5000 });
        await page.keyboard.press('Enter');
        await new Promise(r => setTimeout(r, 300));

        log(`     Ingresando descripción...`);
        await page.type('#documento-descripcion', doc.descripcion, { delay: 20 });
        await new Promise(r => setTimeout(r, 300));

        log(`     Guardando documento...`);
        await page.click('#documento-form-id [id="boton-submit"]');

        await page.waitForFunction(
            () => !document.querySelector('.modal.in #documento-form-id'),
            { timeout: 30000 }
        ).catch(() => null);
        await new Promise(r => setTimeout(r, 600));
        
        log(`     ✅ Documento subido`);
    }
}

export async function agendarAudiencia({ 
    linkSol, tipo, jueces, intervinientes, fyhInicio, fyhFin, sala, linkLeg, 
    agregar = [], documentos = [], action = 'agendar', solicitud = {} 
}, onProgress) {
    const log = (msg) => {
        console.log(`[agendamiento] ${msg}`);
        if (onProgress) onProgress(msg);
    };

    const activeLinkSol = linkSol || solicitud.linkSol;
    const activeLinkLeg = linkLeg || solicitud.linkLeg;
    const activeTipo = tipo || solicitud.tipos || solicitud.tipo;
    const activeJueces = jueces || (solicitud.juez ? solicitud.juez.split(',').map(j => j.trim()) : []);
    const activeIntervinientes = intervinientes || solicitud.intervinientes || {};
    const activeSala = sala || solicitud.sala;
    const activeAgregar = agregar && agregar.length > 0 ? agregar : (solicitud.partesAgregar || []);

    const norm = (str) => str?.trim().toUpperCase().replace(/\s+/g, ' ') ?? '';
    const tipos = (Array.isArray(activeTipo) ? activeTipo : (activeTipo ? [activeTipo] : [])).map(norm);

    const fInicio = fyhInicio || (solicitud.fechaAudiencia ? `${solicitud.fechaAudiencia} ${solicitud.horaAudiencia || '00:00'}` : '');
    const fFin = fyhFin || (solicitud.fechaAudiencia ? `${solicitud.fechaAudiencia} ${solicitud.horaFinAudiencia || solicitud.horaAudiencia || '00:30'}` : '');

    const [fechaStr, horaInicioStr] = fInicio ? fInicio.split(' ') : ['', ''];
    const horaFinStr = fFin ? (fFin.split(' ')[1] || '') : '';

    const browser = await puppeteer.launch({
        headless: false,
        executablePath: getBrowserPath(),
        slowMo: 60, // Slower actions for visual testing
        args: ["--window-size=1280,720", "--no-sandbox", "--disable-setuid-sandbox", "--disable-quic"],
        defaultViewport: { width: 1280, height: 720 },
    });

    const page = (await browser.pages())[0] || await browser.newPage();

    try {
        // ── 1. Login ──────────────────────────────────────────────────────
        log("Iniciando login...");
        await login(page);
        log("Login OK.");

        // ── 2. Agregar partes faltantes al legajo (si las hay) ────────────
        if (activeLinkLeg && activeAgregar && activeAgregar.length > 0) {
            await agregarPartesAlLegajo(page, activeLinkLeg, activeAgregar, log);
        }

        // ── 2b. Subir documentos (Notificaciones) al legajo ───────────────
        if (activeLinkLeg && documentos && documentos.length > 0) {
            await subirDocumentosLegajo(page, activeLinkLeg, documentos, log);
        }

        if (action === 'notificar-solo') {
            const urlNotif = solicitud.urlAgendamiento || activeLinkSol;
            if (!urlNotif) throw new Error("No se proporcionó URL de la audiencia para notificar.");
            log(`Navegando directamente para NOTIFICAR: ${urlNotif}`);
            await page.goto(urlNotif, { waitUntil: "domcontentloaded", timeout: 30000 });
        } 
        else if (action === 'cancelar') {
            const urlCancel = solicitud.urlAgendamiento || activeLinkSol;
            log(`Navegando para CANCELAR: ${urlCancel}`);
            await page.goto(urlCancel, { waitUntil: "domcontentloaded", timeout: 30000 });

            log("Buscando botón Cancelar (fa-times)...");
            await page.waitForSelector('a[title="Cancelar"]', { visible: true, timeout: 60000 });
            await Promise.all([
                page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 30000 }),
                page.click('a[title="Cancelar"]'),
            ]);

            log("Formulario de cancelación cargado.");
            await page.waitForSelector('#historialestadoaudiencia-id_motivo_cambio_estado', { timeout: 60000 });

            log(`Seleccionando motivo: ${solicitud.motivCancel}`);
            await page.click('#select2-historialestadoaudiencia-id_motivo_cambio_estado-container');
            await page.waitForSelector('.select2-results__option', { visible: true, timeout: 5000 });
            await page.type('.select2-search__field', solicitud.motivCancel, { delay: 40 });
            await page.waitForSelector('.select2-results__option--highlighted', { visible: true, timeout: 5000 });
            await page.keyboard.press('Enter');

            log(`Ingresando observaciones: ${solicitud.obsCancel}`);
            await page.type('#historialestadoaudiencia-observaciones', solicitud.obsCancel || 'Cancelación vía UAPyTO', { delay: 20 });

            log("Enviando cancelación...");
            await page.click('button[type="submit"].btn-success');
            await page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 30000 });
            log("✅ Cancelación completada.");
            return { success: true };
        } 
        else if (action === 'reprogramar') {
            const urlRepro = solicitud.urlAgendamiento || activeLinkSol;
            log(`Navegando para REPROGRAMAR: ${urlRepro}`);
            await page.goto(urlRepro, { waitUntil: "domcontentloaded", timeout: 30000 });
            
            log("Buscando botón Reprogramar (glyphicon-time)...");
            await page.waitForSelector('a[title="Reprogramar"]', { visible: true, timeout: 60000 });
            await Promise.all([
                page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 30000 }),
                page.click('a[title="Reprogramar"]'),
            ]);

            log("Formulario de reprogramación cargado.");
            await page.waitForSelector('#dynamic-form', { visible: true, timeout: 60000 });

            log(`Cambiando tiempos — inicio: ${horaInicioStr} | fin: ${horaFinStr}`);
            await setTimepicker(page, 'bloque-0-hora_inicio_programada', horaInicioStr);
            await setTimepicker(page, 'bloque-0-hora_fin_programada', horaFinStr);

            log(`Seleccionando motivo: ${solicitud.motivRepro}`);
            await page.click('#select2-historialestadoaudiencia-id_motivo_cambio_estado-container');
            await page.waitForSelector('.select2-results__option', { visible: true, timeout: 5000 });
            await page.type('.select2-search__field', solicitud.motivRepro, { delay: 40 });
            await page.waitForSelector('.select2-results__option--highlighted', { visible: true, timeout: 5000 });
            await page.keyboard.press('Enter');

            log(`Ingresando observaciones: ${solicitud.obsRepro}`);
            await page.type('#historialestadoaudiencia-observaciones', solicitud.obsRepro || 'Reprogramación vía UAPyTO', { delay: 20 });
            // proceed to form filling section below
        } 
        else {
            // AGENDAR FLOW
            if (!activeLinkSol) throw new Error("No se proporcionó URL de solicitud (linkSol) para agendar.");
            log(`Navegando a la solicitud: ${activeLinkSol}`);
            await page.goto(activeLinkSol, { waitUntil: "domcontentloaded", timeout: 30000 });
            log("Solicitud cargada.");

            log("Buscando botón Agendar...");
            await page.waitForSelector('a[title="Agendar"]', { visible: true, timeout: 60000 });
            await Promise.all([
                page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 30000 }),
                page.click('a[title="Agendar"]'),
            ]);
            log("Calendario cargado.");

            log("Clickeando en el primer día del calendario...");
            await page.waitForSelector('thead tr td.fc-day-top', { visible: true, timeout: 60000 });
            await Promise.all([
                page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 30000 }),
                page.click('thead tr td.fc-day-top'),
            ]);
            log("Formulario de agendamiento cargado.");
            await page.waitForSelector('#dynamic-form', { visible: true, timeout: 60000 });
        }

        // Section 3: Shared Form Filling for Agendar/Reprogramar
        if (action === 'agendar' || action === 'reprogramar') {
            log("Iniciando llenado de formulario...");

            log("Verificando tipos de audiencia...");

            // Leer los "Originales" que muestra la página
            const originalesEnPagina = await page.evaluate(() =>
                Array.from(
                    document.querySelectorAll('.field-audiencia-tiposaudienciaoriginales .form-control-static span')
                ).map(s => s.innerText.trim().toUpperCase().replace(/\s+/g, ' '))
            );

            log(`  Originales en página: [${originalesEnPagina.join(', ')}]`);
            log(`  Tipos en params:      [${tipos.join(', ')}]`);

            // Tipos de página que NO coinciden con ninguno de los params → discrepancia
            const discrepancias = originalesEnPagina.filter(o => !tipos.includes(o));

            if (discrepancias.length > 0) {
                log(`⚠️  Tipos que no coinciden: [${discrepancias.join(', ')}]`);
                const continuar = await confirmarConUsuario(page,
                    `⚠️ <b>Discrepancia en Tipos de Audiencia</b><br><br>
                     <b>Originales en el sistema:</b><br>${originalesEnPagina.join('<br>')}<br><br>
                     <b>Tipos recibidos por parámetro:</b><br>${tipos.join('<br>')}<br><br>
                     ¿Desea continuar de todas formas?`
                );
                if (!continuar) {
                    log("Agendamiento cancelado por el usuario.");
                    return { success: false, cancelado: true };
                }
                log("El usuario eligió continuar pese a la discrepancia.");
            }

            // Tipos en params que NO están como originales → agregar a "Agregadas"
            const tiposParaAgregar = tipos.filter(t => !originalesEnPagina.includes(t));

            if (tiposParaAgregar.length > 0) {
                log(`Agregando ${tiposParaAgregar.length} tipo/s a "Agregadas"...`);
                const tiposInput = '#audiencia-inputtiposaudiencia + span .select2-search__field';
                await page.waitForSelector(tiposInput, { visible: true, timeout: 5000 });
                for (const t of tiposParaAgregar) {
                    log(`  → "${t}"`);
                    await select2Agregar(page, tiposInput, t);
                }
            }
            log(`Agregando ${(activeJueces || []).length} juez/ces...`);
            const juecesInput = '.group-audiencia-inputjueces .select2-search__field';
            await page.waitForSelector(juecesInput, { visible: true, timeout: 5000 });

            for (const juez of (activeJueces || [])) {
                const primerApellido = juez.split(',')[0].trim();
                log(`  → "${juez}" (buscando por: "${primerApellido}")`);
                await select2Agregar(page, juecesInput, primerApellido);
            }
            log("Verificando intervinientes...");
            const yaSeleccionados = await page.evaluate(() =>
                Array.from(
                    document.querySelectorAll('#audiencia-inputintervinientes option[selected]')
                ).map(o => o.innerText.trim().toUpperCase())
            );

            const intervsInput = '#audiencia-inputintervinientes + span .select2-search__field';
            await page.waitForSelector(intervsInput, { visible: true, timeout: 5000 });

            for (const [, personas] of Object.entries(activeIntervinientes || {})) {
                const lista = Array.isArray(personas) ? personas : [personas];
                for (const persona of lista) {
                    const nombre = norm(typeof persona === 'object' ? persona.nombre : persona);
                    if (!nombre) continue;

                    const yaEsta = yaSeleccionados.some(s => s.includes(nombre));
                    if (yaEsta) {
                        log(`  → Ya presente: "${nombre}"`);
                        continue;
                    }

                    const primerApellido = nombre.split(',')[0].trim();
                    log(`  → Agregando: "${nombre}" (buscando por: "${primerApellido}")`);
                    await select2Agregar(page, intervsInput, primerApellido);
                }
            }

            log(`Completando bloque — fecha: ${fechaStr} | inicio: ${horaInicioStr} | fin: ${horaFinStr} | sala: ${sala}`);
            await page.waitForSelector('#bloque-0-fecha', { timeout: 5000 });

            await setDatepicker(page, 'bloque-0-fecha', fechaStr);
            log("  → Fecha seteada.");

            await setTimepicker(page, 'bloque-0-hora_inicio_programada', horaInicioStr);
            log("  → Hora inicio seteada.");

            await setTimepicker(page, 'bloque-0-hora_fin_programada', horaFinStr);
            log("  → Hora fin seteada.");

            log(`  → Seleccionando sala: "${activeSala}"`);
            await page.click('#bloque-0-id_sala + span .select2-selection--single');
            await page.waitForSelector('.select2-dropdown .select2-search__field', { visible: true, timeout: 5000 });
            await page.type('.select2-dropdown .select2-search__field', activeSala, { delay: 40 });
            await page.waitForSelector('.select2-results__option', { visible: true, timeout: 5000 });
            await page.keyboard.press('Enter');
            await new Promise(r => setTimeout(r, 400));
            log("  → Sala seteada.");
            log("Enviando formulario...");
            await page.waitForSelector('button[type="submit"].btn-success', { visible: true, timeout: 5000 });
            await page.click('button[type="submit"].btn-success');

            log("  → Esperando a que el formulario procese...");
            // Espera a navegar (éxito) o a que aparezca un mensaje de error sin navegar (falla)
            const resultadoSubmit = await Promise.race([
                page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 45000 }).then(() => ({ success: true })),
                page.waitForSelector('.form-group.has-error .help-block', { visible: true, timeout: 45000 })
                    .then(async el => {
                        const msgError = await page.evaluate(e => e.innerText, el);
                        return { success: false, error: msgError };
                    })
            ]);

            if (!resultadoSubmit.success) {
                log(`❌ Conflicto o Error de agendamiento detectado: ${resultadoSubmit.error}`);
                if (resultadoSubmit && !resultadoSubmit.success) {
                    // Retorna que al menos los documentos se subieron, pero el agendamiento y notificaciones fallaron
                    return { success: false, error: resultadoSubmit.error, documentosSubidos: true };
                }
            }
        }

        const urlResultante = page.url();
        if (action !== 'notificar-solo') {
            log(`✅ Agendamiento guardado. URL: ${urlResultante}`);
        }

        // ── 5. Crear la Notificación posterior a la agenda ──────────────────
        if (documentos && documentos.length > 0) {
            log(`Navegando a Pestaña Notificaciones...`);
            await page.waitForSelector('a[href="#notificaciones"][data-toggle="tab"]', { visible: true, timeout: 60000 });
            await page.click('a[href="#notificaciones"][data-toggle="tab"]');
            await new Promise(r => setTimeout(r, 600));
            
            // Agregamos una por una las notificaciones
            for (let i = 0; i < documentos.length; i++) {
                const doc = documentos[i];
                log(`Creando Notificación para: ${doc.descripcion}`);
                
                await page.waitForSelector('.btn-success[href^="/notificacion/create/"]', { visible: true, timeout: 60000 });
                await Promise.all([
                    page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 30000 }),
                    page.click('.btn-success[href^="/notificacion/create/"]'),
                ]);

                const isTemplateOnly = doc.isTemplateOnly || false;
                const templateName = isTemplateOnly ? doc.templateName : 'MODELO';

                log(`  → Cargando Plantilla ${templateName}...`);
                await page.waitForSelector('#notificacion-id_tipo_notificacion_template + span .select2-selection--single', { visible: true, timeout: 60000 });
                await page.click('#notificacion-id_tipo_notificacion_template + span .select2-selection--single');
                await page.waitForSelector('.select2-dropdown .select2-search__field', { visible: true, timeout: 5000 });
                await page.type('.select2-dropdown .select2-search__field', templateName, { delay: 40 });
                await page.waitForSelector('.select2-results__option--highlighted', { visible: true, timeout: 5000 }).catch(() => null);
                await page.keyboard.press('Enter');
                await new Promise(r => setTimeout(r, 800));

                if (isTemplateOnly) {
                    log(`  → Seleccionando Bloque (Fecha: ${doc.fechaAudiencia} ${doc.horaAudiencia})...`);
                    try {
                        await page.waitForSelector('#notificacion-id_bloque + span .select2-selection--single', { visible: true, timeout: 5000 });
                        await page.click('#notificacion-id_bloque + span .select2-selection--single');
                        await page.waitForSelector('.select2-results__option', { visible: true, timeout: 5000 });
                        
                        // Buscamos la opción que coincida con la fecha y hora
                        const targetTextMatch = `${doc.fechaAudiencia.trim()} ${doc.horaAudiencia.trim()}`.replace(/[\/\s:]/g, '');
                        const found = await page.evaluate((matchStr) => {
                            const results = Array.from(document.querySelectorAll('.select2-results__option'));
                            const target = results.find(el => el.textContent.replace(/[\/\s:]/g, '').includes(matchStr));
                            if (target) {
                                target.click();
                                return true;
                            }
                            return false;
                        }, targetTextMatch);

                        if (!found) {
                            log(`⚠️ No se encontró un bloque que coincida con ${doc.fechaAudiencia} ${doc.horaAudiencia}. Intentando seleccionar el primero disponible...`);
                            await page.keyboard.press('ArrowDown');
                            await page.keyboard.press('Enter');
                        }
                    } catch (err) {
                        log(`⚠️ Error al seleccionar bloque: ${err.message}`);
                    }
                    await new Promise(r => setTimeout(r, 600));
                }

                log(`  → Vaciando destinatarios predefinidos...`);
                await page.waitForSelector('#notificacion-personas + span .select2-selection--multiple', { visible: true, timeout: 10000 });
                while (true) {
                    const closeBtns = await page.$$('#notificacion-personas + span .select2-selection__choice__remove');
                    if (closeBtns.length === 0) break;
                    try {
                        await closeBtns[0].click();
                        await new Promise(r => setTimeout(r, 150));
                    } catch (err) { break; }
                }

                if (doc.personasAnotificar && Array.isArray(doc.personasAnotificar)) {
                    for (const persona of doc.personasAnotificar) {
                        log(`  → Agregando destinatario: ${persona}`);
                        await page.click('#notificacion-personas + span .select2-search__field');
                        await page.type('#notificacion-personas + span .select2-search__field', persona, { delay: 40 });
                        await page.waitForSelector('.select2-results__option--highlighted', { visible: true, timeout: 5000 }).catch(() => null);
                        await page.keyboard.press('Enter');
                        await new Promise(r => setTimeout(r, 600));
                    }
                }

                if (!isTemplateOnly) {
                    log(`  → Adjuntando doc: ${doc.descripcion}`);
                    await page.waitForSelector('#notificacion-documentos + span .select2-search__field', { visible: true, timeout: 10000 });
                    await page.click('#notificacion-documentos + span .select2-search__field');
                    await page.waitForSelector('.select2-results .select2-search__field', { visible: true, timeout: 5000 }).catch(() => null);
                    await page.type('#notificacion-documentos + span .select2-search__field', doc.descripcion, { delay: 40 });
                    await page.waitForSelector('.select2-results__option--highlighted', { visible: true, timeout: 5000 }).catch(() => null);
                    await page.keyboard.press('Enter');
                    await new Promise(r => setTimeout(r, 800));

                    const textoPlano = doc.textoPlano || '';
                    if (textoPlano.trim() !== '') {
                        log(`  → Pegando texto en cuerpo...`);
                        await page.waitForSelector('iframe#notificacion-texto_ifr', { visible: true, timeout: 10000 });
                        const frameElement = await page.$('iframe#notificacion-texto_ifr');
                        const frame = await frameElement.contentFrame();
                        await frame.evaluate((html) => {
                            const body = document.querySelector('body');
                            if (body) body.innerHTML = html;
                        }, textoPlano);
                    }
                } else {
                    // Flujo Generar Texto para Plantillas
                    log(`  → Iniciando flujo 'Generar Texto'...`);
                    try {
                        await page.waitForSelector('button[title="Generar Texto del Modelo"]', { visible: true, timeout: 10000 });
                        await page.click('button[title="Generar Texto del Modelo"]');
                        
                        log(`  → Esperando diálogo de generación...`);
                        await page.waitForSelector('.tox-dialog iframe', { visible: true, timeout: 60000 });
                        const dialogIframeHandle = await page.$('.tox-dialog iframe');
                        const dialogFrame = await dialogIframeHandle.contentFrame();

                        log(`  → Seleccionando Bloque en diálogo...`);
                        await dialogFrame.waitForSelector('#templatedynamicmodel-input_bloque', { visible: true, timeout: 10000 });
                        
                        const targetTextMatch = `${doc.fechaAudiencia.trim()} ${doc.horaAudiencia.trim()}`.replace(/[\/\s:]/g, '');
                        await dialogFrame.evaluate((matchStr) => {
                            const select = document.querySelector('#templatedynamicmodel-input_bloque');
                            if (select) {
                                const option = Array.from(select.options).find(opt => opt.text.replace(/[\/\s:]/g, '').includes(matchStr));
                                if (option) {
                                    select.value = option.value;
                                    select.dispatchEvent(new Event('change', { bubbles: true }));
                                } else {
                                    if (select.options.length > 1) {
                                        select.selectedIndex = 1;
                                        select.dispatchEvent(new Event('change', { bubbles: true }));
                                    }
                                }
                            }
                        }, targetTextMatch);
                        await new Promise(r => setTimeout(r, 800));

                        log(`  → Seleccionando Persona en diálogo...`);
                        await dialogFrame.waitForSelector('#select2-templatedynamicmodel-input_imputado-container', { visible: true, timeout: 10000 });
                        await dialogFrame.click('#select2-templatedynamicmodel-input_imputado-container');
                        
                        const personaToPick = (doc.personasAnotificar && doc.personasAnotificar[0]) || '';
                        if (personaToPick) {
                            await page.keyboard.type(personaToPick, { delay: 50 });
                            await new Promise(r => setTimeout(r, 1000));
                            await page.keyboard.press('Enter');
                        } else {
                            await page.keyboard.press('ArrowDown');
                            await page.keyboard.press('Enter');
                        }
                        await new Promise(r => setTimeout(r, 800));

                        log(`  → Ejecutando 'Generar Texto' (Verde)...`);
                        await dialogFrame.waitForSelector('.btn-success.btn-confirmar', { visible: true, timeout: 5000 });
                        
                        // Manejador para el alert de confirmación
                        const onDialog = async d => {
                            log(`  → Aceptando confirmación PUMA: ${d.message()}`);
                            await d.accept();
                        };
                        page.on('dialog', onDialog);
                        await dialogFrame.click('.btn-success.btn-confirmar');
                        await new Promise(r => setTimeout(r, 2000));
                        page.off('dialog', onDialog);

                        log(`  → Cerrando diálogo...`);
                        await page.click('.tox-button.tox-button--icon.tox-button--naked[title="Close"]');
                        await new Promise(r => setTimeout(r, 800));

                    } catch (err) {
                        log(`⚠️ Fallo en flujo Generar Texto: ${err.message}`);
                    }
                }

                log(`  → Confirmando Creación de Notificación...`);
                await page.waitForSelector('button[type="submit"].btn-success', { visible: true, timeout: 5000 });
                await Promise.all([
                    page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 40000 }),
                    page.click('button[type="submit"].btn-success'),
                ]);
                log(`✅ Notificación finalizada.`);
                
                // Si todavía quedan documentos por notificar, debemos reactivar la pestaña de Notificaciones
                if (i < documentos.length - 1) {
                    await page.waitForSelector('a[href="#notificaciones"][data-toggle="tab"]', { visible: true, timeout: 60000 });
                    await page.click('a[href="#notificaciones"][data-toggle="tab"]');
                    await new Promise(r => setTimeout(r, 600));
                }
            }

            // ── 6. Enviar a Notificar (Bulk send from table) ────────────────
            log(`Revisando tabla para Enviar a Notificar...`);
            await page.waitForSelector('a[href="#notificaciones"][data-toggle="tab"]', { visible: true, timeout: 15000 });
            await page.click('a[href="#notificaciones"][data-toggle="tab"]');
            
            let nextPagination = true;
            let pageIndex = 1;

            while (nextPagination) {
                log(`  → Revisando página ${pageIndex}...`);
                await page.waitForSelector('#view-grid-notificaciones-container table tbody', { visible: true, timeout: 20000 });
                await new Promise(r => setTimeout(r, 1000)); // esperamos a que el pjax cargue bien si lo hubiera

                const rows = await page.$$('#view-grid-notificaciones-container table tbody tr');
                let foundOld = false;
                let checkedCount = 0;

                for (const row of rows) {
                    try {
                        const dateText = await row.$eval('td[data-col-seq="6"]', td => td.innerText.trim());
                        if (!dateText || dateText === "(sin datos)") continue;

                        const [datePart, timePart] = dateText.split(' ');
                        const [d, m, y] = datePart.split('/');
                        const [H, M, S] = timePart.split(':');
                        const rowDate = new Date(y, m - 1, d, H, M, S);
                        const diffMins = (Date.now() - rowDate.getTime()) / 60000;
                        
                        // Validar si fue creada en los últimos 35 minutos (le damos un ligero margen a 30)
                        if (diffMins <= 35) { 
                            const isDisabled = await row.$eval('input.kv-row-checkbox', el => el.disabled).catch(() => true);
                            if (!isDisabled) {
                                await row.evaluate(el => {
                                    const cb = el.querySelector('input.kv-row-checkbox');
                                    if (cb && !cb.checked) cb.click();
                                });
                                checkedCount++;
                            }
                        } else {
                            foundOld = true;
                        }
                    } catch(e) {}
                }

                if (checkedCount > 0) {
                    log(`  → Marcadas ${checkedCount} notificaciones recientes, clickeando 'Enviar a Notificar'...`);
                    await page.click('#btn-notificar');
                    // Esperar unos segundos a que la petición via web sea enviada y la grilla se recargue
                    await new Promise(r => setTimeout(r, 4000));
                    await page.waitForSelector('#view-grid-notificaciones-container table tbody', { visible: true, timeout: 20000 }).catch(() => null);
                }

                if (foundOld) {
                    log(`  → Se encontró una notificación de hace > 30 mins. Fin del proceso.`);
                    nextPagination = false;
                } else {
                    const nextBtn = await page.$('.pagination li.next:not(.disabled) a');
                    if (nextBtn) {
                        log(`  → Avanzando a la siguiente página...`);
                        await nextBtn.click();
                        await new Promise(r => setTimeout(r, 2000));
                        pageIndex++;
                    } else {
                        nextPagination = false;
                    }
                }
            }
        }

        return { success: true, url: urlResultante };

    } catch (err) {
        log(`❌ Error: ${err.message}`);
        return { success: false, error: err.message };
    } finally {
        await browser.close();
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Rechazo / Anulación de Solicitud (flujo automatizado de 3 fases)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Genera un hash hex de 4 dígitos aleatorio.
 */
function generarHashHex4() {
    return Math.floor(Math.random() * 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Flujo automatizado de rechazo de solicitud en 3 fases:
 *   1. Sube PDF de rechazo oficial al legajo con estado "Procesal"
 *   2. Crea Notificación General, filtrando destinatarios por FISCAL (MPF) o DEFENSOR (Defensa)
 *   3. Anula la solicitud desde /solicitud, adjuntando el mismo PDF con nueva descripción
 *
 * @param {object} params
 * @param {string} params.linkLeg          URL del legajo
 * @param {string} params.linkSol          URL de la solicitud
 * @param {string} params.razonRechazo     Razón de rechazo (va en el cuerpo del doc)
 * @param {string} params.numeroLeg        Número de legajo (interno)
 * @param {string} [params.legajoFiscal]   Número de legajo fiscal (ej. "MPF-SJ-XXXXX-2024")
 * @param {string} [params.solicitante]    'MPF' | 'Defensa'
 * @param {string} params.fyhcreacion      Fecha/hora de creación de la solicitud
 * @param {Function} onProgress
 */
export async function rechazarSolicitud({
    linkLeg,
    linkSol,
    razonRechazo,
    numeroLeg,
    legajoFiscal,
    solicitante = 'MPF',
    fyhcreacion,
}, onProgress) {
    const log = (msg) => {
        console.log(`[rechazarSolicitud] ${msg}`);
        if (onProgress) onProgress(msg);
    };

    // El filtro de destinatarios en PUMA según institución
    const filtroDestinatario = solicitante === 'Defensa' ? 'DEFENSOR' : 'FISCAL';
    const textoSolicitante   = solicitante === 'Defensa' ? 'DEFENSA' : 'MPF';

    // ── Resolver URL base del sistema ─────────────────────────────────────────
    const baseUrl = (() => {
        try {
            const ref = linkLeg || linkSol || '';
            const u = new URL(ref);
            return `${u.protocol}//${u.host}`;
        } catch {
            return 'http://10.107.1.184:8092';
        }
    })();

    const hash1 = generarHashHex4();
    const hash2 = generarHashHex4();
    const legajoRef  = legajoFiscal || String(numeroLeg);
    const descDoc1   = `${legajoRef}-${hash1}`;   // descripción documento de notificación
    const descDoc2   = `${legajoRef}-${hash2}`;   // descripción documento de anulación (distinto)

    // ── Generar PDF oficial usando descargarPdfNotificacion ───────────────────
    log('Generando PDF oficial de rechazo...');
    let pdfBuffer;
    try {
        const { descargarPdfNotificacion } = await import('../../../utils/notificacionesAgendamiento.js');
        const pdfResult = await descargarPdfNotificacion(
            'rechazarSolicitud',
            {
                legajoFiscal: legajoRef,
                solicitante:  textoSolicitante,
                razonRechazo: razonRechazo,
            },
            true  // returnBuffer = true → devuelve { buffer, textoPlano }
        );
        pdfBuffer = pdfResult.buffer;
        log('PDF generado correctamente.');
    } catch (pdfErr) {
        log(`⚠ Error generando PDF oficial (${pdfErr.message}), usando PDF de respaldo...`);
        // Fallback: PDF mínimo de texto plano
        const streamContent = `BT /F1 11 Tf 50 780 Td (RECHAZO) Tj T* (Legajo: ${legajoRef}) Tj T* (Razon: ${razonRechazo}) Tj ET`;
        const pdfParts = [
            '%PDF-1.4\n',
            '1 0 obj<</Type /Catalog /Pages 2 0 R>>\nendobj\n',
            '2 0 obj<</Type /Pages /Kids[3 0 R] /Count 1>>\nendobj\n',
            '3 0 obj<</Type /Page /Parent 2 0 R /MediaBox[0 0 595 842] /Contents 4 0 R /Resources<</Font<</F1 5 0 R>>>>>>\nendobj\n',
            `4 0 obj<</Length ${streamContent.length}>>\nstream\n${streamContent}\nendstream\nendobj\n`,
            '5 0 obj<</Type /Font /Subtype /Type1 /BaseFont /Helvetica>>\nendobj\n',
            'xref\n0 6\ntrailer<</Size 6 /Root 1 0 R>>\nstartxref\n0\n%%EOF'
        ].join('');
        pdfBuffer = Buffer.from(pdfParts, 'utf-8');
    }

    const browser = await puppeteer.launch({
        headless: false,
        executablePath: getBrowserPath(),
        slowMo: 50,
        args: ['--window-size=1280,720', '--no-sandbox', '--disable-setuid-sandbox', '--disable-quic'],
        defaultViewport: { width: 1280, height: 720 },
    });

    const page = (await browser.pages())[0] || await browser.newPage();

    const os   = (await import('os')).default;
    const fs   = (await import('fs/promises')).default;
    const path = (await import('path')).default;

    const tmpDir  = os.tmpdir();
    const tmpPdf1 = path.join(tmpDir, `rechazo_notif_${Date.now()}.pdf`);
    const tmpPdf2 = path.join(tmpDir, `rechazo_anul_${Date.now() + 1}.pdf`);
    await fs.writeFile(tmpPdf1, pdfBuffer);
    await fs.writeFile(tmpPdf2, pdfBuffer);

    try {
        // ── LOGIN ──────────────────────────────────────────────────────────────
        log('Iniciando login...');
        await login(page);
        log('Login OK.');

        // ═══════════════════════════════════════════════════════════════════════
        // FASE 1: Subir PDF de rechazo al legajo con estado "Procesal"
        // ═══════════════════════════════════════════════════════════════════════
        log(`[Fase 1] Navegando al legajo: ${linkLeg}`);
        await page.goto(linkLeg, { waitUntil: 'domcontentloaded', timeout: 30000 });

        log('[Fase 1] Abriendo pestaña Documentos...');
        await page.waitForSelector('a[href="#documentos"][data-toggle="tab"]', { visible: true, timeout: 15000 });
        await page.click('a[href="#documentos"][data-toggle="tab"]');
        await page.waitForSelector('.modalButtonAgregarDocumento', { visible: true, timeout: 15000 });

        log('[Fase 1] Abriendo modal de carga de documento...');
        await page.click('.modalButtonAgregarDocumento');
        await page.waitForSelector('#documento-form-id', { visible: true, timeout: 15000 });
        await new Promise(r => setTimeout(r, 600));

        log('[Fase 1] Subiendo PDF...');
        await page.waitForSelector('input[type="file"][id="documento-documento"]', { timeout: 10000 });
        const fileInput1 = await page.$('input[type="file"][id="documento-documento"]');
        await fileInput1.uploadFile(tmpPdf1);
        await page.waitForFunction(
            () => { const el = document.querySelector('.file-caption-name'); return el && el.value.length > 0; },
            { timeout: 10000 }
        ).catch(() => null);

        log('[Fase 1] Seleccionando estado "Procesal"...');
        await page.click('#documento-estado + span .select2-selection--single');
        await page.waitForSelector('.select2-dropdown .select2-search__field', { visible: true, timeout: 5000 });
        await page.type('.select2-dropdown .select2-search__field', 'Procesal', { delay: 40 });
        await page.waitForSelector('.select2-results__option', { visible: true, timeout: 5000 });
        await page.keyboard.press('Enter');
        await new Promise(r => setTimeout(r, 300));

        log(`[Fase 1] Ingresando descripción: ${descDoc1}`);
        await page.type('#documento-descripcion', descDoc1, { delay: 20 });
        await new Promise(r => setTimeout(r, 200));

        log('[Fase 1] Guardando documento...');
        await page.click('#documento-form-id [id="boton-submit"]');
        await page.waitForFunction(
            () => !document.querySelector('.modal.in #documento-form-id'),
            { timeout: 30000 }
        ).catch(() => null);
        await new Promise(r => setTimeout(r, 800));
        log('[Fase 1] ✅ Documento subido: ' + descDoc1);

        // ═══════════════════════════════════════════════════════════════════════
        // FASE 2: Crear Notificación General en el legajo
        // ═══════════════════════════════════════════════════════════════════════
        log('[Fase 2] Abriendo pestaña Notificaciones...');
        await page.waitForSelector('a[href="#notificaciones"][data-toggle="tab"]', { visible: true, timeout: 15000 });
        await page.click('a[href="#notificaciones"][data-toggle="tab"]');
        await new Promise(r => setTimeout(r, 600));

        log('[Fase 2] Clickeando "Crear notificación"...');
        await page.waitForSelector('.btn-success[href^="/notificacion/create/"]', { visible: true, timeout: 15000 });
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }),
            page.click('.btn-success[href^="/notificacion/create/"]'),
        ]);

        log('[Fase 2] Seleccionando tipo "NOTIFICACIÓN GENERAL"...');
        await page.waitForSelector('#notificacion-id_tipo_notificacion_template + span .select2-selection--single', { visible: true, timeout: 15000 });
        await page.click('#notificacion-id_tipo_notificacion_template + span .select2-selection--single');
        await page.waitForSelector('.select2-dropdown .select2-search__field', { visible: true, timeout: 5000 });
        await page.type('.select2-dropdown .select2-search__field', 'NOTIFICACION GENERAL', { delay: 40 });
        await page.waitForSelector('.select2-results__option--highlighted', { visible: true, timeout: 8000 }).catch(() => null);
        await page.keyboard.press('Enter');
        await new Promise(r => setTimeout(r, 800));

        log(`[Fase 2] Eliminando personas que NO contienen "${filtroDestinatario}"...`);
        await page.waitForSelector('#notificacion-personas + span .select2-selection--multiple', { visible: true, timeout: 10000 });
        let attempts = 0;
        while (attempts < 30) {
            const textos = await page.evaluate(() =>
                Array.from(document.querySelectorAll('#notificacion-personas + span .select2-selection__choice')).map(
                    el => (el.getAttribute('title') || el.textContent || '').toUpperCase().trim()
                )
            );
            if (textos.length === 0) break;
            const noMatchIdx = textos.findIndex(t => !t.includes(filtroDestinatario));
            if (noMatchIdx === -1) break; // todos coinciden con el filtro
            const removeBtn = await page.$(
                `#notificacion-personas + span .select2-selection__choice:nth-child(${noMatchIdx + 1}) .select2-selection__choice__remove`
            );
            if (removeBtn) {
                await removeBtn.click();
                await new Promise(r => setTimeout(r, 200));
            } else {
                break;
            }
            attempts++;
        }

        log('[Fase 2] Adjuntando documento ' + descDoc1 + '...');
        await page.waitForSelector('#notificacion-documentos + span .select2-search__field', { visible: true, timeout: 10000 });
        await page.click('#notificacion-documentos + span .select2-search__field');
        await page.type('#notificacion-documentos + span .select2-search__field', descDoc1, { delay: 40 });
        await page.waitForSelector('.select2-results__option--highlighted', { visible: true, timeout: 5000 }).catch(() => null);
        await page.keyboard.press('Enter');
        await new Promise(r => setTimeout(r, 600));

        log('[Fase 2] Pegando texto oficial de rechazo en el cuerpo...');
        try {
            await page.waitForSelector('iframe#notificacion-texto_ifr', { visible: true, timeout: 8000 });
            const frameEl = await page.$('iframe#notificacion-texto_ifr');
            const frame = await frameEl.contentFrame();
            await frame.evaluate((sol, razon) => {
                const body = document.querySelector('body');
                if (body) {
                    body.innerHTML = `<p>\tAtento a que desde el ${sol} solicitan Audiencia, y que dicho pedido se encuentra incompleto ya que carece de ${razon}, imposibilitando a esta Oficina Judicial Penal realizar la gestión adecuada de lo solicitado, es que se procede a cancelar dicha solicitud conforme lo establecido en Acuerdo de Superintendencia 05/2024. Subsanado o completada la información faltante proceder a realizar nuevamente el pedido a través del Sistema Informático.</p>`;
                }
            }, textoSolicitante, razonRechazo);
        } catch (e) {
            log('[Fase 2] ⚠ No se pudo cargar el iframe del cuerpo: ' + e.message);
        }

        log('[Fase 2] Confirmando creación de notificación...');
        await page.waitForSelector('button[type="submit"].btn-success', { visible: true, timeout: 5000 });
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 40000 }),
            page.click('button[type="submit"].btn-success'),
        ]);

        log('[Fase 2] Notificación creada. Enviando desde tabla...');
        await page.waitForSelector('a[href="#notificaciones"][data-toggle="tab"]', { visible: true, timeout: 15000 });
        await page.click('a[href="#notificaciones"][data-toggle="tab"]');
        await new Promise(r => setTimeout(r, 800));
        await page.waitForSelector('#view-grid-notificaciones-container table tbody', { visible: true, timeout: 20000 });
        await new Promise(r => setTimeout(r, 1000));

        const rows = await page.$$('#view-grid-notificaciones-container table tbody tr');
        let checkedCount = 0;
        for (const row of rows) {
            try {
                const dateText = await row.$eval('td[data-col-seq="6"]', td => td.innerText.trim()).catch(() => '');
                if (!dateText || dateText === '(sin datos)') continue;
                const [datePart, timePart] = dateText.split(' ');
                const [d, m, y] = datePart.split('/');
                const [H, M, S] = (timePart || '0:0:0').split(':');
                const rowDate = new Date(y, m - 1, d, H, M, S);
                if ((Date.now() - rowDate.getTime()) / 60000 <= 35) {
                    const isDisabled = await row.$eval('input.kv-row-checkbox', el => el.disabled).catch(() => true);
                    if (!isDisabled) {
                        await row.evaluate(el => { const cb = el.querySelector('input.kv-row-checkbox'); if (cb && !cb.checked) cb.click(); });
                        checkedCount++;
                    }
                }
            } catch { }
        }
        if (checkedCount > 0) {
            log(`[Fase 2] Enviando ${checkedCount} notificación/es...`);
            await page.click('#btn-notificar');
            await new Promise(r => setTimeout(r, 4000));
        }
        log('[Fase 2] ✅ Notificación general enviada.');

        // ═══════════════════════════════════════════════════════════════════════
        // FASE 3: Anular la Solicitud en /solicitud
        // ═══════════════════════════════════════════════════════════════════════
        const urlSolicitudes = `${baseUrl}/solicitud`;
        log(`[Fase 3] Navegando a: ${urlSolicitudes}`);
        await page.goto(urlSolicitudes, { waitUntil: 'domcontentloaded', timeout: 30000 });

        log(`[Fase 3] Filtrando por legajo "${numeroLeg}"...`);
        await new Promise(r => setTimeout(r, 800));
        const filterInputs = await page.$$('#grid-solicitud-filters input[type="text"], input[data-key]');
        if (filterInputs.length > 0) {
            await filterInputs[0].click({ clickCount: 3 });
            await filterInputs[0].type(String(numeroLeg), { delay: 40 });
            await filterInputs[0].press('Enter');
        }

        // Esperar carga completa
        await new Promise(r => setTimeout(r, 1500));
        let loadAttempts = 0;
        while (loadAttempts < 10) {
            const loader = await page.$('.kv-loader').catch(() => null);
            if (!loader) break;
            await new Promise(r => setTimeout(r, 500));
            loadAttempts++;
        }
        await new Promise(r => setTimeout(r, 600));

        log(`[Fase 3] Buscando fila con fecha coincidente (${fyhcreacion})...`);
        const normFyh = (fyhcreacion || '').replace(/[-/\s:]/g, '').substring(0, 12);

        let anularBtn = null;
        const tbodyRows = await page.$$('table tbody tr');

        for (const tr of tbodyRows) {
            try {
                const rowHtml = await tr.evaluate(el => el.innerText || '');
                const normCell = rowHtml.replace(/[-/\s:]/g, '');
                if (normFyh && normCell.includes(normFyh.substring(0, 8))) {
                    const btn = await tr.$('i.fa-times').catch(() => null);
                    if (btn) { anularBtn = btn; break; }
                }
            } catch { }
        }

        if (!anularBtn) {
            log('[Fase 3] ⚠ No se encontró fila con fecha exacta, usando primera disponible...');
            anularBtn = await page.$('table tbody i.fa-times').catch(() => null);
        }

        if (!anularBtn) {
            throw new Error('No se encontró el botón de anulación (fa-times) en la tabla de solicitudes.');
        }

        log('[Fase 3] Clickeando botón de anulación...');
        const anularLink = await page.evaluateHandle(el => el.closest('a') || el.closest('button') || el, anularBtn);
        await anularLink.click();
        await new Promise(r => setTimeout(r, 800));

        log('[Fase 3] Esperando formulario #solicitud-form-id...');
        await page.waitForSelector('#solicitud-form-id', { visible: true, timeout: 15000 });
        await new Promise(r => setTimeout(r, 400));

        log(`[Fase 3] Ingresando motivo: ${razonRechazo}`);
        const obsEl = await page.$('#solicitud-observacion').catch(() => null)
            || await page.$('#solicitud-form-id textarea').catch(() => null);
        if (obsEl) {
            await obsEl.click({ clickCount: 3 });
            await obsEl.type(razonRechazo, { delay: 20 });
        }

        log('[Fase 3] Subiendo PDF de anulación...');
        const fileInput2 = await page.$('#solicitud-form-id input[type="file"]').catch(() => null);
        if (fileInput2) {
            await fileInput2.uploadFile(tmpPdf2);
            await new Promise(r => setTimeout(r, 600));
        }

        const descInput2 = await page.$('#solicitud-form-id input[id*="descripcion"]').catch(() => null)
            || await page.$('#solicitud-form-id input[name*="descripcion"]').catch(() => null);
        if (descInput2) {
            await descInput2.click({ clickCount: 3 });
            await descInput2.type(descDoc2, { delay: 20 });
        }

        log('[Fase 3] Confirmando anulación (#btnAnular)...');
        await page.waitForSelector('#btnAnular', { visible: true, timeout: 10000 });
        await page.click('#btnAnular');
        await Promise.race([
            page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }),
            new Promise(r => setTimeout(r, 5000))
        ]).catch(() => null);
        log('[Fase 3] ✅ Anulación ejecutada.');

        log('Retornando al legajo...');
        await page.goto(linkLeg, { waitUntil: 'domcontentloaded', timeout: 30000 });
        log('✅ Flujo de rechazo completado con éxito.');

        return { success: true };
    } catch (err) {
        log(`❌ Error en rechazarSolicitud: ${err.message}`);
        return { success: false, error: err.message };
    } finally {
        await browser.close();
        try { await fs.unlink(tmpPdf1); } catch { }
        try { await fs.unlink(tmpPdf2); } catch { }
    }
}
