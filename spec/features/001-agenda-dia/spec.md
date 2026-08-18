# 001 · Agenda del día

**Estado:** implementado ✅

## Qué hace

Pantalla principal que muestra la agenda operativa del día actual. El administrador puede:

- Ver las **tarjetas de turnos inminentes** (en curso, próximos 60 min, pendientes de confirmar) en una zona Hero prominente.
- Consultar la **timeline interactiva por profesional** (Sofía y Camila) con huecos libres y ocupados.
- **Agendar un nuevo turno** haciendo clic en un hueco libre o desde el botón "+ AGENDAR TURNO".
- **Gestionar un turno existente** (cambiar estado, finalizar, cancelar) desde la tarjeta o la timeline.
- **Filtrar por profesional** para ver solo la agenda de uno.
- Ver **métricas resumen** del día (facturación estimada, servicio más demandado, asistencia, recordatorios confirmados).

## Por qué

Es el corazón operativo del salón. Sin esta funcionalidad el panel no tiene utilidad: el administrador necesita ver de un vistazo qué está pasando ahora, qué viene después y qué necesita atención inmediata. Debe ser lo primero que se ve al abrir la app.

## Criterios de aceptación

- [x] Al cargar la app se muestra la zona Hero con turnos inminentes (en curso, próximos, sin confirmar).
- [x] Cada tarjeta de turno inminente muestra: cliente (nombre, teléfono), servicio (categoría + subtipo), horario de inicio/fin, y badge de estado.
- [x] La tarjeta "En Proceso" tiene botón "Finalizar y Cobrar".
- [x] La tarjeta "Próximo" tiene botón "Iniciar Atención".
- [x] La tarjeta "Sin Confirmar" tiene botón "WhatsApp Recordatorio".
- [x] Se muestra la timeline interactiva por profesional con columnas de horario (09:00 AM a 20:00 PM).
- [x] Los huecos ocupados muestran nombre del cliente, servicio y estado.
- [x] Los huecos libres muestran "+ Disponible" y al hacer clic abren el modal de nuevo turno.
- [x] El modal de nuevo turno permite: nombre cliente, teléfono, categoría/servicio (con optgroups), horario inicio, estado inicial.
- [x] Se muestra la barra de métricas inferior (facturación, servicio demandado, asistencia, recordatorios).
- [x] Layout responsive: timeline scrollea horizontalmente en móvil.
- [x] Cumple WCAG 2.1 AA: roles ARIA en timeline, contraste adecuado, focus-visible.

## Fuera de alcance

- Persistencia de turnos (por ahora todo es en memoria).
- Edición completa de un turno (solo cambio de estado y alta rápida).
- Vista semanal o mensual del calendario.
- Integración real con WhatsApp (solo se prepara el enlace/mensaje).
