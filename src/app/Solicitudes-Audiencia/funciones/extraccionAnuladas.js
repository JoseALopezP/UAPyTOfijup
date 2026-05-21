import puppeteer from 'puppeteer';
import { getBrowserPath } from '../../../utils/browserPath.js';
import path from 'path';
import fs from 'fs';

const LOGIN_URL = "http://10.107.1.184:8092/site/login?urlBack=http%3A%2F%2F10.107.1.184%3A8094%2F";
const SOLICITUD_URL = "http://10.107.1.184:8094/solicitud";
const BASE_URL = "http://10.107.1.184:8094";
const BROWSER_COUNT = 4;

// IDs conocidos de los filtros (extraídos del HTML provisto)
// tipo_solicitud_combinado: SUSPENSIÓN/MODIFICACIÓN DE FECHA DE AUDIENCIA
const ID_TIPO_SOL_COMBINADO = "g5m5-1a034caf-b997-44df-a908-873bcabf47b1"; // El UUID de ese option
// id_tipo_solicitud: SOLICITUD JURISDICCIONAL
// id_estado_solicitud_jurisdiccional: ANULADA
const ID_ESTADO_JURISDICCIONAL_ANULADA = "d0a38ed2-f9be-43c8-82ef-eb8ce0ad6793";

async function login(page) {
    page.setDefaultTimeout(60000);
    page.setDefaultNavigationTimeout(60000);
    await page.goto(LOGIN_URL, { waitUntil: "networkidle2" });
    await page.type("#loginform-username", "20423341980");
    await page.type("#loginform-password", "Marzo24");
    await page.click('button[name="login-button"]');
    await page.waitForSelector('a[href="/audiencia/agenda"]', { visible: true, timeout: 60000 });
}

function chunkArray(arr, n) {
    if (arr.length === 0) return [];
    const chunks = [];
    const size = Math.ceil(arr.length / n);
    for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
    }
    return chunks;
}

/**
 * Parsea fecha de fila de tabla: DD/MM/AAAA HH:MM:SS -> Date
 */
function parseDate(str) {
    if (!str) return null;
    // "15/05/2026 13:10:07"
    const match = str.match(/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})/);
    if (!match) return null;
    const [, d, m, y, h, min, sec] = match;
    return new Date(parseInt(y), parseInt(m) - 1, parseInt(d), parseInt(h), parseInt(min), parseInt(sec));
}

/**
 * Parsea la fecha del input HTML tipo date: YYYY-MM-DD -> Date (al inicio del día)
 */
function parseFechaHastaInput(str) {
    if (!str) return null;
    // "2026-05-15" (formato del input[type=date])
    const match = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
        const [, y, m, d] = match;
        return new Date(parseInt(y), parseInt(m) - 1, parseInt(d), 0, 0, 0);
    }
    // Fallback: también acepta DD/MM/YYYY por si acaso
    return parseDate(str + ' 00:00:00');
}

/**
 * Fase 1: extrae todos los links de solicitudes (listado paginado)
 * hasta que la fecha de la fila sea anterior a fechaHasta.
 */
export async function extraerLinksAnuladas(fechaHastaStr, onProgress) {
    const notify = (msg) => {
        console.log(`[extraccion-anuladas] ${msg}`);
        if (onProgress) onProgress(msg);
    };

    // Usar el parser correcto para el formato YYYY-MM-DD del input HTML
    const fechaHasta = parseFechaHastaInput(fechaHastaStr);
    notify(`Fecha límite: ${fechaHasta ? fechaHasta.toLocaleDateString('es-AR') : 'sin límite (se extraerán todas las páginas)'}`);

    const browser = await puppeteer.launch({
        headless: false,
        executablePath: getBrowserPath(),
        args: ["--window-size=1280,720", "--no-sandbox", "--disable-setuid-sandbox"],
        defaultViewport: { width: 1280, height: 720 },
    });

    const page = (await browser.pages())[0] || await browser.newPage();

    try {
        notify("Iniciando login...");
        await login(page);

        notify(`Navegando a solicitudes...`);
        await page.goto(SOLICITUD_URL, { waitUntil: "networkidle2" });

        // Helper pjax
        const waitForPjax = async (triggerFn, timeoutMs = 30000) => {
            await page.evaluate(() => { window._pjaxDone = false; });
            await page.evaluate(() => {
                $(document).one('pjax:complete', () => { window._pjaxDone = true; });
            });
            await triggerFn();
            await page.waitForFunction(() => window._pjaxDone, { timeout: timeoutMs });
        };

        // ── Filtro 1: Tipo Solicitud = SOLICITUD JURISDICCIONAL ──────────────
        // El select id_tipo_solicitud controla el tipo principal
        notify("Aplicando filtro: SOLICITUD JURISDICCIONAL...");
        await waitForPjax(() => page.evaluate(() => {
            // Buscar la opción que tiene texto "SOLICITUD JURISDICCIONAL" 
            const el = document.querySelector('#solicitudsearch-id_tipo_solicitud');
            if (!el) return;
            // Recorrer opciones
            for (const opt of el.options) {
                if (opt.text.trim().toUpperCase().includes('JURISDICCIONAL')) {
                    el.value = opt.value;
                    break;
                }
            }
            $(el).trigger('change');
        }));
        notify("Filtro SOLICITUD JURISDICCIONAL aplicado.");

        // ── Filtro 2: Tipo Solicitud Combinado = SUSPENSIÓN/MODIFICACIÓN ─────
        notify("Aplicando filtro: SUSPENSIÓN/MODIFICACIÓN DE FECHA DE AUDIENCIA...");
        await waitForPjax(() => page.evaluate(() => {
            const el = document.querySelector('#solicitudsearch-tipo_solicitud_combinado');
            if (!el) return;
            for (const opt of el.options) {
                if (opt.text.trim().toUpperCase().includes('SUSPENSIÓN/MODIFICACIÓN') ||
                    opt.text.trim().toUpperCase().includes('SUSPENSION/MODIFICACION')) {
                    el.value = opt.value;
                    break;
                }
            }
            $(el).trigger('change');
        }));
        notify("Filtro SUSPENSIÓN/MODIFICACIÓN aplicado.");

        // ── Filtro 3: Estado Solicitud Jurisdiccional = ANULADA ──────────────
        notify("Aplicando filtro: ANULADA...");
        await waitForPjax(() => page.evaluate(() => {
            const el = document.querySelector('#solicitudsearch-id_estado_solicitud_jurisdiccional');
            if (!el) return;
            for (const opt of el.options) {
                if (opt.text.trim().toUpperCase() === 'ANULADA') {
                    el.value = opt.value;
                    break;
                }
            }
            $(el).trigger('change');
        }));
        notify("Filtro ANULADA aplicado.");

        // Esperar que haya filas (puede no haber resultados, no forzar error)
        await page.waitForSelector('#w0-container table tbody', { visible: true, timeout: 15000 }).catch(() => null);

        notify("Filtros aplicados. Iniciando extracción de links...");

        // ── Helpers ────────────────────────────────────────────────────────────
        const extractRows = () => page.evaluate((baseUrl) => {
            return Array.from(
                document.querySelectorAll('#w0-container table tbody tr[data-key]')
            ).map(row => {
                const col3 = row.querySelector('td[data-col-seq="3"]');
                const col4 = row.querySelector('td[data-col-seq="4"]');
                const col5 = row.querySelector('td[data-col-seq="5"]'); // Fecha creación
                const linkSolEl = row.querySelector('a[aria-label="Ver"]') ||
                    row.querySelector('td[data-col-seq="15"] a');
                const linkLegEl = col3 ? col3.querySelector('a') : null;

                if (!col5) return null;

                return {
                    linkSol: linkSolEl ? (linkSolEl.getAttribute('href').startsWith('http') ? linkSolEl.getAttribute('href') : baseUrl + linkSolEl.getAttribute('href')) : null,
                    linkLeg: linkLegEl ? (linkLegEl.getAttribute('href').startsWith('http') ? linkLegEl.getAttribute('href') : baseUrl + linkLegEl.getAttribute('href')) : null,
                    numeroLeg: col3 ? col3.innerText.trim() : '',
                    caratula: col4 ? col4.innerText.trim() : '',
                    fyhcreacion: col5.innerText.trim(),
                };
            }).filter(r => r !== null && r.linkSol);
        }, BASE_URL);

        const getActivePage = () => page.evaluate(() => {
            const el = document.querySelector('.pagination li.active a');
            return el ? parseInt(el.getAttribute('data-page'), 10) : -1;
        });

        const waitForPageChange = async (targetPage, maxMs = 30000) => {
            const start = Date.now();
            while (Date.now() - start < maxMs) {
                await new Promise(r => setTimeout(r, 500));
                if (await getActivePage() === targetPage) return true;
            }
            return false;
        };

        // ── Loop principal ────────────────────────────────────────────────────
        const allLinks = [];
        let stopFound = false;

        while (!stopFound) {
            const rows = await extractRows();
            notify(`${rows.length} filas en página actual.`);

            for (const row of rows) {
                // Verificar fecha: si la fecha de la fila es anterior a fechaHasta, detener
                if (fechaHasta) {
                    const rowDate = parseDate(row.fyhcreacion);
                    if (rowDate && rowDate < fechaHasta) {
                        notify(`Fecha anterior a límite encontrada: ${row.fyhcreacion}. Deteniendo paginación.`);
                        stopFound = true;
                        break;
                    }
                }
                allLinks.push(row);
            }
            if (stopFound) break;

            const nextBtn = await page.$('li.next:not(.disabled) a');
            if (!nextBtn) {
                notify("No hay más páginas.");
                break;
            }

            const currentPage = await getActivePage();
            const targetPage = currentPage + 1;
            notify(`Navegando a página ${targetPage + 1}...`);
            await nextBtn.click();

            const ok = await waitForPageChange(targetPage, 30000);
            if (!ok) {
                notify("Timeout. Reintentando...");
                const retryBtn = await page.$('li.next:not(.disabled) a');
                if (retryBtn) await retryBtn.click();
                const okRetry = await waitForPageChange(targetPage, 30000);
                if (!okRetry) {
                    notify("Página tildada. Abortando.");
                    break;
                }
            }
            notify(`Página ${targetPage + 1} cargada.`);
        }

        notify(`Total links extraídos: ${allLinks.length}`);
        return allLinks;

    } finally {
        await browser.close();
    }
}

/**
 * Fase 2: procesa un chunk de solicitudes, extrae datos y descarga documentos.
 * Solo guarda la solicitud si "Parte Solicitante" empieza con "FISCAL".
 */
async function procesarChunkAnuladas(workerId, chunk, onProgress, sharedState, downloadDir) {
    const log = (msg) => {
        console.log(`[worker-${workerId}] ${msg}`);
        if (onProgress) onProgress(`[W${workerId}] ${msg}`);
    };

    const browser = await puppeteer.launch({
        headless: true,
        executablePath: getBrowserPath(),
        args: ["--window-size=1280,720", "--no-sandbox", "--disable-setuid-sandbox"],
        defaultViewport: { width: 1280, height: 720 },
    });

    const page = (await browser.pages())[0] || await browser.newPage();

    try {
        log("Login...");
        await login(page);
        log(`Procesando ${chunk.length} solicitudes...`);

        const results = [];

        for (let i = 0; i < chunk.length; i++) {
            const sol = chunk[i];
            log(`[${i + 1}/${chunk.length}] ${sol.linkSol}`);

            try {
                await page.goto(sol.linkSol, { waitUntil: "networkidle2", timeout: 30000 });

                // ── Extracción de datos ─────────────────────────────────────────
                const extra = await page.evaluate((baseUrl) => {
                    const allRows = document.querySelectorAll('.kv-flat-b .detail-view tbody tr');

                    // Parte Solicitante
                    let parteSolicitante = null;
                    let fyhCreacionSol = null;
                    let nroLegajo = null;

                    for (const row of allRows) {
                        const th = row.querySelector('th');
                        const td = row.querySelector('td .kv-attribute');
                        if (!th || !td) continue;
                        const label = th.innerText.trim();
                        if (label === 'Parte Solicitante') parteSolicitante = td.innerText.trim();
                        if (label === 'Fecha y Hora Creación' && !fyhCreacionSol) fyhCreacionSol = td.innerText.trim();
                    }

                    // Datos del Legajo panel
                    const panels = document.querySelectorAll('.kv-flat-b');
                    for (const panel of panels) {
                        const title = panel.querySelector('.panel-title');
                        if (!title) continue;
                        if (title.innerText.trim() === 'Datos del Legajo') {
                            const legRows = panel.querySelectorAll('.detail-view tbody tr');
                            for (const row of legRows) {
                                const th = row.querySelector('th');
                                const td = row.querySelector('td .kv-attribute');
                                if (!th || !td) continue;
                                const label = th.innerText.trim();
                                if (label === 'Nro. Legajo') {
                                    const a = td.querySelector('a');
                                    nroLegajo = a ? a.innerText.trim() : td.innerText.trim();
                                }
                                if (label === 'Fecha y Hora Creación' && fyhCreacionSol) {
                                    // ya tenemos la fecha de la solicitud, no sobreescribir
                                }
                            }
                        }
                    }

                    // Intervinientes: solo FISCAL
                    const fiscales = [];
                    for (const panel of panels) {
                        const title = panel.querySelector('.panel-title');
                        if (!title || title.innerText.trim() !== 'Intervinientes') continue;
                        const ivRows = panel.querySelectorAll('.detail-view tbody tr');
                        for (const row of ivRows) {
                            const th = row.querySelector('th');
                            const td = row.querySelector('td .kv-attribute');
                            if (!th || !td) continue;
                            if (th.innerText.trim().toUpperCase() === 'FISCAL') {
                                fiscales.push(td.innerText.trim());
                            }
                        }
                        break;
                    }

                    // Documentos en tab "solicitud"
                    const docLinks = [];
                    const docRows = document.querySelectorAll('#solicitud .kv-grid-container table tbody tr[data-key]');
                    for (const row of docRows) {
                        const linkEl = row.querySelector('td[data-col-seq="7"] a');
                        const nombreEl = row.querySelector('td[data-col-seq="0"]');
                        if (linkEl) {
                            const href = linkEl.getAttribute('href');
                            docLinks.push({
                                nombre: nombreEl ? nombreEl.innerText.trim() : 'documento',
                                url: href.startsWith('http') ? href : baseUrl + href,
                            });
                        }
                    }

                    return { parteSolicitante, fyhCreacionSol, nroLegajo, fiscales, docLinks };
                }, BASE_URL);

                // ── Filtro: solo si contiene la palabra "FISCAL" ──────────────────
                if (!extra.parteSolicitante || !extra.parteSolicitante.toUpperCase().includes('FISCAL')) {
                    log(`  -> Descartando: Parte Solicitante="${extra.parteSolicitante}" (no contiene FISCAL)`);
                    if (sharedState && onProgress) {
                        sharedState.count++;
                        const pct = Math.round((sharedState.count / sharedState.total) * 100);
                        onProgress(`${pct}%`, pct);
                    }
                    continue;
                }

                // Extraer el "rol" del solicitante: parte antes del primer espacio grande
                // "FISCAL MARTIN, SILVIA ELENA" -> "FISCAL" / "FISCAL" 
                // Separar "FISCAL" del resto
                const partSolParts = extra.parteSolicitante.split(/\s+/);
                const rolSolicitante = partSolParts[0]; // "FISCAL"
                const nombreSolicitante = partSolParts.slice(1).join(' '); // "MARTIN, SILVIA ELENA"

                // Número de legajo: usar el extraído del panel, o el de la lista
                const nroLeg = extra.nroLegajo || sol.numeroLeg;

                // Fecha y hora creación de la SOLICITUD
                const fyhSol = extra.fyhCreacionSol || sol.fyhcreacion;

                // ── Descargar documentos ──────────────────────────────────────
                const docDescargados = [];
                if (downloadDir && extra.docLinks.length > 0) {
                    for (const doc of extra.docLinks) {
                        try {
                            // Construir nombre de archivo: NroLegajo_FechaHora[_contador].pdf
                            const fechaStr = fyhSol.replace(/[/:]/g, '-').replace(/\s/g, '_');
                            const baseName = `${nroLeg}_${fechaStr}`;
                            const ext = path.extname(doc.nombre) || '.pdf';

                            let fileName = `${baseName}${ext}`;
                            let filePath = path.join(downloadDir, fileName);
                            let counter = 1;
                            while (fs.existsSync(filePath)) {
                                fileName = `${baseName}_${counter}${ext}`;
                                filePath = path.join(downloadDir, fileName);
                                counter++;
                            }

                            // Descargar usando el browser de puppeteer
                            const client = await page.target().createCDPSession();
                            await client.send('Page.setDownloadBehavior', {
                                behavior: 'allow',
                                downloadPath: downloadDir,
                            });

                            // Navegar al link de descarga
                            await page.goto(doc.url, { waitUntil: 'networkidle2', timeout: 20000 });
                            // Esperar que se descargue
                            await new Promise(r => setTimeout(r, 2000));

                            // Buscar el archivo más reciente en downloadDir que coincida
                            const files = fs.readdirSync(downloadDir);
                            const recent = files
                                .map(f => ({ f, mtime: fs.statSync(path.join(downloadDir, f)).mtimeMs }))
                                .sort((a, b) => b.mtime - a.mtime)[0];

                            if (recent && Date.now() - recent.mtime < 10000) {
                                const origPath = path.join(downloadDir, recent.f);
                                const targetPath = path.join(downloadDir, fileName);
                                if (origPath !== targetPath) {
                                    fs.renameSync(origPath, targetPath);
                                }
                                docDescargados.push(fileName);
                                log(`  -> Descargado: ${fileName}`);
                            }

                            // Volver a la solicitud
                            await page.goto(sol.linkSol, { waitUntil: "networkidle2", timeout: 30000 });

                        } catch (e) {
                            log(`  -> Error descargando doc: ${e.message}`);
                        }
                    }
                }

                results.push({
                    nroLegajo: nroLeg,
                    fyhCreacion: fyhSol,
                    parteSolicitante: extra.parteSolicitante,
                    rolSolicitante,
                    nombreSolicitante,
                    fiscales: extra.fiscales,
                    linkSol: sol.linkSol,
                    caratula: sol.caratula,
                    docDescargados,
                });

                log(`  -> Guardado: ${nroLeg} | ${fyhSol} | Fiscales: ${extra.fiscales.length}`);

            } catch (err) {
                log(`ERROR en ${sol.linkSol}: ${err.message}`);
            } finally {
                if (sharedState && onProgress) {
                    sharedState.count++;
                    const pct = Math.round((sharedState.count / sharedState.total) * 100);
                    onProgress(`${pct}%`, pct);
                }
            }
        }

        log(`Chunk completo. ${results.length} resultados.`);
        return results;

    } finally {
        await browser.close();
    }
}

/**
 * Función principal: extrae links y luego procesa detalles con 4 workers.
 */
export async function extraerAnuladas({ fechaHasta, downloadDir, onProgress }) {
    const notify = (msg, pct) => {
        console.log(`[extraer-anuladas] ${msg}`);
        if (onProgress) onProgress(msg, pct);
    };

    // Asegurarse que el directorio de descarga existe
    if (downloadDir && !fs.existsSync(downloadDir)) {
        fs.mkdirSync(downloadDir, { recursive: true });
    }

    notify("Iniciando extracción de links...");
    const links = await extraerLinksAnuladas(fechaHasta, notify);
    notify(`Links extraídos: ${links.length}. Iniciando procesamiento de detalles...`);

    if (links.length === 0) {
        notify("No se encontraron solicitudes con los filtros aplicados.");
        return [];
    }

    const count = Math.min(BROWSER_COUNT, links.length);
    const chunks = chunkArray(links, count);
    const sharedState = { total: links.length, count: 0 };

    const allResults = await Promise.all(
        chunks.map((chunk, i) => procesarChunkAnuladas(i, chunk, notify, sharedState, downloadDir))
    );

    const flat = allResults.flat();
    notify(`Extracción completa. Total: ${flat.length} solicitudes guardadas.`, 100);
    return flat;
}
