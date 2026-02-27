import { extraerSolicitudes } from '@/app/Solicitudes-Audiencia/funciones/extraccionSolicitudes';

export const maxDuration = 300; // Si usás Vercel hobby, máximo 60s, pro 300s. Solo por las dudas.

export async function POST(request) {
    const { existingData } = await request.json().catch(() => ({ existingData: [] }));

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            console.log(`[API] Iniciando extracción masiva de solicitudes (Streaming)...`);

            // Callback que envía JSON \n a la respuesta
            const onProgress = (msg, pct = null) => {
                const data = JSON.stringify({ type: 'progress', message: msg, progress: pct }) + '\n';
                controller.enqueue(encoder.encode(data));
            };

            try {
                // Notificamos inicio
                onProgress("Iniciando proceso en el servidor...");

                // Puppeteer
                const data = await extraerSolicitudes(existingData, onProgress);

                // Resultado final
                const finalData = JSON.stringify({ type: 'done', data }) + '\n';
                controller.enqueue(encoder.encode(finalData));
            } catch (error) {
                console.error('[API] Error en extraer-solicitudes:', error);
                const errData = JSON.stringify({ type: 'error', error: error.message }) + '\n';
                controller.enqueue(encoder.encode(errData));
            } finally {
                controller.close();
            }
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'application/x-ndjson',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        }
    });
}
