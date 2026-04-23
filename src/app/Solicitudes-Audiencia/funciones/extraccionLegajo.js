import puppeteer from 'puppeteer';

const LOGIN_URL = "http://10.107.1.184:8092/site/login?urlBack=http%3A%2F%2F10.107.1.184%3A8094%2F";

async function login(page) {
    page.setDefaultTimeout(60000);
    page.setDefaultNavigationTimeout(60000);
    console.log("[extraccion] Iniciando login...");
    await page.goto(LOGIN_URL, { waitUntil: "networkidle2" });
    await page.type("#loginform-username", "20423341980");
    await page.type("#loginform-password", "Marzo24");
    await page.click('button[name="login-button"]');
    await page.waitForSelector('a[href="/audiencia/agenda"]', { visible: true, timeout: 60000 });
    console.log("[extraccion] Login exitoso.");
}
export async function extraerDatosDeUrl(url) {
    if (!url) throw new Error("URL no proporcionada");

    const browser = await puppeteer.launch({
        headless: false,
        args: ["--window-size=1280,720", "--no-sandbox", "--disable-setuid-sandbox"],
        defaultViewport: { width: 1280, height: 720 },
    });

    const page = (await browser.pages())[0] || await browser.newPage();

    try {
        await login(page);

        console.log(`[extraccion] Navegando a: ${url}`);
        await page.goto(url, { waitUntil: "networkidle2" });

        console.log("[extraccion] Iniciando extracción de datos de la tabla...");
        const data = await page.evaluate(() => {
            const results = {
                numeroLeg: null,
                caratula: null,
                ufi: null,
                fyhcreacion: null,
                jueces: [],
                defensaOficial: [],
                fiscal: [],
                defensorParticular: [],
                imputados: []
            };

            // Extraer Número de Legajo
            const panelTitle = document.querySelector('.panel-title');
            if (panelTitle) {
                results.numeroLeg = panelTitle.innerText.replace(/Número de legajo:\s*/i, '').trim();
            }

            // Extraer datos de la tabla de detalles (Carátula, Organismo, Fecha)
            const detailRows = document.querySelectorAll('.detail-view tr');
            detailRows.forEach(row => {
                const head = row.querySelector('th');
                const cell = row.querySelector('td');
                if (!head || !cell) return;

                const label = head.innerText.trim().toUpperCase();
                const value = cell.innerText.trim();

                if (label.includes('CARÁTULA')) {
                    results.caratula = value;
                } else if (label.includes('ORGANISMO')) {
                    results.ufi = value;
                } else if (label.includes('FECHA Y HORA CREACIÓN')) {
                    results.fyhcreacion = value;
                }
            });

            // Extraer datos de la tabla de participantes (Defensa, Fiscal, Imputados)
            const rows = document.querySelectorAll('#w9-container table tbody tr');

            rows.forEach(row => {
                const cells = row.querySelectorAll('td');
                if (cells.length < 2) return;

                const nombreTd = cells[0];
                const tipoTd = cells[1];

                const nombreText = nombreTd.innerText.trim();
                const tipoText = tipoTd.innerText.trim().toUpperCase();

                if (tipoText.includes('DEFENSOR OFICIAL')) {
                    results.defensaOficial.push(nombreText);
                } else if (tipoText.includes('FISCAL')) {
                    results.fiscal.push(nombreText);
                } else if (tipoText.includes('DEFENSOR PARTICULAR')) {
                    results.defensorParticular.push(nombreText);
                } else if (tipoText.includes('IMPUTADO')) {
                    const link = nombreTd.querySelector('a');
                    results.imputados.push({
                        nombre: nombreText,
                        link: link ? link.getAttribute('href') : null
                    });
                }
            });

            return results;
        });

        // Extraer Jueces (requiere clickear pestaña)
        console.log("[extraccion] Extrayendo jueces...");
        try {
            await page.click('a[href="#jueces"]');
            // Esperar a que la tabla de jueces sea visible dentro del panel
            await page.waitForSelector('#jueces table', { visible: true, timeout: 5000 });

            const jueces = await page.evaluate(() => {
                const rows = document.querySelectorAll('#jueces table tbody tr');
                const list = [];
                rows.forEach(row => {
                    const cell = row.querySelector('td[data-col-seq="1"]');
                    if (cell) list.push(cell.innerText.trim());
                });
                return list;
            });
            data.jueces = jueces;
            console.log(`[extraccion] Jueces encontrados: ${jueces.length}`);
        } catch (juecesErr) {
            console.error("[extraccion] Error al extraer jueces:", juecesErr.message);
        }

        if (data.imputados.length > 0) {
            console.log(`[extraccion] Iniciando extracción de DNI para ${data.imputados.length} imputados...`);
            const urlObj = new URL(url);
            const baseURL = `${urlObj.protocol}//${urlObj.host}`;

            for (const imputado of data.imputados) {
                if (!imputado.link) continue;

                const profileURL = imputado.link.startsWith('http') ? imputado.link : `${baseURL}${imputado.link}`;
                console.log(`[extraccion] Navegando al perfil de ${imputado.nombre}...`);
                try {
                    await page.goto(profileURL, { waitUntil: "domcontentloaded", timeout: 10000 });

                    // Esperar a que el contenido cargue (sea en la página principal o en un iframe)
                    await new Promise(r => setTimeout(r, 1000));

                    let targetContext = page;
                    const iframeElement = await page.$('iframe');

                    if (iframeElement) {
                        console.log(`[extraccion] Iframe detectado para ${imputado.nombre}, cambiando contexto...`);
                        targetContext = await iframeElement.contentFrame();
                    }

                    await targetContext.waitForSelector('#documentos table', { visible: true, timeout: 5000 });

                    const dni = await targetContext.evaluate(() => {
                        const table = document.querySelector('#documentos table');
                        if (!table) return null;
                        const rows = table.querySelectorAll('tbody tr');
                        for (const row of rows) {
                            const cells = row.querySelectorAll('td');
                            if (cells.length >= 2) {
                                const tipo = cells[0].innerText.trim().toUpperCase();
                                if (tipo === 'DNI') {
                                    return cells[1].innerText.trim();
                                }
                            }
                        }
                        return null;
                    });

                    imputado.dni = dni;
                    console.log(`[extraccion] DNI extraído para ${imputado.nombre}: ${dni}`);

                } catch (err) {
                    console.error(`[extraccion] Error en perfil de ${imputado.nombre}: ${err.message}`);
                    imputado.dni = null;
                }
            }
        }

        console.log("[extraccion] Extracción finalizada. Enviando resultados:", data);

        return data;

    } catch (error) {
        console.error(`[extraccion] Error: ${error.message}`);
        throw error;
    } finally {
        console.log("[extraccion] Cerrando navegador...");
        await browser.close();
    }
}
