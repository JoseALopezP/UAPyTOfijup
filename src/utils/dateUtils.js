export const todayFunction = () =>{
    return new Date().toLocaleDateString("es-AR",{day: "2-digit", month: "2-digit", year: "numeric"}).split('/').join('')
}