import { bloqueoMasivoAuto, parsearBloques } from '@/firebase new/firestore/bloqueoAuto';

/**
 * POST /api/bloqueo-auto/stream
 * Igual que /api/bloqueo-auto pero usa Server-Sent Events para
 * transmitir progreso y errores en tiempo real al cliente.
 *
 * Body esperado:
 * {
 *   fixed: { tipoPersona, idPersona, idMotivo, observaciones },
 *   bloques: ["DD/MM/AAAA | HH:MM - HH:MM", ...]
 * }
 */
export async function POST(request) {
    const body = await request.json().catch(() => ({}));

    const fixed = body.fixed || {};
    const periodos = body.bloques
        ? parsearBloques(body.bloques)
        : (body.periodos || []);

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            const send = (data) => {
                try {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
                } catch { /* cliente desconectado */ }
            };

            try {
                await bloqueoMasivoAuto(fixed, periodos, send);
            } catch (err) {
                send({ type: 'fatal', message: err.message });
            } finally {
                try { controller.close(); } catch { /* ya cerrado */ }
            }
        },
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no',
        },
    });
}
