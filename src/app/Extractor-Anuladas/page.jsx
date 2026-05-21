import ExtractorAnuladas from '../Solicitudes-Audiencia/components/ExtractorAnuladas'

export const metadata = {
    title: 'Extractor Solicitudes Anuladas — UAC',
    description: 'Extrae solicitudes de tipo SUSPENSIÓN/MODIFICACIÓN con estado ANULADA del sistema PUMA',
}

export default function Page() {
    return <ExtractorAnuladas />
}
