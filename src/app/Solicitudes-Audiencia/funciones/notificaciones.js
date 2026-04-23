import puppeteer from 'puppeteer';

const LOGIN_URL = "http://10.107.1.184:8092/site/login?urlBack=http%3A%2F%2F10.107.1.184%3A8094%2F";

async function login(page) {
    page.setDefaultTimeout(60000);
    page.setDefaultNavigationTimeout(60000);
    await page.goto(LOGIN_URL, { waitUntil: "networkidle2" });
    await page.type("#loginform-username", "20423341980");
    await page.type("#loginform-password", "Marzo24");
    await page.click('button[name="login-button"]');
    await page.waitForSelector('a[href="/audiencia/agenda"]', { visible: true, timeout: 60000 });
}

export async function notificarAudiencia(urlResultante, onProgress) {
    const log = (msg) => {
        console.log(`[notificacion] ${msg}`);
        if (onProgress) onProgress(msg);
    };

    const browser = await puppeteer.launch({
        headless: false,
        args: ["--window-size=1280,720", "--no-sandbox", "--disable-setuid-sandbox"],
        defaultViewport: { width: 1280, height: 720 },
    });

    const page = (await browser.pages())[0] || await browser.newPage();

    try {
        log("Iniciando login...");
        await login(page);
        log("Login OK.");

        log(`Navegando a la URL post-agendamiento: ${urlResultante}`);
        await page.goto(urlResultante, { waitUntil: "networkidle2", timeout: 30000 });

        return { success: true };

    } catch (err) {
        log(`❌ Error durante notificación: ${err.message}`);
        return { success: false, error: err.message };
    } finally {
        await browser.close();
    }
}
