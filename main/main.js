import { app, BrowserWindow, globalShortcut, ipcMain, Menu } from 'electron';
import serve from 'electron-serve';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';

// Dynamically import required puppeteer modules from the Next.js src folder
import { agendarAudiencia, rechazarSolicitud } from '../src/app/Solicitudes-Audiencia/funciones/agendamiento.js';
import { extraerSolicitudes } from '../src/app/Solicitudes-Audiencia/funciones/extraccionSolicitudes.js';
import { extraerAnuladas } from '../src/app/Solicitudes-Audiencia/funciones/extraccionAnuladas.js';
import { extraerDetalles } from '../src/app/Solicitudes-Audiencia/funciones/extraccionDetalles.js';
import { getInfoAudiencia } from '../src/app/Pumba/components/scrappingUAL.js';
import { bloqueoMasivoAuto, parsearBloques } from '../src/firebase/firestore/bloqueoAuto.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const appServe = app.isPackaged ? serve({
  directory: path.join(__dirname, "../out")
}) : null;

let mainWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
    devTools: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      enableRemoteModule: false,
    }
  });

  const template = [
    {
      label: 'Archivo',
      submenu: [
        { label: 'Salir', role: 'quit' }
      ]
    },
    {
      label: 'Edición',
      submenu: [
        { label: 'Deshacer', role: 'undo' },
        { label: 'Rehacer', role: 'redo' },
        { type: 'separator' },
        { label: 'Cortar', role: 'cut' },
        { label: 'Copiar', role: 'copy' },
        { label: 'Pegar', role: 'paste' },
        { label: 'Eliminar', role: 'delete' },
        { type: 'separator' },
        { label: 'Seleccionar todo', role: 'selectAll' }
      ]
    },
    {
      label: 'Vista',
      submenu: [
        { label: 'Recargar', role: 'reload' },
        { label: 'Forzar recarga', role: 'forceReload' },
        { label: 'Herramientas de desarrollo', role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  mainWindow.webContents.on('context-menu', (e, props) => {
    const { isEditable } = props;
    if (isEditable) {
      const contextMenu = Menu.buildFromTemplate([
        { label: 'Deshacer', role: 'undo' },
        { label: 'Rehacer', role: 'redo' },
        { type: 'separator' },
        { label: 'Cortar', role: 'cut' },
        { label: 'Copiar', role: 'copy' },
        { label: 'Pegar', role: 'paste' },
        { type: 'separator' },
        { label: 'Seleccionar todo', role: 'selectAll' }
      ]);
      contextMenu.popup(mainWindow);
    }
  });

  if (app.isPackaged) {
    appServe(mainWindow).then(() => {
      mainWindow.loadURL("app://-");
    });
  } else {
    mainWindow.loadURL("http://localhost:3000");
    mainWindow.webContents.openDevTools();
    
    // Pipe renderer logs to the terminal
    mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
      console.log(`[RENDERER] ${message}`);
    });

    mainWindow.webContents.on("did-fail-load", (e, code, desc) => {
      mainWindow.webContents.reloadIgnoringCache();
    });
  }
  mainWindow.on('closed', () => {
    globalShortcut.unregisterAll();
  });
};

async function getPumaCredentials(type = 'general') {
  const configPath = path.join(app.getPath('userData'), 'puma_config.json');
  try {
    const data = await fs.readFile(configPath, 'utf8');
    const config = JSON.parse(data);
    
    // Check if the configuration has the nested structure
    if (config.general || config.solicitudes) {
      const section = config[type] || {};
      return {
        username: section.username || (type === 'general' ? "20423341980" : "27355078316"),
        password: section.password || "Marzo24",
        baseIp: section.baseIp || "10.107.1.184"
      };
    }
    
    // Fallback to old flat structure for backward compatibility
    return {
      username: config.username || "20423341980",
      password: config.password || "Marzo24",
      baseIp: config.baseIp || "10.107.1.184"
    };
  } catch (error) {
    const defaultConfig = {
      general: {
        username: "20423341980",
        password: "Marzo24",
        baseIp: "10.107.1.184"
      },
      solicitudes: {
        username: "27355078316",
        password: "Marzo24",
        baseIp: "10.107.1.184"
      }
    };
    try {
      await fs.writeFile(configPath, JSON.stringify(defaultConfig, null, 2), 'utf8');
    } catch (writeErr) {
      console.error('Error writing default puma_config.json:', writeErr);
    }
    return defaultConfig[type];
  }
}

app.on("ready", () => {
  createWindow();

  // ------ IPC Handlers for Configuration Management ------

  ipcMain.handle('get-puma-config', async () => {
    const configPath = path.join(app.getPath('userData'), 'puma_config.json');
    try {
      const data = await fs.readFile(configPath, 'utf8');
      return JSON.parse(data);
    } catch {
      return {
        general: { username: "20423341980", password: "Marzo24", baseIp: "10.107.1.184" },
        solicitudes: { username: "27355078316", password: "Marzo24", baseIp: "10.107.1.184" }
      };
    }
  });

  ipcMain.handle('save-puma-config', async (event, newConfig) => {
    const configPath = path.join(app.getPath('userData'), 'puma_config.json');
    try {
      const config = {
        general: {
          username: newConfig.general?.username || newConfig.username || "",
          password: newConfig.general?.password || newConfig.password || "",
          baseIp: newConfig.general?.baseIp || newConfig.baseIp || ""
        },
        solicitudes: {
          username: newConfig.solicitudes?.username || newConfig.username || "",
          password: newConfig.solicitudes?.password || newConfig.password || "",
          baseIp: newConfig.solicitudes?.baseIp || newConfig.baseIp || ""
        }
      };
      await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf8');
      return { success: true };
    } catch (error) {
      console.error('Error saving puma_config.json:', error);
      return { success: false, error: error.message };
    }
  });

  // ------ IPC Handlers for Puppeteer Scripts ------

  ipcMain.handle('agendar-puppeteer', async (event, body) => {
    const sendEvent = (data) => {
      event.sender.send('agendar-puppeteer-progress', data);
    };
    const onProgress = (msg) => {
      sendEvent({ type: 'progress', message: msg });
    };

    const tmpFilesToClean = [];
    try {
      const { linkSol, tipo, jueces, intervinientes, fyhInicio, fyhFin, sala, linkLeg, agregar, documentosBase64, action } = body;
      
      let documentos = [];
      if (documentosBase64 && Array.isArray(documentosBase64)) {
        sendEvent({ type: 'progress', message: `Procesando ${documentosBase64.length} documentos temporales...` });
        for (const doc of documentosBase64) {
          try {
            const base64Data = doc.base64.replace(/^data:application\/[\w.-]+;base64,/, "");
            const buffer = Buffer.from(base64Data, 'base64');
            const safeDesc = (doc.descripcion || 'documento').replace(/[^a-z0-9]/gi, '_').toLowerCase();
            const tmpPath = path.join(os.tmpdir(), `notificacion_${Date.now()}_${safeDesc}.pdf`);
            await fs.writeFile(tmpPath, buffer);
            tmpFilesToClean.push(tmpPath);
            documentos.push({ path: tmpPath, descripcion: doc.descripcion || 'Notificacion' });
          } catch (err) {
            console.error("Error decodificando dcoumento", err);
            sendEvent({ type: 'progress', message: `⚠️ Error procesando documento: ${doc.descripcion}` });
          }
        }
      }

      sendEvent({ type: 'progress', message: 'Iniciando agendamiento con Puppeteer local...' });
      
      const credentials = await getPumaCredentials('solicitudes');
      const resultado = await agendarAudiencia({
        linkSol, tipo, jueces, intervinientes, fyhInicio, fyhFin, sala, linkLeg, agregar, documentos, action, credentials, ...body
      }, onProgress);

      sendEvent({ type: 'done', data: resultado });
      return { success: true, resultado };
    } catch (error) {
      console.error('Error in agendar-puppeteer IPC:', error);
      sendEvent({ type: 'error', error: error.message });
      return { success: false, error: error.message };
    } finally {
      for (const tmpP of tmpFilesToClean) {
        try { await fs.unlink(tmpP); } catch(e) {}
      }
    }
  });

  ipcMain.handle('extraer-solicitudes', async (event, body) => {
    const sendEvent = (data) => {
      event.sender.send('extraer-solicitudes-progress', data);
    };
    const onProgress = (msg) => {
      sendEvent({ type: 'progress', message: msg });
    };

    try {
      const { existingData, tiposAudiencia, forceReviewAll } = body;
      sendEvent({ type: 'progress', message: 'Extraer: Inicializando Puppeteer...' });
      
      const credentials = await getPumaCredentials('solicitudes');
      const result = await extraerSolicitudes(existingData || [], onProgress, tiposAudiencia || [], forceReviewAll, credentials);
      
      sendEvent({ type: 'done', data: result });
      return { success: true, data: result };
    } catch (error) {
      console.error('Error in extraer-solicitudes IPC:', error);
      sendEvent({ type: 'error', error: error.message });
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('extraer-solicitud-individual', async (event, body) => {
    try {
      const { solicitud, tiposAudiencia } = body;
      const credentials = await getPumaCredentials('solicitudes');
      const result = await extraerDetalles([solicitud], null, tiposAudiencia || [], credentials);
      if (result && result.length > 0) {
        return { success: true, data: result[0] };
      }
      return { success: false, error: "No se devolvieron datos." };
    } catch (error) {
      console.error('Error in extraer-solicitud-individual IPC:', error);
      return { success: false, error: error.message };
    }
  });
  
  ipcMain.handle('scrape-pumba', async (event, { dia }) => {
    const sendEvent = (data) => {
      event.sender.send('scrape-pumba-progress', data);
    };
    const onProgress = (progress, current, total) => {
      sendEvent({
        type: 'progress',
        progress,
        current,
        total,
        message: `Procesando ${current} de ${total}...`
      });
    };

    try {
      console.log(`[IPC] Iniciando scrape-pumba para día: ${dia}`);
      const credentials = await getPumaCredentials('general');
      const resultados = await getInfoAudiencia(dia, onProgress, credentials);
      
      sendEvent({
        type: 'complete',
        data: resultados,
        progress: 100
      });
      return { success: true, data: resultados };
    } catch (error) {
      console.error('Error in scrape-pumba IPC:', error);
      sendEvent({ type: 'error', error: error.message });
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('bloqueo-masivo', async (event, body) => {
    const sendEvent = (data) => {
      event.sender.send('bloqueo-masivo-progress', data);
    };

    try {
      const { fixed, bloques, periodos } = body;
      const periodosParsed = bloques ? parsearBloques(bloques) : (periodos || []);
      
      const credentials = await getPumaCredentials('general');
      await bloqueoMasivoAuto(fixed, periodosParsed, sendEvent, credentials);
      return { success: true };
    } catch (error) {
      console.error('Error in bloqueo-masivo IPC:', error);
      sendEvent({ type: 'fatal', message: error.message });
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('rechazar-solicitud', async (event, body) => {
    const sendEvent = (data) => {
      event.sender.send('agendar-puppeteer-progress', data);
    };
    const onProgress = (msg) => {
      sendEvent({ type: 'progress', message: msg });
    };

    try {
      const { solicitud, razonRechazo, solicitanteRechazo } = body;
      const linkLeg = solicitud.linkLeg;
      const linkSol = solicitud.linkSol;
      const numeroLeg = solicitud.numeroLeg;
      const fyhcreacion = solicitud.fyhcreacion;
      const legajoFiscal = solicitud.legajoFiscal || numeroLeg;

      if (!linkLeg) throw new Error('No se proporcionó linkLeg para rechazar la solicitud.');

      sendEvent({ type: 'progress', message: `Iniciando rechazo de solicitud ${numeroLeg}...` });

      const credentials = await getPumaCredentials('solicitudes');
      const resultado = await rechazarSolicitud({
        linkLeg, linkSol, razonRechazo, numeroLeg, fyhcreacion, legajoFiscal,
        solicitante: solicitanteRechazo || 'MPF', credentials
      }, onProgress);

      sendEvent({ type: 'done', data: resultado });
      return { success: true, resultado };
    } catch (error) {
      console.error('Error in rechazar-solicitud IPC:', error);
      sendEvent({ type: 'error', error: error.message });
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('extraer-anuladas', async (event, body) => {
    const sendEvent = (data) => {
      event.sender.send('extraer-anuladas-progress', data);
    };
    const onProgress = (msg, pct) => {
      sendEvent({ type: 'progress', message: msg, pct: pct || null });
    };

    try {
      const { fechaHasta, downloadDir } = body;
      sendEvent({ type: 'progress', message: 'Inicializando extracción de anuladas...' });
      
      const credentials = await getPumaCredentials('solicitudes');
      const result = await extraerAnuladas({
        fechaHasta,
        downloadDir: downloadDir || null,
        onProgress,
        credentials
      });
      
      sendEvent({ type: 'done', data: result });
      return { success: true, data: result };
    } catch (error) {
      console.error('Error in extraer-anuladas IPC:', error);
      sendEvent({ type: 'error', error: error.message });
      return { success: false, error: error.message };
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
