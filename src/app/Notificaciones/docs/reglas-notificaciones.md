# Reglas de Negocio y Funcionamiento — Sistema de Notificaciones

**Oficina Judicial Penal de San Juan — UAPyTO**
**Fecha:** Junio 2026
**Versión:** 2.0

---

## Índice

1. [Visión General del Sistema](#1-visión-general-del-sistema)
2. [Estructura de Datos en Firebase](#2-estructura-de-datos-en-firebase)
3. [Módulo Workspace (Vista Operativa)](#3-módulo-workspace-vista-operativa)
   - 3.1 [Traslados y Videoconferencias](#31-traslados-y-videoconferencias)
   - 3.2 [Mails — Citaciones](#32-mails--citaciones)
   - 3.3 [Mails — Generales (Oficios)](#33-mails--generales-oficios)
   - 3.4 [Teléfonos](#34-teléfonos)
4. [Estados de Seguimiento (statusFlags)](#4-estados-de-seguimiento-statusflags)
5. [Gestión de Comisarías](#5-gestión-de-comisarías)
6. [Módulo Legado (Pendientes / Historial)](#6-módulo-legado-pendientes--historial)
7. [Automatización de Revisión (Puppeteer)](#7-automatización-de-revisión-puppeteer)
8. [Generación de Cédulas PDF](#8-generación-de-cédulas-pdf)
9. [Normalización de Nombres de Comisarías](#9-normalización-de-nombres-de-comisarías)
10. [Flujo Completo: De la Solicitud a la Notificación](#10-flujo-completo-de-la-solicitud-a-la-notificación)
11. [Reglas de Negocio Consolidadas](#11-reglas-de-negocio-consolidadas)
12. [Mejoras Posibles](#12-mejoras-posibles)

---

## 1. Visión General del Sistema

El módulo de Notificaciones de la UAPyTO gestiona todo el ciclo de vida de las citaciones y notificaciones judiciales. El sistema opera en dos niveles:

| Nivel | Descripción |
|-------|-------------|
| **Workspace (Nuevo)** | Vista operativa en tiempo real de traslados, mails y teléfonos pendientes. Los datos provienen de la colección `anotificar` en Firebase. |
| **Legado** | Sistema anterior de tickets de notificación almacenados en la colección `notificaciones`. Sigue vigente para tickets históricos. |

El sistema se integra con:
- **Firebase Firestore** como base de datos en tiempo real.
- **Puppeteer** para automatización de acciones en el sistema PUMA (sistema judicial interno).
- **Generación de PDFs** para cédulas de notificación oficiales.

---

## 2. Estructura de Datos en Firebase

### 2.1 Colección `anotificar`

Es la colección central del Workspace. Contiene documentos separados por tipo de notificación:

| Documento | Contenido |
|-----------|-----------|
| `traslados` | Items de traslado de detenidos y videoconferencias |
| `mails` | Citaciones a notificar por correo electrónico |
| `oficios` | Notificaciones generales u oficios |
| `telefonos` | Notificaciones a gestionar por vía telefónica |

**Estructura de cada item dentro del documento:**

```
{
  numeroLeg: string,          // Número de legajo fiscal
  caratula: string,           // Carátula de la causa
  ayp: string,                // Apellido y Nombre del imputado/citado
  fechaAud: string,           // "DD/MM/YYYY HH:MM" (solo traslados)
  domicilio: string,          // Dirección del destinatario
  comisaria: string,          // Nombre de la comisaría asignada
  departamental: string,      // Departamental que corresponde
  emails: string[],           // Lista de emails de destino (mails)
  telefonos: string,          // Teléfono de contacto
  text: string,               // Texto completo del documento
  tipoNotificacion: string,   // Tipo de notificación (subtítulo)
  documentos: Array<{link, nombre}>, // Links a docs adjuntos
  esVideoconferencia: boolean, // true si es VC, false si es traslado físico
  manual: boolean,            // true si los emails fueron editados manualmente
  statusFlags: {
    listaParaNotificar: boolean,
    notificada: boolean,
    comprobante: boolean,
    indicadaComoNotificada: boolean
  }
}
```

### 2.2 Colección `notificaciones` (Sistema Legado)

| Documento | Contenido |
|-----------|-----------|
| `anotificar` | Tickets pendientes de notificación |
| `MMAAAA` | Historial archivado por mes/año (ej: `062026`) |

**Estructura de cada ticket:**

```
{
  nroLegajo: string,
  cuerpo: string,
  tipo: 'oficio' | 'agendamiento',
  fecha: string,
  fechaGenerada: string,
  fechaFinalizado: string,      // Solo en historial
  notificaciones: [
    {
      nombre: string,
      dni: string,
      anotificar: boolean,        // true = pendiente
      fechaNotificado: string,    // Fecha en que se marcó como notificado
      linkSolicitud: string       // URL en PUMA para revisar
    }
  ]
}
```

### 2.3 Colección `desplegables`

| Documento | Contenido |
|-----------|-----------|
| `comisarias` | Diccionario de comisarías con datos de contacto |

```
{
  "COMISARIA 1": {
    nombre: string,
    departamental: string,
    mailComisaria: string,
    mailDepartamental: string
  }
}
```

---

## 3. Módulo Workspace (Vista Operativa)

### 3.1 Traslados y Videoconferencias

**¿Qué muestra?**
Items del documento `traslados` de la colección `anotificar`.

**Reglas de filtrado:**
- Solo se muestran audiencias cuya `fechaAud` esté entre **ayer** y **pasado mañana** (ventana de 3 días).
- Si el filtro "Siguiente Turno" está activo, se aplica una lógica adicional:
  - Si son **menos de las 14:00 hs**: muestra el turno **tarde de hoy** (hora >= 14).
  - Si son **14:00 hs o más**: muestra el turno **mañana de mañana** (hora < 14 del día siguiente).

**Reglas de ordenamiento:**
- Ordenados cronológicamente por `fechaAud` de más próximo a más lejano.

**Codificación visual:**
- Turno **mañana** → borde y texto en azul (`#3b82f6`)
- Turno **tarde** → borde y texto en naranja (`#f97316`)
- Email editado manualmente (`manual: true`) → fondo rosado/rojo tenue
- Tipo **VIDEOCONF.** → badge violeta
- Tipo **TRASLADO** → badge neutro

**Campos editables por el operador:**
- `domicilio`: click en la celda activa un input de texto. Se guarda con Enter o al perder foco.
- `comisaria`: click abre un `<select>` con las comisarías de la base de datos. Al seleccionar, se guarda automáticamente y se actualiza también el campo `departamental` con los datos de esa comisaría.

**Al cambiar la comisaría:**
1. El sistema normaliza el nombre (ver sección 9).
2. Actualiza `comisaria` con el nombre oficial.
3. Actualiza `departamental` con el dato que tenga ese registro en el diccionario de comisarías.

### 3.2 Mails — Citaciones

**¿Qué muestra?**
Items del documento `mails` de la colección `anotificar`.

**Reglas:**
- El campo `emails` contiene uno o más correos separados como array.
- Si el operador edita manualmente los emails (click en la celda), se activa el flag `manual: true` en ese item. Esto indica que los emails no fueron auto-completados por el sistema.
- Al editar, se ingresan los emails separados por coma. El sistema los parsea (`split(',').map(trim)`).
- Si se actualiza el campo `emails` desde código (no manualmente), se pone `manual: false`.

### 3.3 Mails — Generales (Oficios)

**¿Qué muestra?**
Items del documento `oficios` de la colección `anotificar`. Se accede desde la sub-pestaña "GENERAL" dentro de la vista Mails.

**Reglas:** idénticas al caso de Citaciones.

### 3.4 Teléfonos

**¿Qué muestra?**
Items del documento `telefonos` de la colección `anotificar`.

**Reglas:**
- El campo `telefonos` es un string con el número o números de teléfono de contacto.
- Es editable de forma directa con click en la celda.

---

## 4. Estados de Seguimiento (statusFlags)

Cada item en el Workspace tiene 4 checkboxes de seguimiento:

| Flag | Columna | Descripción |
|------|---------|-------------|
| `listaParaNotificar` | LISTA | Se marcó como lista para salir a notificar |
| `notificada` | NOTIF. | La persona fue efectivamente notificada |
| `comprobante` | COMPRO. | Se recibió el comprobante de notificación |
| `indicadaComoNotificada` | INDICADA | Fue marcada en PUMA como notificada |

**Regla de actualización:**
- Cada checkbox actualiza únicamente el campo `statusFlags` del item en Firebase.
- El estado se persiste de forma independiente de los demás campos.
- El cambio se refleja de manera optimista en la UI y se confirma contra Firebase.
- En caso de error, la UI revierte al estado anterior (re-fetch).

---

## 5. Gestión de Comisarías

### 5.1 Alta y Edición

Un operador puede agregar o editar comisarías desde la pestaña "Comisarías":

**Campos del formulario:**
- Nombre de la comisaría (**obligatorio**)
- Departamental correspondiente
- Email de la comisaría
- Email de la departamental

**Regla de edición con cambio de nombre:**
Si el operador edita una comisaría y **cambia el nombre**, el sistema:
1. Elimina el registro anterior (`removeObject` con el nombre viejo como clave).
2. Crea el nuevo registro con el nombre actualizado.

Si el nombre no cambia, solo se actualiza el contenido.

### 5.2 Eliminación

Requiere confirmación del operador. Elimina el objeto de la clave del documento en `desplegables/comisarias`.

### 5.3 Búsqueda

La tabla de comisarías admite búsqueda por nombre, departamental, email de comisaría o email de departamental. Es case-insensitive.

---

## 6. Módulo Legado (Pendientes / Historial)

### 6.1 Pendientes

- Lee de `notificaciones/anotificar`.
- Cada "ticket" puede tener múltiples personas (`notificaciones[]`).
- Un item de persona tiene `anotificar: true` si está pendiente.
- El contador del ticket (círculo naranja) muestra cuántas personas están pendientes.

**Acción: Marcar como Notificado**

1. Se actualiza la persona en el array: `anotificar: false`, `fechaNotificado: (fecha actual en formato DD/MM/YYYY HH:MM)`.
2. **Si aún quedan personas pendientes:** se actualiza el ticket en `notificaciones/anotificar`.
3. **Si ya no quedan personas pendientes:** el ticket se **archiva**:
   - Se agrega a `notificaciones/MMAAAA` (el mes/año actual) con `fechaFinalizado`.
   - Se elimina de `notificaciones/anotificar`.

### 6.2 Historial

- Lee de `notificaciones/MMAAAA` según el mes y año seleccionado en los filtros.
- Solo lectura. No se pueden marcar como notificados.
- Permite ver el detalle de tickets ya finalizados, con fechas de notificación de cada persona.

### 6.3 Búsqueda (ambas vistas)

Filtra en tiempo real por:
- Número de legajo
- Cuerpo del ticket
- Nombre de persona
- DNI de persona

---

## 7. Automatización de Revisión (Puppeteer)

Disponible únicamente en la **aplicación de escritorio** (Electron).

**Acción:** Botón "Revisar" por cada persona en los tickets legado pendientes.

**Flujo:**
1. El frontend invoca el canal IPC `revisar-notificacion` con la URL de la solicitud (`linkSolicitud`).
2. El proceso principal de Electron (`main.js`) delega en `revisarNotificacion.js`.
3. Se abre un browser Puppeteer (modo visible, no headless).
4. Se hace login en PUMA con las credenciales de la sección `solicitudes` del config.
5. Se navega a la URL de la solicitud.
6. El browser queda abierto 4 segundos para que el operador pueda revisar manualmente.
7. Se cierra el browser y se devuelve `{ success: true }`.

**Progreso en tiempo real:**
- El proceso envía mensajes de progreso al frontend mediante el evento IPC `revisar-notificacion-progress`.
- El texto aparece en pantalla junto al nombre de la persona que se está revisando.

**Nota:** El flujo de revisión actual es semi-manual. El botón abre el sistema PUMA en la URL correcta para que el operador vea el estado; la automatización total del chequeo está reservada para una versión futura.

---

## 8. Generación de Cédulas PDF

La función `descargarPdfNotificacion` (en `notificacionesAgendamiento.js`) genera cédulas según el tipo de notificación.

### 8.1 Tipos de Cédula

| Opción | Descripción |
|--------|-------------|
| `citacionPersonalPolicial` | Cédula dirigida a la Dirección de Personal D-1. Lista de personas a citar con hora específica. |
| `cancelarAudienciaImputadoEnLibertad` | Notifica cancelación de audiencia. |
| `citacionDenunciante` | Citación presencial para denunciantes. |
| `citacionImputadoLibertadVideoconferencia` | Citación vía videoconferencia para imputados en libertad. |
| `citacionConvenio` | Citación VC con número de teléfono para coordinación del enlace. |
| `rechazarSolicitud` | Documento oficial de rechazo de solicitud por información incompleta. |
| *(default)* | Citación presencial estándar para imputados en libertad. |

### 8.2 Estructura Estándar de una Cédula

1. **Fecha** (San Juan, DD de mes del AAAA) — alineada a la derecha.
2. **Encabezado CÉDULA PENAL** — centrado, con borde (excepto en rechazo).
3. **Destinatario** — Jefe de Policía + datos del citado (excepto en policial y rechazo).
4. **Cuerpo del documento** — varía según tipo.
5. **Información del Juez** — informa asignación conforme Acuerdo 05/2024.
6. **Pie de Notificación:**
   - "QUEDA UD. DEBIDAMENTE NOTIFICADO."
   - "UNIDAD DE NOTIFICACIONES Y CITACIONES / OFICINA JUDICIAL PENAL"
   - Contacto: tel. 2646 61-3638 / notificacionofijup@jussanjuan.gov.ar
7. **Acta de Notificación** — para completar por el notificador.
8. **Checkboxes** de opciones (solo en cédulas no-policiales).
9. **Líneas de firma** — persona notificada y funcionario.
10. **Cierre** — solicitud de envío de constancia por email.

### 8.3 Integración con el Agendamiento

Cuando se genera un agendamiento y hay notificaciones pendientes:
1. El sistema genera los PDFs de cédula en buffer.
2. Los convierte a Base64.
3. Los envía al proceso Electron que los escribe en disco temporalmente.
4. Puppeteer los sube al legajo en PUMA con estado "Procesal".
5. Crea la notificación en PUMA asociando el documento.
6. Marca las notificaciones creadas en los últimos 35 minutos y pulsa "Enviar a Notificar".
7. Elimina los archivos temporales.

---

## 9. Normalización de Nombres de Comisarías

La función `getNormalizedComisaria` resuelve variantes de escritura hacia el nombre oficial.

**Estrategia de resolución (en orden de prioridad):**

1. **Match exacto** (después de limpiar acentos y normalizar a mayúsculas).
2. **Solo número**: si el input es "5", busca "COMISARIA 5".
3. **Patrón con número**: si contiene "CRIA 5", "C5", etc., busca "COMISARIA 5". Si contiene "SUB", busca "SUB...5".
4. **Match por token**: extrae palabras significativas del input (ignorando: COMISARIA, SUB, CRIA, DE, LA, EL, LOS, LAS, DEL, UNIDAD, OPERATIVA, BRIGADA) y busca nombres que las contengan.
5. **Match por substring**: si el nombre oficial contiene al input o viceversa.
6. **Fallback**: devuelve el valor original sin cambios.

---

## 10. Flujo Completo: De la Solicitud a la Notificación

```
[Solicitud en PUMA]
       │
       ▼
[Extracción automática vía Puppeteer]
 (módulo Solicitudes-Audiencia)
       │
       ▼
[Solicitud guardada en Firebase — colección solicitudes]
       │
       ▼
[Operador marca para agendar + configura notificaciones]
       │
       ▼
[Procesamiento masivo (botón Procesar)]
  ├── Genera PDFs de cédulas
  ├── Sube documentos al legajo en PUMA
  ├── Agenda/Reprograma la audiencia
  ├── Crea notificaciones en PUMA
  └── Envía notificaciones (botón "Enviar a Notificar")
       │
       ▼
[Notificación queda en PUMA con estado Enviada]
       │
       ▼
[Operador registra en Workspace (colección anotificar)]
  ├── Marca LISTA cuando ya se asignó para notificar
  ├── Marca NOTIF. cuando la persona fue notificada
  ├── Marca COMPRO. cuando llega el comprobante
  └── Marca INDICADA cuando se cargó en PUMA
```

---

## 11. Reglas de Negocio Consolidadas

| # | Regla |
|---|-------|
| 1 | Un ticket legado se archiva automáticamente cuando **todas** sus personas han sido marcadas como notificadas. |
| 2 | El archivado usa el mes/año **del momento exacto** en que se completa la última notificación. |
| 3 | Los datos de Workspace se traen de la colección `anotificar`, **no** de `notificaciones`. Son sistemas paralelos. |
| 4 | En Traslados, solo se muestran items con audiencia en un rango de **ayer a pasado mañana**. |
| 5 | El filtro "Siguiente Turno" utiliza la hora actual del dispositivo del operador para determinar el turno siguiente. |
| 6 | Cambiar la comisaría de un traslado actualiza automáticamente el campo `departamental` con los datos del catálogo. |
| 7 | Editar emails manualmente activa `manual: true`. Al actualizar desde el sistema, vuelve a `manual: false`. |
| 8 | La revisión automática en PUMA requiere la **app de escritorio** (Electron). En la versión web no está disponible. |
| 9 | Las credenciales usadas para revisión son las de la sección `solicitudes` del archivo `puma_config.json`. |
| 10 | Las cédulas de rechazo no incluyen acta de firma ni pie de notificación estándar. |
| 11 | En el agendamiento masivo, solo se generan PDFs para notificaciones que **no sean plantillas puras** (lista en código). |
| 12 | Las notificaciones creadas en PUMA son marcadas para "Enviar a Notificar" si tienen menos de **35 minutos** de antigüedad. |
| 13 | La búsqueda en Pendientes/Historial es case-insensitive y busca simultáneamente en legajo, cuerpo, nombre y DNI. |
| 14 | Al renombrar una comisaría, se **elimina la clave vieja** y se crea una nueva. No hay renombramiento in-place. |

---

## 12. Mejoras Posibles

| Prioridad | Mejora | Descripción |
|-----------|--------|-------------|
| Alta | **Revisión automática real** | Completar el flujo de `revisarNotificacion.js` para que lea el estado de la notificación en PUMA y lo actualice en Firebase automáticamente, sin intervención manual. |
| Alta | **Unificación de sistemas** | Migrar completamente el sistema legado (`notificaciones`) al nuevo Workspace (`anotificar`) para tener un único flujo de datos. |
| Media | **Notificación por email directo** | Desde el Workspace, poder enviar el email de citación directamente con un botón, sin necesidad de ir al cliente de correo. |
| Media | **Historial en Workspace** | El Workspace actual no tiene historial. Agregar un estado "archivado" a los items completados. |
| Baja | **Validación de emails** | Al editar emails manualmente, validar el formato antes de guardar. |
| Baja | **Exportar a Excel** | Permitir exportar la vista de traslados del día como lista para el operador de campo. |

---

*Documento generado el 30 de junio de 2026. UAPyTO — Oficina Judicial Penal de San Juan.*
