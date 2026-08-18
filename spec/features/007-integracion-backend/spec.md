# 007 · Integración con el Backend Real

**Estado:** en desarrollo 🔧

## Qué hace

El panel de administración se conecta al backend real (FastAPI en `http://localhost:8000`, prefijo `/api/v1`, campos en **camelCase**, auth **Bearer**) y deja de depender exclusivamente de los datos semilla en memoria. Incluye:

- **Autenticación:** pantalla de login con email/password contra `POST /auth/login`, renovación de access token (`POST /auth/refresh`), cierre de sesión (`POST /auth/logout`) y guard de rutas admin.
- **Agenda del día:** carga desde `GET /admin/agenda?date=YYYY-MM-DD` y persistencia de cambios de estado con `PATCH /admin/appointments/{id}/status`.
- **Catálogo de servicios:** carga desde `GET /public/services`.
- **Horarios y ausencias:** carga y guardado con `GET/PATCH /admin/settings/business-hours` (PATCH es reemplazo total).
- **Analytics:** KPIs, turnos/ganancias por mes, servicios más solicitados y clientes frecuentes con datos reales de `GET /admin/appointments?from&to` (últimos 6 meses).
- **Estados de carga y error** por feature: banner de error y sin datos si la API falla (no hay fallback a semilla).

## Por qué

La misión define al panel como una SPA que consume APIs externas vía HTTP. Los datos semilla en memoria impiden trabajar con los datos reales del salón y no reflejan los modelos del backend (citas, estados, business hours, etc.).

## Criterios de aceptación

- [ ] La app muestra login cuando no hay sesión y protege las rutas admin con un guard.
- [ ] Login/refresh/logout funcionan contra `/auth/*`; los tokens persisten en `localStorage` y se envían como `Authorization: Bearer`.
- [ ] La agenda del día se carga desde `GET /admin/agenda?date=...` con estados mapeados (`pendiente/confirmado/reprogramado/completado/cancelado/no_asiste`).
- [ ] Las acciones de la timeline (Confirmar, Completar) persisten vía `PATCH /admin/appointments/{id}/status`.
- [ ] El catálogo de servicios se carga desde `GET /public/services` (Service + types → Servicio).
- [ ] Los horarios se cargan al entrar y se guardan con PATCH de reemplazo total contra `/admin/settings/business-hours`.
- [ ] Analytics usa datos reales: KPIs del mes, turnos/ganancias por mes, top servicios y clientes frecuentes.
- [ ] Cada feature muestra estado de carga y un banner de error si la API falla (sin datos).
- [ ] El ABM de servicios y el alta local de turnos siguen funcionando en memoria (la API no expone CRUD admin).
- [ ] Los turnos sin teléfono (limitación de la API) no habilitan el envío de recordatorio por WhatsApp.
- [ ] `npm run build` pasa y los tests existentes no se rompen.

## Fuera de alcance

- **ABM de servicios persistido** — la API solo expone `GET /public/services` (sin endpoints admin de CRUD).
- **Alta de turnos persistida** — `POST /appointments` es para el cliente autenticado; el alta desde el modal sigue siendo local.
- **Recordatorios con teléfono real** — la agenda del backend no incluye teléfono del cliente.
- **Feriados y bloqueos de agenda** — la UI actual solo gestiona franjas laborales (endpoints `/admin/settings/holidays` y `/admin/settings/blocks` quedan para otra feature).
- **Registro público, recuperación de contraseña, notificaciones y dispositivos** — endpoints del backend no usados por el panel.
