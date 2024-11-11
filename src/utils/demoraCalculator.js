const demoraPorTipo = {
    "AMPLIACIÓN DEL OBJETO DE LA IPP": 34.66,
    "AMPLIACIÓN DEL OBJETO DE LA IPP - ANTICIPO DE PRUEBA": 19.50,
    "ANTICIPO DE PRUEBA": 19.05,
    "ANTICIPO DE PRUEBA - REVISIÓN DE MEDIDA CAUTELAR": 30.50,
    "CONCILIACIÓN EN DELITOS DE ACCIÓN PRIVADA": 26.60,
    "CONCILIACIÓN EN DELITOS DE ACCIÓN PÚBLICA": 19.24,
    "CONTROL DE ACUSACIÓN": 50.09,
    "CONTROL DE DETENCION": 33.61,
    "CONTROL JUDICIAL ANTERIOR A LA FORMALIZACIÓN DE I.P.P": 32.57,
    "CUESTION DE COMPETENCIA": 20.46,
    "CUESTIONES PERICIALES": 28.63,
    "DECLARACIÓN DEL IMPUTADO": 35.67,
    "EXCEPCIONES PROCESALES": 26.60,
    "EXHORTO": 22.50,
    "FORMALIZACIÓN DE LA IPP": 24.51,
    "FORMALIZACIÓN DE LA IPP - SUSPENSIÓN DE JUICIO A PRUEBA": 34.00,
    "FORMALIZACIÓN DE LA IPP CON ANTICIPO DE PRUEBA": 31.20,
    "FORMALIZACIÓN DE LA IPP CON ANTICIPO DE PRUEBA Y CONTROL DE DETENCIÓN": 51.37,
    "FORMALIZACIÓN DE LA IPP CON CONTROL DE DETENCION": 40.64,
    "FORMALIZACIÓN DE LA IPP CON CONTROL DE DETENCION y SUSPENSIÓN DE JUICIO A PRUEBA": 35.40,
    "FORMALIZACIÓN DE LA IPP Y SUSPENSIÓN DE JUICIO A PRUEBA": 23.02,
    "HABEAS CORPUS": 17.74,
    "IMPOSICIÓN, PRÓRROGA O CESE DE PROSIÓN PREVENTIVA": 24.50,
    "JUICIO ABREVIADO": 32.31,
    "MODIFICACIÓN DE MEDIDA CAUTELAR": 22.36,
    "OFRECIMIENTO DE PRUEBA EN DELITOS DE ACCIÓN PRIVADA": 32.00,
    "PRESUNTA INIMPUTABILIDAD": 25.96,
    "PROCEDENCIA DE DILIGENCIAS PROPUESTAS": 38.48,
    "PRÓRROGA DE PLAZO DE LA AVERIGUACIÓN PRELIMINAR": 13.50,
    "PRÓRROGA PLAZO I.P.P": 17.86,
    "PRÓRROGA PLAZO I.P.P Y RENOVACIÓN DE MEDIDA CAUTELAR": 18.57,
    "REBELDÍA": 26.47,
    "RECUSACIÓN": 69.00,
    "REDUCCIÓN PLAZO I.P.P": 28.00,
    "RENOVACIÓN DE MEDIDA CAUTELAR": 28.50,
    "REPARACIÓN INTEGRAL": 16.55,
    "REQUERIMIENTO DE MEDIDAS DE COERCIÓN Y CAUTELARES": 36.50,
    "REVISIÓN DE EJECUCIÓN": 19.25,
    "REVISIÓN DE MEDIDA CAUTELAR": 25.45,
    "REVISIÓN DE SENTENCIA": 8.00,
    "REVISION DE SUSPENSIÓN DE JUICIO A PRUEBA": 12.00,
    "REVISIÓN DE SUSPENSIÓN DE JUICIO A PRUEBA": 10.64,
    "REVOCACIÓN CONDENA CONDICIONAL": 25.00,
    "REVOCACIÓN DE LA SUSPENSIÓN DE JUICIO A PRUEBA": 18.06,
    "REVOCACIÓN DE MEDIDA CAUTELAR": 27.25,
    "REVOCATORIA- DECISIONES FUERA DE AUDIENCIA": 31.26,
    "RUEDA DE RECONOCIMIENTO": 19.43,
    "SANEAMIENTO O NULIDAD": 32.29,
    "SOBRESEIMIENTO": 19.24,
    "SUSPENSIÓN DE JUICIO A PRUEBA": 20.67,
    "TRÁMITES DE EJECUCIÓN": 12.24,
    "UNIFICACIÓN DE PENAS": 22.67,
    "UNILATERAL DE PRÓRROGA DE LA INVESTIGACIÓN PREVIA A LA FORMALIZACIÓN IPP": 10.11,
    "UNILATERAL PARA APERTURA Y EXAMEN DE SECUESTRO": 11.25,
    "DEBATE DEL JUICIO ORAL": 240
  };
  export default function demoraCalculator(tipo) {
    const searchValue = tipo.toLowerCase();

    function getMatchScore(name) {
        const nameWords = name.toLowerCase().split(" ");
        const searchWords = searchValue.split(" ");
        let score = 0;
        for (let word of searchWords) {
            if (nameWords.includes(word)) {
                score += 10; 
            }
        }
        for (let char of searchValue) {
            if (name.toLowerCase().includes(char)) {
                score++;
            }}
        return score;
    }

    let bestMatch = null;
    let highestScore = 0;
    for (const name in demoraPorTipo) {
        const score = getMatchScore(name);
        if (score > highestScore) {
            highestScore = score;
            bestMatch = name;
        }
    }
    return bestMatch ? demoraPorTipo[bestMatch] : 0;
}