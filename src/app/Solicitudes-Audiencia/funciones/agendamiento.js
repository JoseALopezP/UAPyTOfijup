import puppeteer from 'puppeteer';

const LOGIN_URL = "http://10.107.1.184:8092/site/login?urlBack=http%3A%2F%2F10.107.1.184%3A8094%2F";

async function login(page) {
    await page.goto(LOGIN_URL, { waitUntil: "networkidle2" });
    await page.type("#loginform-username", "20423341980");
    await page.type("#loginform-password", "Marzo24");
    await page.click('button[name="login-button"]');
    await page.waitForSelector('a[href="/audiencia/agenda"]', { visible: true, timeout: 15000 });
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
    await page.goto(linkLeg, { waitUntil: 'networkidle2', timeout: 30000 });

    // El tab "Partes" es el activo por defecto — verificar que esté cargado
    await page.waitForSelector('.modalButtonAgregarParte', { visible: true, timeout: 15000 });

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

export async function agendarAudiencia({ linkSol, tipo, jueces, intervinientes, fyhInicio, fyhFin, sala, linkLeg, agregar = [] }, onProgress) {
    const log = (msg) => {
        console.log(`[agendamiento] ${msg}`);
        if (onProgress) onProgress(msg);
    };

    const norm = (str) => str?.trim().toUpperCase().replace(/\s+/g, ' ') ?? '';
    const tipos = (Array.isArray(tipo) ? tipo : (tipo ? [tipo] : [])).map(norm);

    // Parsear fecha y horas  "DD/MM/YYYY HH:mm" → fecha + horaInicio / horaFin
    const [fechaStr, horaInicioStr] = fyhInicio.split(' ');
    const horaFinStr = fyhFin.split(' ')[1];

    const browser = await puppeteer.launch({
        headless: false,
        args: ["--window-size=1280,720", "--no-sandbox", "--disable-setuid-sandbox"],
        defaultViewport: { width: 1280, height: 720 },
    });

    const page = (await browser.pages())[0] || await browser.newPage();

    try {
        // ── 1. Login ──────────────────────────────────────────────────────
        log("Iniciando login...");
        await login(page);
        log("Login OK.");

        // ── 2. Agregar partes faltantes al legajo (si las hay) ────────────
        if (linkLeg && agregar && agregar.length > 0) {
            await agregarPartesAlLegajo(page, linkLeg, agregar, log);
        }

        // ── 2. Navegar a la solicitud ─────────────────────────────────────
        log(`Navegando a la solicitud: ${linkSol}`);
        await page.goto(linkSol, { waitUntil: "networkidle2", timeout: 30000 });
        log("Solicitud cargada.");

        // ── 3. Click en "Agendar" ─────────────────────────────────────────
        log("Buscando botón Agendar...");
        await page.waitForSelector('a[title="Agendar"]', { visible: true, timeout: 15000 });
        await Promise.all([
            page.waitForNavigation({ waitUntil: "networkidle2", timeout: 30000 }),
            page.click('a[title="Agendar"]'),
        ]);
        log("Calendario cargado.");

        // ── 4. Click en el primer día del calendario ──────────────────────
        log("Clickeando en el primer día del calendario...");
        await page.waitForSelector('thead tr td.fc-day-top', { visible: true, timeout: 15000 });
        await Promise.all([
            page.waitForNavigation({ waitUntil: "networkidle2", timeout: 30000 }),
            page.click('thead tr td.fc-day-top'),
        ]);
        log("Formulario de agendamiento cargado.");

        await page.waitForSelector('#dynamic-form', { visible: true, timeout: 15000 });

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

        // ════════════════════════════════════════════════════════════════════
        // JUECES
        // ════════════════════════════════════════════════════════════════════
        log(`Agregando ${(jueces || []).length} juez/ces...`);
        const juecesInput = '.group-audiencia-inputjueces .select2-search__field';
        await page.waitForSelector(juecesInput, { visible: true, timeout: 5000 });

        for (const juez of (jueces || [])) {
            // Usar el primer apellido para que el autocomplete sea más preciso
            const primerApellido = juez.split(',')[0].trim();
            log(`  → "${juez}" (buscando por: "${primerApellido}")`);
            await select2Agregar(page, juecesInput, primerApellido);
        }

        // ════════════════════════════════════════════════════════════════════
        // INTERVINIENTES
        // ════════════════════════════════════════════════════════════════════
        log("Verificando intervinientes...");

        // Leer los ya seleccionados (tienen selected en el <select> oculto)
        const yaSeleccionados = await page.evaluate(() =>
            Array.from(
                document.querySelectorAll('#audiencia-inputintervinientes option[selected]')
            ).map(o => o.innerText.trim().toUpperCase())
        );

        const intervsInput = '#audiencia-inputintervinientes + span .select2-search__field';
        await page.waitForSelector(intervsInput, { visible: true, timeout: 5000 });

        for (const [, personas] of Object.entries(intervinientes || {})) {
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

        // ════════════════════════════════════════════════════════════════════
        // BLOQUE: fecha, hora inicio, hora fin, sala
        // ════════════════════════════════════════════════════════════════════
        log(`Completando bloque — fecha: ${fechaStr} | inicio: ${horaInicioStr} | fin: ${horaFinStr} | sala: ${sala}`);
        await page.waitForSelector('#bloque-0-fecha', { timeout: 5000 });

        await setDatepicker(page, 'bloque-0-fecha', fechaStr);
        log("  → Fecha seteada.");

        await setTimepicker(page, 'bloque-0-hora_inicio_programada', horaInicioStr);
        log("  → Hora inicio seteada.");

        await setTimepicker(page, 'bloque-0-hora_fin_programada', horaFinStr);
        log("  → Hora fin seteada.");

        // Sala — select2 single: click en la selección para abrir, buscar y Enter
        log(`  → Seleccionando sala: "${sala}"`);
        await page.click('#bloque-0-id_sala + span .select2-selection--single');
        await page.waitForSelector('.select2-dropdown .select2-search__field', { visible: true, timeout: 5000 });
        await page.type('.select2-dropdown .select2-search__field', sala, { delay: 40 });
        await page.waitForSelector('.select2-results__option', { visible: true, timeout: 5000 });
        await page.keyboard.press('Enter');
        await new Promise(r => setTimeout(r, 400));
        log("  → Sala seteada.");
        log("Enviando formulario...");
        await page.waitForSelector('button[type="submit"].btn-success', { visible: true, timeout: 5000 });
        await Promise.all([
            page.waitForNavigation({ waitUntil: "networkidle2", timeout: 30000 }),
            page.click('button[type="submit"].btn-success'),
        ]);

        const urlResultante = page.url();
        log(`✅ Agendamiento guardado. URL: ${urlResultante}`);

        return { success: true, url: urlResultante };

    } catch (err) {
        log(`❌ Error: ${err.message}`);
        return { success: false, error: err.message };
    } finally {
        await browser.close();
    }
}
