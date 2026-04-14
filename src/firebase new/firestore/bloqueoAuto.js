import puppeteer from "puppeteer";
import { getBrowserPath } from "../../utils/browserPath.js";

const LOGIN_URL = "http://10.107.1.184:8092/site/login?urlBack=http%3A%2F%2F10.107.1.184%3A8094%2F";
const FORM_URL = "http://10.107.1.184:8094/bloqueo-persona/create";

// ── Login ─────────────────────────────────────────────────────────────────────
async function login(page) {
    await page.goto(LOGIN_URL, { waitUntil: "networkidle2" });
    await page.type("#loginform-username", "20423341980");
    await page.type("#loginform-password", "Marzo24");
    await page.click('button[name="login-button"]');
    await page.waitForSelector('a[href="/audiencia/agenda"]', { visible: true, timeout: 15000 });
    console.log("   ✓ Login exitoso.");
}

// ── Llenar y enviar para UN período ──────────────────────────────────────────
async function llenarYEnviar(page, fixed, periodo, index, total) {
    console.log(`\n[${index + 1}/${total}] Período: ${periodo.desde} → ${periodo.hasta}`);

    await page.goto(FORM_URL, { waitUntil: "networkidle2" });

    // 1. Tipo Persona (Select2)
    await page.evaluate((val) => {
        const sel = document.getElementById("bloqueopersona-tipo_persona");
        sel.value = val;
        sel.dispatchEvent(new Event("change", { bubbles: true }));
    }, fixed.tipoPersona);

    await new Promise(r => setTimeout(r, 900));

    // 2. Persona
    await page.evaluate((val) => {
        const sel = document.getElementById("bloqueopersona-id_persona");
        sel.value = val;
        sel.dispatchEvent(new Event("change", { bubbles: true }));
    }, fixed.idPersona);

    // 3. Motivo Bloqueo
    await page.evaluate((val) => {
        const sel = document.getElementById("bloqueopersona-id_motivo_bloqueo");
        sel.value = val;
        sel.dispatchEvent(new Event("change", { bubbles: true }));
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

    // 5. Observaciones
    const obsField = await page.$("#bloqueopersona-observaciones");
    await obsField.click({ clickCount: 3 });
    await obsField.type(fixed.observaciones || "");

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
