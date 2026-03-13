import puppeteer from 'puppeteer';
import { extraerDetalles } from './extraccionDetalles.js';

const LOGIN_URL = "http://10.107.1.184:8092/site/login?urlBack=http%3A%2F%2F10.107.1.184%3A8094%2F";
const SOLICITUD_URL = "http://10.107.1.184:8094/solicitud";

async function login(page) {
    console.log("[extraccion-solicitudes] Iniciando login...");
    await page.goto(LOGIN_URL, { waitUntil: "networkidle2" });
    await page.type("#loginform-username", "20423341980");
    await page.type("#loginform-password", "Marzo24");
    await page.click('button[name="login-button"]');
    await page.waitForSelector('a[href="/audiencia/agenda"]', { visible: true, timeout: 15000 });
    console.log("[extraccion-solicitudes] Login exitoso.");
}

export async function extraerSolicitudes(existingData = [], onProgress, tiposAudiencia = []) {
    // onProgress lo usamos internamente solo al final para no hacer ruido
    // en la primera fase, que es rápida
    const notify = (msg) => {
        console.log(`[extraccion-solicitudes] ${msg}`);
    };

    const browser = await puppeteer.launch({
        headless: false,
        args: ["--window-size=1280,720", "--no-sandbox", "--disable-setuid-sandbox"],
        defaultViewport: { width: 1280, height: 720 },
    });

    const page = (await browser.pages())[0] || await browser.newPage();

    try {
        notify("Iniciando login...");
        await login(page);

        notify(`Navegando a la página de solicitudes: ${SOLICITUD_URL}`);
        await page.goto(SOLICITUD_URL, { waitUntil: "networkidle2" });

        notify("Aplicando filtros...");

        // Helper: registra un listener pjax:complete y devuelve una función que espera su disparo
        const waitForPjax = async (triggerFn, timeoutMs = 30000) => {
            // Antes de disparar el cambio, armar el listener
            await page.evaluate(() => { window._pjaxDone = false; });
            await page.evaluate(() => {
                $(document).one('pjax:complete', () => { window._pjaxDone = true; });
            });
            // Disparar el cambio
            await triggerFn();
            // Esperar que el PJAX termine
            await page.waitForFunction(() => window._pjaxDone, { timeout: timeoutMs });
        };

        // ── Filtro 1: PENDIENTE ───────────────────────────────────────────────
        await waitForPjax(() => page.evaluate(() => {
            const el = document.querySelector('#solicitudsearch-id_estado');
            el.value = 'a2ddb5a6-57bc-47b9-8235-e5b0012f3450';
            $(el).trigger('change');
        }));
        notify("Filtro PENDIENTE aplicado.");

        // ── Filtro 2: SOLICITUD DE AUDIENCIA ─────────────────────────────────
        await waitForPjax(() => page.evaluate(() => {
            const el = document.querySelector('#solicitudsearch-id_tipo_solicitud');
            el.value = '37261e4a-94b8-4275-8bb8-0ac5a918feed';
            $(el).trigger('change');
        }));
        notify("Filtro SOLICITUD DE AUDIENCIA aplicado.");

        // Confirmar que hay filas visibles antes de empezar
        await page.waitForSelector('#w0-container table tbody tr[data-key]', { visible: true, timeout: 15000 });

        notify("Filtros aplicados. Iniciando extracción...");


        // ── Helpers ───────────────────────────────────────────────────────────

        // Extrae todas las filas visibles de la tabla actual
        const extractRows = () => page.evaluate(() => {
            const origin = window.location.origin;
            return Array.from(
                document.querySelectorAll('#w0-container table tbody tr[data-key]')
            ).map(row => {
                const col1 = row.querySelector('td[data-col-seq="1"]');
                const col3 = row.querySelector('td[data-col-seq="3"]');
                const col4 = row.querySelector('td[data-col-seq="4"]');
                const col5 = row.querySelector('td[data-col-seq="5"]');
                if (!col3 || !col4 || !col5) return null;

                const linkLegEl = col3.querySelector('a');
                const linkSolEl = row.querySelector('a[aria-label="Ver"]');

                // Detectar si es urgente: buscar el icono fa-exclamation en col 1
                const urgente = col1
                    ? !!col1.querySelector('i.fa-exclamation, i[title="Urgente"]')
                    : false;

                return {
                    numeroLeg: col3.innerText.trim(),
                    linkLeg: linkLegEl ? new URL(linkLegEl.getAttribute('href'), origin).href : null,
                    caratula: col4.innerText.trim(),
                    fyhcreacion: col5.innerText.trim(),
                    linkSol: linkSolEl ? new URL(linkSolEl.getAttribute('href'), origin).href : null,
                    urgente,
                };
            }).filter(r => r !== null);
        });

        // Devuelve el data-page del li.active actual
        const getActivePage = () => page.evaluate(() => {
            const el = document.querySelector('.pagination li.active a');
            return el ? parseInt(el.getAttribute('data-page'), 10) : -1;
        });

        // Espera hasta que li.active tenga data-page === targetPage, máximo maxMs
        const waitForPageChange = async (targetPage, maxMs = 30000) => {
            const start = Date.now();
            while (Date.now() - start < maxMs) {
                await new Promise(r => setTimeout(r, 500));
                if (await getActivePage() === targetPage) return true;
            }
            return false;
        };

        // ── Loop principal ────────────────────────────────────────────────────

        const allSolicitudes = [];
        let stopFound = false;

        while (!stopFound) {
            // 1. Extraer filas de la página actual
            const rows = await extractRows();
            notify(`${rows.length} filas en página actual.`);

            for (const row of rows) {
                const alreadyExists = existingData.some(
                    d => d.numeroLeg === row.numeroLeg && d.fyhcreacion === row.fyhcreacion
                );
                if (alreadyExists) {
                    notify(`Match encontrado: ${row.numeroLeg}. Deteniendo.`);
                    stopFound = true;
                    break;
                }
                allSolicitudes.push(row);
            }
            if (stopFound) break;

            // 2. Buscar botón "Siguiente"
            const nextBtn = await page.$('li.next:not(.disabled) a');
            if (!nextBtn) {
                notify("No hay más páginas.");
                break;
            }

            // 3. Anotar página actual y hacer clic
            const currentPage = await getActivePage();
            const targetPage = currentPage + 1;
            notify(`Navegando a página ${targetPage + 1}...`);
            await nextBtn.click();

            // 4. Esperar cambio de página (hasta 30s); si no cambia, reintentar una vez
            const ok = await waitForPageChange(targetPage, 30000);
            if (!ok) {
                notify("Timeout devuelto. Reintentando clic en Siguiente...");
                const retryBtn = await page.$('li.next:not(.disabled) a');
                if (retryBtn) await retryBtn.click();
                const okRetry = await waitForPageChange(targetPage, 30000);
                if (!okRetry) {
                    notify("Página tildada tras reintento. Abortando paginación.");
                    break;
                }
            }
            notify(`Página ${targetPage + 1} cargada.`);
        }

        notify(`Total extraídos tabla base: ${allSolicitudes.length}`);

        if (onProgress) onProgress("Preparando datos...");

        // ── Extracción de detalles (4 navegadores en paralelo) ────────────────
        notify(`Pasando a extracción detallada (${allSolicitudes.length} items)...`);

        const allDetalles = await extraerDetalles(allSolicitudes, onProgress, tiposAudiencia);
        return allDetalles;


    } catch (error) {
        console.error(`[extraccion-solicitudes] Error: ${error.message}`);
        throw error;
    } finally {
        console.log("[extraccion-solicitudes] Cerrando navegador...");
        await browser.close();
    }
}
