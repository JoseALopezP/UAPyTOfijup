/**
 * Infiere el género de un nombre judicial para asignar el título correcto (Dr./Dra., Sr. Juez/Sra. Jueza).
 * Soporta tanto el sistema legado (prefijos manuales) como el nuevo (nombres limpios).
 */
export const inferGender = (name) => {
    if (!name) return { isMale: true, title: 'Dr.', titleJuez: 'Sr. Juez', labelJuez: 'Juez' };

    const up = name.toUpperCase().trim();

    // 1. Detección por prefijos explícitos (Legacy / Sistema anterior)
    const hasDra = up.includes('DRA.') || up.includes('DRA ');
    const hasSra = up.includes('SRA.') || up.includes('SRA ') || up.includes('JUEZA');
    const hasDr = (up.includes('DR.') || up.includes('DR ')) && !hasDra;
    const hasSr = (up.includes('SR.') || up.includes('SR ')) && !hasSra;

    if (hasDra || hasSra) return { isMale: false, title: 'Dra.', titleJuez: 'Sra. Jueza', labelJuez: 'Jueza' };
    if (hasDr || hasSr) return { isMale: true, title: 'Dr.', titleJuez: 'Sr. Juez', labelJuez: 'Juez' };

    // 2. Detección por Heurística (Nombres nuevos/limpios sin prefijo)
    // Buscamos el nombre de pila (después de la coma o al principio)
    let firstName = '';
    const parts = up.split(',');
    if (parts.length > 1) {
        // Formato: APELLIDO, NOMBRE
        firstName = parts[1].trim().split(' ')[0];
    } else {
        // Formato: NOMBRE APELLIDO o solo NOMBRE
        firstName = up.split(' ')[0];
    }

    // Heurística de terminación y nombres comunes femeninos
    const femaleNamesEndings = ['A', 'ES', 'IZ', 'EN', 'ER', 'EL', 'TH', 'UZ', 'IS']; 
    // Nota: Aunque cubren Beatriz, Ines, Carmen, Ester, Mabel, Ruth, Luz, Maris
    // Pero hay que ser cuidadosos con nombres masculinos que terminan en 'A'
    const femaleExplicit = ['INES', 'BEATRIZ', 'CARMEN', 'ESTER', 'MABEL', 'RUTH', 'LUZ', 'MARIS', 'SILVIA', 'LAURA', 'ANA', 'MARIA', 'JULIA', 'EMILIA'];
    const maleExceptions = ['BAUTISTA', 'LUCA', 'NICOLA', 'JOSHUA', 'MATIA', 'EZRA', 'NOA'];

    let isMale = true;

    if (maleExceptions.includes(firstName)) {
        isMale = true;
    } else if (femaleExplicit.includes(firstName) || (firstName.endsWith('A') && !maleExceptions.includes(firstName))) {
        isMale = false;
    } else if (['INES', 'BEATRIZ', 'CARMEN', 'ESTER', 'MABEL', 'RUTH', 'LUZ', 'MARIS'].some(f => firstName.endsWith(f))) {
        isMale = false;
    }

    const isMaleActual = isMale;

    // 3. Limpieza del nombre (quitar títulos si existen para devolver el nombre base)
    const cleanName = (str) => {
        return str.replace(/(^|\s)(Dr\.|Dra\.|Sr\.|Sra\.|El|La|Juez(?:a)?|Fiscal|Defensor(?:a)?)(\s|$)/gi, ' ').trim();
    };

    return {
        isMale: isMaleActual,
        title: isMaleActual ? 'Dr.' : 'Dra.',
        titleJuez: isMaleActual ? 'Sr. Juez' : 'Sra. Jueza',
        labelJuez: isMaleActual ? 'Juez' : 'Jueza',
        cleanName: cleanName(name)
    };
};

export const cleanName = (name) => {
    if (!name) return '';
    return name.replace(/(^|\s)(Dr\.|Dra\.|Sr\.|Sra\.|El|La|Juez(?:a)?|Fiscal|Defensor(?:a)?)(\s|$)/gi, ' ').trim();
};

/**
 * Formatea un objeto de defensa para mostrarlo en tablas y reportes (Pumba).
 * Formato: NOMBRE APELLIDO #MATRICULA (oficial/particular)
 */
export const formatDefensa = (defObj) => {
    if (!defObj) return '';
    if (typeof defObj === 'string') return defObj;
    
    const name = (defObj.nombre || '').toUpperCase();
    const type = (defObj.tipo || '').toLowerCase();
    const mat = (type === 'oficial' && defObj.matricula) ? ` #${defObj.matricula}` : '';
    
    // Para particulares, el nombre suele traer ya el #matricula si viene de la lista maestra
    return `${name}${mat} (${type})`;
};
