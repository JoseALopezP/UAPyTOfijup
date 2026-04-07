export async function GET(request) {
    let dia = null;
    try {
        if (!request || !request.url) return new Response('BUILD', { status: 200 });
        const { searchParams } = new URL(request.url);
        dia = searchParams.get('dia');
    } catch {
        return new Response('Statically generated dummy', { status: 200 });
    }

    if (!dia) {
        return new Response(JSON.stringify({ error: 'Día requerido', data: [] }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // Configurar Server-Sent Events
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {
            try {
                // Función para enviar eventos al cliente
                const sendEvent = (data) => {
                    const message = `data: ${JSON.stringify(data)}\n\n`;
                    controller.enqueue(encoder.encode(message));
                };

                // Callback de progreso
                const onProgress = (progress, current, total) => {
                    sendEvent({
                        type: 'progress',
                        progress,
                        current,
                        total,
                        message: `Procesando ${current} de ${total}...`
                    });
                };

                const { getInfoAudiencia } = await import('@/app/Pumba/components/scrappingUAL');
                
                // Ejecutar scraping con callback de progreso
                const resultados = await getInfoAudiencia(dia, onProgress);

                // Enviar resultado final
                sendEvent({
                    type: 'complete',
                    data: resultados,
                    progress: 100
                });

                controller.close();
            } catch (error) {
                console.error('Error en scraping:', error);
                const errorMessage = `data: ${JSON.stringify({
                    type: 'error',
                    error: error.message
                })}\n\n`;
                controller.enqueue(encoder.encode(errorMessage));
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
