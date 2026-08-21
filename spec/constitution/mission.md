# Misión

## Qué construimos

**TammiControl** (Tammi) — Panel de administración operativo interno para un salón de belleza (peluquería y servicio de manicura). Es una SPA que gestiona la agenda diaria, turnos, catálogo de servicios, horarios operativos y recordatorios a clientes.

Las piezas principales del producto:

1. **Agenda del día** — Timeline interactiva de turnos con estados en tiempo real, acciones rápidas (iniciar, finalizar, cancelar) y vista por profesional.
2. **Catálogo de servicios** — ABM de servicios organizados por 4 categorías (CORTE UNISEX, TRATAMIENTOS CAPILARES, COLOR, UÑAS) con precios y duraciones.
3. **Horarios y ausencias** — Configuración de franjas laborales (lunes-sábado) y días no laborables.
4. **Recordatorios** — Envío de recordatorios por WhatsApp para reducir inasistencias, individual y masivo.

## Para quién

- **Personal administrativo del salón** — Audiencia principal. Usa el panel para gestionar el día a día: ver próximos turnos, agendar nuevos, gestionar servicios y enviar recordatorios.
- **Profesionales del salón (Sofía, Camila)** — Consultan su agenda asignada.

## Principios

- **Dashboard operacional, NO analítico** — La prioridad máxima es la gestión operativa fluida del día a día. Las métricas son secundarias y van en la zona inferior.
- **Jerarquía visual clara** — Zona Hero (turnos inminentes) > Zona Media (calendario) > Zona Inferior (analytics). Lo primero que se ve al cargar es la atención en curso.
- **Accesibilidad WCAG 2.1 AA** — Contraste adecuado, roles ARIA en agenda/calendario, focus-visible, navegación por teclado.
- **Contenido en español** — Todo el contenido visible está en español (es-AR).
- **Sin persistencia por ahora** — Los datos se manejan en memoria; no hay base de datos.

## Qué NO es

- **NO es una app de reservas para clientes** — Las reservas externas se realizan en otra plataforma.
- **NO es un dashboard de analíticas** — Las métricas son complementarias, no el foco.
- **NO es un CRM completo** — No gestiona historial extenso de clientes ni campañas de marketing.
- **NO usa backend propio** — Consume APIs externas vía HTTP; no hay servidor propio.
