import { agendarAudiencia } from '@/app/Solicitudes-Audiencia/funciones/agendamiento';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

export const maxDuration = 300; // 5 minutos por si puppeteer demora

export async function POST(request) {
    let body;
    try {
        body = await request.json();
    } catch (e) {
        return Response.json({ error: 'Body no válido' }, { status: 400 });
    }

    const {
        linkSol, tipo, jueces, intervinientes, fyhInicio, fyhFin, sala, linkLeg, agregar, documentosBase64, action
    } = body;

    // Configurar Server-Sent Events para un POST con fetch streaming
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {
            const sendEvent = (data) => {
                const message = `data: ${JSON.stringify(data)}\n\n`;
                controller.enqueue(encoder.encode(message));
            };

            const onProgress = (msg) => {
                sendEvent({ type: 'progress', message: msg });
            };

            const tmpFilesToClean = [];

            try {
                // 1. Guardar los PDFs en una carpeta temporal si existen
                const documentos = [];
                if (documentosBase64 && Array.isArray(documentosBase64)) {
                    sendEvent({ type: 'progress', message: `Procesando ${documentosBase64.length} documentos temporales en el servidor...` });
                    
                    for (const doc of documentosBase64) {
                        try {
                            // Convertir de Base64 a raw Buffer
                            const base64Data = doc.base64.replace(/^data:application\/[\w.-]+;base64,/, "");
                            const buffer = Buffer.from(base64Data, 'base64');
                            
                            // Limpiar nombre para la ruta
                            const safeDesc = (doc.descripcion || 'documento').replace(/[^a-z0-9]/gi, '_').toLowerCase();
                            const tmpPath = path.join(os.tmpdir(), `notificacion_${Date.now()}_${safeDesc}.pdf`);
                            
                            await fs.writeFile(tmpPath, buffer);
                            tmpFilesToClean.push(tmpPath);
                            documentos.push({ path: tmpPath, descripcion: doc.descripcion || 'Notificacion' });
                        } catch (err) {
                            console.error("Error decodificando y guardando documento", err);
                            sendEvent({ type: 'progress', message: `⚠️ Error procesando documento: ${doc.descripcion}` });
                        }
                    }
                }

                // 2. Ejecutar Puppeteer pasándole la ruta temporal de los archivos
                sendEvent({ type: 'progress', message: 'Iniciando agendamiento con Puppeteer...' });
                const resultado = await agendarAudiencia({
                    linkSol,
                    tipo,
                    jueces,
                    intervinientes,
                    fyhInicio,
                    fyhFin,
                    sala,
                    linkLeg,
                    agregar,
                    documentos,
                    action,
                    // Pass everything else just in case
                    ...body
                }, onProgress);

                // 3. Notificar finalización del proceso
                sendEvent({
                    type: 'complete',
                    data: resultado
                });

            } catch (error) {
                console.error('Error en API de agendamiento:', error);
                sendEvent({
                    type: 'error',
                    error: error.message
                });
            } finally {
                // 4. Limpieza automática de archivos temporales
                for (const tmpP of tmpFilesToClean) {
                    try {
                        await fs.unlink(tmpP);
                    } catch (e) {
                        console.error('No se pudo borrar el temporal:', tmpP, e);
                    }
                }
                controller.close();
            }
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}
