import getDocument from '@/firebase/firestore/getDocument';

export const maxDuration = 60;

/**
 * GET /api/solicitudes-a-agendar
 * Devuelve todas las solicitudes de solicitudes/pendientes donde agendar === true.
 */
export async function GET() {
    try {
        const data1 = await getDocument('solicitudes', 'pendientes') || {};
        const data2 = await getDocument('solicitudes', 'pendientes2') || {};

        const data = { ...data1, ...data2 };

        if (Object.keys(data).length === 0) {
            return Response.json({ solicitudes: [] });
        }

        const todas = Object.values(data);
        const aAgendar = todas.filter(sol => sol.agendar === true);

        return Response.json({
            total: aAgendar.length,
            solicitudes: aAgendar,
        });
    } catch (error) {
        console.error('[API] Error en solicitudes-a-agendar:', error.message);
        return Response.json({ error: error.message, solicitudes: [] }, { status: 200 });
    }
}

