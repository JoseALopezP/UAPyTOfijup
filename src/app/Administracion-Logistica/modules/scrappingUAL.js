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

// Función vacía para que el usuario implemente la extracción de datos del detalle
async function extractDetailData(page) {
    // Aquí puedes usar page.$eval o page.evaluate para sacar info
    // Ejemplo:
    // const detalle = await page.evaluate(() => document.querySelector('.some-class')?.innerText);
    // return { detalle };
    return {};
}
export async function getInfoAudiencia() {
    const diaABuscar = "26";
    await page.goto('http://10.107.1.184:8092/site/login?urlBack=http%3A%2F%2F10.107.1.184%3A8094%2F')
    await page.type('#loginform-username', '20423341980');

    await page.type('#loginform-password', 'Marzo24');

    await page.click('button[name="login-button"]');

    await page.waitForSelector('a[href="/audiencia/agenda"]', { visible: true });

    await page.click('a[href="/audiencia/agenda"]');
    await page.waitForSelector('button ::-p-text(Día)', { visible: true });
    await page.click('button ::-p-text(Día)');
    const selector = `td.day ::-p-text(${diaABuscar})`;
    await page.waitForSelector(selector, { visible: true });
    await page.click(selector);
    const selectorLinks = 'td a';
    await page.waitForSelector(selectorLinks, { visible: true });
    const links = await page.$$(selectorLinks);
    await page.evaluate(() => {
        document.documentElement.style.overflowY = 'scroll';
        document.body.style.overflowY = 'scroll';
    });
    const resultados = [];

    console.log(`Se encontraron ${links.length} elementos.`);
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

    // --- NUEVO LOOP DE NAVEGACIÓN A DETALLE ---
    console.log('Iniciando extracción de detalles...');

    // Recorremos los resultados que ya tenemos.
    // Nota: Como resultados se llena incrementalmente, coincide en índice con los links de la lista original.
    for (let i = 0; i < resultados.length; i++) {
        const item = resultados[i];
        if (!item || item.status === 'error' || item.status === 'timeout') continue;

        try {
            // 1. Re-localizar los links porque al volver atrás pueden perderse las referencias
            const currentLinks = await page.$$(selectorLinks);
            const link = currentLinks[item.index];

            if (!link) {
                console.warn(`No se encontró el link para el índice ${item.index}`);
                continue;
            }

            // 2. Navegar al detalle
            console.log(`Navegando al detalle del item ${item.index}...`);
            await link.scrollIntoView({ block: 'center', behavior: 'instant' });
            await new Promise(r => setTimeout(r, 200));

            // Navegamos y esperamos a que cargue algo significativo de la nueva página.
            // Ajusta 'body' o un selector específico de la página de detalle si lo conoces.
            await Promise.all([
                page.waitForNavigation({ waitUntil: 'networkidle2' }),
                link.click()
            ]);

            // 3. Extraer datos con la función del usuario
            const datosExtra = await extractDetailData(page);

            // Fusionamos los datos nuevos con lo que ya teníamos
            resultados[i] = { ...item, ...datosExtra };

            // 4. Volver atrás
            console.log('Volviendo a la lista...');
            await page.goBack({ waitUntil: 'networkidle2' });

            // 5. Esperar a que la tabla/lista esté visible de nuevo
            await page.waitForSelector(selectorLinks, { visible: true });

            // Pequeña pausa de seguridad
            await new Promise(r => setTimeout(r, 500));

        } catch (error) {
            console.error(`Error procesando detalle del índice ${item.index}:`, error);
            // Intentamos recuperar la navegación si algo falló
            try {
                const urlActual = page.url();
                if (!urlActual.includes('agenda')) { // Si no estamos en la agenda, intentamos volver
                    await page.goBack({ waitUntil: 'networkidle2' });
                    await page.waitForSelector(selectorLinks, { visible: true });
                }
            } catch (recoveryError) {
                console.error('Error recuperando navegación:', recoveryError);
            }
        }
    }
    console.log(`Datos extraídos (${filterAudiencias(resultados).length}):`, filterAudiencias(resultados));
    await browser.close();
}