# 📥 Módulo: Solicitudes de Audiencia (Solicitudes-Audiencia)

Este módulo gestiona la extracción, procesamiento, agendamiento y rechazo automatizado de solicitudes de audiencias penales provenientes del sistema judicial externo (**PUMA / UAL**). Utiliza automatización de navegador basada en **Puppeteer** (en el backend de Electron o vía APIs de streaming SSE en modo web) y almacena su estado en **Firebase Firestore** en tiempo real.

---

## 📌 1. Arquitectura del Módulo y Flujo General

El módulo se compone de una interfaz interactiva de usuario y una serie de micro-servicios de automatización que interactúan directamente con el portal judicial legacy de San Juan (`10.107.1.184`).

```mermaid
graph TD
    A[PUMA / UAL Portal] -- Extraer Solicitudes --> B[Proceso Principal Electron / API SSE]
    B -- Filtrar y Procesar Detalles --> C[Firestore: solicitudes/pendientes]
    C -- Presentar Lista en UI --> D[Tabla de Solicitudes]
    D -- Operador Selecciona Acción --> E{Decisión}
    E -- Aceptar/Agendar --> F[Automatización: Agendamiento.js]
    E -- Rechazar/Anular --> G[Automatización: RechazarSolicitud]
    F -- Crear Audiencia --> H[Firestore: audiencias/{fecha}]
    F -- Completar Estado --> I[Firestore: solicitudes/completadas]
    G -- Notificar y Anular --> I
```

### Componentes de Código Clave
- **`page.jsx`**: Punto de entrada del módulo, envuelve la vista con `AuthContext` y `DataContext`.
- **`SolicitudesBlock.jsx`**: Contenedor estructural principal.
- **`HeaderSolicitudes.jsx`**: Orquesta las acciones masivas (`Sincronizar`, `Revisar`, `Procesar`).
- **`TableSol.jsx`**: Gestiona filtros locales, ordenamiento por fecha de solicitud (`FYH SOLICITUD`) en orden descendente estricto y selección de filas.
- **`RowSol.jsx`**: Celda de fila interactiva. Permite expandir detalles, reasignar tipos, configurar notificaciones específicas, e imputar datos particulares.

---

## ⚙️ 2. Reglas de Negocio Clave

El sistema cuenta con una serie de validaciones automáticas y reglas de negocio críticas para asegurar la consistencia de los datos procesados:

### A. Filtrado y Exclusiones Tempranas
> [!IMPORTANT]
> El sistema no procesa casos de Flagrancia ni solicitudes de partes que no pertenezcan al Ministerio Público Fiscal (MPF).
- **Filtro de Flagrancia:** Durante la extracción detallada en `extraccionDetalles.js`, si el campo **Parte Solicitante** o el campo **Organismo (UFI)** contiene la palabra `"flagrancia"` (insensible a mayúsculas/minúsculas), la solicitud es **descartada automáticamente** y no se persiste en Firestore.
- **Filtro del Solicitante (Sólo MPF):** Las solicitudes de agendamiento y el extractor de anuladas filtran de forma estricta para guardar únicamente solicitudes donde la parte solicitante comience con la palabra `"FISCAL"` o `"MPF"`. Si pertenece a la Defensa, se descartan a nivel base o se derivan al flujo correspondiente.

### B. Limpieza y Normalización de Datos
Para evitar errores de duplicidad e inconsistencia en los nombres de las personas y legajos:
- **Limpieza de Nombres de Imputados:** Al extraer los imputados de la base de datos PUMA, sus nombres suelen venir acompañados del tipo de audiencia entre paréntesis o guiones. El sistema los limpia comparando contra una lista de tipos de audiencia (`tiposAudiencia`) para remover siglas sobrantes y normalizar nombres de forma limpia.
- **Normalización de Siglas:** Se preserva el formato de siglas con puntos (ej. *A.N.I.V.I.*) en lugar de convertirlos a formato de oración (*A.n.i.v.i.*) para mantener la nomenclatura judicial oficial.
- **Formato de Fechas y Tiempos:** Todas las fechas de audiencia y timestamps se normalizan al formato standard argentino `DD/MM/AAAA`. Los horarios de inicio y fin se calculan en base a rangos (ej. `09:00 - 09:30` -> 30 minutos de duración).

### C. Ciclo de Vida de Solicitudes y Archivado Automático
- Las solicitudes se almacenan inicialmente en `solicitudes/pendientes`.
- Una vez agendadas o anuladas, se mueven a `solicitudes/completadas`.
- **Archivado Automático (Legacy):** Tras cada sincronización exitosa, el sistema ejecuta un proceso de archivado para solicitudes con más de **7 días de antigüedad** con respecto a su `fechaAudiencia`. Estas solicitudes se clonan en la colección `solicitudesLegacy/{legajo}` y se eliminan de `solicitudes/pendientes` para optimizar el rendimiento de Firestore.

### D. Reporte de Anomalías en Tiempo Real (Alert en App)
- Durante la sincronización masiva o la revisión de solicitudes, si se detectan anomalías de extracción (por ejemplo, intervinientes incompletos, errores de red al leer iframes de DNI, etc.), el sistema no interrumpe el proceso ni descarga archivos locales `.txt`.
- En su lugar, el sistema compila de inmediato un reporte estructurado y lo presenta directamente al operador en pantalla mediante un modal `alert` interactivo que lista cada legajo y las inconsistencias específicas halladas, facilitando la visualización directa e inmediata de errores sin requerir manejo de archivos extras.

---

## 🔄 3. Flujos de Trabajo (Workflows)

### Workflow 1: Sincronización Masiva (Rápida)
Se ejecuta mediante el botón **Sincronizar** en el encabezado.
1. Abre un navegador Puppeteer controlado por Electron (o API web).
2. Se autentica en PUMA con el perfil judicial.
3. Navega al listado de solicitudes `/solicitud`.
4. Aplica dos filtros pjax:
   - **Estado:** Pendiente (`a2ddb5a6-57bc-47b9-8235-e5b0012f3450`)
   - **Tipo Solicitud:** Solicitud de Audiencia (`37261e4a-94b8-4275-8bb8-0ac5a918feed`)
5. Recorre las páginas de la tabla básica de solicitudes.
6. **Optimización de Parada:** Detiene la paginación al encontrar la primera solicitud que ya existe en Firestore (evita scraping redundante).
7. Para los nuevos enlaces detectados, inicia **4 Workers en Paralelo** para extraer los detalles completos (Legajos, Intervinientes, Jueces, Delitos y DNI).
8. Persiste en Firestore.

### Workflow 2: Revisión Completa (Lento)
Se ejecuta mediante el botón **Revisar** en el encabezado.
1. Realiza el mismo scraping del Workflow 1 pero **sin optimización de parada** (recorre todas las páginas).
2. Actualiza la información de los intervinientes, delitos, documentos y jueces de todas las solicitudes pendientes por si hubo cambios externos.
3. **Detección de Solicitudes Eliminadas:** Si una solicitud en nuestra base de datos local ya no aparece en el listado de pendientes de PUMA y no ha sido marcada como agendada en nuestro sistema, se actualiza en Firestore con la bandera `noEncontrada: true` (alertando visualmente al operador de que fue eliminada o cancelada externamente).

### Workflow 3: Agendamiento Automático (Procesar)
Se ejecuta en lote (bulk) para todas las solicitudes marcadas en la tabla con las opciones **Agendar**, **Reprogramar**, o **Cancelar**.
```
[Procesar] ──► Generar PDF de Notificaciones ──► Login en PUMA ──► Cargar Legajo 
           ──► Subir PDFs generados ──► Crear Notificaciones en Legajo 
           ──► Enviar Notificaciones ──► Completar Agendamiento en Calendario ──► Fin
```
- **Generación de PDFs:** Por cada notificación programada en la fila, el sistema genera dinámicamente un PDF oficial de citación usando jsPDF. Si la plantilla está marcada como `isTemplateOnly` (plantillas fijas de PUMA), omite la subida y se limita a citar por sistema.
- **Automatización en PUMA:** Puppeteer entra al legajo correspondiente, añade los documentos PDF al legajo con el estado "Procesal", asocia los intervinientes elegidos, y confirma el agendamiento del bloque horario en el calendario de salas judiciales.
- **Creación en Firestore:** Al finalizar con éxito, se crea automáticamente la audiencia en `audiencias/{fecha}/audiencias/{id}` con estado `PROGRAMADA` para que aparezca en el Registro de Audiencia del día.

### Workflow 4: Rechazo y Anulación Automatizada
Este subflujo automatiza el rechazo formal de una solicitud que no cumple con los requisitos mínimos de información (en 3 fases consecutivas):
1. **Fase 1 (Subir PDF):** Genera un PDF de rechazo oficial que detalla la causal y lo sube a la pestaña **Documentos** del legajo en PUMA bajo estado "Procesal".
2. **Fase 2 (Notificación General):** Crea una Notificación General en el legajo del caso. Filtra automáticamente a los destinatarios basándose en el solicitante (si es MPF, notifica a los Fiscales; si es la Defensa, notifica al Defensor). Inserta un cuerpo de texto estandarizado con el fundamento legal (Acuerdo de Superintendencia 05/2024), adjunta el PDF subido en la Fase 1, y envía la notificación.
3. **Fase 3 (Anulación de Solicitud):** Navega al listado `/solicitud`, busca la fila correspondiente usando la fecha de creación exacta (`fyhcreacion`), clickea el botón de anular (ícono de cruz `fa-times`), introduce el motivo del rechazo en el campo de texto, adjunta una copia de respaldo del PDF y confirma la anulación.

---

## ⚙️ 4. Configuración y Seguridad (Segregación de Credenciales)

Para robustecer la seguridad del sistema y evitar el uso de credenciales quemadas en el código fuente, se ha implementado un esquema parametrizado y segregado:
- **Segregación de Credenciales:** El sistema divide los accesos a PUMA en dos perfiles diferenciados:
  - `general`: Usado para consultas de agenda pública y bloqueo masivo de salas.
  - `solicitudes`: Asignado exclusivamente para la gestión y procesamiento de solicitudes de audiencia (agendamientos, extracciones de detalles y anulaciones).
- **Almacenamiento Local Parametrizado:** Las credenciales y la IP del servidor judicial se persisten en un archivo local `puma_config.json` en la carpeta `userData` del entorno Electron en cada máquina cliente.
- **Canales IPC de Configuración:** La interfaz React consume e interactúa con esta configuración mediante los IPC handlers `get-puma-config` y `save-puma-config`, lo que permite un desacoplamiento completo y elimina el riesgo de fuga de credenciales del codebase.

---

## 🖥️ 5. Interacción con el Sistema Judicial Externo (PUMA)

Las funciones externas esperan una estructura fija de la plataforma legacy PUMA. A continuación se detallan los requisitos técnicos de integración:

### A. Parámetros de Conexión y Login
- **URL Base:** `http://10.107.1.184:8092` (Login y portal principal de redirección) y `http://10.107.1.184:8094` (Módulo específico de Solicitudes y Legajos).
- **Credenciales y Configuración:** El sistema carga dinámicamente las credenciales a través del canal IPC correspondientes al perfil `solicitudes` desde `puma_config.json`. Si no existe el archivo, se utiliza un fallback por defecto para desarrollo.

### B. Selectores CSS y Dependencias del DOM
Cualquier modificación en el frontend de PUMA romperá los scripts de automatización. Los selectores críticos mapeados son:
- **Login:** `#loginform-username`, `#loginform-password`, `button[name="login-button"]`.
- **Filtros PJAX (Listado):** Selects `#solicitudsearch-id_estado`, `#solicitudsearch-id_tipo_solicitud`, y el input de filtro rápido por legajo en `#grid-solicitud-filters input`.
- **Legajo e Intervinientes:** Panel con clase `.kv-flat-b` que posea un `.panel-title` con texto `"Intervinientes"`. Tabla de partes `#w9-container table`.
- **Extracción de DNI de Perfiles:** Navega a los enlaces individuales de imputados y busca la tabla `#documentos table` (manejando si se encuentra contenida dentro de un elemento `iframe`).
- **Anulación de Solicitud:** Selector `#solicitud-form-id`, campo de texto `#solicitud-observacion`, botón de confirmación `#btnAnular`.

---

## 🚀 6. Trabajo Futuro y Mejoras Pendientes

### 🛡️ A. Estabilidad de Workers en Paralelo
- **Problema:** En conexiones de red inestables o bajo alta carga en el servidor judicial, los 4 workers paralelos pueden experimentar fallos de timeout (configurado a 30s) al intentar extraer los DNI dentro de los perfiles de imputados (especialmente cuando los perfiles cargan a través de sub-iframes lentos).
- **Solución Propuesta:** Implementar una cola de tareas resiliente (ej. con `p-queue`) que intente re-procesar solicitudes fallidas de forma individual antes de dar por terminado el lote, y añadir logs visibles de progreso de cada worker en la UI del sistema.

### 🧩 B. Desacoplamiento de Lógica en la Interfaz (Header)
- **Problema:** El componente `HeaderSolicitudes.jsx` tiene más de 700 líneas y mezcla el renderizado visual con la lógica densa de preparación de PDFs de notificaciones masivas, decodificación base64, mapeo de intervinientes y triggers de IPC.
- **Solución Propuesta:** Refactorizar el procesamiento masivo abstrayéndolo en un hook personalizado llamado `useSolicitudesProcess.js` para simplificar la mantenibilidad y modularidad del código de la interfaz de usuario.

### ⚖️ C. Control de Normalización y Tipos
- **Problema:** En raras ocasiones, al procesar "Reconversiones" (solicitudes con tipos de audiencia modificados respecto al original de PUMA), el sistema puede duplicar participantes si sus nombres contienen partes del tipo de audiencia no contemplados en el diccionario de limpieza.
- **Solución Propuesta:** Utilizar coincidencia difusa (Fuzzy Matching) en base a la distancia Levenshtein para asociar defensores e imputados de manera unívoca sin depender exclusivamente de strings estáticos.
