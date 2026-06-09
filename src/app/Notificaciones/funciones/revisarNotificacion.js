import puppeteer from 'puppeteer';
import { getBrowserPath } from '../../../utils/browserPath.js';

async function login(page, credentials = {}) {
    const { username = "27355078316", password = "Marzo24", baseIp = "10.107.1.184" } = credentials;
    const loginUrl = `http://${baseIp}:8092/site/login?urlBack=http%3A%2F%2F${baseIp}%3A8094%2F`;
    page.setDefaultTimeout(60000);
    page.setDefaultNavigationTimeout(60000);
    console.log("[revisar-notificacion] Iniciando login...");
    await page.goto(loginUrl, { waitUntil: "domcontentloaded" });
    await page.type("#loginform-username", username);
    await page.type("#loginform-password", password);
    await page.click('button[name="login-button"]');
    await page.waitForSelector('a[href="/audiencia/agenda"]', { visible: true, timeout: 60000 });
    console.log("[revisar-notificacion] Login exitoso.");
}

export async function revisarNotificacion({ linkSolicitud, credentials = {} }, onProgress) {
    const log = (msg) => {
        console.log(`[revisar-notificacion] ${msg}`);
        if (onProgress) onProgress(msg);
    };

    if (!linkSolicitud) {
        throw new Error("No se proporcionó la URL (linkSolicitud) para revisar.");
    }

    log("Iniciando Puppeteer...");
    const browser = await puppeteer.launch({
        headless: false,
        executablePath: getBrowserPath(),
        slowMo: 60,
        args: ["--window-size=1280,720", "--no-sandbox", "--disable-setuid-sandbox", "--disable-quic"],
        defaultViewport: { width: 1280, height: 720 },
    });

    const page = (await browser.pages())[0] || await browser.newPage();

    try {
        log("Iniciando sesión en el sistema...");
        await login(page, credentials);

        log(`Accediendo a la URL de revisión: ${linkSolicitud}`);
        await page.goto(linkSolicitud, { waitUntil: "domcontentloaded", timeout: 45000 });
        log("Página cargada con éxito.");

        // Espacio para agregar futuros flujos automáticos de revisión.
        // Mantenemos el navegador abierto un momento para que el usuario pueda visualizar la página.
        await new Promise(r => setTimeout(r, 4000));
        log("Proceso de revisión completado preliminarmente.");

        return { success: true };
    } catch (error) {
        log(`❌ Error durante la revisión: ${error.message}`);
        return { success: false, error: error.message };
    } finally {
        log("Cerrando navegador...");
        await browser.close();
    }
}
