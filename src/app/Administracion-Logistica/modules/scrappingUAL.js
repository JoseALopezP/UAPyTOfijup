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

async function goToAgenda(diaABuscar) {
    await page.click('a[href="/audiencia/agenda"]');
    await page.waitForSelector('button ::-p-text(Día)', { visible: true });
    await page.click('button ::-p-text(Día)');
    const selector = `td.day ::-p-text(${diaABuscar})`;
    await page.waitForSelector(selector, { visible: true });
    await page.click(selector);
}

export async function getInfoAudiencia(diaABuscar = "26") {
    await login();
    await goToAgenda(diaABuscar);
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
    //getInfoAudiencia
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

            // Click to navigate to detail page
            console.log(`Navegando al detalle del item ${i}...`);
            await Promise.all([
                page.waitForNavigation({ waitUntil: 'networkidle2' }),
                link.click()
            ]);
            await new Promise(r => setTimeout(r, 1000));
            console.log('Página de detalle cargada. Extrayendo datos...');

            console.log('Volviendo a la lista...');
            await page.goBack({ waitUntil: 'networkidle2' });
            await goToAgenda(diaABuscar);
            await page.waitForSelector(selectorLinks, { visible: true });
            await new Promise(r => setTimeout(r, 500));
        } catch (error) {
            console.warn(`⚠️ Error crítico en índice ${i}: ${error.message}`);
            resultados.push({ index: i, data: null, status: 'error' });
        }
        await page.mouse.move(0, 0);
        await new Promise(r => setTimeout(r, 10));
    }
    for (let i = 0; i < links.length; i++) {
        try {
            const currentLinks = await page.$$(selectorLinks);
            const link = currentLinks[i];
            if (!link) continue;
            await link.scrollIntoView({ block: 'center', behavior: 'instant' });
            await new Promise(r => setTimeout(r, 100));
            await link.hover();
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
    const datosFiltrados = filterAudiencias(resultados);
    console.log(`Datos extraídos (${datosFiltrados.length}):`, datosFiltrados);
    await browser.close();

    return datosFiltrados;
}