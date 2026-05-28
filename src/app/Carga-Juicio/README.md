# ⚖️ Módulo: Carga de Juicios (Carga-Juicio)

Este módulo gestiona la planificación, registro y seguimiento de los Juicios Orales y Debates complejos dentro de la Oficina Judicial Penal (**OFIJUP**). Permite registrar la información troncal del juicio (carátula, legajo, fiscales, defensores, imputados), estructurar los bloques horarios diarios de debate, administrar listas dinámicas de testigos con control de citaciones y programar calendarios saltando días no hábiles (fines de semana y feriados).

---

## 📌 1. Arquitectura de Juicios Orales

A diferencia de las audiencias individuales simples, los Juicios se componen de múltiples sesiones o "bloques" de debate distribuidos a lo largo del tiempo.

```mermaid
graph TD
    A[Cargar Datos Básicos del Juicio] --> B[Registrar Testigos TestigoList]
    B --> C[Planificar Bloques Diarios AddJuicioInfo]
    C -- Evitar Fines de Semana / Feriados --> D[Generar Propuesta de Fechas]
    D --> E[Guardar Juicio en Colección juicios]
    E -- Crear/Actualizar de forma síncrona las audiencias individuales --> F[audiencias/{fecha}]
```

### Componentes de Código Clave
- **`page.jsx`**: Layout inicial del cargador y selector de Juicios.
- **`JuicioFrame.jsx`**: Orquestador maestro que administra el estado general de carga (`newState` / `CARGAR` vs `EDITAR`), cálculos de secuencia e impacto síncrono en Firestore.
- **`AddJuicioInfo.jsx`**: Panel para ingresar fechas, calcular y programar los bloques de debate saltando días inhábiles.
- **`BloqueJuicio.jsx` / `BloqueList.jsx`**: Gestión visual de las sesiones de juicio (Fecha, Hora, Juez, Sala).
- **`TestigoList.jsx` / `TestigoEditList.jsx`**: Formularios dinámicos para añadir, ordenar, editar y asociar DNI/teléfonos de testigos e intervinientes.
- **`savingStatus.js`**: Utilidad auxiliar de estado para sincronización de guardado.

---

## ⚙️ 2. Reglas de Negocio Clave

### A. Cálculo Automático de Bloques Hábiles
> [!IMPORTANT]
> Al programar un juicio de múltiples jornadas, el planificador lee el calendario de feriados (`feriados` en DataContext) y omite fines de semana y feriados nacionales.
- Si el usuario establece un juicio de 5 jornadas a partir de un viernes, el planificador programará: viernes, lunes, martes, miércoles y jueves (asumiendo que no hay feriados intermedios).

### B. Generación de Secuencia Única (`#N`)
- Para mantener la trazabilidad de los juicios cargados, el sistema inspecciona los registros existentes de Juicios en Firebase para calcular automáticamente el número incremental secuencial máximo (`#N`) y asignarlo al nuevo registro.

### C. Sincronización en Cascada de Audiencias
- Cuando un Juicio es guardado o reprogramado, los bloques de debate se persisten en la colección `juicios`. En paralelo, el sistema escribe registros individuales de tipo `audiencia` en `audiencias/{fecha}` por cada bloque programado, asegurando que las sesiones aparezcan de forma unívoca en las pantallas y cronómetros de los operadores de sala diarios.

---

## 🚀 3. Trabajo Futuro y Mejoras Pendientes

### ⚖️ A. Control de Colisiones de Jueces en Debates
- **Problema:** Un tribunal de debate colegiado suele estar bloqueado por semanas. El sistema actual permite programar bloques que coinciden con otras audiencias de los mismos jueces.
- **Solución Propuesta:** Alertar al operador en tiempo de diseño si alguno de los jueces cargados tiene audiencias simultáneas en la fecha de un bloque propuesto.
