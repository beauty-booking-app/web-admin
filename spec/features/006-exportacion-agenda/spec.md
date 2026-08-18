# 006 · Exportación de Agenda

**Estado:** implementado ✅

## Qué hace

El administrador puede descargar la agenda del día como un **PDF** bien formateado, listo para imprimir o compartir. Desde la agenda se agrega una acción "Exportar PDF" que:

- Genera un PDF con el detalle de todos los turnos del día ordenados por horario.
- Agrupa los turnos por profesional (Sofía / Camila) con subtítulos claros.
- Incluye por cada turno: hora, cliente, servicio (categoría + subtipo), estado, precio y teléfono.
- Muestra un encabezado con la fecha del día y el nombre del salón.

## Por qué

El corazón del panel es la agenda operativa diaria (misión). La impresión/PDF permite imprimir la agenda en papel para tenerla a mano en el sector o compartirla con el equipo sin necesidad de login. Complementa la vista en pantalla sin sustituirla.

## Criterios de aceptación

- [x] La ruta `/` (Agenda del día) incluye un botón accesible "Exportar PDF" junto al header de la agenda.
- [x] Al hacer clic se genera y descarga un archivo `agenda-YYYY-MM-DD.pdf`.
- [x] El PDF incluye el nombre del salón (VELVET & GLOW) y la fecha completa del día en la cabecera.
- [x] El PDF incluye todos los turnos del día (apilados por hora) con cliente, servicio, profesional, estado, precio y teléfono.
- [x] Los turnos se agrupan en secciones por profesional con título de sección.
- [x] Cumple WCAG 2.1 AA en el botón (aria-label, contraste, target 44px).
- [x] No se rompe con una agenda vacía (PDF con la fecha y mensaje "Sin turnos").

## Fuera de alcance

- Exportación de otros períodos (semana/mes) — se limita al día de la vista (la agenda es diaria).
- Exportación CSV/Excel.
- Exportación de las demás secciones (servicios, horarios, analytics).
- Personalización del diseño del PDF.