export const nameTranslate = (operadorName) =>{
    const traducciones = {
        "Echegaray, Andrea": 'ANDI',
        "Galaburri, Enrique": 'QUIQUE',
        "Lara, María Cielo": 'CIELO',
        "Martín, Juan": 'JUAN',
        "Sosa, Nahuel": 'NAHUEL',
        "Vidal, Ornela": 'ORNE',
        "Soria, Martín": 'MARTIN',
        "Naranjo, María Agustina": 'AGUS',
        "Zamudio, Francisco": 'FRAN',
        "Narváez, Ignacio": 'IGNA',
        "Manzione, Juliana": 'JULI',
        "Carpio, Florencia": 'FLOR C',
        "Sánchez, Martina": 'MARTI',
        "Pérez, Daniela": 'DANI',
        "Luluaga, Nicolás": 'NICO',
        "González, Sofía": 'SOFI G',
        "Hidalgo, María Milagro": 'MILI',
        "Cuart, Sofía": 'SOFI C',
        "Sánchez, Soledad": 'SOLE',
        "Gimenez, Florencia": 'FLOR G' 
    }
    return traducciones[operadorName]
}
export const nameTranslateActuario = (actuarioNombre) =>{
    const traducciones = {
        "Sánchez, Gemma Luciana": 'GEMMA',
        "Pérez, Juan Carlos": 'CHARLIE',
        "Gimenez, María Agostina": 'AGOS',
        "Radi Pezzotti, Lucas": 'LUCAS'
    }
    return traducciones[actuarioNombre]
}