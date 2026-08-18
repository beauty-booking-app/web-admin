# Registro de cambios

## 006 · Exportación de Agenda (2026-08-17)

- Se instaló **jsPDF** (`^4.2.1`) — dependencia aprobada.
- Nuevo `AgendaPdfService.exportarDia()` que genera y descarga `agenda-YYYY-MM-DD.pdf` con cabecera del salón, fecha, secciones por profesional (Sofía/Camila) y filas de turnos (hora, cliente, servicio, estado, precio, teléfono) con salto de página y manejo de agenda vacía.
- Botón "Exportar PDF" accesible en la cabecera de la agenda (`HeaderBarComponent`).
- Nuevos tests del servicio con `jsPDF` mockeado (4 tests en suite).

## 005 · Dashboard de Analytics (2026-08-17)

- Nueva feature `analytics/` con ruta lazy `/analytics` e ítem en el sidebar.
- Nuevo `AnalyticsService` con dataset histórico generado de 6 meses (determinístico con semilla), `computed` de KPIs, turnos por mes, ganancias con diferencia %, servicios más solicitados (filtro por categoría y mes) y clientes frecuentes.
- Nueva página `AnalyticsPageComponent` con gráficos de barras CSS accesibles (`role="img"` + `aria-label`), KPIs y filtros navegables.
- Sin dependencias nuevas.

## Fix test (2026-08-17)

- Corregido `app.spec.ts:21` que fallaba por un test de andamiaje obsoleto: esperaba un `<h1>` que ya no existe. Ahora verifica la presencia del `<router-outlet />`.

## 004 · Recordatorios (2026-08-17)

- Nuevo servicio `RecordatorioService` que filtra turnos `Pendiente` del día desde `TurnosStateService`.
- Nueva utilidad `shared/utils/whatsapp-utils.ts` con `construirMensajeRecordatorio()` y `construirWhatsAppLink()` (enlace `wa.me`).
- Nueva página `/recordatorios` (`RecordatoriosPageComponent`) con lista de pendientes, envío individual y masivo, y toast de confirmación.
- Badge "N pend." en el sidebar que cuenta los turnos pendientes por enviar.
- El envío abre `wa.me` en pestaña nueva y marca el turno como recordatorio enviado.