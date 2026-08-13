const defaultTraduccionesOperador = {
    "Echegaray, Andrea": 'ANDI',
    "Galaburri, Enrique": 'QUIQUE',
    "Lara, María Cielo": 'CIELO',
    "Martín, Juan": 'JUAN',
    "Sosa, Nahuel": 'NAHUEL',
    "Vidal, Ornela": 'ORNE',
    "Soria, Martín Abel": 'MARTIN',
    "Naranjo, María Agustina": 'AGUS',
    "Zamudio, Francisco": 'FRAN',
    "Narváez, Ignacio": 'IGNA N',
    "Manzione, Juliana": 'JULI',
    "Carpio, Florencia": 'FLOR C',
    "Sánchez, Martina": 'MARTI',
    "Pérez, Daniela": 'DANI',
    "Luluaga, Nicolás": 'NICO',
    "González, Sofía": 'SOFI G',
    "Hidalgo, María del Milagro": 'MILI',
    "Cuart, Sofía": 'SOFI C',
    "Sánchez, Soledad": 'SOLE',
    "Gimenez, Florencia": 'FLOR G',
    "Waisman, Natasha": 'NATI',
    "Victoria, Gonzalo José": 'GONZA',
    "Fernández Chipre, Cecilia": 'CHECHU',
    "Martinazzo, Ignacio": 'IGNA',
    "Venerando, Tomás": 'TOMI',
    "Narvaez, Facundo Nahuel": 'FACU',
    "Paroli, Carla Antonela": 'ANTO',
    'Roldan, Eliana': 'ELI',
    'Maldonado, Juan Francisco': 'JUANFRA',
    'Aubone, Maria Estela': 'ESTELA',
    'Elizondo, Ricardo': 'RICARDO',
    'Lopez, Ana': 'ANA'
};

const defaultTraduccionesActuario = {
    "Sánchez, Gemma Luciana": 'GEMMA',
    "Pérez, Juan Carlos": 'CHARLIE',
    "Gimenez, María Agostina": 'AGOS',
    "Bosch, Mauricio": "MAURI",
    "Paniagua, Guillermo": "GUILLE",
    "Roldán, Eliana": 'ELI'
};

// Cache en memoria poblado desde Firestore (ver DataContext.js -> updateApodos).
// Si todavía no se cargó o el nombre no tiene apodo cargado ahí, se usa el default hardcodeado.
let customTraduccionesOperador = {};
let customTraduccionesActuario = {};

export const setApodosFromList = (list) => {
    const operador = {};
    const actuario = {};
    (list || []).forEach(({ tipo, nombre, apodo }) => {
        if (!nombre || !apodo) return;
        if (tipo === 'actuario') {
            actuario[nombre] = apodo;
        } else {
            operador[nombre] = apodo;
        }
    });
    customTraduccionesOperador = operador;
    customTraduccionesActuario = actuario;
};

export const nameTranslate = (operadorName) => {
    return customTraduccionesOperador[operadorName] ?? defaultTraduccionesOperador[operadorName];
};

export const nameTranslateActuario = (actuarioNombre) => {
    return customTraduccionesActuario[actuarioNombre] ?? defaultTraduccionesActuario[actuarioNombre];
};
