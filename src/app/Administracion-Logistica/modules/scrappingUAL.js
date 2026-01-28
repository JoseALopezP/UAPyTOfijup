'use server'
import puppeteer from 'puppeteer';

const width = 1280;
const height = 720;

const browser = await puppeteer.launch({
    headless: false,
    args: [`--window-size=${width},${height}`],
    defaultViewport: {
        width: width,
        height: height
    }
});
let [page] = await browser.pages();

function instanceOfScraping() {

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
    return arr
        .filter(audiencia => !audiencia.titulo.includes('LICENCIA'))
        .filter(audiencia => !audiencia.titulo.includes('CANCELADA'))
        //.filter(audiencia => !audiencia.titulo.includes('PROGRAMADA'))
        .map(audiencia => {
            const horarioParts = audiencia.horario && audiencia.horario.split(' ');
            const horaInicio = horarioParts[0] || "00:00";
            const horaFin = horarioParts[2] || "00:00";

            // Calculate duration in minutes safely
            const [hInicio, mInicio] = horaInicio.split(':').map(n => parseInt(n) || 0);
            const [hFin, mFin] = horaFin.split(':').map(n => parseInt(n) || 0);
            const horaProgramada = (hFin - hInicio) * 60 + (mFin - mInicio);

            const salaRaw = audiencia.titulo.split(' ')[1];
            const sala = salaRaw === '10' ? '10' : (salaRaw ? salaRaw.replace('0', '') : '');

            return {
                ...audiencia,
                sala: sala,
                horaProgramada: horaProgramada,
                hora: horaInicio,
                juez: audiencia.jueces ? audiencia.jueces.map(juez => juez.replace(',', '')).join('+') : '',
                numeroLeg: audiencia.legajo,
                tipo: audiencia.tipos_de_audiencia ? audiencia.tipos_de_audiencia[0] : '',
                tipo2: audiencia.tipos_de_audiencia && audiencia.tipos_de_audiencia[1] ? audiencia.tipos_de_audiencia[1] : '',
                tipo3: audiencia.tipos_de_audiencia && audiencia.tipos_de_audiencia[2] ? audiencia.tipos_de_audiencia[2] : '',
            };
        }).map(audiencia => ({
            numeroLeg: audiencia.numeroLeg,
            horaProgramada: audiencia.horaProgramada,
            hora: audiencia.hora,
            juez: audiencia.juez,
            tipo: audiencia.tipo,
            tipo2: audiencia.tipo2,
            tipo3: audiencia.tipo3,
            estado: "PROGRAMADA",
            sala: audiencia.sala,
        }));
}

async function login() {
    await page.goto('http://10.107.1.184:8092/site/login?urlBack=http%3A%2F%2F10.107.1.184%3A8094%2F')
    await page.type('#loginform-username', '20423341980');
    await page.type('#loginform-password', 'Marzo24');
    await page.click('button[name="login-button"]');
    await page.waitForSelector('a[href="/audiencia/agenda"]', { visible: true });
}

async function goToAgenda(diaABuscar, pageInstance) {
    await pageInstance.click('a[href="/audiencia/agenda"]');
    await pageInstance.waitForSelector('button ::-p-text(Día)', { visible: true });
    await pageInstance.click('button ::-p-text(Día)');
    const selector = `td.day ::-p-text(${diaABuscar})`;
    await pageInstance.waitForSelector(selector, { visible: true });
    await pageInstance.click(selector);
}

// Función para procesar un chunk de audiencias con su propio navegador
async function procesarChunkAudiencias(diaABuscar, startIndex, endIndex, totalLinks, onProgressChunk) {
    // Crear navegador independiente para este chunk
    const browserInstance = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    let pageInstance = (await browserInstance.pages())[0];
    const resultadosChunk = [];

    try {
        // Login
        await pageInstance.goto('http://10.107.1.184:8092/site/login?urlBack=http%3A%2F%2F10.107.1.184%3A8094%2F');
        await pageInstance.type('#loginform-username', '20423341980');
        await pageInstance.type('#loginform-password', 'Marzo24');
        await pageInstance.click('button[name="login-button"]');
        await pageInstance.waitForSelector('a[href="/audiencia/agenda"]', { visible: true });

        // Ir a agenda
        await goToAgenda(diaABuscar, pageInstance);

        const selectorLinks = 'td a';
        await pageInstance.waitForSelector(selectorLinks, { visible: true });

        // Procesar solo el rango asignado
        for (let i = startIndex; i < endIndex; i++) {
            try {
                const currentLinks = await pageInstance.$$(selectorLinks);
                const link = currentLinks[i];
                if (!link) continue;

                await link.scrollIntoView({ block: 'center', behavior: 'instant' });
                await new Promise(r => setTimeout(r, 100));
                await link.hover();
                const dynamicSelector = 'div.qtip.qtip-default.qtip-focus';

                try {
                    await pageInstance.waitForSelector(dynamicSelector, { visible: true, timeout: 2000 });
                } catch (e) {
                    console.log(`[Chunk ${startIndex}-${endIndex}] Posible shift detectado en índice ${i}, re-intentando hover...`);
                    await link.scrollIntoView({ block: 'center', behavior: 'instant' });
                    await new Promise(r => setTimeout(r, 300));
                    await link.hover();
                    await pageInstance.waitForSelector(dynamicSelector, { visible: true, timeout: 0 });
                }

                console.log(`[Chunk ${startIndex}-${endIndex}] Navegando al detalle del item ${i}...`);
                await Promise.all([
                    pageInstance.waitForNavigation({ waitUntil: 'networkidle2' }),
                    link.click()
                ]);
                console.log(`[Chunk ${startIndex}-${endIndex}] Página de detalle cargada. Extrayendo datos...`);
                const datosAudiencia = await pageInstance.evaluate(() => {
                    const datos = {};
                    const linkLegajo = document.querySelector('a[title="Ver Legajo"]');
                    datos.numeroLeg = linkLegajo ? linkLegajo.textContent.trim() : '';

                    const linkSolicitud = document.querySelector('a[title="Ver Solicitud"]');
                    datos.dyhsolicitud = linkSolicitud ? linkSolicitud.textContent.trim() : '';

                    const labels1 = Array.from(document.querySelectorAll('label'));
                    const labelCreada = labels1.find(label => label.textContent.includes('Creada'));
                    if (labelCreada) {
                        const divSiguiente = labelCreada.nextElementSibling;
                        const pOrganismo = divSiguiente ? divSiguiente.querySelector('p') : null;
                        let ufiTexto = pOrganismo ? pOrganismo.textContent.trim() : '';
                        datos.dyhagendamiento = ufiTexto;
                    } else {
                        datos.dyhagendamiento = '';
                    }

                    const labels2 = Array.from(document.querySelectorAll('label'));
                    const labelOrganismo = labels2.find(label => label.textContent.includes('Organismo Interviniente'));
                    if (labelOrganismo) {
                        const divSiguiente = labelOrganismo.nextElementSibling;
                        const pOrganismo = divSiguiente ? divSiguiente.querySelector('p') : null;
                        let ufiTexto = pOrganismo ? pOrganismo.textContent.trim() : '';
                        if (ufiTexto.startsWith('UFI ')) {
                            ufiTexto = ufiTexto.substring(4);
                        }
                        datos.ufi = ufiTexto;
                    } else {
                        datos.ufi = '';
                    }

                    return datos;
                });

                // Guardar los datos extraídos
                resultadosChunk.push({
                    index: i,
                    ...datosAudiencia
                });

                console.log(`[Chunk ${startIndex}-${endIndex}] Datos extraídos:`, datosAudiencia);

                console.log(`[Chunk ${startIndex}-${endIndex}] Volviendo a la lista...`);
                await pageInstance.goBack({ waitUntil: 'networkidle2' });
                await goToAgenda(diaABuscar, pageInstance);
                await pageInstance.waitForSelector(selectorLinks, { visible: true });

                await new Promise(r => setTimeout(r, 500));

                // Reportar progreso de este chunk
                if (onProgressChunk) {
                    onProgressChunk(i);
                }
            } catch (error) {
                console.warn(`[Chunk ${startIndex}-${endIndex}] ⚠️ Error crítico en índice ${i}: ${error.message}`);
                resultadosChunk.push({ index: i, data: null, status: 'error' });
            }
            await pageInstance.mouse.move(0, 0);
            await new Promise(r => setTimeout(r, 10));
        }
    } catch (error) {
        console.error(`[Chunk ${startIndex}-${endIndex}] Error general:`, error);
    } finally {
        await browserInstance.close();
    }

    return resultadosChunk;
}

export async function getInfoAudiencia(diaABuscar = "26", onProgress) {
    await login();
    await goToAgenda(diaABuscar, page);
    const selectorLinks = 'td a';
    await page.waitForSelector(selectorLinks, { visible: true });
    const links = await page.$$(selectorLinks);
    await page.evaluate(() => {
        document.documentElement.style.overflowY = 'scroll';
        document.body.style.overflowY = 'scroll';
    });
    const resultados = [];
    const totalLinks = links.length;
    console.log(`Se encontraron ${totalLinks} elementos.`);

    // Reportar inicio
    if (onProgress) {
        onProgress(0, 0, totalLinks);
    }

    // Primer bucle - preparación (sin reporte de progreso)
    for (let i = 0; i < links.length; i++) {
        try {
            const currentLinks = await page.$$(selectorLinks);
            const link = currentLinks[i];
            if (!link) continue;
            await link.scrollIntoView({ block: 'center', behavior: 'instant' });
            await new Promise(r => setTimeout(r, 100));
            await link.hover();
            const dynamicSelector = 'div.qtip.qtip-default.qtip-pos-tl.qtip-focus';
            await page.waitForSelector(dynamicSelector, { visible: true, timeout: 5000 });
            const info = await page.evaluate((sel) => {
                const element = document.querySelector(sel);
                return element ? element.innerText.trim() : null;
            }, dynamicSelector);
        } catch (error) {
            console.warn(`⚠️ No se pudo obtener info del índice ${i}. Saltando...`);
            resultados.push({ index: i, data: null, status: 'timeout' });
            await page.mouse.move(0, 0);
        }
    }

    // Segundo bucle - preparación (sin reporte de progreso)
    for (let i = 0; i < links.length; i++) {
        try {
            const currentLinks = await page.$$(selectorLinks);
            const link = currentLinks[i];
            if (!link) continue;
            await link.scrollIntoView({ block: 'center', behavior: 'instant' });
            await new Promise(r => setTimeout(r, 100));
            await link.hover();
            const dynamicSelector = 'div.qtip.qtip-default.qtip-focus';
            try {
                await page.waitForSelector(dynamicSelector, { visible: true, timeout: 2000 });
            } catch (e) {
                console.log(`Posible shift detectado en índice ${i}, re-intentando hover...`);
                await link.scrollIntoView({ block: 'center', behavior: 'instant' });
                await new Promise(r => setTimeout(r, 300));
                await link.hover();
                await page.waitForSelector(dynamicSelector, { visible: true, timeout: 0 });
            }
        } catch (error) {
            console.warn(`⚠️ Error crítico en índice ${i}: ${error.message}`);
            resultados.push({ index: i, data: null, status: 'error' });
        }
        await page.mouse.move(0, 0);
        await new Promise(r => setTimeout(r, 10));
    }

    const NUM_BROWSERS = 4;
    const chunkSize = Math.ceil(totalLinks / NUM_BROWSERS);
    const chunks = [];

    // Dividir las audiencias en chunks
    for (let i = 0; i < NUM_BROWSERS; i++) {
        const startIndex = i * chunkSize;
        const endIndex = Math.min(startIndex + chunkSize, totalLinks);
        if (startIndex < totalLinks) {
            chunks.push({ startIndex, endIndex });
        }
    }

    console.log(`Dividiendo ${totalLinks} audiencias en ${chunks.length} chunks para procesamiento paralelo`);
    chunks.forEach((chunk, idx) => {
        console.log(`Chunk ${idx + 1}: índices ${chunk.startIndex}-${chunk.endIndex - 1}`);
    });

    // Contador compartido de progreso
    let completadas = 0;

    // Ejecutar todos los chunks en paralelo
    const resultadosChunks = await Promise.all(
        chunks.map((chunk, idx) => {
            return procesarChunkAudiencias(
                diaABuscar,
                chunk.startIndex,
                chunk.endIndex,
                totalLinks,
                (indexCompletado) => {
                    // Callback de progreso - se ejecuta cada vez que un chunk completa una audiencia
                    completadas++;
                    if (onProgress) {
                        const progress = Math.round((completadas / totalLinks) * 100);
                        onProgress(progress, completadas, totalLinks);
                    }
                }
            );
        })
    );

    // Combinar resultados de todos los chunks
    resultadosChunks.forEach(chunkResultados => {
        resultados.push(...chunkResultados);
    });

    const datosFiltrados = filterAudiencias(resultados);
    console.log(`Datos extraídos (${datosFiltrados.length}):`, datosFiltrados);
    await browser.close();

    return datosFiltrados;
}