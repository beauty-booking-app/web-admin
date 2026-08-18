# 006 · Exportación de Agenda — Plan

## Enfoque

Generar el PDF en el cliente con **jsPDF** (aprobado por el usuario, única dependencia nueva). Se ubica la lógica de generación en un servicio dedicado `AgendaPdfService` que consume el estado global de turnos (`TurnosStateService`) y produce un PDF coherente con la paleta e información de la app. Se expone un botón en la cabecera de la agenda (`HeaderBarComponent`).

## Implementación

1. **Instalar dependencia** — `npm install jspdf` (aprobado).
2. **Servicio `AgendaPdfService`** (`src/app/features/turnos/services/agenda-pdf.service.ts`)
   - Método `exportarDia(turnos: Turno[])` que:
     1. Crea el documento con orientación vertical y medidas A4.
     2. Escribe la cabecera: "VELVET & GLOW", fecha completa del día (o de `turnos[0].inicio`), subtítulo "Agenda del día".
     3. Agrupa los turnos por profesional y dibuja secciones con título.
     4. Por cada turno: fila con hora ini-fin, cliente, servicio (categoría - subtipo), estado, precio (`currencyArs`) y teléfono.
     5. Si no hay turnos: escribe mensaje "Sin turnos para el día".
     6. Descarga con `doc.save('agenda-YYYY-MM-DD.pdf')`.
   - Panel de colores: usar colores del PDF en tonos slate/rose, sin depender de clases CSS (jsPDF dibuja vectores/texto).
3. **Integración en la vista** — En `HeaderBarComponent` (agenda), agregar botón "Exportar PDF" con `aria-label`, icono 🖨️, target ≥44px y contraste adecuado. Llama a `AgendaPdfService.exportarDia(turnosState.turnos())`.
4. **Validación** — Build + test de servicio (generar PDF con datos semilla y verificar que no lanza; usar mock de `save` si el entorno jsdom lo requiere).

## Decisiones

- **jsPDF sola (sin autoTable)** — No se instala la tabla automática para evitar más dependencias; se dibujan filas manualmente con coordenadas y saltos de página. Control total del layout y menor peso.
- **Servicio dedicado en `turnos/`** — La exportación pertenece al dominio de la agenda; sigue la convención de un servicio por dominio.
- **Formato A4 apaisado vs vertical** — Vertical, más natural para imprimir/listado de turnos; se controla cantidad de filas por página con salto automático.
- **Fecha desde los turnos** — La agenda muestra "hoy"; se usa la fecha del día de los turnos para el nombre del archivo y cabecera.

## Riesgos

- **jsPDF y jsdom en tests** — Algunas APIs de jsPDF (canvas) pueden fallar en jsdom. Mitigar: en el test, stubear `doc.save` y no depender del render vectorial real.
- **Overflow de páginas** — Muchos turnos + agrupación por profesional. Mitigar: control de altura acumulada y `addPage()` cuando se supera el límite.
- **Datos semilla de prueba** — Los 7 turnos de la agenda son el dataset de prueba; el PDF debe reflejarlos fielmente.