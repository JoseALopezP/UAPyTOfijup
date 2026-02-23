import puppeteer from 'puppeteer';

const LOGIN_URL = "http://10.107.1.184:8092/site/login?urlBack=http%3A%2F%2F10.107.1.184%3A8094%2F";

async function login(page) {
    console.log("[extraccion] Iniciando login...");
    await page.goto(LOGIN_URL, { waitUntil: "networkidle2" });
    await page.type("#loginform-username", "20423341980");
    await page.type("#loginform-password", "Marzo24");
    await page.click('button[name="login-button"]');
    await page.waitForSelector('a[href="/audiencia/agenda"]', { visible: true, timeout: 15000 });
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

        console.log("[extraccion] Página lista para futuras extracciones.");

    } catch (error) {
        console.error(`[extraccion] Error: ${error.message}`);
        throw error;
    } finally {
        console.log("[extraccion] Cerrando navegador...");
        await browser.close();
    }
}
