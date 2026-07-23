# MANUAL DE USUARIO Y OPERACIÓN: SISTEMA DE AUTOMATIZACIÓN DE NOTIFICACIONES
**Unidad de Notificaciones y Citaciones (UNC)**  
**Oficina Judicial Penal (OFIJUP) - Poder Judicial de San Juan**

---

<!-- page-break -->

## Índice
1. [Introducción y Propósito](#1-introducción-y-propósito)
2. [Arquitectura General y Flujo de Trabajo](#2-arquitectura-general-y-flujo-de-trabajo)
3. [Fase 1: Extracción y Clasificación Automática (Antes de Editar)](#3-fase-1-extracción-y-clasificación-automática-antes-de-editar)
    - 3.1. [Categorías de Almacenamiento](#31-categorías-de-almacenamiento)
    - 3.2. [Resolución de Contactos y Reglas de Negocio](#32-resolución-de-contactos-y-reglas-de-negocio)
    - 3.3. [Filtro de Domicilio y Comisarías](#33-filtro-de-domicilio-y-comisarías)
4. [Fase 2: Gestión y Edición desde la Consola Web](#4-fase-2-gestión-y-edición-desde-la-consola-web)
    - 4.1. [Panel General de Notificaciones](#41-panel-general-de-notificaciones)
    - 4.2. [Panel de Notificaciones-Traslados y Videoconferencias](#42-panel-de-notificaciones-traslados-y-videoconferencias)
    - 4.3. [Panel de Traducciones de Nombres (Reglas)](#43-panel-de-traducciones-de-nombres-reglas)
5. [Fase 3: Envío, Resguardo y Cierre (Después de Editar)](#5-fase-3-envío-resguardo-y-cierre-después-de-editar)
    - 5.1. [Cuerpo del Correo y Reglas Especiales](#51-cuerpo-del-correo-y-reglas-especiales)
    - 5.2. [Resguardo en Nextcloud](#52-resguardo-en-nextcloud)
    - 5.3. [Cierre de Estado en el Sistema Judicial (PUMA)](#53-cierre-de-estado-en-el-sistema-judicial-puma)
6. [Seguridad y Control de Accesos por Perfil de Compilación](#6-seguridad-y-control-de-accesos-por-perfil-de-compilación)

---

<!-- page-break -->

## 1. Introducción y Propósito

El **Sistema de Automatización de Notificaciones** tiene como propósito centralizar, digitalizar y agilizar el envío y registro de notificaciones judiciales y citaciones de audiencias. 

Antes de la implementación de este sistema, los operadores debían buscar manualmente las notificaciones en el portal judicial (PUMA), descargar los adjuntos correspondientes, buscar las direcciones de correo oficiales, redactar el correo y subir individualmente cada comprobante a Nextcloud. 

Este sistema automatizado reduce el tiempo de procesamiento y mitiga los errores humanos mediante dos herramientas acopladas:
- **CONO**: El motor de automatizaciones (desarrollado en Electron con Playwright-Core) que realiza el trabajo pesado de navegación, raspado de datos (scraping), envío de correos y subida de constancias.
- **UAPyTOfijup**: La consola web de administración (desarrollada en Next.js) que permite a los operadores supervisar, corregir datos erróneos y programar reglas dinámicas de traducción de nombres.

---

## 2. Arquitectura General y Flujo de Trabajo

El flujo de información sigue un ciclo cerrado que garantiza la consistencia de los datos en todo momento:

1. **Extracción**: El robot **CONO** accede a PUMA y descarga las notificaciones pendientes con estado **"A NOTIFICAR"**.
2. **Clasificación y Carga**: Las notificaciones se analizan y clasifican de acuerdo al texto libre del proveído y al tipo de destinatario, guardándose en colecciones dedicadas en **Firebase Firestore** bajo la colección raíz `anotificar`.
3. **Gestión Web**: Los operadores entran a la consola web **UAPyTOfijup** para auditar los registros clasificados, completar datos faltantes (marcando registros listos para enviar) y formatear notificaciones a comisarías o traslados.
4. **Despacho Automatizado**: El robot **CONO** lee las notificaciones marcadas como "LISTAS", envía los correos institucionales correspondientes con sus adjuntos, sube el comprobante de envío a la carpeta correcta de **Nextcloud** y actualiza el estado de la notificación en **PUMA** a "Enviada" o "Notificada".

---

<!-- page-break -->

## 3. Fase 1: Extracción y Clasificación Automática (Antes de Editar)

Cuando se ejecuta el módulo de **Extracción Notificaciones** en CONO (que corre secuencialmente `citaciones.ts` y `oficios.ts`), se realiza un escaneo de la tabla del portal judicial PUMA.

### 3.1. Categorías de Almacenamiento
Cada notificación procesada se inserta en Firestore con un identificador único conformado por:  
`[Legajo normalizado]_[Fecha de creación normalizada]` (Ej. `MPF-SJ-00101-2026_02-07-2026`).

La clasificación se distribuye automáticamente en cinco documentos dentro de la colección Firestore `anotificar`:
- **`mails`**: Contiene notificaciones que disponen de un correo electrónico válido extraído de la tabla o de la sección de domicilios electrónicos.
- **`telefonos`**: Almacena citaciones donde se identifica un número de teléfono móvil para envío de SMS o WhatsApp (frecuentemente testigos o peritos).
- **`traslados`**: Registra notificaciones dirigidas al Servicio Penitenciario Provincial (SPP) o que hacen referencia explícita a traslados o videoconferencias (VC).
- **`oficios`**: Guarda los oficios y providencias generales que no encajan en las otras categorías.
- **`citaciones`**: Clasificación genérica para notificaciones que requieren entrega en mano o despacho vía comisarías.

### 3.2. Resolución de Contactos y Reglas de Negocio
Durante la extracción, el sistema aplica las siguientes reglas automáticas:
- **Exclusión de Flagrancia**: Aquellas notificaciones cuyo texto mencione "Flagrancia" son descartadas de forma automática para evitar interferir con su circuito de procesamiento independiente.
- **Defensores Oficiales**: Si el destinatario coincide con un Defensor Oficial configurado (ej. "LEVEQUE", "MUT"), se asocia automáticamente un grupo de correos institucionales correspondientes a su defensoría.
- **Jueces en Citaciones**: Para citaciones dirigidas a la defensa, el robot ingresa al legajo en PUMA, ubica la pestaña de la audiencia programada y extrae el nombre del juez titular para agregar su correo institucional en copia (`cc`).
- **Jueces en Oficios**: Para providencias u oficios, busca por coincidencia de apellido el nombre del juez en el texto libre y, si se encuentra en la base de magistrados, se agrega su email en la citación.
- **Detección Manual**: Si el sistema no puede encontrar un email válido ni tampoco resolver el destinatario por medio de las tablas de traducción, deja la lista de correos vacía y establece la bandera `manual: true`. Esto advierte visualmente al operador en la consola web para que intervenga.

### 3.3. Filtro de Domicilio y Comisarías
Para las notificaciones dirigidas a **comisarías** o que especifican **traslados**:
1. El scraper analiza el texto libre usando expresiones regulares para aislar el domicilio físico de la persona a citar.
2. Emplea un algoritmo de similitud por tokens (Dice's Coefficient / Bigrams) contra un diccionario estático de **971 comisarías y delegaciones de San Juan**.
3. Si la similitud supera un umbral crítico de confianza, se asigna automáticamente el nombre de la comisaría normalizada y su respectivo **departamento departamental**. Si la confianza es baja, se deja en blanco para que el operador complete la información en la consola web.

---

<!-- page-break -->

## 4. Fase 2: Gestión y Edición desde la Consola Web

Una vez que Firestore está cargado con los datos extraídos, los operadores interactúan con los registros en la interfaz web de **UAPyTOfijup**.

### 4.1. Panel General de Notificaciones
Ruta: `/Notificaciones`  
Este panel presenta pestañas para **Mails**, **Oficios**, **Teléfonos** y **Citaciones**:
- **Monitoreo**: Permite visualizar de un vistazo los datos del destinatario, legajo, fecha de la audiencia y estado de la notificación.
- **Resolución de Errores**: Si un registro está marcado como `manual`, el operador puede ingresar el correo correcto en el campo editable y guardar los cambios.
- **Banderas de Control (Flags)**:
  - **LISTA** (`listaParaNotificar`): Al activar esta casilla, el registro queda listo para que la automatización de envío (`notificaciones.ts`) lo procese.
  - **NOTIF.** (`notificada`): Indica si el robot ya actualizó el estado a Notificada en PUMA.
  - **COMPRO.** (`comprobante`): Indica si la constancia del envío ya se encuentra guardada en Nextcloud.
  - **INDICADA** (`indicadaComoNotificada`): Flag secundario que confirma la actualización exitosa.

### 4.2. Panel de Notificaciones-Traslados y Videoconferencias
Ruta: `/Notificaciones-Traslados`  
Diseñado específicamente para gestionar el flujo de traslados físicos de detenidos y audiencias virtuales:
- **Asignación de Comisarías**: En la tabla interactiva, el operador puede editar el domicilio e ingresar el nombre de la comisaría oficial mediante un menú desplegable autocompletable.
- **Actualización en Cascada**: Al seleccionar la comisaría del catálogo normalizado, el sistema recupera de la base de datos la dirección, los correos institucionales de la comisaría y la departamental de la que depende, actualizando automáticamente el registro en Firestore.
- **Copiar VC WhatsApp**: Al marcar la casilla de verificación de múltiples videoconferencias (VC) del día, el operador puede hacer clic en "Copiar VC WhatsApp". El sistema formateará los datos (Legajo, Imputado, Enlace de Zoom, Hora y Sala) en un solo texto limpio para ser copiado al portapapeles, agilizando el envío al personal policial de custodia.
- **Filtro de Turno**: Permite separar de forma ágil las audiencias que corresponden al turno mañana ("M", antes de las 13:15hs) y turno tarde ("T", después de las 13:15hs).

### 4.3. Panel de Traducciones de Nombres (Reglas)
Ruta: `/Traducciones-Notificaciones`  
Permite parametrizar las sustituciones de texto para que el scraper CONO asocie de forma inteligente nombres alternativos o mal escritos con los correos oficiales correctos:
- **Traducciones Generales**: Mapea nombres de personas o dependencias recurrentes a una lista de correos.
- **Traducciones de Jueces**: Mapea el nombre del juez recuperado en la audiencia a su correo oficial. 
- *Almacenamiento*: Se guardan directamente en Firebase (`notificaciones/traducciones` y `notificaciones/traduccionesJueces`), de modo que el scraper las lee antes de procesar cada fila.

---

<!-- page-break -->

## 5. Fase 3: Envío, Resguardo y Cierre (Después de Editar)

Cuando el operador ejecuta la automatización de **Ejecución Notificaciones** en CONO, el robot realiza el despacho físico y formal:

### 5.1. Cuerpo del Correo y Reglas Especiales
Para cada registro con `listaParaNotificar: true` y `estadoEnviada: false`:
1. El robot descarga los adjuntos desde PUMA.
2. **Regla de Comisaría en Libertad**: Si la notificación va dirigida a una comisaría policial, la persona a citar se encuentra en libertad y hay archivos adjuntos en el envío, el robot redacta un correo con **cuerpo vacío** (solo adjuntos y la firma institucional de la UNC). Esto previene que se transcriba información innecesaria y agiliza la lectura del personal policial.
3. En otros casos, se incorpora el texto del proveído íntegramente en formato HTML.
4. Se despacha el email a los correos resueltos en `to` y, de ser citación de defensa, se copia (`cc`) al juez correspondiente.

### 5.2. Resguardo en Nextcloud
Una vez enviado el correo, la automatización genera un comprobante de envío en formato JSON/PDF y lo sube al repositorio en la nube de la OFIJUP (**Nextcloud**).
El almacenamiento sigue una estructura de directorios estricta:
`CONSTANCIAS NOTIFICACIONES / [Año] / [Rango de Legajos] / [Legajo Abreviado] / [Fecha Audiencia]`

*Ejemplo de estructura:*
```text
CONSTANCIAS NOTIFICACIONES/
└── 2026/
    └── LEGAJOS 100 A 199/
        └── LN° 101.26/
            └── 02-07-2026/
                └── comprobante_178491823.json
```

### 5.3. Cierre de Estado en el Sistema Judicial (PUMA)
Finalmente, el robot regresa a PUMA y actualiza los metadatos de la notificación:
- Si se trata de un envío a través del sistema electrónico Choique, asigna el medio de notificación como **"CHOIQUE (Sistema de Notificaciones Electrónicas)"**.
- En caso contrario, lo marca como **"EMAIL/SMS/WHATSAPP/TELÉFONO"**.
- Guarda el cambio y presiona el botón para modificar el estado de la notificación a **"Enviada"** en PUMA.
- Para notificaciones estándar (no comisarías), ejecuta el segundo paso para marcar la notificación como **"Notificada"**.

---

<!-- page-break -->

## 6. Seguridad y Control de Accesos por Perfil de Compilación

Para resguardar la integridad de los datos y evitar ejecuciones indebidas, el sistema cuenta con control de accesos centralizado en `accesos.js`:

| Perfil / Rango | Acceso a Notificaciones | Acceso a Traslados | Acceso a Traducciones | Observaciones |
| :--- | :---: | :---: | :---: | :--- |
| **Administrador (`admin`)** | Sí | Sí | Sí | Control total de la plataforma |
| **Unidad de Apoyo Local (`ual`)** | Sí | Sí | Sí | Acceso completo |
| **Mesa de Entradas (`uac`)** | Sí | Sí | Sí | Gestión operativa diaria |
| **Unidad de Notificaciones (`unc`)**| Sí | Sí | Sí | Gestión operativa diaria |
| **Gestión de Audiencias (`uga`)** | No | No | No | Perfil limitado a agendamientos |

### Configuración en Build Targets
El sistema se compila en diferentes instalables según el destinatario. Los accesos se restringen en tiempo de compilación mediante la variable de entorno `NEXT_PUBLIC_BUILD_TARGET`:
- **Build `unc` (Unidad de Notificaciones)**: Compila las pantallas de Notificaciones, Traslados y Traducciones.
- **Build `ual` (Unidad de Apoyo Local)**: Compila el set completo de herramientas de notificaciones y usuarios.
- **Build `uga` (Unidad de Gestión de Audiencias)**: **Excluye** por completo estos tres módulos para evitar ruido visual al personal enfocado en agendar audiencias.
