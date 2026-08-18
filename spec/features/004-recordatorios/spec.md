# 004 · Recordatorios

**Estado:** implementado ✅

## Qué hace

Módulo para gestionar el envío de recordatorios a clientes por WhatsApp. El administrador puede:

- Ver la **lista de turnos pendientes de confirmar** del día.
- **Enviar recordatorio individual** por WhatsApp a un cliente específico.
- **Enviar todos los recordatorios** pendientes de una vez (envío masivo).
- Visualizar el **estado de envío** de cada recordatorio (pendiente / enviado).

## Por qué

Las inasistencias son un costo directo para el salón. Enviar recordatorios por WhatsApp el día anterior o en la mañana reduce significativamente los no-shows. El módulo permite gestionar esto de forma rápida y centralizada.

## Criterios de aceptación

- [x] Se muestra la vista "Módulo Recordatorios" con la lista de turnos pendientes.
- [x] Cada turno pendiente muestra: nombre del cliente, horario, servicio.
- [x] Botón "Enviar Individual" prepara el enlace de WhatsApp con el mensaje formateado.
- [x] Botón "Enviar Todos por WhatsApp" prepara el envío masivo.
- [x] Badge de estado "pend." en el sidebar junto al nombre del módulo.
- [x] Feedback visual al enviar (toast de confirmación).
- [x] Cumple WCAG 2.1 AA.

## Fuera de alcance

- Integración real con API de WhatsApp (solo se prepara el enlace/wa.me).
- Plantillas de mensajes personalizables.
- Historial de recordatorios enviados.
- Envío automático programado (cron job).
