if (typeof global !== 'undefined' && typeof global.document === 'undefined') {
    global.document = { querySelector: () => null, querySelectorAll: () => [], getElementById: () => null };
}

export const maxDuration = 300; // Si usás Vercel hobby, máximo 60s, pro 300s. Solo por las dudas.

export async function GET(request) {
    let tipo = null;
    try {
        if (!request || !request.url) return new Response('BUILD', { status: 200 });
        const { searchParams } = new URL(request.url);
        tipo = searchParams.get('tipo'); // P.ej. "NUEVA" o "REPROGRAMACION"
    } catch {
        return new Response('Statically generated dummy', { status: 200 });
    }

    if (!tipo) {
        return new Response(JSON.stringify({ error: 'Falta parámetro tipo' }), { status: 400 });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {
            const emit = (obj) => {
                const dataStr = `data: ${JSON.stringify(obj)}\n\n`;
                controller.enqueue(encoder.encode(dataStr));
            };

            try {

                // Puppeteer
                const data = await extraerSolicitudes(existingData, onProgress, tiposAudiencia);

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
