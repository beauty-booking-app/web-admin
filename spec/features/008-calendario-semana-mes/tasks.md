# 008 · Calendario semana/mes — Tareas

## Mapper

- [x] Crear `appointmentToTurno()` en `src/app/core/api/mappers.ts` (modelo `Appointment` → `Turno`, datetime ISO completo)
- [x] Extraer lógica común con `agendaAppointmentToTurno` en un helper compartido

## Servicio

- [x] Crear `src/app/features/turnos/services/calendario.service.ts` (señales `vista`, `fechaAncla`, `turnosPorDia`, `cargando`, `error`)
- [x] `cargarPeríodo()` con `GET /admin/appointments?from&to` + agrupado por día
- [x] Cálculo de rangos: semana (Lun–Dom) y mes (1..último día)
- [x] `irAnterior()` / `irSiguiente()` / `irHoy()` / `cambiarVista()`
- [x] `irAlDia(fecha)` → delega en `TurnosStateService` y navega a `/`
- [x] Respetar filtro de profesional activo

## Página

- [x] Crear `src/app/features/turnos/pages/calendario-page.component.ts` (standalone, template inline)
- [x] Encabezado: toggle Semana|Mes, label de período, ‹ › y "Hoy"
- [x] Vista semana: grilla de 7 columnas con tarjetas compactas y hoy resaltado
- [x] Vista mes: grilla de celdas con hasta 3 turnos + "+N más", celdas fuera de mes vacías, hoy resaltado
- [x] Banner de error y estado vacío (señales `cargando`/`error`)
- [x] ARIA + navegación por teclado en la grilla

## Compartir estilos de estado

- [x] Mover `STATUS_CONFIG` y `CATEGORY_CONFIG` a `status-config.ts` compartido
- [x] Refactor `timeline.component.ts` para usar el módulo compartido

## Ruta y navegación

- [x] Agregar `{ path: 'calendario', ... }` en `turnos.routes.ts`
- [x] Agregar método `irAlDia(fecha)` en `TurnosStateService` (reusado por an/sig)
- [x] Agregar enlace "Calendario" en `sidebar.component.ts`

## Tests y docs

- [x] Test unitario de `calendario.service.ts` (agrupado por día, rangos semana/mes)
- [x] `npm run build` y `npm test` pasan
- [x] Actualizar `docs/ARQUITECTURA.md`, `docs/CAMBIOS.md`, `AGENTS.md` y roadmap (`spec/constitution/roadmap.md`)
