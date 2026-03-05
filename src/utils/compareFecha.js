export function compareFyH(a, b) {
    const auxA = a.split(' ')[0].split('/').map(el => parseInt(el))
    const auxB = b.split(' ')[0].split('/').map(el => parseInt(el))
    return auxA[2] - auxB[2] || auxA[1] - auxB[1] || auxA[0] - auxB[0] || a.split(' ')[1] - b.split(' ')[1]
}