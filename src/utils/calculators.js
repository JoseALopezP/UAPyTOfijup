function parseTime(timeStr) {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return (hours * 60) + minutes;
}

export function calculateCuartos(hitos) {
    return hitos.reduce((acc, hito, i, arr) => {
        if (hito.includes('CUARTO_INTERMEDIO') && i < arr.length - 1) {
            const tiempoActual = parseTime(hito.split(' | ')[0]);
            const tiempoSiguiente = parseTime(arr[i + 1].split(' | ')[0]);
            return acc + (tiempoSiguiente - tiempoActual);
        }
        return acc;
    }, 0);
}
export function calculateCuartosOtros(hitos) {
    return hitos.reduce((acc, hito, i, arr) => {
        if (hito.includes('CUARTO_INTERMEDIO') && !hito.includes('JUEZ') && i < arr.length - 1) {
            const tiempoActual = parseTime(hito.split(' | ')[0]);
            const tiempoSiguiente = parseTime(arr[i + 1].split(' | ')[0]);
            return acc + (tiempoSiguiente - tiempoActual);
        }
        return acc;
    }, 0);
}