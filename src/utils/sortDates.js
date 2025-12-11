const compareDates = (a, b) => {
    const strA = String(a).padStart(4, '0');
    const strB = String(b).padStart(4, '0');
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
    return arr.sort(compareDates);
}