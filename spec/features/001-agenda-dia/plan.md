# 001 · Agenda del día — Plan

## Enfoque

Componente standalone de Angular que renderiza la zona Hero (tarjetas de turnos inminentes) y la timeline por profesional. Se usa un servicio de estado (`TurnosStateService`) basado en Angular Signals para manejar la lista de turnos del día en memoria. El modal de nuevo turno se implementa como componente hijo.

## Implementación

1. Crear `TurnosStateService` en `src/app/features/turnos/services/` — Signal con lista de turnos del día, métodos para agregar, cambiar estado, filtrar por profesional.
2. Crear modelo `Turno` en `src/app/core/models/turno.model.ts` con interfaz tipada.
3. Crear componente `HeroTurnosComponent` — tarjetas de turnos inminentes (En Proceso, Próximo, Sin Confirmar).
4. Crear componente `TimelineComponent` — grilla de 3 columnas (horario, Sofía, Camila) con slots ocupados y libres.
5. Crear componente `TurnoFormModalComponent` — modal para alta de nuevo turno con formulario.
6. Crear componente `MetricasComponent` — barra de métricas resumen del día.
7. Crear feature module `TurnosModule` en `src/app/features/turnos/` con routing propio.
8. Integrar en `app.routes.ts` con lazy loading.
9. Crear componente `AgendaPageComponent` como página contenedora que orquesta Hero + Timeline + Métricas + Modal.
10. Agregar datos semilla (turnos de ejemplo) para demostrar la funcionalidad.

## Decisiones

- **Angular Signals sobre RxJS** — El estado de turnos es local y simple; Signals es más directo y legible para este caso.
- **Timeline con CSS Grid** — 3 columnas fijas (horario + 2 profesionales) es suficiente; no se necesita librería de calendario externa.
- **Modal como componente hijo** — Se controla con signal boolean en el padre; no se usa Router para modales.
- **Datos en memoria** — Sin persistencia por ahora; los datos semilla se cargan al iniciar.

## Riesgos

- **Complejidad de la timeline** — Si se agregan más profesionales en el futuro, la grilla crece. Mitigar con diseño flexible que permita agregar columnas.
- **Sincronización de estados** — Los turnos inminentes y la timeline deben reflejar los mismos datos. Mitigar con un único signal fuente de verdad en el servicio.
