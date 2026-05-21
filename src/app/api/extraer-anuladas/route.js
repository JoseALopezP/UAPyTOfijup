export const maxDuration = 600;

export async function POST(request) {
    let body = {};
    try {
        body = await request.json();
    } catch {
        return new Response(JSON.stringify({ type: 'error', error: 'Body inválido' }), { status: 400 });
    }

    const { fechaHasta, downloadDir } = body;

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {
            const emit = (obj) => {
                const line = JSON.stringify(obj) + '\n';
                controller.enqueue(encoder.encode(line));
            };

            try {
                const { extraerAnuladas } = await import('@/app/Solicitudes-Audiencia/funciones/extraccionAnuladas');

                const data = await extraerAnuladas({
                    fechaHasta,
                    downloadDir: downloadDir || null,
                    onProgress: (msg, pct) => {
                        emit({ type: 'progress', message: msg, pct: pct || null });
                    },
                });

                emit({ type: 'done', data });
            } catch (error) {
                console.error('[API extraer-anuladas] Error:', error);
                emit({ type: 'error', error: error.message });
            } finally {
                controller.close();
            }
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'application/x-ndjson',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache',
        }
    });
}
