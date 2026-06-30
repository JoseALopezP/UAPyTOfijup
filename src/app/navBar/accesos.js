// ============================================================
// CONFIGURACIÓN CENTRALIZADA DE ACCESOS
// ============================================================
// Acá podés agregar o quitar rutas del navbar para cada
// tipo de usuario y para cada build (vercel, unc, uga, ual).
//
// - routesByRole: qué rutas puede ver cada ROL de usuario.
// - routesByBuild: qué rutas se compilan en cada BUILD target.
// - publicRoutes: rutas siempre visibles si hay sesión iniciada.
// ============================================================

// Rutas que cualquier usuario autenticado puede ver
export const publicRoutes = ['', 'tablero', 'Manual'];

// Accesos por ROL de usuario (lo que Firestore devuelve como userRole)
export const routesByRole = {
    admin: 'all', // acceso total
    ual: 'all', // acceso total

    uac: [
        'Agregar-Audiencia',
        'Carga-Juicio',
        'Oficios',
        'audienciasUAC/control',
        'Control-UAC',
        'Solicitudes-Audiencia',
        'Notificaciones',
        'Situacion-Corporal',
    ],

    unc: [
        'Agregar-Audiencia',
        'Carga-Juicio',
        'Oficios',
        'audienciasUAC/control',
        'Control-UAC',
        'Solicitudes-Audiencia',
        'Notificaciones',
        'Situacion-Corporal',
    ],

    ugaadmin: [
        'Agregar-Audiencia',
        'Centro-UGA',
        'Registro-Audiencia',
        'Sorteo-Operador',
    ],

    uga: [
        'Agregar-Audiencia',
        'Centro-UGA',
        'Registro-Audiencia',
        'Sorteo-Operador',
    ],

    operador: [
        'Agregar-Audiencia',
        'Centro-UGA',
        'Registro-Audiencia',
        'Sorteo-Operador',
    ],
};

// Accesos por BUILD TARGET (NEXT_PUBLIC_BUILD_TARGET)
// Estas rutas se compilan/muestran solo en esa build
export const routesByBuild = {
    vercel: {
        exclude: [],  // rutas que no se muestran en vercel
    },

    unc: [
        'Agregar-Audiencia',
        'Carga-Juicio',
        'Oficios',
        'audienciasUAC/control',
        'Control-UAC',
        'Solicitudes-Audiencia',
        'Notificaciones',
        'Situacion-Corporal',
        'Abogados',
    ],

    uga: [
        'Agregar-Audiencia',
        'Centro-UGA',
        'Registro-Audiencia',
        'Sorteo-Operador',
        'Gestion-Usuarios',
        'Abogados',
    ],

    ual: [
        'Pumba',
        'tablero',
        'Notificaciones',
        'Gestion-Usuarios',
        'Abogados',
    ],
};
