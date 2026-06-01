# ⚖️ OFIJUPenal — Sistema de Gestión Integral de Audiencias Penales

> **Autor:** José Agustín López  
> **Organismo:** Oficina Judicial Penal (OFIJUP) — Poder Judicial de San Juan, Argentina  
> **Stack:** Next.js 14 · React 18 · Electron 32 · Firebase · Puppeteer  
> **Inicio:** Abril 2024 | **Commits:** +730 | **Archivos fuente:** 243 (~2.3 MB de código)

---

## 📌 Resumen Ejecutivo

**OFIJUPenal** es una aplicación de escritorio híbrida (Electron + Next.js) diseñada para **digitalizar y automatizar la gestión completa de audiencias penales** en la Oficina Judicial Penal de San Juan. El sistema reemplaza procesos manuales que anteriormente requerían planillas Excel y documentos Word, centralizando todo el flujo de trabajo — desde la recepción de solicitudes hasta la generación automática de documentos legales (minutas, resuelvos, oficios y notificaciones en PDF).

### Problema que resuelve

| Antes (manual) | Después (OFIJUPenal) |
|---|---|
| Registro en planillas Excel dispersas | Base de datos centralizada en tiempo real (Firebase) |
| Redacción manual de minutas y resuelvos | Generación automática de documentos PDF con formato judicial |
| Agendamiento manual en sistema web externo | Automatización con Puppeteer (web scraping + agendamiento) |
| Sin control de tiempos de audiencia | Cronómetro integrado con hitos y métricas |
| Sin trazabilidad de solicitudes | Pipeline completo de solicitudes con estados |
| Exportación manual de informes | Exportación automática a Excel (XLSX) |

### Impacto medible

- **Reducción de ~70% del tiempo** de registro por audiencia
- **Eliminación de errores** en documentos legales (formato estandarizado)
- **Trazabilidad completa** del ciclo de vida de cada audiencia
- **Métricas en tiempo real** para informes de gestión

---

## 🏗️ Arquitectura del Sistema

### Arquitectura Híbrida (Desktop + Web)

```
┌─────────────────────────────────────────────────────────────┐
│                     ELECTRON (Desktop)                       │
│  ┌──────────────┐    IPC     ┌───────────────────────────┐  │
│  │ Main Process │◄──────────►│     Preload (Bridge)      │  │
│  │  main.js     │            └─────────────┬─────────────┘  │
│  │              │                          │ contextBridge   │
│  │  Puppeteer ──┼──► Sistema UAL           │                │
│  └──────────────┘    (Poder Judicial)      │                │
│                                            ▼                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                 NEXT.JS (Renderer)                    │   │
│  │                                                       │   │
│  │  React UI ──► DataContext ──► Firestore (Firebase)    │   │
│  │              AuthContext ──► Firebase Auth             │   │
│  │              App Router (17 módulos)                   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
         │                                    │
         ▼                                    ▼
   Vercel (Web)                        Firebase Cloud
```

### Decisiones arquitectónicas clave

| Decisión | Justificación |
|---|---|
| **Electron + Next.js** | Permite distribución desktop (acceso a Puppeteer para automatización) y deploy web (Vercel) desde el mismo codebase |
| **Firebase Firestore** | Base de datos NoSQL en tiempo real, sincronización multi-usuario sin backend propio |
| **Static Export** | Permite servir la app tanto en Electron (`electron-serve`) como en Vercel |
| **Puppeteer en Main Process** | El scraping y agendamiento automático requiere un navegador headless que solo puede ejecutarse en el proceso principal de Electron |
| **Context API** | Suficiente para la escala del proyecto; `DataContext` centraliza ~50+ operaciones CRUD |
| **CSS Modules** | Aislamiento de estilos por componente sin conflictos globales |

### Estructura del Proyecto

```
UAPyTOfijup/
├── main/                              # Proceso principal Electron
│   ├── main.js                        # IPC handlers, ventana, Puppeteer bridge
│   └── preload.js                     # Context bridge seguro
├── src/
│   ├── app/                           # Next.js App Router (17 módulos)
│   │   ├── Registro-Audiencia/        # ⭐ Módulo principal de registro
│   │   ├── Solicitudes-Audiencia/     # Gestión + automatización de solicitudes
│   │   ├── Minuta-Juicio/             # Editor de minutas para juicios orales
│   │   ├── Administracion-Logistica/  # Panel admin, exportaciones, sync
│   │   ├── Pumba/                     # Scraping de datos UAL
│   │   ├── Oficios/                   # Generador de oficios judiciales
│   │   ├── Agregar-Audiencia/         # Alta de audiencias
│   │   ├── Carga-Juicio/             # Carga de juicios orales
│   │   ├── Sorteo-Operador/          # Sorteo aleatorio de operadores
│   │   ├── Control-UAC/              # Control de audiencias UAC
│   │   ├── Abogados/                 # ABM de abogados/fiscales/jueces
│   │   ├── Situacion-Corporal/       # Registro de situación corporal
│   │   ├── Listas-Desplegables/      # Configuración de listas del sistema
│   │   ├── Extractor-Anuladas/       # Extracción de audiencias anuladas
│   │   ├── tablero/                  # Dashboard de audiencias del día
│   │   ├── celular/                  # Vista mobile responsive
│   │   └── api/                      # 7 API routes (Puppeteer bridge)
│   ├── context/                       # Estado global
│   │   ├── AuthContext.js             # Autenticación Firebase
│   │   └── DataContext.js             # ~735 líneas, 50+ operaciones CRUD
│   ├── firebase/
│   │   ├── config.js                  # Configuración Firebase
│   │   ├── auth/                      # Sign in, sign up, roles
│   │   └── firestore/                 # 24 módulos de abstracción Firestore
│   └── utils/                         # 27 utilidades compartidas
│       ├── resuelvoUtils.js           # Generación de resuelvos y minutas
│       ├── pdfUtils.js                # Motor PDF con justificado y layout
│       ├── excelUtils.js              # Exportación XLSX
│       ├── modelosUtils.js            # 14 plantillas de audiencias penales
│       ├── genderUtils.js             # Inferencia de género para tratamiento
│       └── ...
├── next.config.js                     # Config Next.js + Webpack (Puppeteer)
├── electron-builder.yaml              # Config build Electron multiplataforma
├── vercel.json                        # Config deploy Vercel
└── package.json
```

---

## 🧩 Módulos Funcionales

### ⭐ Registro de Audiencia (Módulo Principal)

> **Ruta:** `/Registro-Audiencia` · **16 componentes** · **~120 KB de código**

El corazón del sistema. Permite al operador registrar y gestionar audiencias en tiempo real durante su desarrollo.

| Componente | Responsabilidad |
|---|---|
| `RegistroAudienciaControl` | Controlador central: estado de 18+ campos, auto-guardado, snapshots, retry con backoff |
| `RegistroAudienciaLeft` | Panel izquierdo: datos de la audiencia (partes, tipo, caratula, fiscales, defensa, imputados) |
| `RegistroAudienciaRight` | Panel derecho: editores de texto enriquecido (Resuelvo, Minuta, Cierre) + acciones |
| `Cronometro` | Máquina de estados de la audiencia con cronómetro integrado |
| `TextEditor` | Editor de texto enriquecido basado en Quill.js |
| `EditHitos` | Gestión de hitos temporales (inicio, cuarto intermedio, fin) |
| `RepresentationSelector` | Selector de representación legal (imputado ↔ defensor) |

**Flujo de estados de una audiencia:**

```
PROGRAMADA ──► EN_CURSO ──► CUARTO_INTERMEDIO ──► EN_CURSO ──► FINALIZADA ──► RESUELVO
    │                                                              │
    ├──► CANCELADA                                                 └──► EN_CURSO (reiniciar)
    └──► REPROGRAMADA
```

**Características técnicas:**

- **Auto-guardado inteligente:** Detecta cambios via snapshots (`deepEqual`) y guarda automáticamente al perder foco o cambiar de pestaña
- **Retry con backoff exponencial:** 3 intentos con delays de 1s, 2s para operaciones Firebase
- **Cronómetro persistente:** El timestamp de inicio se almacena en Firestore, sobrevive recargas
- **Hold-to-confirm:** Los botones de cambio de estado requieren mantener presionado (progress bar visual) para evitar clicks accidentales
- **Rich Text:** Editor Quill con soporte para negrita, cursiva, subrayado, listas, colores

### Solicitudes de Audiencia

> **Ruta:** `/Solicitudes-Audiencia` · **Automatización completa con Puppeteer**

Pipeline completo para gestionar solicitudes de audiencia del sistema judicial externo:

```
Extracción ──► Solicitudes ──► Decisión ──► Agendamiento Automático ──► Notificación PDF ──► Completada
(Puppeteer)    Pendientes       │
                                └──► Rechazo con motivo ──► Completada
```

**Scripts de automatización:**

| Script | Tamaño | Función |
|---|---|---|
| `agendamiento.js` | 66 KB | Automatiza el agendamiento completo en el sistema UAL |
| `extraccionSolicitudes.js` | 9 KB | Extrae lista de solicitudes pendientes |
| `extraccionDetalles.js` | 34 KB | Extrae datos detallados de cada solicitud |
| `extraccionAnuladas.js` | 23 KB | Extrae audiencias anuladas para reportes |
| `extraccionLegajo.js` | 8 KB | Extrae datos de legajos específicos |

### Generación Automática de Documentos

El sistema genera 4 tipos de documentos PDF con formato judicial oficial:

| Documento | Descripción |
|---|---|
| **Resuelvo** | Resolución del juez con todas las partes intervinientes |
| **Minuta** | Registro del desarrollo de la audiencia (14 plantillas predefinidas) |
| **Oficio Judicial** | Comunicación formal a las partes sobre lo resuelto |
| **Notificación** | Documento con checkboxes para notificaciones procesales |

**Motor PDF (`pdfUtils.js`):**
- Basado en **jsPDF** con fuentes Arial custom embebidas
- Algoritmo de **justificado exacto** (word spacing proporcional)
- Manejo automático de **paginación** con headers/footers institucionales
- Inferencia de género para tratamiento ("Sr. Juez" / "Sra. Jueza")

### Plantillas de Audiencia Disponibles

El sistema incluye 14 modelos de minutas para distintos tipos de audiencia penal:

1. Control de Acusación
2. Control de Detención y Formalización IPP
3. Debate de Juicio Oral
4. Formalización IPP y Anticipo de Prueba
5. Formalización IPP y Juicio Abreviado
6. Formalización IPP y Suspensión de Juicio a Prueba
7. Impugnación
8. Juicio Abreviado
9. Renovación/Revisión de Medidas Cautelares
10. Sobreseimiento
11. Suspensión de Juicio a Prueba
12. Trámite de Ejecución
13. General
14. Cierre

### Otros Módulos

| Módulo | Ruta | Función |
|---|---|---|
| Pumba | `/Pumba` | Scraping de datos de audiencias del sistema UAL |
| Minuta Juicio | `/Minuta-Juicio` | Editor especializado para juicios orales multi-día |
| Admin Logística | `/Administracion-Logistica` | Panel admin (exportaciones, bloqueo masivo, sync, migración) |
| Oficios | `/Oficios` | Generador de oficios judiciales |
| Sorteo Operador | `/Sorteo-Operador` | Asignación aleatoria de operadores |
| Abogados | `/Abogados` | ABM de abogados, fiscales, jueces y defensores |
| Control UAC | `/Control-UAC` | Checklist de control de audiencias |
| Situación Corporal | `/Situacion-Corporal` | Registro de situación corporal de detenidos |
| Tablero | `/tablero` | Dashboard visual de audiencias del día |

---

## 💾 Modelo de Datos (Firebase Firestore)

### Colecciones principales

| Colección | Descripción |
|---|---|
| `audiencias/{fecha}/audiencias` | Documentos completos de audiencias (subcollection por fecha) |
| `audienciasView/{fecha}` | Documentos ligeros para lista lateral (optimización de lecturas) |
| `legajos/{nroLegajo}` | Índice por legajo para búsqueda rápida |
| `juicios/{año}` | Juicios orales agrupados por año |
| `solicitudes/pendientes` | Solicitudes de audiencia pendientes |
| `solicitudes/completadas` | Solicitudes agendadas o rechazadas |
| `solicitudesLegacy/{legajo}` | Archivo de solicitudes antiguas |
| `informeUAL/{fecha}` | Datos scrapeados del sistema UAL |
| `informeUALData/{fecha}` | Datos procesados de UAL para métricas |
| `desplegables/desplegables` | Configuración de listas desplegables |
| `desplegables/feriados` | Fechas de feriados |
| `desplegables/modelosMinuta` | Modelos personalizados de minutas |
| `abogados/listaAbogados` | Base de datos de abogados |
| `sorteos/{fecha}` | Sorteos de operadores |
| `informacion/importantDates` | Fechas importantes del sistema |
| `informacion/releaseNotes` | Notas de versiones |

### Estructura de una audiencia

```javascript
{
  numeroLeg: "MPF-SJ-12345",    // Número de legajo
  caratula: "PEREZ S/...",       // Carátula de la causa
  hora: "09:00",                 // Hora programada
  tipo: "Formalización IPP",     // Tipo de audiencia
  tipo2: "Juicio Abreviado",     // Subtipo
  juez: "DR. GARCIA",            // Juez interviniente
  sala: "Sala 1",                // Sala asignada
  operador: "López",             // Operador asignado
  estado: "EN_CURSO",            // Estado actual
  ufi: "4",                      // Unidad Fiscal
  defensoria: "2",               // Defensoría Oficial
  mpf: [{ nombre, subrogando, asistencia, presencial }],  // Fiscales
  defensa: [{ nombre, tipo, imputado, subrogando }],      // Defensores
  imputado: [{ nombre, dni, detenido, condenado }],        // Imputados
  partes: [{ name, role, representa }],                    // Otras partes
  hitos: ["09:05 | EN_CURSO", "10:30 | CUARTO_INTERMEDIO", ...],  // Timeline
  resuelvoText: "<p>El Sr. Juez resuelve...</p>",  // HTML del resuelvo
  minuta: "<p>Desarrollo de la audiencia...</p>",   // HTML de la minuta
  cierre: "En este estado, siendo las...",           // Texto de cierre
  stopwatch: 3600000,            // Tiempo acumulado (ms)
  stopwatchStart: 1716300000000  // Timestamp de inicio del cronómetro
}
```

### Estrategia de almacenamiento dual

- **`audiencias/{fecha}/audiencias/{id}`** — Documento completo (subcollection)
- **`audienciasView/{fecha}`** — Documento ligero para la lista lateral

Esta separación optimiza las lecturas: la lista lateral solo descarga el documento view, mientras que los detalles completos se cargan on-demand al seleccionar una audiencia.

---

## 🔧 Capa de Abstracción Firebase

El proyecto implementa **24 módulos de abstracción** sobre Firestore:

| Módulo | Operación |
|---|---|
| `addOrUpdateDocument` | Crea/actualiza doc en subcollection + sync con view |
| `updateDocumentAndObjectField` | Actualiza campo en doc + sync bidireccional |
| `updateDocumentOnly` | Actualiza solo en audiencias (sin sync a view) |
| `deleteDocumentAndObject` | Elimina de ambas colecciones |
| `batchWrite` | Escrituras batch para operaciones masivas |
| `bloqueoAuto` | Bloqueo masivo automatizado de horarios |
| `getListCollection` | Obtiene docs de subcollection como array |
| `updateInternalUALData` | Actualización de datos UAL anidados |

### Estado Global — DataContext

`DataContext.js` (735 líneas) centraliza el estado de la aplicación:

- **18 estados React** (audiencias, solicitudes, juicios, abogados, feriados, etc.)
- **4 listas computadas** con `useMemo`: fiscales, defensores oficiales, jueces, defensores particulares
- **50+ funciones CRUD** que abstraen la complejidad de Firestore
- **Sincronización automática** audiencias ↔ legajos

---

## ⚡ Patrones de Ingeniería

### Auto-guardado con detección de cambios

```
1. Al cargar audiencia → crear snapshot de referencia
2. Al editar → actualizar estado React + ref
3. Al detectar cambio de foco/visibilidad → comparar con snapshot (deepEqual)
4. Si hay diferencias → guardar solo campos modificados
5. Actualizar snapshot con nuevos valores guardados
```

### Retry con Backoff Exponencial

Todas las operaciones críticas usan `withRetry()`:
- 3 intentos máximo
- Delays: 1s → 2s → fallo final con alerta al usuario
- Feedback visual durante reintentos

### Hold-to-Confirm (Long Press)

Los cambios de estado de audiencia requieren mantener presionado el botón:
- Progress bar visual (0% → 100% en ~2 segundos)
- Previene cambios accidentales en estados críticos
- Implementado con `setInterval` + state machine

### Comunicación IPC Segura (Electron)

```javascript
// Main process — maneja Puppeteer y Credenciales
ipcMain.handle('agendar-puppeteer', async (event, body) => {
    const onProgress = (msg) => {
        event.sender.send('agendar-puppeteer-progress', { type: 'progress', message: msg });
    };
    const credentials = await getPumaCredentials('solicitudes');
    const resultado = await agendarAudiencia({ ...body, credentials }, onProgress);
    return { success: true, resultado };
});
```

El renderer envía tareas al main process via `ipcRenderer.invoke()`, y recibe actualizaciones de progreso en tiempo real via eventos IPC.

### Segregación de Credenciales y Configuración Centralizada (PUMA/UAL)
Para proteger las credenciales de acceso a los portales judiciales y la IP del servidor sin hardcodearlas:
- **Segregación:** Dos perfiles de credenciales (`general` para bloqueos y agendas, `solicitudes` para creación y anulación de audiencias).
- **Persistencia:** Almacenamiento local en `puma_config.json` dentro de `userData` de Electron.
- **Acceso seguro:** El frontend invoca `get-puma-config` y `save-puma-config` vía IPC de Electron de manera segura.

### Importación de Antecedentes (Traer Anterior)
Para acelerar la carga de audiencias repetitivas, el sistema permite importar datos históricos de audiencias del mismo legajo:
- **Búsqueda Histórica:** Recupera todas las audiencias asociadas al legajo de la causa.
- **Ordenamiento y Selección:** Ordena de forma descendente por fecha y hora para seleccionar la audiencia inmediatamente anterior.
- **Mapeo de Datos:** Copia campos como carátula, intervinientes (fiscales, defensores, imputados) y dependencias (UFI, Defensoría) tras confirmación expresa del operador.

---

## 🛠️ Stack Tecnológico

| Categoría | Tecnología | Versión |
|---|---|---|
| **Framework Web** | Next.js (App Router) | 14.2.x |
| **UI** | React | 18 |
| **Desktop** | Electron | 32.2.0 |
| **Base de Datos** | Firebase Firestore | 10.14.x |
| **Autenticación** | Firebase Auth | 10.14.x |
| **Automatización** | Puppeteer | 24.40.x |
| **PDF** | jsPDF | 2.5.x |
| **Excel** | ExcelJS | 4.4.0 |
| **Rich Text** | Quill / React-Quill | 2.x |
| **Estilos** | CSS Modules | — |
| **Build Desktop** | electron-builder | 25.1.8 |
| **Deploy Web** | Vercel | — |
| **Tipografía** | Titillium Web | — |

---

## 🚀 Getting Started

### Requisitos previos

- Node.js 18+
- npm
- Variables de entorno Firebase (`.env`)

### Modo Desarrollo

```bash
npm install
npm run dev    # Ejecuta concurrently: Next.js dev + Electron
```

Esto inicia Next.js en `localhost:3000` y abre la ventana Electron apuntando al servidor de desarrollo.

### Build Producción

```bash
npm run build  # next build → electron-builder
```

### Targets de distribución

| Plataforma | Formato |
|---|---|
| Windows | Portable + Directory |
| Linux | AppImage + Directory |
| macOS | DMG + Directory |

### Deploy Web (Vercel)

El proyecto se deploya automáticamente en Vercel. Puppeteer se excluye del bundle web:

```json
{
  "installCommand": "PUPPETEER_SKIP_DOWNLOAD=true npm install",
  "buildCommand": "next build"
}
```

> **Nota:** Las funciones de automatización (agendamiento, scraping) solo están disponibles en la versión desktop.

---

## 📊 Métricas del Proyecto

| Métrica | Valor |
|---|---|
| Commits totales | 730+ |
| Archivos fuente | 243 |
| Tamaño del código fuente | ~2.3 MB |
| Módulos funcionales | 17 |
| Abstracciones Firestore | 24 módulos |
| Utilidades compartidas | 27 módulos |
| Plantillas de audiencia | 14 tipos |
| API Routes | 7 |
| Tiempo de desarrollo | Abril 2024 — presente |

---

## 🧠 Competencias Técnicas Demostradas

| Área | Evidencia en el proyecto |
|---|---|
| **Full-Stack Development** | Frontend React + Backend Electron + Firebase + API Routes |
| **Arquitectura de Software** | Patrón híbrido desktop/web, separación de concerns, Context API centralizado |
| **Automatización (RPA)** | 6 scripts Puppeteer para scraping y agendamiento (~140 KB) |
| **Generación de Documentos** | Motor PDF custom con justificado, paginación y layout judicial |
| **Bases de Datos NoSQL** | Modelado Firestore, sincronización dual, batch writes |
| **UX/Interacción** | Cronómetro en tiempo real, auto-guardado, hold-to-confirm, rich text |
| **DevOps** | Build multiplataforma, deploy Vercel, Electron packaging |
| **Dominio del Negocio** | Terminología procesal penal, flujos judiciales, documentación legal |

---

> **Este sistema es utilizado activamente en producción por la Oficina Judicial Penal de San Juan para la gestión diaria de audiencias penales.**
