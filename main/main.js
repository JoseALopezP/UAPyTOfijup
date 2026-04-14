import { app, BrowserWindow, globalShortcut, ipcMain, Menu } from 'electron';
import serve from 'electron-serve';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';

// Dynamically import required puppeteer modules from the Next.js src folder
import { agendarAudiencia, rechazarSolicitud } from '../src/app/Solicitudes-Audiencia/funciones/agendamiento.js';
import { extraerSolicitudes } from '../src/app/Solicitudes-Audiencia/funciones/extraccionSolicitudes.js';
import { getInfoAudiencia } from '../src/app/Pumba/components/scrappingUAL.js';
import { bloqueoMasivoAuto, parsearBloques } from '../src/firebase new/firestore/bloqueoAuto.js';

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
    mainWindow.webContents.on("did-fail-load", (e, code, desc) => {
      mainWindow.webContents.reloadIgnoringCache();
    });
  }
  mainWindow.on('closed', () => {
    globalShortcut.unregisterAll();
  });
};

app.on("ready", () => {
  createWindow();

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
      
      const resultado = await agendarAudiencia({
        linkSol, tipo, jueces, intervinientes, fyhInicio, fyhFin, sala, linkLeg, agregar, documentos, action, ...body
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
      const { existingData, tiposAudiencia } = body;
      sendEvent({ type: 'progress', message: 'Extraer: Inicializando Puppeteer...' });
      
      const result = await extraerSolicitudes(existingData || [], onProgress, tiposAudiencia || []);
      
      sendEvent({ type: 'done', data: result });
      return { success: true, data: result };
    } catch (error) {
      console.error('Error in extraer-solicitudes IPC:', error);
      sendEvent({ type: 'error', error: error.message });
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
      const resultados = await getInfoAudiencia(dia, onProgress);
      
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
      
      await bloqueoMasivoAuto(fixed, periodosParsed, sendEvent);
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

      const resultado = await rechazarSolicitud({
        linkLeg, linkSol, razonRechazo, numeroLeg, fyhcreacion, legajoFiscal,
        solicitante: solicitanteRechazo || 'MPF'
      }, onProgress);

      sendEvent({ type: 'done', data: resultado });
      return { success: true, resultado };
    } catch (error) {
      console.error('Error in rechazar-solicitud IPC:', error);
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
