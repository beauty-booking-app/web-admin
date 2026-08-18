# 005 · Dashboard de Analytics — Plan

## Enfoque

Crear una feature `analytics/` con su propio servicio de estado que mantiene un dataset histórico **independiente** del estado operativo de la agenda: se generan turnos semilla de los últimos 6 meses para que los gráficos tengan datos realistas. Los gráficos se dibujan con CSS/SVG propio (barras con divs de Tailwind), respetando el límite duro de "no instalar dependencias sin avisar".

## Implementación

1. **Servicio `AnalyticsService`** (`src/app/features/analytics/services/analytics.service.ts`)
   - Signal `_turnosHistoricos` con generación de datos semilla de los últimos 6 meses (mezcla de servicios, clientes, estados, profesionales y fechas).
   - `computed()`: `turnosPorMes`, `kpis`, `serviciosMasSolicitados(categoria, mes)` y `clientesFrecuentes`.
   - `computed()` de `gananciasPorMes` con la diferencia porcentual contra el mes anterior.

2. **Página `AnalyticsPageComponent`** (`src/app/features/analytics/pages/analytics-page.component.ts`)
   - Header con título y selector de período (solo mes actual por ahora).
   - Sección de KPIs (turnos totales, clientes únicos, facturación, ticket promedio).
   - Gráfico de barras de turnos por mes (CSS).
   - Gráfico de barras horizontales de servicios más solicitados (top 5) con filtro por categoría (select accesible).
   - Gráfico de barras de ganancias por mes con etiqueta de diferencia % vs mes anterior.
   - Lista de clientes frecuentes (top 5) con cantidad de turnos.

3. **Componentes reutilizables (opcional)** — `components/barra-metrica/` para las barras, o inline en la página si el tamaño lo permite.

4. **Routing** — Nueva ruta lazy `/analytics` con `analytics.routes.ts` y registro en `app.routes.ts`.

5. **Sidebar** — Ítem "Analytics" con icono 📊 en el bloque "Principal".

6. **Core** — Ningún cambio al modelo de datos existente; se reutiliza `Turno`, `Servicio` y `SERVICIOS_SEMILLA`.

## Decisiones

- **CSS/SVG propio en lugar de librería de charts** — La constitución exige avisar antes de instalar dependencias; se evita y se mantiene el bundle liviano y sin dependencias nuevas. Las barras son divs con `width:%` calculado, accesibles con `role="img"` y `aria-label`.
- **Dataset histórico independiente** — Los turnos semilla de la agenda (`TurnosStateService`) son del día actual y representan la operación en vivo. El dashboard necesita meses de historia, así que `AnalyticsService` genera su propio set histórico; no se contamina la agenda operativa ni se toca su lógica.
- **Solo mes como período** — El spec limita el filtro temporal a mes; se deja preparada la estructura para ampliar.
- **Cálculo de ganancia** — Se toma la facturación de turnos con estado `Finalizado` o `Confirmado` (equivalente a la lógica de `TurnosStateService.metricas`), para mantener consistencia.

## Riesgos

- **Datos semilla poco realistas** — Mitigar generándolos con distribución razonable: más turnos en categorías populares y fechas válidas de los últimos 6 meses.
- **Gráficos accesibles** — Las barras CSS deben tener alternativas de texto (`role="img"`, valores en el DOM, tabulación por focos de filtros). Se valida con build y revisión manual.
- **Sobre-crecimiento de la página** — Mitigar manteniendo componentes pequeños y composición, siguiendo `docs/best-practices.md`.