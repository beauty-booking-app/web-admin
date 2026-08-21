# TammiControl — Panel de Administración (web-admin)

Panel de administración web del salón de belleza (Tammi). Es un **dashboard operacional** para la gestión interna: agenda del día, turnos, catálogo de servicios, horarios operativos y recordatorios a clientes.

Consume la API del backend FastAPI (`api-backend`).

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Angular 22 (Standalone Components, CSR) |
| Lenguaje | TypeScript 6 |
| Estado | Angular Signals |
| Estilos | Tailwind CSS v4 (PostCSS) |
| Tests | Vitest + jsdom |
| Build | `@angular/build:application` (Vite) |
| Extras | jsPDF (exportación de agenda), RxJS (HTTP) |

## Requisitos

- Node.js con pnpm 10 (`packageManager` del proyecto: `pnpm@10.31.0`)
- El backend corriendo en `http://localhost:8000` (ver README de `api-backend`)

> La API base se configura en `src/app/core/api/environment.ts` (`API_BASE_URL` + prefijo `/api/v1`).

## Puesta en marcha

```bash
pnpm install      # primera vez
pnpm start        # servidor de desarrollo (ng serve) → http://localhost:4200
```

La app redirige a `/login`. Credenciales de desarrollo del backend:

- **Email:** `admin@salon.com`
- **Password:** `Admin#2026`

Los tokens se persisten en `localStorage`; el `auth.interceptor` renueva el access token automáticamente en un 401.

## Comandos

| Comando | Descripción |
|---|---|
| `pnpm start` | Servidor de desarrollo en `http://localhost:4200` |
| `pnpm run build` | Build de producción (se usa como validación) |
| `pnpm test` | Tests unitarios (Vitest) |

## Rutas

| Ruta | Descripción |
|---|---|
| `/login` | Login (email/password, sin layout) |
| `/` | Agenda del día (dashboard principal) |
| `/calendario` | Calendario por semana y mes |
| `/recordatorios` | Recordatorios por WhatsApp |
| `/analytics` | Dashboard de analytics |
| `/servicios` | Catálogo de servicios y precios |
| `/configuracion` | Horarios y ausencias |

## Estructura del proyecto

```
web-admin/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── models/          # Modelos de dominio (servicio, turno, franja laboral)
│   │   │   └── api/             # Conexión con el backend: environment, backend.models, mappers, auth.service/interceptor/guard
│   │   ├── shared/              # Pipes y utils reutilizables (currency-ars, whatsapp)
│   │   ├── features/            # Funcionalidades por módulo (lazy): auth, turnos, servicios-catalogo, configuracion, analytics
│   │   ├── layout/              # Shell de maquetación: admin-layout + sidebar
│   │   └── app.config.ts        # Providers globales
│   ├── styles.css               # Tailwind
│   └── index.html
├── docs/                        # ARQUITECTURA.md, CONVENCIONES.md, CAMBIOS.md, best-practices.md, backend/
├── spec/                        # Spec-Driven Development: constitution/ + features/
├── public/
└── angular.json
```

## Backend / API

- Base: `http://localhost:8000` · Prefijo: `/api/v1` · JSON en **camelCase** · Auth `Bearer`.
- Los state services cargan desde la API; si falla muestran error y vacío (sin fallback a semilla).
- El catálogo y la agenda se cargan de endpoints reales; el alta de turnos y el ABM de servicios siguen en memoria (el backend no los expone aún).
- Modelos y API documentados en `docs/backend/api.md` y `docs/backend/models.md`.

## Convenciones

- Todo el contenido visible en español (es-AR).
- Angular Signals para estado local; RxJS solo para flujos HTTP complejos.
- Componentes standalone con templates inline.
- Cumplimiento WCAG 2.1 AA.
- Detalles en `docs/ARQUITECTURA.md`, `docs/CONVENCIONES.md` y `docs/best-practices.md`.
- Documentar cambios significativos en `docs/CAMBIOS.md`.

## Especificación y roadmap

El proyecto usa **Spec-Driven Development** (`spec/`): cada feature tiene `spec.md`, `plan.md` y `tasks.md` en `spec/features/NNN-nombre/`, con el roadmap en `spec/constitution/roadmap.md`.

Estado actual: features 001–008 implementadas (agenda del día, catálogo, horarios, recordatorios, analytics, exportación, integración con backend y **calendario semana/mes**).
