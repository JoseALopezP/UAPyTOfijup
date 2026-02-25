import { extraerDatosDeUrl } from '@/app/Solicitudes-Audiencia/funciones/extraccion';

export async function POST(request) {
    try {
        const { url } = await request.json();

        if (!url) {
            return new Response(JSON.stringify({ error: 'URL requerida' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        console.log(`[API] Iniciando extracción para: ${url}`);

        // Llamamos a la función de extracción (que usa Puppeteer)
        const data = await extraerDatosDeUrl(url);

        return new Response(JSON.stringify({
            message: 'Extracción completada con éxito',
            data: data
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('[API] Error en extraer-datos:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
