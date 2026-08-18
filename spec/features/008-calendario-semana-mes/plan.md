# 008 · Calendario semana/mes — Plan

## Enfoque

Se agrega una pantalla **lectura** dentro del feature `turnos` (ya contiene la agenda del día y comparte modelos/mappers). Un `CalendarioService` (señales, patrón del proyecto) carga el rango visible con `GET /admin/appointments?from&to` y expone los turnos agrupados por día. La UI es un componente standalone `calendario-page` con dos vistas (semana/mes) que comparten estado y navegación.

No se toca `TurnosStateService` más allá de reutilizar `fechaActual` y `irAlDia(fecha)` para que el click a un día abra la agenda del día con esa fecha.

## Implementación

### 1. Mapper (`src/app/core/api/mappers.ts`)
- **`appointmentToTurno(app: Appointment, catalogoPorSubtipo)`** — traduce el modelo `Appointment` (datetime ISO completo) a `Turno`. Reutiliza la lógica de `agendaAppointmentToTurno` (categoría por catálogo, profesional por categoría, `ESTADO_BACKEND_TO_UI`, `recordatorioEnviado: false`).
- Extraer la lógica común en un helper interno para evitar duplicación.

### 2. Servicio (`src/app/features/turnos/services/calendario.service.ts`)
- Señales: `vista` (`'semana' | 'mes'`), `fechaAncla` (Date del período visible), `turnosPorDia` (`Map<string, Turno[]>` key = `YYYY-MM-DD`), `cargando`, `error`.
- Métodos:
  - `cargarPeríodo()` → calcula `from`/`to` según `vista` + `fechaAncla`, hace `GET /admin/appointments?from&to`, mapea con `appointmentToTurno` y agrupa por día.
  - `irAnterior()` / `irSiguiente()` / `irHoy()` → ajustan `fechaAncla` y recargan.
  - `cambiarVista(v)` → actualiza `vista` y recarga.
  - `turnosDe(fecha)` → helper para la vista.
  - `irAlDia(fecha)` → delega en `TurnosStateService` (setea `fechaActual`, `cargarAgenda()`) y navega a `/` vía `Router`.
- Cálculo de rangos:
  - **Semana:** lunes a domingo de la semana de `fechaAncla`.
  - **Mes:** desde `1` hasta el último día del mes (solo días reales).
- Si el filtro de profesional está activo (`filtroProfesional !== 'todos'`), filtrar por `t.profesional`.

### 3. Página (`src/app/features/turnos/pages/calendario-page.component.ts`)
- Encabezado: toggle **Semana | Mes**, label del período ("Semana del 18/8 al 24/8" / "Agosto 2026"), ‹ › y "Hoy".
- **Semana:** `grid grid-cols-7`; cada columna encabezado con día + número (hoy resaltado), debajo las tarjetas compactas (hora → cliente · subtipo · badge estado, mismo `STATUS_CONFIG` del timeline). Click en encabezado de día → `irAlDia`.
- **Mes:** `grid grid-cols-7`; celdas con número de día, píldoras de turnos (hora + cliente, color por estado, máx. 3, "+N más"), celdas fuera de mes vacías, hoy resaltado. Click en celda → `irAlDia`.
- Banner de error y estado vacío con las señales del servicio, igual que `agenda-page`.
- `ngOnInit` → `cargarPeríodo()`.

### 4. Ruta y navegación
- `turnos.routes.ts`: agregar `{ path: 'calendario', loadComponent: CalendarioPageComponent }`.
- `sidebar.component.ts`: agregar enlace "Calendario" (`📆` ya usado en "Agenda del Día"; usar `🗓️`) entre "Agenda del Día" y "Servicios".
- `TurnosStateService`: agregar método `irAlDia(fecha: Date)` (set `_fechaActual` + `cargarAgenda()`), reusado por `irAlDiaAnterior/Siguiente`.

### 5. Compartir `STATUS_CONFIG`
- Mover `STATUS_CONFIG` y `CATEGORY_CONFIG` de `timeline.component.ts` a `src/app/features/turnos/components/` (p. ej. `status-config.ts`) y reutilizarlo en timeline y calendario. Alternativa: exportarlos del timeline y reimportar (evitar circular). Se elige un módulo compartido `status-config.ts`.

### 6. Validación y docs
- `npm run build` y `npm test`.
- Actualizar `docs/ARQUITECTURA.md`, `docs/CAMBIOS.md`, `AGENTS.md` y el roadmap.
- Crear test unitario mínimo del service (agrupación por día, rangos semana/mes) con vitest.

## Decisiones

- **Pantalla de lectura separada** — la agenda del día es la pantalla operativa; el calendario es visión de período. Menos riesgo de romper el flujo diario.
- **`GET /admin/appointments?from&to` en vez de 7/28 llamadas a `/admin/agenda`** — una sola petición por período; la agenda por día solo se pide al hacer click.
- **Sin backend** — el endpoint de rango ya entrega todo lo necesario (criterio del usuario: no tocar el backend si no es necesario).
- **`STATUS_CONFIG` compartido** — evita divergencias de colores entre timeline y calendario.
- **Click → agenda del día** — mantiene el calendario simple y empuja la operación al lugar donde ya funciona (confirmar/iniciar/completar).

## Riesgos

- **Zonas horarias** — el backend devuelve fechas naive (hora local). Se parsean como `Date` local (igual que hoy); el agrupado por día se hace con la fecha local del cliente.
- **Turnos que cruzan la medianoche** — no aplican en este negocio (horario 9–18); se agrupa por `startTime`.
- **Cambios de estado entre pantallas** — la agenda del día sigue siendo la fuente para operar; el calendario solo se recarga al navegar/cambiar período.
- **Carga pesada en mes** — un mes completo es a lo sumo ~100 turnos; sin paginación por ahora.
