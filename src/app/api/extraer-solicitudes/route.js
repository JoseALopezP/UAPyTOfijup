import { extraerSolicitudes } from '@/app/Solicitudes-Audiencia/funciones/extraccionSolicitudes';

export async function POST(request) {
    try {
        const { existingData } = await request.json() || { existingData: [] };

        console.log(`[API] Iniciando extracción masiva de solicitudes...`);

        // Llamamos a la función de extracción (que usa Puppeteer)
        const data = await extraerSolicitudes(existingData);

        return new Response(JSON.stringify({
            message: 'Extracción de solicitudes completada con éxito',
            data: data
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('[API] Error en extraer-solicitudes:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
