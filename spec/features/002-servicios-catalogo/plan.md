# 002 · Servicios y Catálogo — Plan

## Enfoque

Componente standalone con un servicio de estado (`ServiciosService`) que maneja la lista de servicios en memoria usando Angular Signals. Cada categoría se renderiza como una tarjeta con su lista de subtipos. Se usa el pipe `CurrencyArsPipe` existente para formatear precios.

## Implementación

1. Crear modelo `Servicio` en `src/app/core/models/servicio.model.ts` (si no existe) con la interfaz completa.
2. Crear `ServiciosService` en `src/app/features/servicios-catalogo/services/` con signal de lista de servicios y datos semilla.
3. Crear componente `ServicioListComponent` — contenedor de las 4 tarjetas de categoría.
4. Crear componente `ServicioFormComponent` — modal/formulario para alta y edición de servicios.
5. Crear routing de feature en `servicios.routes.ts`.
6. Integrar lazy route en `app.routes.ts`.
7. Reutilizar pipe `CurrencyArspipe` de `src/app/shared/pipes/` para formateo de precios.

## Decisiones

- **Categorías fijas** — Las 4 categorías (CORTE UNISEX, TRATAMIENTOS, COLOR, UÑAS) están hardcodeadas por ahora; se abstrae en un enum para facilitar el futuro.
- **Pipe de moneda** — Se reutiliza `CurrencyArsPipe` existente en lugar de crear uno nuevo.
- **Servicio de estado separado** — Mismo patrón que turnos: signal como fuente de verdad.

## Riesgos

- **Desacoplamiento con agenda** — Los servicios se usan en el modal de turno. Mitigar exportando el servicio y modelo desde un punto central.
