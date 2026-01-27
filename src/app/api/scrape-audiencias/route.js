import { NextResponse } from 'next/server';
import { getInfoAudiencia } from '@/app/Administracion-Logistica/modules/scrappingUAL';

export async function POST(request) {
    try {
        const { dia } = await request.json();

        if (!dia) {
            return NextResponse.json({ error: 'Día requerido' }, { status: 400 });
        }

        const resultados = await getInfoAudiencia(dia);

        return NextResponse.json({ success: true, data: resultados });
    } catch (error) {
        console.error('Error en scraping:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
