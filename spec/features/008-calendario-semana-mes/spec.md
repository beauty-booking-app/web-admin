# 008 · Calendario semana/mes

**Estado:** implementado ✅

## Qué hace

Agrega al panel una pantalla de **calendario** para visualizar los turnos de la semana o del mes de un vistazo, complementando la agenda del día (que sigue siendo la pantalla operativa).

- Nueva ruta **`/calendario`** accesible desde el sidebar.
- **Vista semana:** 7 columnas (Lun–Dom). Cada columna muestra los turnos del día como tarjetas compactas (hora, cliente, subtipo y badge de estado). El día de hoy se resalta.
- **Vista mes:** grilla tipo calendario (Lun–Dom). Cada celda muestra el número de día y hasta 3 turnos como píldoras (hora + cliente, coloreadas por estado) con "+N más" si exceden. Los días fuera del mes quedan vacíos; hoy se resalta.
- **Navegación:** botones ‹ › para cambiar de semana/mes, botón "Hoy" para volver al período actual y toggle **Semana | Mes**.
- **Click a un día** (celda en mes, encabezado en semana) o a un turno → establece esa fecha y navega a la agenda del día (`/`), donde se puede operar (confirmar/iniciar/completar).

## Por qué

La agenda del día permite operar el detalle, pero no da visión de qué viene en la semana o el mes. Para la gestión operativa del salón (planificar ocupación, detectar días sin actividad, prepararse para feriados o bloqueos) hace falta una vista resumida por período.

## Datos y backend

**No requiere cambios en el backend.** Se usa el endpoint existente:

```
GET /api/v1/admin/appointments?from=YYYY-MM-DD&to=YYYY-MM-DD
```

Devuelve `Appointment[]` (camelCase) con `startTime`, `endTime` (ISO local), `client.name`, `serviceTypes[].name`, `status`, `price`. El frontend agrupa por día.

- Se agrega un mapper `appointmentToTurno()` (modelo `Appointment` → `Turno`), parseando el datetime ISO completo (a diferencia de `agendaAppointmentToTurno` que recibe hora "HH:MM" + día).
- Rango a pedir: semana = Lunes a Domingo; mes = desde el primer día del mes al último (Lun-Dom reales, no 7/42 días).

## Criterios de aceptación

- [x] La ruta `/calendario` está protegida por el auth guard y accesible desde el sidebar.
- [x] La vista semana muestra 7 días con sus turnos (hora, cliente, subtipo, badge de estado) y resalta hoy.
- [x] La vista mes muestra la grilla completa del mes con hasta 3 turnos por celda y "+N más".
- [x] Los estados se muestran con los mismos colores del timeline (`STATUS_CONFIG`).
- [x] ‹ › y "Hoy" navegan el período; el toggle Semana|Mes cambia la vista conservando la fecha visible.
- [x] Click en un día o en un turno navega a la agenda del día con esa fecha seleccionada (se carga vía `/admin/agenda`).
- [x] Estados de carga y error (banner de error, sin datos) coherentes con el resto de la app.
- [x] Se respeta el filtro de profesional del sidebar (Ver Todo/Sofía/Camila) si está activo.
- [x] `npm run build` y `npm test` pasan.
- [x] Accesibilidad: navegación por teclado y roles ARIA en la grilla (WCAG 2.1 AA).

## Fuera de alcance

- **Feriados y bloqueos en el calendario** — el endpoint de rango no los incluye; `GET /admin/blocks` y `GET /admin/settings/holidays` se integran en una iteración posterior.
- **Acciones dentro del calendario** (confirmar/iniciar/completar desde la tarjeta) — el click navega a la agenda del día.
- **Exportación PDF de semana/mes** — hoy solo existe la del día.
- **Alta de turno desde el calendario** — se mantiene en la agenda del día.
- **Cambios en el backend** — ninguno necesario para esta feature.
