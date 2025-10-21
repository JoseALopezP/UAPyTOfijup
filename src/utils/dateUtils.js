export const todayFunction = () =>{
    return new Date().toLocaleDateString("es-AR",{day: "2-digit", month: "2-digit", year: "numeric"}).split('/').join('')
}
export const yearFunction = (date) =>{
    return date.slice(4)
}
export const getCurrentYear = () =>{
    const fecha = new Date();
    return fecha.getFullYear();
}