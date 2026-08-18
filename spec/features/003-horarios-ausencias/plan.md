# 003 · Horarios y Ausencias — Plan

## Enfoque

Componente standalone con un servicio de estado (`HorariosService`) que maneja la configuración de franjas laborales en memoria. Se renderiza una lista de franjas con checkboxes y inputs de hora.

## Implementación

1. Crear interfaz `FranjaLaboral` en `src/app/core/models/` con: dia, activo, horaInicio, horaFin.
2. Crear `HorariosService` en `src/app/features/configuracion/services/` con signal de franjas y datos semilla.
3. Crear componente `HorarioLaboralComponent` — formulario de franjas laborales.
4. Crear componente `DiasNoLaborablesComponent` — sección de días cerrados.
5. Crear routing de feature en `configuracion.routes.ts`.
6. Integrar lazy route en `app.routes.ts`.

## Decisiones

- **Franjas predefinidas** — Se inician con 3 franjas (L-V, Sáb, Dom) que el usuario puede activar/desactivar y editar horarios.
- **Sin persistencia** — Los cambios se guardan en el signal del servicio; no hay backend.

## Riesgos

- **Impacto en agenda** — Los horarios configurados deberían filtrar la timeline. Mitigar exponiendo el servicio para que TurnosStateService lo consulte.
