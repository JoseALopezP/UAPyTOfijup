import { bloqueoMasivoAuto, generarPeriodos } from '@/firebase new/firestore/bloqueoAuto';

// Configuración por defecto — se puede sobreescribir enviando body en el POST
const FIXED_DEFAULT = {
    tipoPersona: "juez",
    idPersona: "48c86072-79f4-4a01-88b1-e9ed025e740a", // PARRA, ANA CAROLINA
    idMotivo: "3114ef2d-6986-4e7e-8c04-d65b9905f6db", // LICENCIA
    observaciones: "Posgrado Parra",
};

// Por defecto: lunes y jueves de marzo a noviembre 2026, 16:00-20:00
const PERIODOS_DEFAULT = generarPeriodos(2026, 4, 11, [1, 4], "16:00:00", "20:00:00");

export async function POST(request) {
    let fixed = FIXED_DEFAULT;
    let periodos = PERIODOS_DEFAULT;

    // Permitir sobreescribir config enviando JSON en el body
    try {
        const body = await request.json();
        if (body.fixed) fixed = { ...FIXED_DEFAULT, ...body.fixed };
        if (body.periodos) periodos = body.periodos;
    } catch {
        // Sin body → usar defaults
    }

    // Correr en background para no bloquear la respuesta HTTP
    // (Puppeteer puede tardar mucho)
    bloqueoMasivoAuto(fixed, periodos).catch(err =>
        console.error("[bloqueo-auto] Error:", err)
    );

    return new Response(
        JSON.stringify({
            ok: true,
            message: `Proceso iniciado. Se procesarán ${periodos.length} períodos.`,
            periodos: periodos.length,
        }),
        {
            status: 202,
            headers: { "Content-Type": "application/json" },
        }
    );
}
