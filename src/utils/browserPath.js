import fs from 'fs';
import path from 'path';

/**
 * Intenta encontrar una ruta válida al ejecutable de Chrome o Edge en Windows.
 * Esto es necesario para que Puppeteer funcione en máquinas donde no se descargó 
 * el binario interno durante el build de Electron.
 */
export function getBrowserPath() {
    const commonPaths = [
        // Rutas estándar de Chrome
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        // Rutas estándar de Edge (compatible con Puppeteer)
        'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
        'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
        // Ruta de usuario (Chrome)
        path.join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe'),
    ];

    for (const p of commonPaths) {
        if (fs.existsSync(p)) {
            console.log(`[BrowserPath] Encontrado: ${p}`);
            return p;
        }
    }

    console.warn('[BrowserPath] No se encontró una instalación de Chrome o Edge. Se usará la de Puppeteer (si existe).');
    return undefined; // Puppeteer intentará usar su binario interno
}
