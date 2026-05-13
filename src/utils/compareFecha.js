export function compareFyH(a, b) {
    if (!a && !b) return 0;
    if (!a) return -1;
    if (!b) return 1;

    const partsA = a.split(' ');
    const partsB = b.split(' ');

    const dateA = partsA[0].split('/').map(el => parseInt(el));
    const dateB = partsB[0].split('/').map(el => parseInt(el));

    // Compare Year
    if ((dateA[2] || 0) !== (dateB[2] || 0)) return (dateA[2] || 0) - (dateB[2] || 0);
    // Compare Month
    if ((dateA[1] || 0) !== (dateB[1] || 0)) return (dateA[1] || 0) - (dateB[1] || 0);
    // Compare Day
    if ((dateA[0] || 0) !== (dateB[0] || 0)) return (dateA[0] || 0) - (dateB[0] || 0);

    // Compare Time
    const timeA = partsA[1] || "";
    const timeB = partsB[1] || "";
    return timeA.localeCompare(timeB);
}