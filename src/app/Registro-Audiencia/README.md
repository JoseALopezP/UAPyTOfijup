# 🎙️ Módulo: Registro de Audiencias en Sala (Registro-Audiencia)

Este módulo es la herramienta principal de trabajo de los operadores de sala de la Oficina Judicial Penal (**OFIJUP**). Permite registrar en tiempo real el desarrollo de una audiencia judicial, controlar el cronómetro de estados, catalogar a las partes intervinientes (fiscales, imputados, defensores), redactar el acta de debate mediante un editor enriquecido (Quill) y exportar la Minuta en PDF.

---

## 📌 1. Arquitectura del Espacio de Trabajo de Sala

El módulo está orquestado por un contenedor principal (`RegistroAudienciaControl`) que sincroniza el formulario de intervinientes a la izquierda con el editor de actas y cronómetro a la derecha.

```mermaid
graph TD
    A[RegistroAudienciaControl - Orquestador] --> B[RegistroAudienciaLeft - Formulario de Partes]
    A --> C[RegistroAudienciaRight - Editor Quill & Resuelvo]
    A --> D[Cronometro - Transición de Estados]
    D -- Inicio/Fin/Pausas --> E[Registrar Hitos Temporales]
    C -- Guardado Automático Debounce 3s --> F[Firestore: audiencias/{fecha}]
    B -- Copiar Audiencia Previa --> G[Consultar Legajo en Firestore]
```

### Componentes de Código Clave
- **`page.jsx`**: Punto de acceso del operador que inicializa el layout de sala.
- **`RegistroAudienciaControl.jsx`**: Sincroniza estados de cambio (`needsSaving`), gestiona alertas de salida de página y realiza confirmaciones atómicas de guardado.
- **`RegistroAudienciaLeft.jsx`**: Panel de carga de intervinientes. Incluye filtros de fiscales, asignación de defensores particulares/oficiales y el botón de importación de datos de audiencias anteriores del mismo legajo.
- **`Cronometro.jsx`**: Motor de medición temporal en vivo y control de la máquina de estados.
- **`RegistroAudienciaRight.jsx` / `TextEditor.jsx`**: Editor WYSIWYG basado en Quill que aplica estilos inline y plantillas estructuradas de forma automática.
- **`EditHitos.jsx` / `HistorialVersiones.jsx`**: Permiten depurar de forma manual marcas de tiempo de los estados e importar borradores recuperados.

---

## ⚙️ 2. Reglas de Negocio Clave

### A. Máquina de Estados y Prevención de Errores (Hold-to-Trigger)
> [!IMPORTANT]
> Los botones de transición de estado del cronómetro (Iniciar, Cuarto Intermedio, Finalizar) requieren una pulsación continua de 2 segundos para dispararse, evitando clicks accidentales del operador en plena sala de audiencias.
- **Estados del Ciclo de Vida:**
  - `PROGRAMADA` ➔ `EN_PROCESO` ➔ `CONCLUIDA` / `SUSPENDIDA` / `REPROGRAMADA` / `CUARTO_INTERMEDIO`.
- Al pasar a `CUARTO_INTERMEDIO` (en audiencias de tipo Debate), el sistema solicita ingresar la duración solicitada y el solicitante.

### B. Auto-casing y Normalización de Textos
- Al escribir los nombres de las partes o la carátula, el sistema normaliza el texto a Sentence Case pero preserva de forma inteligente las siglas judiciales oficiales (ej. *A.N.I.V.I.*, *U.F.I.*) en mayúsculas gracias a excepciones regex en el motor de normalización.

### C. Copiado de Antecedentes (Legajo)
- El operador puede presionar el botón de copiado de datos previos. El sistema realiza una búsqueda de la última audiencia del mismo legajo, recuperando carátula, imputados, defensores y fiscales correspondientes para pre-llenar los campos y agilizar el trabajo.

---

## 🚀 3. Trabajo Futuro y Mejoras Pendientes

### 📝 A. Bloqueo de Concurrencia de Edición
- **Problema:** Si dos operadores abren el registro de la misma audiencia al mismo tiempo, los auto-guardados de uno sobrescribirán los del otro (Race Condition).
- **Solución Propuesta:** Implementar un sistema de locks temporales en Firestore (ej. escribir un campo `operatorActive: UUID` con expiración de 1 minuto en la audiencia) para advertir o bloquear la edición doble.
