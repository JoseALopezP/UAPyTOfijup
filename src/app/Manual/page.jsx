import styles from './Manual.module.css'
import Image from 'next/image';

export default function Manual() {
    return (
        <div className={`${styles.manualContainer}`}>
            <h1>INSTRUCTIVO USUARIO</h1>
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
                <li><a href="#agregarAudiencia">Agregar Audiencia</a>
                    <ol type="a">
                        <li><a href="#seleccionarFechaAgregarAudiencia">Seleccionar fecha</a></li>
                        <li><a href="#agregarAudiencia2">Agregar audiencia</a></li>
                        <li><a href="#editarAudiencia">Editar audiencias</a></li>
                    </ol>
                </li>
                <li><a href="#registroAudiencia">Registro Audiencia</a>
                    <ol type="a">
                        <li><a href="#seleccionarFechaRegistroAudiencia">Seleccionar fecha y audiencia</a></li>
                        <li><a href="#cambiarEstado">Cambiar estado y cronómetro</a></li>
                        <li><a href="#editarDatosMinuta">Editar datos de minuta</a></li>
                    </ol>
                </li>
                <li><a href="#sorteoOperador">Sorteo Operador</a>
                    <ol type="a">
                        <li><a href="#sorteo">Sorteo</a></li>
                        <li><a href="#seleccionarOperador">Seleccionar operador encargado de audiencia</a></li>
                    </ol>
                </li>
                <li><a href="#oficios">Oficios</a>
                    <ol type="a">
                        <li><a href="#seleccionarFechaOficio">Seleccionar fecha y audiencia</a></li>
                        <li><a href="#codigoColor">Código de color</a></li>
                        <li><a href="#editarComentario">Editar comentario control</a></li>
                        <li><a href="#revisionUga">Agregar revisión UGA</a></li>
                        <li><a href="#comentarioResultado">Editar comentario resultado</a></li>
                        <li><a href="#generaroOficio">Generar oficio PDF</a></li>
                    </ol>
                </li>
                <li><a href="#situacionCorporal">Situación Corporal</a>
                    <ol type="a">
                        <li><a href="#busquedaSituacion">Búsqueda</a></li>
                        <li><a href="#cambioSituacion">Cambio de Situación</a></li>
                        <li><a href="#codigoSituacion">Código de color</a></li>
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
                <Image align='left' src="/imgManual/tablero.png" width={600} height={330} alt="Tablero"/>
                <h4 id='descripcionTablero'>Descripción</h4>
                <p>Visor de información general de audiencias del mismo día ordenadas por hora de programación. La información a mostrar es:</p>
                <ul><li>Hora programada</li>
                    <li>Sala</li>
                    <li>Número de Legajo</li>
                    <li>Tipo de audiencia</li>
                    <li>Juez o jueces</li>
                    <li>Estado actual con el correcto código de color</li></ul>
                <h4 id='busquedaTablero'>Búsqueda</h4>
                <Image align='right' src="/imgManual/tableroBusqueda.png" width={292} height={85} alt="Tablero"/>
                <p>Utilizando la cuadro de entrada situado en la esquina superior derecha con el texto provisorio "Buscar..." se pueden filtrar las audiencias por cualquiera de los valores listados anteriormente (aquellos que se muestran) o una combinación de ellos utilizando espacios como separadores. Por ejemplo:</p>
                <ul><li>"8 30 13456": Va mostrar solo aquellas audiencias que respeten el criterio, podría mostrar las audiencias de las 8:30 con el número de legajo 13456</li>
                    <li>"IPP 2024": Mostrará solo aquellas audiencia que contengan en su nombre de tipo la palabra "IPP" y cuyo número de legajo contenga los dígitos "2024" en ese orden</li></ul>
                <h3 id='agregarAudiencia'>Agregar audiencia</h3>
                <h4 id='seleccionarFechaAgregarAudiencia'>Seleccionar fecha</h4>
                <Image align='right' src="/imgManual/seleccionarFecha.png" width={241} height={36} alt="Tablero"/>
                <p>Seleccionar la fecha del día a editar, por defecto selecciona el mismo día. El formato aceptado para el día es "dd" o "d", para el mes es "mm" o "m" y para el año "aa" o "aaaa"</p>
                <h4 id='agregarAudiencia2'>Agregar audiencia</h4>
                <Image align='left' src="/imgManual/agregarAudiencia.png" width={272} height={429} alt="Tablero"/>
                <p>Para agregar una audiencia a la lista se deben inlcuir los siguientes datos:</p>
                <ul><li><strong>Duración programada (obligatorio, no controlado):</strong> duración expresada en minutos</li>
                    <li><strong>Hora programada de audiencia (obligatorio, controlado):</strong> el formato es hh:mm en 24hs</li>
                    <li><strong>Número de Legajo (obligatorio, controlado)</strong></li>
                    <li><strong>Tipo de audiencia (obligatorio, controlado):</strong> se pueden agregar hasta 3 tipos, los datos válidos se despliegan de valores habilitados</li>
                    <li><strong>Juez o jueces (obligatorio, controlado):</strong> con el botón situado a la izquierda del cuadro de ingreso se puede seleccionar entre unipersonal (uni) y colegiado (col), con esto permitiendo agregar 1 o 3 nombres de jueces respectivamente de la lista de habilitados</li>
                    <li><strong>Situación (no obligatorio, no controlado):</strong> permite agregar la situación corporal desde el agendamiento</li></ul>
                <p>No agregar alguno de aquellos datos obligatorios o al no respetar los formatos o valores aceptables de aquellos controlados resultará en error.</p>
                <h4 id='editarAudiencia'>Editar audiencia</h4>
                <Image src="/imgManual/editarAudiencia.png" width={1108} height={48} alt="Tablero"/>
                <p>Editar cualquier valor o seleccionar la opción de eliminar la audiencia resultará en la habilitación del botón guardar identificado con el ícono de un diskette (floppy disk), seleccionar el mismo resultará en guardar el cambio o la eliminación de la audiencia según lo indicado.</p>
                <h3 id='registroAudiencia'>Registro audiencia</h3>
                <h4 id='seleccionarFechaRegistroAudiencia'>Seleccionar fecha y audiencia</h4>
                <Image align='right' src="/imgManual/seleccionarFecha.png" width={241} height={36} alt="Tablero"/>
                <p>Seleccionar la fecha del día a editar, por defecto selecciona el mismo día. El formato aceptado para el día es "dd" o "d", para el mes es "mm" o "m" y para el año "aa" o "aaaa"</p>
                <h4 id='cambiarEstado'>Cambiar estado y cronómetro</h4>
                <Image align='right' src="/imgManual/cronometro.png" width={272} height={104} alt="Tablero"/>
                <p>Los cambios de estado se realizan presionando el cambio deseado durante 2 segundos, tiempo en el que se percibe una retroalimentación visual indicando esta carga, esto con el fin de evitar cambios no deseados.
                    El cronómetro indica el tiempo acumulado en vivo en el sector izquierdo, y tiempo del bloque actual en el sector derecho, el tiempo inicia cuando la audiencia se encuentra en curso y no requiere permanecer en el mismo sector para que la medición continúe.
                    El tiempo acumulado puede tener una demora de segundos en ser actualizado una vez finalizado un bloque dependiendo de los timepos de demora del servidor, el del bloque actual es casi instantáneo.
                    Habiendo seleccionado cuarto intermedio se espera luego que se indique quién lo pide y el tiempo pedido.
                </p>
                <h4 id='editarDatosMinuta'>Editar datos de minuta</h4>
                <Image align='right' src="/imgManual/editarDatosMinuta.png" width={897} height={618} alt="Tablero"/>
                <p>Para poder descargar la minuta en formato PDF previamente se tuvo que finalizar la audiencia cuidando los tiempos de los estados, haber marcado como finalizado el resuelvo y haber rellenado todos los datos obligatorios:</p>
                <ul><li><strong>Carátula</strong></li>
                    <li><strong>Ministero Público Fiscal:</strong> al agregar un fiscal se selecciona automáticamente la UFI a la que pertenece el fiscal seleccionado, esto no implica que se deba mantener la misma ufi, cuidando así los casos en los que el fiscal se encuentra subrogando para otra unidad. Requiere que sea de la lista de fiscales habilitados donde se incluyen tanto fiscales como ayudantes</li>
                    <li><strong>Imputados:</strong> se puede agregar en formato imputado o condenado, requiere del nombre ingresado manualmente y el dni sin puntos con el mismo método de ingreso</li>
                    <li><strong>Defensa:</strong> se agrega la defensa seleccionando primero si es oficial o particular, para ambos se incluye una lista de los mismos para cuidar la calidad de los datos, luego se puede seleccionar opcionalmente qué imputado defiende el abogado</li>
                    <li><strong>Otras Partes:</strong> permite incluir otras partes presentes como querella o traductores siendo esto no obligatorio para descargar la minuta</li>
                    <li><strong>Motivo demora:</strong> se habilita en el caso de haber tenido un tiempo de demora mayor a 5 minutos, requiriendo que se indique la razón de la misma</li>
                    <li><strong>Insertar modelo:</strong> permite agregar un modelo de minuta con fines de facilitar un proceso más eficiente pero pudiendo ser ignorado de no requerirlo o no creerlo conveniente por el usuario</li></ul>
                <h3 id='sorteoOperador'>Sorteo Operador</h3>
                <Image align='right' src="/imgManual/sorteo.png" width={434} height={613} alt="Tablero"/>
                <h4 id='sorteo'>Sorteo</h4>
                <p>Permite incluir todos los nombres que se quieran partícipes del sorteo para, luego de seleccionar la opción "SORTEAR", obtener una lista de los operadores seleccionados en el orden que resultaron seleccionados. Para cambiar los operadores entre la columna de la lista de nombres y los seleccionados solo requiere de un click sobre el nombre</p>
                <h4 id='seleccionarOperador'>Seleccionar operador encargado de audiencia</h4>
                <p>Cambiar el operador responsable d euna audiencia se realiza seleccionándolo en cada audiencia dispeusta a la derecha de la lista desplegable. Para facilitar el proceso se puede filtrar y ordenar por distintos valores:</p>
                <ul className={`${styles.filterList}`}>
                    <li>Si hay un operador seleccionado</li>
                    <li>Nombre de operador alfabeticamente</li>
                    <li>Hora</li>
                    <li>Nombre del tipo de audiencia</li>
                    <li>Nombre de Juez principal</li>
                    <li>Duración estimada de audiencia</li>
                </ul>
                <Image align='left' src="/imgManual/seleccionarOperador.png" width={972} height={162} alt="Tablero"/>
                <p>&nbsp; </p>
                <p>&nbsp; </p>
                <h3 id='oficios'>Oficios</h3>
                <h4 id='seleccionarFechaOficio'>Seleccionar fecha</h4>
                <Image align='right' src="/imgManual/seleccionarFecha.png" width={241} height={36} alt="Tablero"/>
                <p>Seleccionar la fecha del día a editar, por defecto selecciona el mismo día. El formato aceptado para el día es "dd" o "d", para el mes es "mm" o "m" y para el año "aa" o "aaaa"</p>
                <h4 id='codigoColor'>Código de color</h4>
                <div><div className={`${styles.codigoColorBlock}`}><span className={`${styles.lineaCodigo}`}>
                <svg viewBox="0 0 24 24" fill="none" align='left'>
                    <path d="M8 5.00005C7.01165 5.00082 6.49359 5.01338 6.09202 5.21799C5.71569 5.40973 5.40973 5.71569 5.21799 6.09202C5 6.51984 5 7.07989 5 8.2V17.8C5 18.9201 5 19.4802 5.21799 19.908C5.40973 20.2843 5.71569 20.5903 6.09202 20.782C6.51984 21 7.07989 21 8.2 21H15.8C16.9201 21 17.4802 21 17.908 20.782C18.2843 20.5903 18.5903 20.2843 18.782 19.908C19 19.4802 19 18.9201 19 17.8V8.2C19 7.07989 19 6.51984 18.782 6.09202C18.5903 5.71569 18.2843 5.40973 17.908 5.21799C17.5064 5.01338 16.9884 5.00082 16 5.00005M8 5.00005V7H16V5.00005M8 5.00005V4.70711C8 4.25435 8.17986 3.82014 8.5 3.5C8.82014 3.17986 9.25435 3 9.70711 3H14.2929C14.7456 3 15.1799 3.17986 15.5 3.5C15.8201 3.82014 16 4.25435 16 4.70711V5.00005" stroke='#fff' strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p>Audiencia programada, no iniciada</p></span>
                <span className={`${styles.lineaCodigo}`}>
                <svg viewBox="0 0 24 24" fill="none">
                    <path d="M8 5.00005C7.01165 5.00082 6.49359 5.01338 6.09202 5.21799C5.71569 5.40973 5.40973 5.71569 5.21799 6.09202C5 6.51984 5 7.07989 5 8.2V17.8C5 18.9201 5 19.4802 5.21799 19.908C5.40973 20.2843 5.71569 20.5903 6.09202 20.782C6.51984 21 7.07989 21 8.2 21H15.8C16.9201 21 17.4802 21 17.908 20.782C18.2843 20.5903 18.5903 20.2843 18.782 19.908C19 19.4802 19 18.9201 19 17.8V8.2C19 7.07989 19 6.51984 18.782 6.09202C18.5903 5.71569 18.2843 5.40973 17.908 5.21799C17.5064 5.01338 16.9884 5.00082 16 5.00005M8 5.00005V7H16V5.00005M8 5.00005V4.70711C8 4.25435 8.17986 3.82014 8.5 3.5C8.82014 3.17986 9.25435 3 9.70711 3H14.2929C14.7456 3 15.1799 3.17986 15.5 3.5C15.8201 3.82014 16 4.25435 16 4.70711V5.00005M12 11V17M12 11L14 13M12 11L10 13" stroke='#17a2b8' strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p>Audiencia finalizada, sin resuelvo subido</p></span>
                <span className={`${styles.lineaCodigo}`}>
                <svg viewBox="0 0 24 24" fill="none">
                    <path d="M8 5.00005C7.01165 5.00082 6.49359 5.01338 6.09202 5.21799C5.71569 5.40973 5.40973 5.71569 5.21799 6.09202C5 6.51984 5 7.07989 5 8.2V17.8C5 18.9201 5 19.4802 5.21799 19.908C5.40973 20.2843 5.71569 20.5903 6.09202 20.782C6.51984 21 7.07989 21 8.2 21H15.8C16.9201 21 17.4802 21 17.908 20.782C18.2843 20.5903 18.5903 20.2843 18.782 19.908C19 19.4802 19 18.9201 19 17.8V8.2C19 7.07989 19 6.51984 18.782 6.09202C18.5903 5.71569 18.2843 5.40973 17.908 5.21799C17.5064 5.01338 16.9884 5.00082 16 5.00005M8 5.00005V7H16V5.00005M8 5.00005V4.70711C8 4.25435 8.17986 3.82014 8.5 3.5C8.82014 3.17986 9.25435 3 9.70711 3H14.2929C14.7456 3 15.1799 3.17986 15.5 3.5C15.8201 3.82014 16 4.25435 16 4.70711V5.00005M9 14H15" stroke='#ffc107' strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p>Audiencia finalizada y con resuelvo completo, no controlada por oficio</p></span>
                <span className={`${styles.lineaCodigo}`}>
                <svg viewBox="0 0 24 24" fill="none">
                    <path d="M8 5.00005C7.01165 5.00082 6.49359 5.01338 6.09202 5.21799C5.71569 5.40973 5.40973 5.71569 5.21799 6.09202C5 6.51984 5 7.07989 5 8.2V17.8C5 18.9201 5 19.4802 5.21799 19.908C5.40973 20.2843 5.71569 20.5903 6.09202 20.782C6.51984 21 7.07989 21 8.2 21H15.8C16.9201 21 17.4802 21 17.908 20.782C18.2843 20.5903 18.5903 20.2843 18.782 19.908C19 19.4802 19 18.9201 19 17.8V8.2C19 7.07989 19 6.51984 18.782 6.09202C18.5903 5.71569 18.2843 5.40973 17.908 5.21799C17.5064 5.01338 16.9884 5.00082 16 5.00005M8 5.00005V7H16V5.00005M8 5.00005V4.70711C8 4.25435 8.17986 3.82014 8.5 3.5C8.82014 3.17986 9.25435 3 9.70711 3H14.2929C14.7456 3 15.1799 3.17986 15.5 3.5C15.8201 3.82014 16 4.25435 16 4.70711V5.00005M10 12L14 16M14 12L10 16" stroke='#dc3545' strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p>Audiencia controlada por oficio, con correcciones necesarias</p></span>
                <span className={`${styles.lineaCodigo}`}>
                <svg viewBox="0 0 24 24" fill="none">
                    <path d="M8 5.00005C7.01165 5.00082 6.49359 5.01338 6.09202 5.21799C5.71569 5.40973 5.40973 5.71569 5.21799 6.09202C5 6.51984 5 7.07989 5 8.2V17.8C5 18.9201 5 19.4802 5.21799 19.908C5.40973 20.2843 5.71569 20.5903 6.09202 20.782C6.51984 21 7.07989 21 8.2 21H15.8C16.9201 21 17.4802 21 17.908 20.782C18.2843 20.5903 18.5903 20.2843 18.782 19.908C19 19.4802 19 18.9201 19 17.8V8.2C19 7.07989 19 6.51984 18.782 6.09202C18.5903 5.71569 18.2843 5.40973 17.908 5.21799C17.5064 5.01338 16.9884 5.00082 16 5.00005M8 5.00005V7H16V5.00005M8 5.00005V4.70711C8 4.25435 8.17986 3.82014 8.5 3.5C8.82014 3.17986 9.25435 3 9.70711 3H14.2929C14.7456 3 15.1799 3.17986 15.5 3.5C15.8201 3.82014 16 4.25435 16 4.70711V5.00005M16 11H14M16 16H14M8 11L9 12L11 10M8 16L9 17L11 15" stroke='#28a745' strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p>Audiencia controlada y correcta</p></span></div><Image align='right' src="/imgManual/codigoColorOficio.png" width={364} height={193} alt="Tablero"/></div>
                <h4 id='editarComentario'>Editar comentario control</h4>
                <Image align='right' src="/imgManual/oficio.png" width={624} height={486} alt="Tablero"/>
                <p>Se puede editar libremente el cuadro de entrada de texto guardando siempre con el botón indicado como "GUARDAR"que ese habilita siempre que haya cambios generados. Una vez terminado con el proceso se puede indicar como controlado con el botón "CONTROLADO" o escribiendo la palabra controlado, cambiando así la devolución visual que ahora indicará que el estado actual es correcto</p>
                <h4 id='revisionUga'>Revisión UGA</h4>
                <p>Permite agregar ítems a revisar por parte del operador encargado de la audiencia, indicando cuando ha sido resuelto para poder continuar con el proceso de oficio</p>
                <h4 id='comentarioResultado'>Editar comentario resultado</h4>
                <p>Cuadro de texto editable con fin de dejar comentarios de rápida lectura que eficienticen el proceso y su posterior revisión. Se guarda con el botón "GUARDAR" habilitado cuando se detecta un cambio &nbsp;</p>
                <p>&nbsp; </p>
                <Image align='left' src="/imgManual/generarOficioPDF.png" width={468} height={364} alt="Tablero"/>
                <h4 id='generaroOficio'>Generar oficio PDF</h4>
                <p>El sector derecho del tablero de oficio muestra la carátula y una versión simplificada de la minuta. Esta información con fin de, al seleccionar la opción con el boton inferior "GENERAR OFICIO" se puedan descargar los PDFs oficiando a las partes seleccionadas.</p>
                <p>Una vez agregado un destinatario se lo puede elegir de la lista desplegable, filtra automáticamente en base al texto escrito manualmente.</p>
                <p>El cuadro de texto mostrado debajo del ingreso de destinatarios permite incluir texto libre de necesitarse.</p>
                <h3 id='situacionCorporal'>Situación Corporal</h3>
                <h4 id='busquedaSituacion'>Búsqueda</h4>
                <p>El método de filtrado de las situaciones corporales toma en consideración los números de legajo, trabajando de forma instantánea cuando se ingresa un dígito</p>
                <h4 id='cambioSituacion'>Cambio Situación</h4>
                <p>El comentario sobre la situación se puede editar libremente y seleccionando la opción guardar para registrar los cambios</p>
                <h4 id='codigoSituacion'>Código de color</h4>
                <Image align='left' src="/imgManual/codigoColorSituacion.png" width={233} height={61} alt="Tablero"/>
                <p>Cuando la audiencia tenga un comentario de situación corporal guardado se mostrará con un fondo con una tonalidad de gris más claro</p>
            </div>
        </div>
    );
}