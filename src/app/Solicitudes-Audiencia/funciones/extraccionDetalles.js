import puppeteer from 'puppeteer';

const LOGIN_URL = "http://10.107.1.184:8092/site/login?urlBack=http%3A%2F%2F10.107.1.184%3A8094%2F";
const BROWSER_COUNT = 4;

async function login(page) {
    await page.goto(LOGIN_URL, { waitUntil: "networkidle2" });
    await page.type("#loginform-username", "20423341980");
    await page.type("#loginform-password", "Marzo24");
    await page.click('button[name="login-button"]');
    await page.waitForSelector('a[href="/audiencia/agenda"]', { visible: true, timeout: 15000 });
}

function chunkArray(arr, n) {
    const chunks = [];
    const size = Math.ceil(arr.length / n);
    for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
    }
    return chunks;
}
async function procesarChunk(workerId, chunk, onProgress, sharedState) {
    const log = (msg) => {
        console.log(`[worker-${workerId}] ${msg}`);
    };

    const browser = await puppeteer.launch({
        headless: true,
        args: ["--window-size=1280,720", "--no-sandbox", "--disable-setuid-sandbox"],
        defaultViewport: { width: 1280, height: 720 },
    });

    const page = (await browser.pages())[0] || await browser.newPage();

    try {
        log("Iniciando login...");
        await login(page);
        log(`Login OK. Procesando ${chunk.length} solicitudes...`);

        const results = [];

        for (let i = 0; i < chunk.length; i++) {
            const sol = chunk[i];
            log(`[${i + 1}/${chunk.length}] Navegando a: ${sol.linkSol}`);

            try {
                await page.goto(sol.linkSol, { waitUntil: "networkidle2", timeout: 30000 });

                // ── Extracción de datos del detalle de la solicitud ──────────
                const extra = await page.evaluate(() => {
                    const origin = window.location.origin;

                    // ── 1. Tipo Solicitud (primer panel) ─────────────────────
                    let tipo = null;
                    const allRows = document.querySelectorAll('.kv-flat-b .detail-view tbody tr');
                    for (const row of allRows) {
                        const th = row.querySelector('th');
                        if (th && th.innerText.trim() === 'Tipo Solicitud') {
                            tipo = row.querySelector('td .kv-attribute')?.innerText.trim() || null;
                            break;
                        }
                    }

                    // ── 2. Intervinientes (solo primera página, paginación se hace fuera) ──
                    const intervinientes = {};
                    const panels = document.querySelectorAll('.kv-flat-b');
                    for (const panel of panels) {
                        const title = panel.querySelector('.panel-title');
                        if (!title || title.innerText.trim() !== 'Intervinientes') continue;

                        const ivRows = panel.querySelectorAll('.detail-view tbody tr');
                        for (const row of ivRows) {
                            const th = row.querySelector('th');
                            const td = row.querySelector('td .kv-attribute');
                            if (!th || !td) continue;

                            const key = th.innerText.trim().toLowerCase().replace(/\s+/g, '_');
                            const firstText = Array.from(td.childNodes)
                                .filter(n => n.nodeType === 3)
                                .map(n => n.textContent.trim())
                                .filter(Boolean)[0] || td.innerText.trim();

                            if (!intervinientes[key]) intervinientes[key] = [];

                            // Si es IMPUTADO, guardamos como objeto {nombre, dni: null}
                            if (key === 'imputado') {
                                intervinientes[key].push({ nombre: firstText, dni: null });
                            } else {
                                intervinientes[key].push(firstText);
                            }
                        }
                        break;
                    }

                    // ── 3. Documentos ────────────────────────────────────────
                    const docRows = document.querySelectorAll('#solicitud .kv-grid-container table tbody tr[data-key]');
                    const documentos = Array.from(docRows).map(row => {
                        const nombre = row.querySelector('td[data-col-seq="0"]')?.innerText.trim() || null;
                        const linkEl = row.querySelector('td[data-col-seq="7"] a');
                        const link = linkEl ? new URL(linkEl.getAttribute('href'), origin).href : null;
                        return { nombre, link };
                    });

                    // ── 4. Solicitante (Parte Solicitante) ───────────────────
                    let solicitante = null;
                    for (const row of allRows) {
                        const th = row.querySelector('th');
                        if (th && th.innerText.trim() === 'Parte Solicitante') {
                            solicitante = row.querySelector('td .kv-attribute')?.innerText.trim() || null;
                            break;
                        }
                    }

                    // ── 5. Paginación de intervinientes: info del pager ───────
                    const pagerEl = document.querySelector('.kv-panel-pager span.kv-panel-pager-info, .summary');
                    let paginaActual = 1;
                    let totalPaginas = 1;
                    if (pagerEl) {
                        const match = pagerEl.innerText.match(/(\d+)\s*[-–]\s*\d+\s*of\s*(\d+)/i);
                        if (match) totalPaginas = Math.ceil(parseInt(match[2]) / 10);
                    }

                    return { tipo, solicitante, intervinientes, documentos, paginaActual, totalPaginas };
                });

                // ── Paginación de intervinientes ─────────────────────────────
                // Si hay más de 1 página de intervinientes, las recorremos
                if (extra.totalPaginas > 1) {
                    log(`  -> Intervinientes paginados: ${extra.totalPaginas} páginas`);
                    for (let pg = 2; pg <= extra.totalPaginas; pg++) {
                        // La paginación suele ser PJAX, buscamos el link de siguiente página
                        await page.evaluate((pgNum) => {
                            const links = document.querySelectorAll('.kv-panel-pager a[data-pjax]');
                            for (const link of links) {
                                if (link.innerText.trim() === String(pgNum) || link.getAttribute('data-page') === String(pgNum)) {
                                    link.click();
                                    return;
                                }
                            }
                            // fallback: botón "next"
                            const next = document.querySelector('.kv-panel-pager .next a');
                            if (next) next.click();
                        }, pg);

                        await new Promise(r => setTimeout(r, 1500));

                        const moreRows = await page.evaluate(() => {
                            const result = {};
                            const panels = document.querySelectorAll('.kv-flat-b');
                            for (const panel of panels) {
                                const title = panel.querySelector('.panel-title');
                                if (!title || title.innerText.trim() !== 'Intervinientes') continue;
                                const ivRows = panel.querySelectorAll('.detail-view tbody tr');
                                for (const row of ivRows) {
                                    const th = row.querySelector('th');
                                    const td = row.querySelector('td .kv-attribute');
                                    if (!th || !td) continue;
                                    const key = th.innerText.trim().toLowerCase().replace(/\s+/g, '_');
                                    const firstText = Array.from(td.childNodes)
                                        .filter(n => n.nodeType === 3)
                                        .map(n => n.textContent.trim())
                                        .filter(Boolean)[0] || td.innerText.trim();
                                    if (!result[key]) result[key] = [];
                                    if (key === 'imputado') {
                                        result[key].push({ nombre: firstText, dni: null });
                                    } else {
                                        result[key].push(firstText);
                                    }
                                }
                                break;
                            }
                            return result;
                        });

                        // Merge moreRows into extra.intervinientes
                        for (const [key, vals] of Object.entries(moreRows)) {
                            if (!extra.intervinientes[key]) extra.intervinientes[key] = [];
                            extra.intervinientes[key].push(...vals);
                        }
                    }
                }

                results.push({ ...sol, ...extra });

                // ── Filtro temprano: FLAGRANCIA en solicitante ────────────
                if (extra.solicitante && /flagrancia/i.test(extra.solicitante)) {
                    log(`  -> FLAGRANCIA en solicitante ("${extra.solicitante}"). Descartando.`);
                    results.pop();
                    continue;
                }

                // ── Navegar al legajo ─────────────────────────────────────
                if (sol.linkLeg) {
                    log(`  -> Legajo: ${sol.linkLeg}`);
                    await page.goto(sol.linkLeg, { waitUntil: "networkidle2", timeout: 30000 });

                    // Helper: navega todas las páginas de un paginador y acumula datos
                    // extractFn() -> debe devolver { data: any[], hasNext: bool }
                    const paginarTabla = async (containerSelector, extractFn, mergeInto) => {
                        while (true) {
                            const { data, hasNext } = await extractFn();

                            // Merge: array → push, objeto → por clave
                            if (Array.isArray(mergeInto)) {
                                mergeInto.push(...data);
                            } else {
                                for (const [k, vals] of Object.entries(data)) {
                                    if (!mergeInto[k]) mergeInto[k] = [];
                                    mergeInto[k].push(...(Array.isArray(vals) ? vals : [vals]));
                                }
                            }

                            if (!hasNext) break;

                            // Leer página activa ANTES de hacer click
                            const beforePage = await page.evaluate((sel) => {
                                const panel = document.querySelector(sel)?.closest('.panel') ||
                                    document.querySelector(sel)?.closest('.tab-pane');
                                const active = panel?.querySelector('.pagination li.active a');
                                return active ? active.getAttribute('data-page') : null;
                            }, containerSelector);

                            // Click en "next"
                            await page.evaluate((sel) => {
                                const panel = document.querySelector(sel)?.closest('.panel') ||
                                    document.querySelector(sel)?.closest('.tab-pane');
                                const next = panel?.querySelector('li.next:not(.disabled) a');
                                if (next) next.click();
                            }, containerSelector);

                            // Esperar que la página activa cambie (max 15s)
                            const deadline = Date.now() + 15000;
                            let changed = false;
                            while (Date.now() < deadline) {
                                await new Promise(r => setTimeout(r, 600));
                                const currentPage = await page.evaluate((sel) => {
                                    const panel = document.querySelector(sel)?.closest('.panel') ||
                                        document.querySelector(sel)?.closest('.tab-pane');
                                    const active = panel?.querySelector('.pagination li.active a');
                                    return active ? active.getAttribute('data-page') : null;
                                }, containerSelector);
                                if (currentPage !== beforePage) { changed = true; break; }
                            }
                            if (!changed) {
                                log(`  -> Timeout esperando página siguiente en ${containerSelector}, abortando paginación`);
                                break;
                            }
                        }
                    };

                    // ── 1. Fiscal a Cargo y UFI (datos de cabecera, sin paginación) ────
                    const { fiscalACargo, ufi } = await page.evaluate(() => {
                        const getField = (label) => {
                            const rows = document.querySelectorAll('.detail-view tbody tr');
                            for (const row of rows) {
                                const th = row.querySelector('th');
                                if (th && th.innerText.trim() === label) {
                                    const editable = row.querySelector('.kv-editable-value');
                                    if (editable) return editable.innerText.trim() || null;
                                    return row.querySelector('td .kv-attribute')?.innerText.trim() || null;
                                }
                            }
                            return null;
                        };
                        return { fiscalACargo: getField('Fiscal a Cargo'), ufi: getField('Organismo') };
                    });

                    // ── Filtro FLAGRANCIA ──────────────────────────────────
                    if (ufi && /flagrancia/i.test(ufi)) {
                        log(`  -> FLAGRANCIA detectada en UFI ("${ufi}"). Descartando solicitud.`);
                        results.pop(); // Elimina el resultado ya pusheado
                        continue;     // Pasa a la siguiente solicitud del chunk
                    }

                    // ── 2. Partes del legajo (paginadas) ──────────────────────────────
                    const partesLegajo = {};
                    const imputadosMatch = [];

                    await paginarTabla(
                        '#w9-container',   // el paginador está en el panel que contiene este id
                        async () => {
                            return page.evaluate(() => {
                                const data = {};
                                const impMatches = [];
                                const hasNext = !!document.querySelector(
                                    // Paginador del panel partes, siguiente no desactivado
                                    '#w9-container ~ .panel-footer li.next:not(.disabled) a,' +
                                    '#w9-container + .panel-footer li.next:not(.disabled) a'
                                ) || (() => {
                                    // fallback: buscar el panel-footer más cercano a #w9-container
                                    const el = document.querySelector('#w9-container');
                                    const panel = el?.closest('.panel');
                                    return !!panel?.querySelector('li.next:not(.disabled) a');
                                })();

                                Array.from(
                                    document.querySelectorAll('#w9-container table tbody tr[data-key]')
                                ).forEach(row => {
                                    const tdNombre = row.querySelector('td[data-col-seq="0"]');
                                    const aEl = tdNombre?.querySelector('a');
                                    const rolEl = row.querySelector('td[data-col-seq="1"]');
                                    if (!tdNombre || !rolEl) return;

                                    const nombreRaw = (aEl ? aEl.innerText : tdNombre.innerText).trim();
                                    const nombreLimpio = nombreRaw.replace(/\(.*\)/g, '').trim();
                                    const key = rolEl.innerText.trim().toLowerCase().replace(/\s+/g, '_');

                                    if (!data[key]) data[key] = [];
                                    data[key].push(nombreLimpio);

                                    if (key === 'imputado') {
                                        impMatches.push({ nombre: nombreLimpio, link: aEl?.getAttribute('href') || null, dni: null });
                                    }
                                });

                                return { data, imputados: impMatches, hasNext };
                            }).then(res => {
                                imputadosMatch.push(...res.imputados);
                                return { data: res.data, hasNext: res.hasNext };
                            });
                        },
                        partesLegajo
                    );

                    log(`  -> Partes extraídas: ${Object.values(partesLegajo).flat().length} total`);

                    // ── 3. Calificaciones/delitos (tab PJAX, puede paginar) ───────────
                    await page.click('a[href="#calificaciones"]');
                    await page.waitForSelector(
                        '#calificaciones .kv-grid-container table tbody tr',
                        { timeout: 15000 }
                    ).catch(() => null);

                    const delitos = [];
                    await paginarTabla(
                        '#calificaciones',
                        async () => {
                            return page.evaluate(() => {
                                const data = Array.from(
                                    document.querySelectorAll('#calificaciones .kv-grid-container table tbody tr[data-key]')
                                ).map(row => row.querySelector('td[data-col-seq="0"]')?.innerText.trim()).filter(Boolean);

                                const panel = document.querySelector('#calificaciones')?.closest('.panel, .tab-pane');
                                const hasNext = !!panel?.querySelector('li.next:not(.disabled) a');
                                return { data, hasNext };
                            });
                        },
                        delitos
                    );

                    // Enriquecemos el último resultado
                    const finalIntervinientes = { ...results[results.length - 1].intervinientes };
                    if (imputadosMatch.length > 0) {
                        finalIntervinientes.imputado = imputadosMatch;
                    }

                    results[results.length - 1] = {
                        ...results[results.length - 1],
                        fiscalACargo, ufi,
                        partesLegajo,
                        intervinientes: finalIntervinientes,
                        delitos,
                    };

                    // ── 4. Jueces (tab PJAX, puede paginar) ───────────────────────────
                    await page.click('a[href="#jueces"]');
                    await page.waitForSelector(
                        '#jueces .kv-grid-container table tbody tr',
                        { timeout: 15000 }
                    ).catch(() => null);

                    const jueces = [];
                    await paginarTabla(
                        '#jueces',
                        async () => {
                            return page.evaluate(() => {
                                const data = Array.from(
                                    document.querySelectorAll('#jueces .kv-grid-container table tbody tr[data-key]')
                                ).map(row => row.querySelector('td[data-col-seq="1"]')?.innerText.trim()).filter(Boolean);

                                const panel = document.querySelector('#jueces')?.closest('.panel, .tab-pane');
                                const hasNext = !!panel?.querySelector('li.next:not(.disabled) a');
                                return { data, hasNext };
                            });
                        },
                        jueces
                    );

                    results[results.length - 1] = { ...results[results.length - 1], jueces };
                    log(`  -> Jueces extraídos: ${jueces.length}`);

                    // ── Extracción DNI (Navegación perfiles - AL FINAL) ─────
                    if (imputadosMatch.length > 0) {
                        log(`  -> Extrayendo DNI de ${imputadosMatch.length} imputados...`);
                        const urlObj = new URL(sol.linkLeg);
                        const baseURL = `${urlObj.protocol}//${urlObj.host}`;

                        for (const imp of imputadosMatch) {
                            if (!imp.link) { imp.dni = null; continue; }
                            const profileURL = imp.link.startsWith('http') ? imp.link : `${baseURL}${imp.link}`;
                            try {
                                await page.goto(profileURL, { waitUntil: "domcontentloaded", timeout: 15000 });
                                await new Promise(r => setTimeout(r, 1000));

                                let targetContext = page;
                                const iframeEl = await page.$('iframe');
                                if (iframeEl) {
                                    targetContext = await iframeEl.contentFrame();
                                }

                                await targetContext.waitForSelector('#documentos table', { visible: true, timeout: 5000 }).catch(() => null);

                                const dni = await targetContext.evaluate(() => {
                                    const table = document.querySelector('#documentos table');
                                    if (!table) return null;
                                    for (const row of table.querySelectorAll('tbody tr')) {
                                        const cells = row.querySelectorAll('td');
                                        if (cells.length >= 2 && cells[0].innerText.trim().toUpperCase() === 'DNI') {
                                            return cells[1].innerText.trim();
                                        }
                                    }
                                    return null;
                                });
                                imp.dni = dni;
                            } catch (e) {
                                log(`  -> Error extrayendo DNI de ${imp.nombre}: ${e.message}`);
                                imp.dni = null;
                            }
                        }

                        // Guardamos imputados con DNI actualizado en el resultado final
                        results[results.length - 1].intervinientes.imputado = imputadosMatch;
                    }
                } // End if (sol.linkLeg)

            } catch (err) {
                log(`ERROR en ${sol.linkSol}: ${err.message}`);
                results.push({ ...sol, error: err.message });
            } finally {
                // Incrementamos contador global y calculamos porcentaje real
                if (sharedState && onProgress) {
                    sharedState.count++;
                    const globalPct = Math.round((sharedState.count / sharedState.total) * 100);
                    onProgress(`${globalPct}%`, globalPct);
                }
            }
        } // End chunks loop


        log(`Chunk completo. ${results.length} resultados.`);
        return results;

    } finally {
        log("Cerrando navegador.");
        await browser.close();
    }
}

/**
 * Toma el array de solicitudes ya extraídas, las divide entre 4 navegadores
 * y cada uno extrae datos adicionales de su chunk en paralelo.
 *
 * @param {Array} solicitudes - Array con { linkSol, numeroLeg, caratula, fyhcreacion, linkLeg }
 * @param {Function} onProgress - Opcional callback de progreso
 * @returns {Promise<Array>} - Array enriquecido con los datos de detalle
 */
export async function extraerDetalles(solicitudes, onProgress) {
    if (!solicitudes || solicitudes.length === 0) {
        if (onProgress) onProgress("No hay solicitudes para procesar.");

        console.warn("[extraccion-detalles] No hay solicitudes para procesar.");
        return [];
    }

    // Solo paralelizamos hasta BROWSER_COUNT workers (o menos si hay pocas solicitudes)
    const count = Math.min(BROWSER_COUNT, solicitudes.length);
    const chunks = chunkArray(solicitudes, count);

    if (onProgress) onProgress(`Preparando datos...`);

    // Estado compartido para rastrear progreso de los 4 workers
    const sharedState = { total: solicitudes.length, count: 0 };

    // Lanzamos todos los workers en paralelo
    const allResults = await Promise.all(
        chunks.map((chunk, i) => procesarChunk(i, chunk, onProgress, sharedState))
    );


    // Aplanamos los resultados de todos los workers
    const flat = allResults.flat();
    console.log(`[extraccion-detalles] Extracción completa. Total: ${flat.length}`);
    console.log("[extraccion-detalles] Resultados:\n" + JSON.stringify(flat, null, 2));

    return flat;
}
