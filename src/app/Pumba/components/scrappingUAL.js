import puppeteer from 'puppeteer';
import { getBrowserPath } from '../../../utils/browserPath.js';

const width = 1280;
const height = 720;

let browser;
let page;

async function initBrowser() {
    if (browser && (await browser.pages()).length > 0) return;
    browser = await puppeteer.launch({
        headless: false,
        executablePath: getBrowserPath(),
        args: [`--window-size=${width},${height}`, '--no-sandbox', '--disable-setuid-sandbox', '--disable-quic'],
        defaultViewport: {
            width: width,
            height: height
        }
    });
    [page] = (await browser.pages());
    if (!page) page = await browser.newPage();
}

function limpiarYFormatear(textoBruto) {
    if (!textoBruto) return {};
    const lineas = textoBruto
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0);

    const resultado = {};
    if (lineas.length === 0) return resultado;

    resultado["titulo"] = lineas[0];

    for (let i = 1; i < lineas.length; i++) {
        const linea = lineas[i];

        if (linea.includes(':')) {
            const partes = linea.split(':');
            const nombreAtributo = partes[0]
                .trim()
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/\s+/g, '_');
            let valorEnMismaLinea = partes.slice(1).join(':').trim();
            let listaDeValores = valorEnMismaLinea !== "" ? [valorEnMismaLinea] : [];
            while (i + 1 < lineas.length && !lineas[i + 1].includes(':')) {
                const contenidoLineaNueva = lineas[i + 1].trim();
                listaDeValores.push(contenidoLineaNueva);
                i++;
            }
            const siempreArray = ['tipos_de_audiencia', 'jueces'];
            if (listaDeValores.length > 1 || siempreArray.includes(nombreAtributo)) {
                resultado[nombreAtributo] = listaDeValores;
            } else {
                resultado[nombreAtributo] = listaDeValores[0] || "";
            }
        }
    }
    return resultado;
}

function filterAudiencias(arr) {
    if (!Array.isArray(arr)) return [];

    return arr.map(audiencia => {
        if (!audiencia || audiencia.status === 'error') return null;

        // Calcular duración programada (usando bloques si existen)
        let horaProgramada = 0;
        if (audiencia.inicioProgramada && audiencia.finProgramada) {
            try {
                const [hInicio, mInicio] = audiencia.inicioProgramada.split(':').map(n => parseInt(n) || 0);
                const [hFin, mFin] = audiencia.finProgramada.split(':').map(n => parseInt(n) || 0);
                horaProgramada = (hFin - hInicio) * 60 + (mFin - mInicio);
            } catch (e) {
                horaProgramada = 0;
            }
        }

        // Ya tenemos la sala extraída como salaBlock
        const sala = audiencia.salaBlock || '';

        // Jueces ya es un array
        const juezString = Array.isArray(audiencia.jueces)
            ? audiencia.jueces.map(j => j.replace(',', '')).join('+')
            : '';

        // Tipos ya es un array de objetos {nombre, original}
        const tipos = Array.isArray(audiencia.audTipo) ? audiencia.audTipo.map(t => t.nombre) : [];

        return {
            numeroLeg: audiencia.numeroLeg || '',
            horaProgramada: horaProgramada,
            hora: audiencia.inicioProgramada || '',
            inicioProgramada: audiencia.inicioProgramada || '',
            finProgramada: audiencia.finProgramada || '',
            inicioReal: audiencia.inicioReal || '',
            finReal: audiencia.finReal || '',
            juez: juezString,
            tipo: tipos[0] || '',
            tipo2: tipos[1] || '',
            tipo3: tipos[2] || '',
            estado: audiencia.estado || "PROGRAMADA",
            sala: sala,
            caratula: audiencia.caratula || '',
            linkAudiencia: audiencia.linkAudiencia || '',
            linkVideo: audiencia.linkVideo || '',
            linkMinuta: audiencia.linkMinuta || '',
            fechaNotificacion: audiencia.fechaNotificacion || '',
            finalizadaMinuta: audiencia.finalizadaMinuta || '',
            operador: audiencia.operador || '',
            motivoDemora: audiencia.motivoDemora || '',
            ufi: audiencia.ufi || '',
            dyhsolicitud: audiencia.dyhsolicitud || '',
            dyhagendamiento: audiencia.dyhagendamiento || '',
            intervinientes: audiencia.intervinientes ?
                Object.entries(audiencia.intervinientes).flatMap(([k, v]) => v.map(n => `${k}: ${n}`)) : []
        };
    }).filter(a => a !== null);
}

async function login() {
    await initBrowser();
    page.setDefaultTimeout(60000);
    page.setDefaultNavigationTimeout(60000);
    await page.goto('http://10.107.1.184:8092/site/login?urlBack=http%3A%2F%2F10.107.1.184%3A8094%2F')
    await page.type('#loginform-username', '20423341980');
    await page.type('#loginform-password', 'Marzo24');
    await page.click('button[name="login-button"]');
    await page.waitForSelector('a[href="/audiencia/agenda"]', { visible: true, timeout: 60000 });
}

async function goToAgenda(fechaStr, pageInstance) {
    console.log(`[goToAgenda] Iniciando navegación para fecha: ${fechaStr}`);
    const dia = fechaStr.substring(0, 2).replace(/^0/, '');
    const mesNum = parseInt(fechaStr.substring(2, 4));
    const anio = parseInt(fechaStr.substring(4, 8));

    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const nombreMes = meses[mesNum - 1];
    const targetText = `${nombreMes} ${anio}`.toLowerCase();

    // 1. Navegar a la URL de la agenda si no estamos ahí
    if (!pageInstance.url().includes('/audiencia/agenda')) {
        console.log(`[goToAgenda] Navegando directamente a URL de agenda...`);
        await pageInstance.goto('http://10.107.1.184:8094/audiencia/agenda', { waitUntil: 'networkidle2' });
    }

    // 2. Asegurar vista de "Día"
    try {
        await pageInstance.waitForSelector('button ::-p-text(Día)', { visible: true, timeout: 30000 });
        const isDiaActive = await pageInstance.evaluate(() => {
            const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Día'));
            return btn?.classList.contains('active') || btn?.parentElement?.classList.contains('active');
        });
        if (!isDiaActive) {
            console.log(`[goToAgenda] Activando vista de Día...`);
            await pageInstance.click('button ::-p-text(Día)');
            await new Promise(r => setTimeout(r, 1000));
        }
    } catch (e) {
        console.log(`[goToAgenda] ⚠️ Error al verificar botón Día, intentando continuar...`);
    }

    // 3. Navegación de mes/año
    const containerSelector = '#bloquesearch-fecha-kvdate';
    await pageInstance.waitForSelector(`${containerSelector} .datepicker-switch`, { visible: true });

    let currentText = await pageInstance.$eval(`${containerSelector} .datepicker-switch`, el => el.textContent.trim().toLowerCase());

    while (currentText !== targetText) {
        console.log(`[goToAgenda] Mes actual: ${currentText}, Objetivo: ${targetText}`);
        const parts = currentText.split(/\s+/);
        if (parts.length < 2) {
            console.error(`[goToAgenda] Texto de mes inválido: ${currentText}`);
            break;
        }
        const [currMesStr, currAnioStr] = parts;
        const currAnio = parseInt(currAnioStr);
        const currMesIdx = meses.findIndex(m => m.toLowerCase() === currMesStr);

        if (currMesIdx === -1) {
            console.error(`[goToAgenda] No se encontró el mes: ${currMesStr}`);
            break;
        }

        const prevText = currentText;
        if (anio < currAnio || (anio === currAnio && (mesNum - 1) < currMesIdx)) {
            console.log(`[goToAgenda] Retrocediendo un mes...`);
            await pageInstance.click(`${containerSelector} .datepicker-days thead th.prev`);
        } else {
            console.log(`[goToAgenda] Avanzando un mes...`);
            await pageInstance.click(`${containerSelector} .datepicker-days thead th.next`);
        }

        // 1. Esperar a que el UI refleje el cambio de mes (texto)
        try {
            await pageInstance.waitForFunction(
                (sel, old) => document.querySelector(sel)?.textContent.trim().toLowerCase() !== old,
                { timeout: 4000 },
                `${containerSelector} .datepicker-switch`,
                prevText
            );
        } catch (e) {
            console.warn(`[goToAgenda] El texto del mes no cambió en el tiempo esperado.`);
        }

        // 2. Esperar a que el sitio termine de cargar datos (red)
        console.log(`[goToAgenda] Esperando carga de datos del mes (red)...`);
        await pageInstance.waitForNetworkIdle({ idleTime: 600, timeout: 30000 }).catch(() => { });

        await new Promise(r => setTimeout(r, 400));
        currentText = await pageInstance.$eval(`${containerSelector} .datepicker-switch`, el => el.textContent.trim().toLowerCase());
    }

    // 4. Selección del día con verificación de clase 'active'
    console.log(`[goToAgenda] Buscando y seleccionando día ${dia}...`);
    const daySelector = `${containerSelector} .datepicker-days td.day:not(.old):not(.new)`;

    await pageInstance.evaluate(async (targetDay, sel) => {
        const findDay = () => Array.from(document.querySelectorAll(sel))
            .find(el => el.textContent.trim() === targetDay);

        let attempts = 0;
        while (attempts < 15) {
            const dayEl = findDay();
            if (dayEl) {
                if (dayEl.classList.contains('active')) {
                    console.log(`[Browser] Día ${targetDay} ya está activo.`);
                    return true;
                }
                dayEl.click();
                // Breve espera para que el click se procese y la clase active se asigne
                await new Promise(r => setTimeout(r, 400));
                if (dayEl.classList.contains('active')) return true;
            }
            attempts++;
            await new Promise(r => setTimeout(r, 400));
        }
        throw new Error(`[Browser] No se pudo confirmar el estado active para el día ${targetDay}`);
    }, dia, daySelector);

    // 5. Esperar a que todo el contenido (agenda) termine de cargar tras seleccionar el día
    console.log(`[goToAgenda] Esperando que la página termine de cargar el contenido final (red)...`);
    await pageInstance.waitForNetworkIdle({ idleTime: 1000, timeout: 30000 });
    await new Promise(r => setTimeout(r, 800));
    console.log(`[goToAgenda] ✅ Navegación completada con éxito.`);
}



async function procesarChunkAudiencias(fechaStr, indicesParaProcesar, totalLinks, onProgressChunk) {
    const browserInstance = await puppeteer.launch({
        headless: true,
        executablePath: getBrowserPath(),
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-quic']
    });

    let pageInstance = (await browserInstance.pages())[0];
    await pageInstance.setDefaultNavigationTimeout(60000);
    await pageInstance.setDefaultTimeout(60000);
    const resultadosChunk = [];

    const selectorLinks = 'td a';

    try {
        await pageInstance.goto('http://10.107.1.184:8092/site/login?urlBack=http%3A%2F%2F10.107.1.184%3A8094%2F');
        await pageInstance.type('#loginform-username', '20423341980');
        await pageInstance.type('#loginform-password', 'Marzo24');
        await pageInstance.click('button[name="login-button"]');
        await pageInstance.waitForSelector('a[href="/audiencia/agenda"]', { visible: true, timeout: 60000 });

        await goToAgenda(fechaStr, pageInstance);

        await pageInstance.waitForSelector(selectorLinks, { visible: true });
        console.log(`[Chunk] Iniciando procesamiento de audiencias (${indicesParaProcesar.length} items)...`);

        for (let idxDentroChunk = 0; idxDentroChunk < indicesParaProcesar.length; idxDentroChunk++) {
            const globalIndex = indicesParaProcesar[idxDentroChunk];
            try {
                // Capturar links actuales
                const currentLinks = await pageInstance.$$(selectorLinks);
                const link = currentLinks[globalIndex];

                if (!link) {
                    console.log(`[Chunk] ❌ Link en índice ${globalIndex} NO DISPONIBLE.`);
                    continue;
                }

                const linkText = await pageInstance.evaluate(el => el.textContent.trim(), link);
                console.log(`[Chunk] [Paso 1] Navegando a item ${globalIndex} - Texto: "${linkText}"`);

                await link.scrollIntoView({ block: 'center', behavior: 'instant' });
                await new Promise(r => setTimeout(r, 300));

                const navigationPromise = pageInstance.waitForNavigation({ waitUntil: 'networkidle2', timeout: 120000 });
                await link.click();
                await navigationPromise;

                const linkAudiencia = pageInstance.url();
                let datosAudiencia = {};
                try {
                    console.log(`[Chunk] [Paso 2] Extrayendo datos de: ${linkAudiencia}`);
                    const rawDatos = await pageInstance.evaluate(() => {
                        const datos = {};
                        const textOf = (selector) => document.querySelector(selector)?.textContent.trim() ?? '';
                        const getValueFromLabel = (labelText) => {
                            const labels = Array.from(document.querySelectorAll('label'));
                            const label = labels.find(l => l.textContent.includes(labelText));
                            if (!label) return '';
                            const valEl = label.nextElementSibling;
                            if (!valEl) return '';
                            const p = valEl.querySelector('p');
                            return p ? p.textContent.trim() : valEl.textContent.trim();
                        };

                        datos.numeroLeg = textOf('a[title="Ver Legajo"]');
                        datos.dyhsolicitud = textOf('a[title="Ver Solicitud"]');
                        datos.dyhagendamiento = getValueFromLabel('Creada');
                        datos.caratula = getValueFromLabel('Carátula');
                        datos.estado = getValueFromLabel('Estado');
                        datos.motivoDemora = getValueFromLabel('Motivo de Demora');

                        let ufiTexto = getValueFromLabel('Organismo Interviniente');
                        if (ufiTexto.startsWith('UFI ')) ufiTexto = ufiTexto.substring(4);
                        datos.ufi = ufiTexto;

                        const intervinientes = {};
                        const tablaContainer = document.querySelector('#view-grid-intervinientes-container');
                        if (tablaContainer) {
                            const filas = tablaContainer.querySelectorAll('tbody tr');
                            filas.forEach(fila => {
                                const celdas = fila.querySelectorAll('td');
                                if (celdas.length >= 2) {
                                    const nombre = celdas[0].textContent.trim();
                                    const motivo = celdas[1].textContent.trim();
                                    if (intervinientes[motivo]) intervinientes[motivo].push(nombre);
                                    else intervinientes[motivo] = [nombre];
                                }
                            });
                        }
                        datos.intervinientes = intervinientes;

                        const audTipo = [];
                        const parrafosHeader = Array.from(document.querySelectorAll('p.panel-title'));
                        const headerTipos = parrafosHeader.find(p => p.textContent.includes('Tipos de Audiencia'));
                        const boxBody = headerTipos?.closest('.box')?.querySelector('.box-body');
                        if (boxBody) {
                            const filasTipos = boxBody.querySelectorAll('.row');
                            filasTipos.forEach(fila => {
                                const columnas = fila.querySelectorAll('div[class^="col-"]');
                                if (columnas.length >= 2) {
                                    const nombreTipo = columnas[0].textContent.trim();
                                    const iconoOriginal = columnas[1].querySelector('i');
                                    const esOriginal = iconoOriginal ? iconoOriginal.classList.contains('fa-check-square-o') : false;
                                    audTipo.push({ nombre: nombreTipo, original: esOriginal });
                                }
                            });
                        }
                        datos.audTipo = audTipo;

                        const jueces = [];
                        const headerJueces = parrafosHeader.find(p => p.textContent.includes('Jueces'));
                        const boxBodyJueces = headerJueces?.closest('.box')?.querySelector('.box-body');
                        if (boxBodyJueces) {
                            const filasJueces = boxBodyJueces.querySelectorAll('.row');
                            filasJueces.forEach(fila => {
                                const nombreJuez = fila.querySelector('div[style*="font-weight: bold"]')?.textContent.trim();
                                if (nombreJuez) jueces.push(nombreJuez);
                            });
                        }
                        datos.jueces = jueces;
                        return datos;
                    });
                    datosAudiencia = JSON.parse(JSON.stringify(rawDatos || {}));
                } catch (err) {
                    console.error(`[Chunk] ❌ FALLO Paso 2: ${err.message}`);
                    throw err;
                }

                try {
                    await pageInstance.click('a[href="#notificaciones"]');
                    await pageInstance.waitForSelector('#view-grid-notificaciones-container table tbody tr', { timeout: 30000 });

                    // Ir a la última página de notificaciones si existe para obtener la última fecha
                    const lastPageClicked = await pageInstance.evaluate(() => {
                        const notificacionesTab = document.querySelector('#notificaciones');
                        if (notificacionesTab) {
                            const lastLi = notificacionesTab.querySelector('.pagination li.last');
                            if (lastLi && !lastLi.classList.contains('disabled')) {
                                const link = lastLi.querySelector('a');
                                if (link) {
                                    link.click();
                                    return true;
                                }
                            }
                        }
                        return false;
                    });

                    if (lastPageClicked) {
                        // Esperar a que el PJAX termine de cargar la nueva página
                        await pageInstance.waitForFunction(() => {
                            const loader = document.querySelector('#view-grid-notificaciones-pjax .kv-loader-overlay');
                            return !loader || loader.style.display === 'none' || loader.classList.contains('hide');
                        }, { timeout: 10000 }).catch(() => null);
                        await new Promise(r => setTimeout(r, 1500)); 
                    }

                    const fechaNotif = await pageInstance.evaluate(() => {
                        const lastRow = document.querySelector('#view-grid-notificaciones-container table tbody tr:last-child');
                        if (!lastRow) return '';
                        // La fecha está en la columna data-col-seq="6" (7ma columna)
                        const cell = lastRow.querySelector('td[data-col-seq="6"]');
                        return cell ? cell.textContent.trim() : '';
                    });
                    datosAudiencia.fechaNotificacion = fechaNotif;
                } catch (e) {
                    datosAudiencia.fechaNotificacion = '';
                }

                try {
                    await pageInstance.click('a[href="#historialEstado"]');
                    await pageInstance.waitForSelector('#view-grid-historial-estados-container table tbody tr', { timeout: 30000 });
                    const fechaFin = await pageInstance.evaluate(() => {
                        const rows = Array.from(document.querySelectorAll('#view-grid-historial-estados-container table tbody tr'));
                        const finalizadaRow = rows.find(row => {
                            const stateCell = row.querySelector('td[data-col-seq="1"]');
                            return stateCell && stateCell.textContent.trim().toUpperCase() === 'FINALIZADA';
                        });
                        if (!finalizadaRow) return '';
                        const dateCell = finalizadaRow.querySelector('td[data-col-seq="0"]');
                        return dateCell ? dateCell.textContent.trim() : '';
                    });
                    datosAudiencia.finalizadaMinuta = fechaFin;
                } catch (e) {
                    datosAudiencia.finalizadaMinuta = '';
                }

                let bloquesArray = [];
                try {
                    await pageInstance.click('a[href="#bloques"]');
                    await pageInstance.waitForSelector('#view-grid-bloques-container table tbody tr', { timeout: 5000 });
                    const rawBloques = await pageInstance.evaluate((targetDate) => {
                        const targetFormatted = targetDate.slice(0, 2) + '/' + targetDate.slice(2, 4) + '/' + targetDate.slice(4, 8);
                        const rows = Array.from(document.querySelectorAll('#view-grid-bloques-container table tbody tr'));
                        return rows.map(row => {
                            const cells = Array.from(row.querySelectorAll('td'));
                            if (cells.length < 7) return null;

                            const fechaProg = cells[0].textContent.trim();
                            if (fechaProg !== targetFormatted) return null;

                            const salaText = cells[5].textContent.trim();
                            const salaMatch = salaText.match(/SALA\s+(\d+)/i);
                            const actionsCell = cells[7];
                            const linkMinutaEl = actionsCell?.querySelector('a[title="Descargar Acta Firmada"]');
                            const linkVideoEl = actionsCell?.querySelector('a[title="Ver Video Audiencia"]');
                            const baseUrl = window.location.origin;
                            const getFullUrl = (href) => (!href ? '' : (href.startsWith('http') ? href : baseUrl + href));
                            return {
                                fechaProgramada: fechaProg,
                                inicioProgramada: cells[1].textContent.trim(),
                                finProgramada: cells[2].textContent.trim(),
                                inicioReal: cells[3].textContent.trim(),
                                finReal: cells[4].textContent.trim(),
                                salaBlock: salaMatch ? salaMatch[1] : '',
                                operador: cells[6].textContent.trim(),
                                linkMinuta: getFullUrl(linkMinutaEl?.getAttribute('href')),
                                linkVideo: getFullUrl(linkVideoEl?.getAttribute('href'))
                            };
                        }).filter(b => b !== null);
                    }, fechaStr);
                    bloquesArray = JSON.parse(JSON.stringify(rawBloques || []));
                } catch (e) {
                    bloquesArray = [];
                }
                const emptyFields = {
                    fechaProgramada: '', inicioProgramada: '', finProgramada: '',
                    inicioReal: '', finReal: '', salaBlock: '', operador: '',
                    linkMinuta: '', linkVideo: '', finalizadaMinuta: ''
                };

                if (bloquesArray.length > 0) {
                    bloquesArray.forEach(bloque => {
                        resultadosChunk.push({ index: globalIndex, linkAudiencia, ...datosAudiencia, ...bloque });
                    });
                } else {
                    resultadosChunk.push({ index: globalIndex, linkAudiencia, ...datosAudiencia, ...emptyFields });
                }

                console.log(`[Chunk] Item ${globalIndex} completado.`);
                console.log(`[Chunk] Re-estableciendo estado de la agenda para el siguiente item...`);

                await goToAgenda(fechaStr, pageInstance);
                await pageInstance.waitForSelector(selectorLinks, { visible: true });
            } catch (error) {
                console.warn(`[Chunk] ⚠️ Error crítico en índice ${globalIndex}: ${error.message}`);
                resultadosChunk.push({ index: globalIndex, data: null, status: 'error' });
                try { await goToAgenda(fechaStr, pageInstance); } catch (e) { }
            } finally {
                if (onProgressChunk) onProgressChunk(globalIndex);
            }
            await pageInstance.mouse.move(0, 0);
            await new Promise(r => setTimeout(r, 10));
        }
    } catch (error) {
        console.error(`[Chunk] Error general de chunk:`, error);
    } finally {
        await browserInstance.close();
    }

    return JSON.parse(JSON.stringify(resultadosChunk));
}

export async function getInfoAudiencia(fechaStr = "26012026", onProgress) {
    await login();
    await goToAgenda(fechaStr, page);

    // Usar el mismo selector específico aquí
    const selectorLinks = 'td a';

    await page.waitForSelector(selectorLinks, { visible: true });

    // Pequeña espera para asegurar que la tabla terminó de renderizar
    await new Promise(r => setTimeout(r, 1000));

    const linksInfo = await page.$$eval(selectorLinks, elements =>
        elements.map((el, i) => {
            const titleEl = el.querySelector('.fc-title');
            const titleText = titleEl ? titleEl.textContent : el.textContent;
            return {
                index: i,
                text: titleText ? titleText.trim() : '',
                href: el.href
            };
        })
    );

    const validIndices = linksInfo
        .filter(l => !l.text.toLowerCase().includes('flagrancia'))
        .map(l => l.index);

    const totalLinks = validIndices.length;
    console.log(`[getInfoAudiencia] Fecha: ${fechaStr}, Total elementos en la UI: ${linksInfo.length}, Elementos válidos a procesar (sin Flagrancia): ${totalLinks}`);

    if (onProgress) {
        onProgress(0, 0, totalLinks);
    }

    const NUM_BROWSERS = 4;
    const chunkSize = Math.ceil(totalLinks / NUM_BROWSERS);
    const chunks = [];

    for (let i = 0; i < NUM_BROWSERS; i++) {
        const startIndex = i * chunkSize;
        const endIndex = Math.min(startIndex + chunkSize, totalLinks);
        if (startIndex < totalLinks) {
            chunks.push(validIndices.slice(startIndex, endIndex));
        }
    }

    console.log(`Dividiendo ${totalLinks} audiencias en ${chunks.length} chunks para procesamiento paralelo`);
    chunks.forEach((chunk, idx) => {
        console.log(`Chunk ${idx + 1}: ${chunk.length} items asignados`);
    });

    let completadas = 0;
    const resultados = [];

    const resultadosChunks = await Promise.all(
        chunks.map((chunkIndices, idx) => {
            return procesarChunkAudiencias(
                fechaStr,
                chunkIndices,
                totalLinks,
                (indexCompletado) => {
                    completadas++;
                    if (onProgress) {
                        const progress = Math.round((completadas / totalLinks) * 100);
                        onProgress(progress, completadas, totalLinks);
                    }
                }
            );
        })
    );

    resultadosChunks.forEach(chunkResultados => {
        resultados.push(...chunkResultados);
    });

    const datosFiltrados = filterAudiencias(resultados);
    console.log(`Proceso completado. Datos extraídos finales: ${datosFiltrados.length}`);

    if (browser) {
        await browser.close();
        browser = null;
    }

    return datosFiltrados;
}
