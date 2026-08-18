# 007 · Integración con el Backend Real — Tareas

## Capa API core

- [x] Crear `src/app/core/api/environment.ts` con `API_BASE_URL` y `API_URL`
- [x] Crear `src/app/core/api/backend.models.ts` con los tipos del backend (camelCase)
- [x] Crear `src/app/core/api/auth.service.ts` (signals de sesión, login/logout/refresh, localStorage)
- [x] Crear `src/app/core/api/auth.interceptor.ts` (Bearer + refresh en 401)
- [x] Crear `src/app/core/api/auth.guard.ts` (guard funcional)
- [x] Crear `src/app/core/api/mappers.ts` (agenda→Turno, Service→Servicio, BusinessHour↔Franja)

## Autenticación

- [x] Crear `features/auth/` con `auth.routes.ts` y `login-page.component.ts`
- [x] Registrar ruta `/login` y proteger las rutas admin en `app.routes.ts`
- [x] Agregar `provideHttpClient(withInterceptors([...]))` en `app.config.ts`

## Features

- [x] Agenda: `cargarAgenda()` desde `/admin/agenda` + persistir estados con PATCH
- [x] Agregar estados `Reprogramado` y `No Asiste` a `EstadoTurno` y `STATUS_CONFIG`
- [x] Servicios: `cargarServicios()` desde `/public/services`
- [x] Horarios: `cargarFranjas()` y `guardar()` contra `/admin/settings/business-hours`
- [x] Analytics: `cargarHistorico()` desde `/admin/appointments?from&to`
- [x] UI de carga/error en agenda, servicios, horarios y analytics
- [x] Recordatorios: deshabilitar WhatsApp cuando no hay teléfono
- [x] Modal de nuevo turno y listado consumen el catálogo del backend (no semilla)

## Validación y docs

- [x] `npm run build` y `npm test` pasan
- [x] Validar contra los criterios de aceptación de `spec.md`
- [x] Actualizar `docs/ARQUITECTURA.md`, `docs/CAMBIOS.md` y `AGENTS.md`
- [x] Mover la feature a "Hecho" en `spec/constitution/roadmap.md`
