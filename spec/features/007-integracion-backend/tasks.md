# 007 · Integración con el Backend Real — Tareas

## Capa API core

- [ ] Crear `src/app/core/api/environment.ts` con `API_BASE_URL` y `API_URL`
- [ ] Crear `src/app/core/api/backend.models.ts` con los tipos del backend (camelCase)
- [ ] Crear `src/app/core/api/auth.service.ts` (signals de sesión, login/logout/refresh, localStorage)
- [ ] Crear `src/app/core/api/auth.interceptor.ts` (Bearer + refresh en 401)
- [ ] Crear `src/app/core/api/auth.guard.ts` (guard funcional)
- [ ] Crear `src/app/core/api/mappers.ts` (agenda→Turno, Service→Servicio, BusinessHour↔Franja)

## Autenticación

- [ ] Crear `features/auth/` con `auth.routes.ts` y `login-page.component.ts`
- [ ] Registrar ruta `/login` y proteger las rutas admin en `app.routes.ts`
- [ ] Agregar `provideHttpClient(withInterceptors([...]))` en `app.config.ts`

## Features

- [ ] Agenda: `cargarAgenda()` desde `/admin/agenda` + persistir estados con PATCH
- [ ] Agregar estados `Reprogramado` y `No Asiste` a `EstadoTurno` y `STATUS_CONFIG`
- [ ] Servicios: `cargarServicios()` desde `/public/services`
- [ ] Horarios: `cargarFranjas()` y `guardar()` contra `/admin/settings/business-hours`
- [ ] Analytics: `cargarHistorico()` desde `/admin/appointments?from&to`
- [ ] UI de carga/error en agenda, servicios, horarios y analytics
- [ ] Recordatorios: deshabilitar WhatsApp cuando no hay teléfono
- [ ] Modal de nuevo turno y listado consumen el catálogo del backend (no semilla)

## Validación y docs

- [ ] `npm run build` y `npm test` pasan
- [ ] Validar contra los criterios de aceptación de `spec.md`
- [ ] Actualizar `docs/ARQUITECTURA.md`, `docs/CAMBIOS.md` y `AGENTS.md`
- [ ] Mover la feature a "Hecho" en `spec/constitution/roadmap.md`
