const compareDates = (a, b) => {
    // Si a o b son arrays (entries), extraemos el primer elemento (la key)
    const keyA = Array.isArray(a) ? a[0] : String(a);
    const keyB = Array.isArray(b) ? b[0] : String(b);

    const strA = String(keyA).padStart(4, '0');
    const strB = String(keyB).padStart(4, '0');
    const dayA = Number(strA.substring(0, 2));
    const monthA = Number(strA.substring(2, 4));
    const dayB = Number(strB.substring(0, 2));
    const monthB = Number(strB.substring(2, 4));

    if (monthA !== monthB) {
        return monthA - monthB;
    }
    return dayA - dayB;
}

export default function customDigitSort(arr) {
    if (!Array.isArray(arr)) return [];
    return [...arr].sort(compareDates);
}