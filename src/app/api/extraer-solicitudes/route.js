export const maxDuration = 300;

export async function GET(request) {
    let tipo = null;
    try {
        if (!request || !request.url) return new Response('BUILD', { status: 200 });
        const { searchParams } = new URL(request.url);
        tipo = searchParams.get('tipo');
    } catch {
        return new Response('Statically generated dummy', { status: 200 });
    }

    if (!tipo) {
        return new Response(JSON.stringify({ error: 'Falta parámetro tipo', data: [] }), { status: 200 });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {
            const emit = (obj) => {
                const dataStr = `data: ${JSON.stringify(obj)}\n\n`;
                controller.enqueue(encoder.encode(dataStr));
            };

            try {
                const { extraerSolicitudes } = await import('@/app/Solicitudes-Audiencia/funciones/extraccionSolicitudes');

                const data = await extraerSolicitudes(tipo, (msg, done = false) => {
                    emit({ message: msg, done });
                });

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
