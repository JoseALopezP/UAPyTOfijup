# ➕ Módulo: Agregar Audiencia (Agregar-Audiencia)

Este módulo gestiona la creación manual y registro de audiencias penales directamente en la base de datos de la Oficina Judicial Penal (**OFIJUP**). Ofrece una interfaz estructurada con autocompletado en base a catálogos dinámicos (desplegables), validación de legajos en tiempo real y detección de colisiones de agenda (duplicados).

---

## 📌 1. Arquitectura del Módulo y Flujo

El módulo consta de un formulario de entrada de datos y una lista de previsualización que muestra las audiencias registradas para la fecha seleccionada.

```mermaid
graph TD
    A[Operador ingresa datos] --> B[Formulario AddAudienciaForm]
    B -- Validaciones locales --> C{¿Datos Válidos?}
    C -- No --> D[Mostrar Errores en UI]
    C -- Sí --> E[addAudiencia Firestore]
    E -- Guardar en Colección principal --> F[audiencias/{fecha}]
    E -- Recargar Listado local --> G[AddAudienciasList]
```

### Componentes de Código Clave
- **`page.jsx`**: Orquesta el contexto de autenticación y carga de datos.
- **`AddAudienciaBlock.jsx`**: Distribuye visualmente el formulario a la izquierda y la lista de control a la derecha.
- **`AddAudienciaForm.jsx`**: Gestiona la entrada de datos, estados de carga, desplegables dinámicos (salas, tipos de audiencias, jueces) y reglas de validación locales.
- **`AddAudienciasList.jsx` / `AddAudienciaIndiv.jsx`**: Renderiza la grilla de audiencias ya agendadas para el día seleccionado para evitar sobreposiciones visuales inmediatas.

---

## ⚙️ 2. Reglas de Negocio y Validaciones Clave

### A. Validación de Legajo Judicial
- **Formato Standard:** El legajo se construye en base a tres bloques: Prefijo (`legajo1`, ej. *MPF-SJ*), Número (`legajo2`, max. 5 dígitos autocompletado con ceros a la izquierda ej. *00123*), y Año (`legajo3`, ej. *2026*).
- El sistema no permite el registro de legajos con formatos corruptos o campos vacíos.

### B. Control de Jueces y Tribunal Colegiado
- **Modo Unipersonal:** Un selector simple cargado desde la lista dinámica de jueces (`juecesList`).
- **Modo Colegiado:** Al activar la casilla **Colegiado**, se habilitan tres selectores individuales independientes. Los tres jueces se concatenan con el delimitador `+` (ej. *JuezA+JuezB+JuezC*) al persistirse en Firestore para su posterior procesamiento en actas y minutas.

### C. Prevención de Duplicidad Temprana
> [!IMPORTANT]
> El sistema calcula un hash único de audiencia (`aId`) basado en el formato: `[HoraDeInicio][Legajo]`.
- Antes de impactar Firestore, el formulario valida contra el estado local (`bydate`) para asegurar que no exista otra audiencia programada para el mismo legajo a la misma hora en la fecha dada.

---

## 🚀 3. Trabajo Futuro y Mejoras Pendientes

### 🗓️ A. Detección Activa de Colisiones de Salas
- **Problema:** El sistema alerta sobre duplicados de legajo/hora, pero permite guardar audiencias en la misma Sala y Hora con distintos legajos, lo cual genera conflictos de espacio físico.
- **Solución Propuesta:** Implementar un validador cruzado que alerte si la sala elegida ya se encuentra ocupada por otra audiencia en el mismo rango de horario del día.
