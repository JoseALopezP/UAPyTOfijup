import getDocument from '@/firebase new/firestore/getDocument';

export const maxDuration = 60;

/**
 * GET /api/solicitudes-a-agendar
 * Devuelve todas las solicitudes de solicitudes/pendientes donde agendar === true.
 */
export async function GET() {
    try {
        const data = await getDocument('solicitudes', 'pendientes');

        if (!data) {
            return Response.json({ solicitudes: [] });
        }

        const todas = Object.values(data);
        const aAgendar = todas.filter(sol => sol.agendar === true);

        return Response.json({
            total: aAgendar.length,
            solicitudes: aAgendar,
        });
    } catch (error) {
        console.error('[API] Error en solicitudes-a-agendar:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}
