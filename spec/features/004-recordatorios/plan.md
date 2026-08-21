# 004 · Recordatorios — Plan

## Enfoque

Componente standalone que consume el `TurnosStateService` para obtener los turnos con estado "Pendiente" del día. Cada recordatorio genera un enlace a `wa.me` con el mensaje preformateado. No se usa librería externa de WhatsApp.

## Implementación

1. Crear componente `RecordatoriosComponent` en `src/app/features/turnos/components/` — lista de turnos pendientes con botones de envío.
2. Crear pipe helper `WhatsAppLinkPipe` o función utilitaria que genere el enlace `wa.me/?text=...` con el mensaje formateado.
3. Crear servicio `RecordatorioService` (ligero) que filtré turnos pendientes del estado global y maneje el envío (apertura de enlace).
4. Integrar en el routing de turnos o como sub-ruta.
5. Agregar badge de pendientes en el sidebar.

## Decisiones

- **Enlace wa.me directo** — Sin API de WhatsApp; se abre el enlace en nueva pestaña para que el admin envíe manualmente o use WhatsApp Web.
- **Reusar TurnosStateService** — Los recordatorios dependen de los turnos existentes; no se crea estado duplicado.
- **Mensaje predefinido** — Formato: "Hola {nombre}, te recordamos tu turno de {servicio} hoy a las {hora}. ¡Te esperamos! - Tammi".

## Riesgos

- **Dependencia de turnos** — Si la feature 001 no está completa, esta no funciona. Mitigar implementando después de 001.
