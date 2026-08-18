# Roadmap

## Hecho ✅

1. **001 · Agenda del día** — Timeline interactiva de turnos con estados en tiempo real, hero zone de atención en curso y calendario por profesional.
2. **002 · Servicios y Catálogo** — ABM de servicios organizados por 4 categorías con precios y duraciones.
3. **003 · Horarios y Ausencias** — Configuración de franjas laborales y días no laborables.
4. **004 · Recordatorios** — Envío de recordatorios por WhatsApp individual y masivo a turnos pendientes.
5. **005 · Dashboard de Analytics** — KPIs, turnos/ganancias por mes, servicios más solicitados y clientes frecuentes.
6. **006 · Exportación de Agenda** — Descarga de la agenda del día como PDF con detalle por profesional.
7. **007 · Integración con el Backend Real** — Login/refresh/logout contra `/auth/*`, agenda desde `/admin/agenda`, catálogo desde `/public/services`, horarios contra `/admin/settings/business-hours` y analytics con citas reales de `/admin/appointments`. Estados de carga/error por feature.
8. **008 · Calendario semana/mes** — Pantalla de lectura en `/calendario` con vista por semana y mes, agrupando los turnos de `GET /admin/appointments?from&to`; click en un día navega a la agenda del día. Sin cambios en el backend.

## Siguiente 🔜

<!-- ... -->

## Backlog / ideas 💡

- **Gestión de profesionales** — Alta/baja y edición de profesionales con especialidades.
- **Notas de cliente** — Campo de observaciones por turno para registrar preferencias.

> Cada feature nueva se crea como `features/NNN-nombre-feature/` con `spec.md`, `plan.md` y `tasks.md` antes de tocar código.
