import puppeteer from 'puppeteer';

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

export async function extraerSolicitudes(existingData = []) {
    const browser = await puppeteer.launch({
        headless: false,
        args: ["--window-size=1280,720", "--no-sandbox", "--disable-setuid-sandbox"],
        defaultViewport: { width: 1280, height: 720 },
    });

    const page = (await browser.pages())[0] || await browser.newPage();

    try {
        await login(page);

        console.log(`[extraccion-solicitudes] Navegando a la página de solicitudes: ${SOLICITUD_URL}`);
        await page.goto(SOLICITUD_URL, { waitUntil: "networkidle2" });

        console.log("[extraccion-solicitudes] Aplicando filtros...");

        // Seleccionar PENDIENTE (value: a2ddb5a6-57bc-47b9-8235-e5b0012f3450)
        await page.select("#solicitudsearch-id_estado", "a2ddb5a6-57bc-47b9-8235-e5b0012f3450");

        // Seleccionar SOLICITUD DE AUDIENCIA (value: 37261e4a-94b8-4275-8bb8-0ac5a918feed)
        await page.select("#solicitudsearch-id_tipo_solicitud", "37261e4a-94b8-4275-8bb8-0ac5a918feed");

        // Esperar a que el PJAX recargue la tabla
        await new Promise(r => setTimeout(r, 2000));
        await page.waitForSelector("#w0-container table tbody", { visible: true });

        let allSolicitudes = [];
        let stopFound = false;

        while (!stopFound) {
            console.log("[extraccion-solicitudes] Extrayendo datos de la página actual...");

            const pageData = await page.evaluate(() => {
                const rows = Array.from(document.querySelectorAll('#w0-container table tbody tr:not(.empty)'));
                return rows.map(row => {
                    const cells = row.querySelectorAll('td');
                    if (cells.length < 14) return null;

                    // numeroLeg: 4to td (index 3)
                    const nroLegTd = cells[3];
                    const linkLegObj = nroLegTd.querySelector('a');

                    // caratula: 5to td (index 4)
                    const caratula = cells[4].innerText.trim();

                    // fyhcreacion: 6to td (index 5)
                    const fyhcreacion = cells[5].innerText.trim();

                    // linkSol: 14vo td (index 13)
                    const accionesTd = cells[13];
                    const linkSolObj = accionesTd.querySelector('a');

                    return {
                        numeroLeg: nroLegTd.innerText.trim(),
                        linkLeg: linkLegObj ? linkLegObj.getAttribute('href') : null,
                        caratula: caratula,
                        fyhcreacion: fyhcreacion,
                        linkSol: linkSolObj ? linkSolObj.getAttribute('href') : null
                    };
                }).filter(r => r !== null);
            });

            for (const sol of pageData) {
                // Verificar stop-on-match de arriba hacia abajo
                const isDuplicate = existingData.some(d =>
                    d.numeroLeg === sol.numeroLeg &&
                    d.fyhcreacion === sol.fyhcreacion
                );

                if (isDuplicate) {
                    console.log(`[extraccion-solicitudes] Coincidencia encontrada para ${sol.numeroLeg}. Deteniendo.`);
                    stopFound = true;
                    break;
                }

                allSolicitudes.push(sol);
            }

            if (!stopFound) {
                const nextButton = await page.$('li.next:not(.disabled) a');
                if (nextButton) {
                    console.log("[extraccion-solicitudes] Pasando a la siguiente página...");
                    await nextButton.click();
                    await new Promise(r => setTimeout(r, 2000));
                    await page.waitForSelector("#w0-container table tbody", { visible: true });
                } else {
                    console.log("[extraccion-solicitudes] Fin de las páginas.");
                    stopFound = true;
                }
            }
        }

        console.log(`[extraccion-solicitudes] Extracción finalizada. Total: ${allSolicitudes.length}`);
        return allSolicitudes;

    } catch (error) {
        console.error(`[extraccion-solicitudes] Error: ${error.message}`);
        throw error;
    } finally {
        console.log("[extraccion-solicitudes] Cerrando navegador...");
        await browser.close();
    }
}
