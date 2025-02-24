import styles from './Manual.module.css'

export default function Manual() {
    return (
        <div className={`${styles.manualContainer}`}>
            <h1>MANUAL DE USUARIO</h1>
            <div className={`${styles.indiceContainer}`}>
            <h2>Índice</h2>
            <ol>
                <li><a href="#barraDeNavegacion">Barra de navegación</a></li>
                <li><a href="#Home">Home</a></li>
                <li><a href="#tablero">Tablero</a>
                    <ol type="a">
                        <li><a href="#descripcionTablero">Descripción</a></li>
                        <li><a href="#busquedaTablero">Búsqueda</a></li>
                    </ol>
                </li>
                <li>Agregar Audiencia
                    <ol type="a">
                        <li>Seleccionar fecha</li>
                        <li>Agregar audiencia</li>
                        <li>Editar audiencias</li>
                    </ol>
                </li>
                <li>Registro Audiencia
                    <ol type="a">
                        <li>Seleccionar fecha y audiencia</li>
                        <li>Cambiar estado y cronómetro</li>
                        <li>Cambiar datos audiencia</li>
                    </ol>
                </li>
                <li>Sorteo Operador
                    <ol type="a">
                        <li>Sorteo</li>
                        <li>Seleccionar operador encargado de audiencia</li>
                    </ol>
                </li>
                <li>Oficios
                    <ol type="a">
                        <li>Seleccionar fecha y audiencia</li>
                        <li>Código de color</li>
                        <li>Editar comentario control</li>
                        <li>Agregar revisión UGA</li>
                        <li>Editar comentario resultado</li>
                    </ol>
                </li>
                <li>Situación Corporal
                    <ol type="a">
                        <li>Descripción</li>
                        <li>Búsqueda</li>
                        <li>Cambio de Situación</li>
                        <li>Código de color</li>
                    </ol>
                </li>
            </ol>
            </div>
            <div className={`${styles.bodyContainer}`}>
            <h2>Cuerpo</h2>
                <h3 id='barraDeNavegacion'>Barra de navegación</h3>
                <p>Dispuesta a lo alto, del lado izquierdo, permite navegar entre las herramientas del tablero utilizando los íconos. Con un borde izquierdo de color azúl y un cambio de relleno de los íconos indica en qué herramienta está situado el usuario. Al posar el mouse (hover) muestra el título de la herramienta</p>
                <h3 id='home'>Home</h3>
                <p>Utilizado para mostrar información relevante, es la dirección por defecto al acceder a la aplicación.</p>
                <h3 id='tablero'>Tablero</h3>
                <h4 id='descripcionTablero'>Descripción</h4>
                <p>Visor de información general de audiencias del mismo día ordenadas por hora de programación. La información a mostrar es:
                    <ul><li>Hora programada</li>
                    <li>Sala</li>
                    <li>Número de Legajo</li>
                    <li>Tipo de audiencia</li>
                    <li>Juez o jueces</li>
                    <li>Estado actual con el correcto código de color</li></ul>
                </p>
                <h4 id='busquedaTablero'>Búsqueda</h4>
                <p>Utilizando la cuadro de entrada situado en la esquina superior derecha con el texto provisorio "Buscar..." se pueden filtrar las audiencias por cualquiera de los valores listados anteriormente (aquellos que se muestran) o una combinación de ellos utilizando espacios como separadores. Por ejemplo:
                <ul><li>"8 30 13456": Va mostrar solo aquellas audiencias que respeten el criterio, podría mostrar las audiencias de las 8:30 con el número de legajo 13456</li>
                    <li>"IPP 2024": Mostrará solo aquellas audiencia que contengan en su nombre de tipo la palabra "IPP" y cuyo número de legajo contenga los dígitos "2024" en ese orden</li></ul>
                </p>
            </div>
        </div>
    );
}