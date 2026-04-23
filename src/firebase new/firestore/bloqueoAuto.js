import puppeteer from "puppeteer";
import { getBrowserPath } from "../../utils/browserPath.js";

const LOGIN_URL = "http://10.107.1.184:8092/site/login?urlBack=http%3A%2F%2F10.107.1.184%3A8094%2F";
const FORM_URL = "http://10.107.1.184:8094/bloqueo-persona/create";

// ── Login ─────────────────────────────────────────────────────────────────────
async function login(page) {
    page.setDefaultTimeout(60000);
    page.setDefaultNavigationTimeout(60000);
    await page.goto(LOGIN_URL, { waitUntil: "networkidle2" });
    await page.$eval("#loginform-username", el => el.value = "20423341980");
    await page.$eval("#loginform-password", el => el.value = "Marzo24");
    await page.click('button[name="login-button"]');
    await page.waitForSelector('a[href="/audiencia/agenda"]', { visible: true, timeout: 60000 });
    console.log("   ✓ Login exitoso.");
}

// ── Llenar y enviar para UN período ──────────────────────────────────────────
async function llenarYEnviar(page, fixed, periodo, index, total) {
    console.log(`\n[${index + 1}/${total}] Período: ${periodo.desde} → ${periodo.hasta}`);

    await page.goto(FORM_URL, { waitUntil: "networkidle2" });

    // Helper para clickear select2 fidedignamente (Sólo para Tipo Persona según solicitud)
    const select2UiClick = async (selectId, value) => {
        const arrowSel = `#${selectId} + span.select2 .select2-selection__arrow`;
        await page.waitForSelector(arrowSel, { visible: true, timeout: 15000 });
        await page.click(arrowSel);
        
        await page.waitForSelector('.select2-results__option', { visible: true, timeout: 10000 });
        await page.evaluate((id, val) => {
            const nativeOpt = document.querySelector(`#${id} option[value="${val}"]`);
            if (!nativeOpt) return;
            const textToFind = nativeOpt.textContent.trim().toLowerCase();

            const lis = document.querySelectorAll('.select2-results__option');
            for (const li of lis) {
                if (li.textContent.trim().toLowerCase() === textToFind) {
                    li.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
                    li.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window }));
                    break;
                }
            }

            const origSelect = document.getElementById(id);
            if (origSelect) {
                origSelect.value = val;
                origSelect.dispatchEvent(new Event("change", { bubbles: true }));
                if (typeof window.jQuery !== "undefined") {
                    window.jQuery(`#${id}`).trigger("change");
                }
            }
        }, selectId, value);
    };

    // 1. Tipo Persona (Manual click select)
    await select2UiClick('bloqueopersona-tipo_persona', fixed.tipoPersona);

    await new Promise(r => setTimeout(r, 600)); // Espera normal para Krajee AJAX

    // Esperar a que desaparezca el "Loading..." y se inyecte la opción de Persona
    await page.waitForFunction((val) => {
        const el = document.getElementById("bloqueopersona-id_persona");
        if (!el) return false;
        const isLoading = Array.from(el.options).some(opt => opt.text.includes("Loading"));
        return !isLoading && el.querySelector(`option[value="${val}"]`);
    }, { timeout: 15000 }, fixed.idPersona);
    await new Promise(r => setTimeout(r, 200));

    // 2. Persona (Evaluate JS, como se venía haciendo)
    await page.evaluate((val) => {
        const sel = document.getElementById("bloqueopersona-id_persona");
        if (sel) {
            sel.value = val;
            sel.dispatchEvent(new Event("change", { bubbles: true }));
        }
    }, fixed.idPersona);

    await new Promise(r => setTimeout(r, 600)); // Espera normal para Krajee AJAX

    // Esperar a que el option del Motivo se cargue y desaparezca el "Loading..."
    await page.waitForFunction((val) => {
        const el = document.getElementById("bloqueopersona-id_motivo_bloqueo");
        if (!el) return false;
        const isLoading = Array.from(el.options).some(opt => opt.text.includes("Loading"));
        return !isLoading && el.querySelector(`option[value="${val}"]`);
    }, { timeout: 15000 }, fixed.idMotivo);
    await new Promise(r => setTimeout(r, 200));

    // 3. Motivo Bloqueo (Evaluate JS)
    await page.evaluate((val) => {
        const sel = document.getElementById("bloqueopersona-id_motivo_bloqueo");
        if (sel) {
            sel.value = val;
            sel.dispatchEvent(new Event("change", { bubbles: true }));
        }
    }, fixed.idMotivo);

    // 4. Período — hidden inputs del daterangepicker
    await page.evaluate((p) => {
        const visible = document.getElementById("bloqueopersona-rango_kvdate");
        if (visible) visible.value = `${p.desde} - ${p.hasta}`;
        const start = document.getElementById("bloqueopersona-rango_kvdate-start");
        const end = document.getElementById("bloqueopersona-rango_kvdate-end");
        if (start) start.value = p.desde;
        if (end) end.value = p.hasta;
    }, periodo);

    // 5. Observaciones (Escritura instantánea)
    await page.evaluate((obs) => {
        const el = document.getElementById("bloqueopersona-observaciones");
        if (el) {
            el.value = obs;
            el.dispatchEvent(new Event("input", { bubbles: true }));
        }
    }, fixed.observaciones || "");

    // 6. Re-inyectar hora justo antes del submit por si el daterangepicker los pisó
    await page.evaluate((p) => {
        const visible = document.getElementById("bloqueopersona-rango_kvdate");
        if (visible) visible.value = `${p.desde} - ${p.hasta}`;
        const start = document.getElementById("bloqueopersona-rango_kvdate-start");
        const end = document.getElementById("bloqueopersona-rango_kvdate-end");
        if (start) start.value = p.desde;
        if (end) end.value = p.hasta;
    }, periodo);

    // 7. Submit — espera redirect a /bloqueo-persona
    await Promise.all([
        page.waitForNavigation({ waitUntil: "networkidle2", timeout: 30000 }),
        page.click('button[type="submit"]'),
    ]);

    const finalUrl = page.url();

    // Si el form falló y volvió a /create, leer el help-block con el motivo
    if (finalUrl.includes("/bloqueo-persona/create")) {
        let motivo = "Error de validación del formulario";
        try {
            const helpTexts = await page.$$eval(".help-block", els =>
                els.map(el => el.textContent.trim()).filter(t => t.length > 0)
            );
            if (helpTexts.length > 0) motivo = helpTexts.join(" | ");
        } catch { /* ignorar */ }
        throw new Error(motivo);
    }

    if (!finalUrl.includes("/bloqueo-persona")) {
        throw new Error(`Redirect inesperado: ${finalUrl}`);
    }
    console.log(`   ✓ Creado. Redirigido a: ${finalUrl}`);
}

// ── Helper: genera períodos desde array de strings ────────────────────────────
// Formato esperado: "DD/MM/AAAA | HH:MM - HH:MM"
// Ejemplo:          "09/03/2026 | 15:00 - 18:00"
export function parsearBloques(bloques) {
    return bloques.map((bloque) => {
        const [fechaPart, horaPart] = bloque.split("|").map((s) => s.trim());
        const [horaDesde, horaHasta] = horaPart.split("-").map((s) => s.trim());
        return {
            desde: `${fechaPart} ${horaDesde}:00`,
            hasta: `${fechaPart} ${horaHasta}:00`,
        };
    });
}

// ── Helper: genera períodos (por rango de meses) ──────────────────────────────
export function generarPeriodos(anio, mesInicio, mesFin, diasSemana, horaDesde, horaHasta) {
    const pad = (n) => String(n).padStart(2, "0");
    const formatFecha = (d, hora) =>
        `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${hora}`;

    const periodos = [];
    const cursor = new Date(anio, mesInicio - 1, 1);
    const fin = new Date(anio, mesFin, 1);

    while (cursor < fin) {
        if (diasSemana.includes(cursor.getDay())) {
            periodos.push({
                desde: formatFecha(cursor, horaDesde),
                hasta: formatFecha(cursor, horaHasta),
            });
        }
        cursor.setDate(cursor.getDate() + 1);
    }
    return periodos;
}

// ── Función principal exportada ───────────────────────────────────────────────
/**
 * @param {Object} fixed
 * @param {string} fixed.tipoPersona   - "juez" | "fiscal" | "defensor" | "psicologo_gesell"
 * @param {string} fixed.idPersona     - UUID del <option> de Persona
 * @param {string} fixed.idMotivo      - UUID del <option> de Motivo Bloqueo
 * @param {string} [fixed.observaciones]
 * @param {Array<{desde:string, hasta:string}>} periodos - Formato "dd/mm/yyyy HH:mm:ss"
 */
export async function bloqueoMasivoAuto(fixed, periodos, onEvent = null) {
    const notify = (data) => { try { if (onEvent) onEvent(data); } catch { /* ignorar */ } };
    const errores = [];
    let exitosos = 0;

    const browser = await puppeteer.launch({
        headless: false,
        executablePath: getBrowserPath(),
        slowMo: 60,
        args: ["--window-size=1280,720", "--no-sandbox", "--disable-setuid-sandbox", "--disable-quic"],
        defaultViewport: { width: 1280, height: 720 },
    });
    const page = (await browser.pages())[0] || await browser.newPage();

    try {
        await login(page);

        for (let i = 0; i < periodos.length; i++) {
            const bloqueLabel = `${periodos[i].desde} → ${periodos[i].hasta}`;
            let intentos = 0;
            let exito = false;
            let ultimoError = "";

            while (intentos < 3) {
                try {
                    await llenarYEnviar(page, fixed, periodos[i], i, periodos.length);
                    exito = true;
                    break;
                } catch (err) {
                    intentos++;
                    ultimoError = err.message;
                    console.warn(`   ⚠️  Intento ${intentos}/3: ${err.message}`);
                    if (intentos >= 3) console.error(`   ❌ Período saltado.`);
                    else await new Promise(r => setTimeout(r, 1500));
                }
            }

            if (exito) {
                exitosos++;
            } else {
                errores.push({ bloque: bloqueLabel, motivo: ultimoError });
                notify({ type: "block_error", bloque: bloqueLabel, motivo: ultimoError });
            }

            notify({ type: "progress", index: i + 1, total: periodos.length, exitosos, erroresCount: errores.length });
        }

        console.log("\n✅ Todos los períodos fueron procesados.");
        notify({ type: "done", exitosos, errores });
    } finally {
        await browser.close();
    }

    return { exitosos, errores };
}
