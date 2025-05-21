export const checkCompletion = (aud) => {
  if (!aud || typeof aud !== 'object') {
    return 'Error: Objeto de audiencia no válido.';
  }
  const missingFields = [];
  if (!aud.tipo) {
    missingFields.push('tipo');
  }
  if (!aud.numeroLeg) {
    missingFields.push('número de legajo');
  }
  if (!aud.caratula) {
    missingFields.push('carátula');
  }
  if (!aud.sala) {
    missingFields.push('número de sala');
  }
  if (!aud.hora) {
    missingFields.push('hora');
  }
  if (!aud.hitos) {
    missingFields.push('inicio y fin');
  }
  if (!aud.juez) {
    missingFields.push('juez');
  }
  if (!aud.mpf) {
    missingFields.push('datos fiscalía');
  }
  if (!aud.defensa) {
    missingFields.push('datos defensa');
  }
  if (!aud.minuta) {
    missingFields.push('completar minuta');
  }
  if (!aud.cierre) {
    missingFields.push('completar cierre');
  }
  if (!aud.resuelvoText) {
    missingFields.push('completar resuelvo');
  }
  if (missingFields.length === 0) {
    return 'completo';
  } else {
    return 'Falta: ' + missingFields.join(', ');
  }
};