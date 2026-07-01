// List of common Spanish first names to help identify where the surname ends and the first name begins
const COMMON_FIRST_NAMES = new Set([
    'JUAN', 'MARIA', 'JOSE', 'CARLOS', 'RODOLFO', 'MARIO', 'INES', 'HUGO', 'HILDA', 'LEONOR',
    'PEDRO', 'MARCOS', 'DAVID', 'EUSEBIO', 'MANUEL', 'WALTER', 'BENJAMIN', 'MARCELO', 'DARIO',
    'NELLY', 'ALFONSO', 'LUCRECIA', 'OSCAR', 'CLAUDIA', 'JACOBO', 'LIDIA', 'LEOPOLDO', 'ERNESTO',
    'ALBERTO', 'LUCIO', 'DANTE', 'RAFAEL', 'VICENTE', 'AMADO', 'ARMANDO', 'ROSA', 'FRANCISCA',
    'TERESA', 'JORGE', 'SALOMON', 'LEONARDO', 'FRANCISCO', 'REINALDO', 'WENCESLAO', 'LUCIA',
    'EDUARDO', 'NELSON', 'ROBERTO', 'ANA', 'MARGARITA', 'HORACIO', 'ELVA', 'SAMIRA', 'ALEJANDRO',
    'ANTONIO', 'SARUI', 'HUMBERTO', 'MIGUEL', 'ROSALBA', 'DORA', 'RAUL', 'EMILIO', 'GILBERTO',
    'BLANCA', 'TULIO', 'PASCUAL', 'ANGEL', 'RONALD', 'NILDA', 'YOLANDA', 'ESTHER', 'OLGA',
    'ELEODORO', 'GUSTAVO', 'JOAQUIN', 'HECTOR', 'ADOLFO', 'RICARDO', 'OSVALDO', 'SUSANA',
    'FABIANA', 'CELIA', 'GLADYS', 'FATIMA', 'MONICA', 'MARISA', 'SANTIAGO', 'ANDRES', 'INES',
    'VIVIANA', 'PATRICIA', 'STELLA', 'SONIA', 'SILVIA', 'MIRTA', 'ELIZABETH', 'ADRIANA',
    'GRACIELA', 'LILIANA', 'BEATRIZ', 'NORA', 'CARINA', 'SANDRA', 'MARCELA', 'VERONICA',
    'ALICIA', 'MARTA', 'ROXANA', 'LORENA', 'CECILIA', 'VANESA', 'MARIANA', 'JULIA', 'LUCIA'
]);

/**
 * Formats a judge's full name to show only their first name and first surname.
 * Handles both "LastName, FirstName" and "[Title] LastName FirstName" formats.
 */
export function formatSingleJudge(rawName) {
    if (!rawName) return '';
    let name = rawName.replace(/[()]/g, '').trim();
    if (!name || name.toUpperCase() === 'NA' || name.toUpperCase() === 'SIN JUEZ' || name === '-') {
        return 'NA';
    }

    const titles = new Set([
        'DR', 'DRA', 'DR.', 'DRA.', 'DRES', 'DRES.', 'SR', 'SRA', 'SR.', 'SRA.',
        'JUEZ', 'JUEZA', 'JUEZ.', 'JUEZA.'
    ]);

    // Format 1: "LastName, FirstName"
    if (name.includes(',')) {
        const parts = name.split(',');
        const surnamePart = parts[0].trim();
        const firstnamePart = parts[1].trim();

        const surnameWords = surnamePart.split(/\s+/).filter(w => !titles.has(w.toUpperCase()));
        const firstnameWords = firstnamePart.split(/\s+/).filter(w => !titles.has(w.toUpperCase()));

        const firstSurname = surnameWords[0] || '';
        const firstName = firstnameWords[0] || '';

        return `${capitalize(firstName)} ${capitalize(firstSurname)}`.trim();
    }

    // Format 2: "[Title] LastName FirstName" (or similar without comma)
    const words = name.split(/\s+/).filter(w => !titles.has(w.toUpperCase()));
    if (words.length === 0) return '';
    if (words.length === 1) return capitalize(words[0]);

    // Locate the first word that is a known first name
    let firstNameIdx = -1;
    for (let i = 0; i < words.length; i++) {
        if (COMMON_FIRST_NAMES.has(words[i].toUpperCase())) {
            firstNameIdx = i;
            break;
        }
    }

    let firstName = '';
    let firstSurname = '';

    if (firstNameIdx !== -1) {
        firstName = words[firstNameIdx];
        if (firstNameIdx === 0) {
            // If the first name is the very first word, the next word is the surname
            firstSurname = words[1] || '';
        } else {
            // Otherwise, the very first word is assumed to be the first surname
            firstSurname = words[0];
        }
    } else {
        // Fallback: assume "Surname Firstname"
        firstSurname = words[0];
        firstName = words[1] || '';
    }

    return `${capitalize(firstName)} ${capitalize(firstSurname)}`.trim();
}

function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
