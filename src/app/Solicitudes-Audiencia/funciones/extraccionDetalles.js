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

                    // ── 2. Intervinientes ────────────────────────────────────
                    // Buscamos el panel cuyo título sea "Intervinientes"
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

                            // Clave: "DEFENSOR PARTICULAR" → "defensor_particular"
                            const key = th.innerText.trim().toLowerCase().replace(/\s+/g, '_');

                            // Nombre: solo el primer nodo de texto (antes de <b>)
                            const firstText = Array.from(td.childNodes)
                                .filter(n => n.nodeType === 3)
                                .map(n => n.textContent.trim())
                                .filter(Boolean)[0] || td.innerText.trim();

                            if (!intervinientes[key]) intervinientes[key] = [];
                            intervinientes[key].push(firstText);
                        }
                        break;
                    }

                    // ── 3. Documentos ────────────────────────────────────────
                    // El tab activo "#solicitud" contiene la tabla de documentos
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

                    return { tipo, solicitante, intervinientes, documentos };
                });

                results.push({ ...sol, ...extra });

                // ── Navegar al legajo ─────────────────────────────────────
                if (sol.linkLeg) {
                    log(`  -> Legajo: ${sol.linkLeg}`);
                    await page.goto(sol.linkLeg, { waitUntil: "networkidle2", timeout: 30000 });

                    const extraLeg = await page.evaluate((solImputados) => {
                        // Helper: busca el valor de una fila por texto del th
                        const getField = (label) => {
                            const rows = document.querySelectorAll('.detail-view tbody tr');
                            for (const row of rows) {
                                const th = row.querySelector('th');
                                if (th && th.innerText.trim() === label) {
                                    // Usamos .kv-editable-value si existe (campos editables inline)
                                    const editable = row.querySelector('.kv-editable-value');
                                    if (editable) return editable.innerText.trim() || null;
                                    return row.querySelector('td .kv-attribute')?.innerText.trim() || null;
                                }
                            }
                            return null;
                        };

                        // ── 1. Fiscal a Cargo ─────────────────────────────
                        const fiscalACargo = getField('Fiscal a Cargo');

                        // ── 2. UFI / Organismo ────────────────────────────
                        const ufi = getField('Organismo');

                        // ── 3. Partes del legajo ──────────────────────────
                        const partesLegajo = [];
                        const imputadosMatch = [];

                        Array.from(
                            document.querySelectorAll('#w9-container table tbody tr[data-key]')
                        ).forEach(row => {
                            const tdNombre = row.querySelector('td[data-col-seq="0"]');
                            const aEl = tdNombre ? tdNombre.querySelector('a') : null;
                            const rolEl = row.querySelector('td[data-col-seq="1"]');
                            if (!tdNombre || !rolEl) return;

                            const nombreRaw = (aEl ? aEl.innerText : tdNombre.innerText).trim();
                            const nombreLimpio = nombreRaw.replace(/\(.*\)/g, '').trim();

                            const rol = rolEl.innerText.trim();
                            const key = rol.toLowerCase().replace(/\s+/g, '_');

                            if (key === 'imputado') {
                                const link = aEl ? aEl.getAttribute('href') : null;
                                // Verificamos si este imputado existe en intervinientes.imputado
                                // O si la lista original vino vacía, extraemos TODOS los imputados del legajo.
                                const coincide = !solImputados || solImputados.length === 0 || solImputados.some(imp =>
                                    nombreLimpio.includes(imp) || imp.includes(nombreLimpio)
                                );
                                if (coincide) {
                                    imputadosMatch.push({ nombre: nombreLimpio, link });
                                }
                            }


                            partesLegajo.push({ [key]: nombreLimpio });
                        });

                        return { fiscalACargo, ufi, partesLegajo, imputadosMatch };
                    }, sol.intervinientes?.imputado || []);

                    // ── Calificaciones (tab PJAX) ──────────────────────────
                    await page.click('a[href="#calificaciones"]');
                    // Esperamos hasta 15s a que cargue el contenido del tab
                    await page.waitForSelector(
                        '#calificaciones .kv-grid-container table tbody tr',
                        { timeout: 15000 }
                    ).catch(() => null); // Si no hay filas o no carga, seguimos igual

                    const delitos = await page.evaluate(() =>
                        Array.from(
                            document.querySelectorAll('#calificaciones .kv-grid-container table tbody tr[data-key]')
                        ).map(row => {
                            const tipoEl = row.querySelector('td[data-col-seq="0"]');
                            return tipoEl ? tipoEl.innerText.trim() : null;
                        }).filter(Boolean)
                    );

                    // Enriquecemos el último resultado con todos los datos del legajo
                    const imputadosFinales = extraLeg.imputadosMatch || [];
                    const finalIntervinientes = { ...sol.intervinientes };
                    if (imputadosFinales.length > 0) {
                        finalIntervinientes.imputado = imputadosFinales;
                    }

                    const finalExtraLeg = { ...extraLeg };
                    delete finalExtraLeg.imputadosMatch; // Removemos datos temporales

                    results[results.length - 1] = {
                        ...results[results.length - 1],
                        ...finalExtraLeg,
                        intervinientes: finalIntervinientes,
                        delitos,
                    };


                    // ── Jueces (tab PJAX) ──────────────────────────────────
                    await page.click('a[href="#jueces"]');
                    await page.waitForSelector(
                        '#jueces .kv-grid-container table tbody tr',
                        { timeout: 15000 }
                    ).catch(() => null);

                    const jueces = await page.evaluate(() =>
                        Array.from(
                            document.querySelectorAll('#jueces .kv-grid-container table tbody tr[data-key]')
                        ).map(row => {
                            // El nombre está directamente en td[data-col-seq="1"] (texto plano, no link)
                            const td = row.querySelector('td[data-col-seq="1"]');
                            return td ? td.innerText.trim() : null;
                        }).filter(Boolean)
                    );

                    results[results.length - 1] = { ...results[results.length - 1], jueces };

                    // ── Extracción DNI (Navegación perfiles - AL FINAL) ─────
                    if (imputadosFinales.length > 0) {
                        log(`  -> Extrayendo DNI de ${imputadosFinales.length} imputados...`);
                        const urlObj = new URL(sol.linkLeg);
                        const baseURL = `${urlObj.protocol}//${urlObj.host}`;

                        for (const imp of imputadosFinales) {
                            if (!imp.link) {
                                imp.dni = null;
                                continue;
                            }
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
