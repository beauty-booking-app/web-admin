# Contexto del Proyecto: Panel de Administración - Salón de Belleza

## 1. Descripción del Dominio
Aplicación web administrativa interna para un salón de belleza (peluquería y servicio de manicura). 
* **Nombre de la app:** Tammi (sidebar) / Tammiontrol (index.html title)
* **Propósito:** Gestión interna diaria de la agenda, turnos, catálogo de servicios, horarios operativos y recordatorios a clientes.
* **Audiencia:** Uso exclusivo por parte del personal administrativo (las reservas externas se realizan en otra plataforma).
* **Enfoque de UX:** Es un **dashboard operacional**, NO un dashboard de analíticas. La prioridad máxima es la gestión operativa fluida del día a día.

## 2. Stack Tecnológico & Arquitectura
* **Framework:** Angular 22 (`^22.0.0`) con TypeScript 6 (`~6.0.2`).
* **Build:** `@angular/build:application` (Vite) + `@angular/build:dev-server`.
* **Gestión de Estado & Reactividad:** Angular Signals (evitar `RxJS` innecesario para estado local, reservar para flujos HTTP/asíncronos complejos).
* **Estrategia de Renderizado:** Client-Side Rendering (CSR), Standalone Components por defecto.
* **Accesibilidad:** Cumplimiento estricto de normas WCAG 2.1 AA (contraste de color adecuado, roles ARIA en la agenda/calendario, variantes claras en componentes interactivos y navegación por teclado).
* **Estilos:** Tailwind CSS v4 (`^4.1.12`) con PostCSS plugin (`@tailwindcss/postcss`).
* **Templates:** Todos inline (sin archivos `.html` separados).
* **Testing:** Vitest (`^4.0.8`) + jsdom (`^28.0.0`).
* **Package manager:** pnpm (`10.31.0`).
* **Formateo:** Prettier (`^3.8.1`) con parser angular para HTML.

No hay base de datos. Por ahora la memoria no persiste.

## Comandos

```bash
pnpm start          # servidor de desarrollo (ng serve)
pnpm run build      # build de producción (se usa como validación)
pnpm test           # tests unitarios (vitest)
```

## 3. Estructura del proyecto

```
admin-app/
├── public/                          # Recursos estáticos
│   ├── favicon.ico
│   └── vite.svg
│
├── docs/                            # Documentación técnica
│   ├── ARQUITECTURA.md              # Arquitectura, estructura de archivos, routing, modelos
│   ├── CONVENCIONES.md              # Convenciones de código y estilo
│   ├── CAMBIOS.md                   # Registro de cambios
│   ├── best-practices.md            # Guía de buenas prácticas Angular 22
│   ├── modelo.html                  # Prototipo HTML estático de referencia visual
│   └── agenda_del_dia.md           # Reference React del componente timeline
│
├── spec/                            # Spec-Driven Development
│   ├── constitution/                # Reglas base y visión estratégica
│   │   ├── mission.md               # Propósito del panel y principios de UX/UI
│   │   ├── tech-stack.md            # Angular 22, TypeScript, Tailwind CSS, etc.
│   │   └── roadmap.md               # Hitos y fases del desarrollo
│   └── features/                    # Especificaciones por feature
│       ├── 001-agenda-dia/          # ✅ Implementado
│       │   ├── spec.md
│       │   ├── plan.md
│       │   └── tasks.md
│       ├── 002-servicios-catalogo/  # ✅ Implementado
│       ├── 003-horarios-ausencias/  # ✅ Implementado
│       ├── 004-recordatorios/       # ✅ Implementado
│       └── 005-dashboard-analytics/ # ✅ Implementado
│       └── 006-exportacion-agenda/  # ✅ Implementado
│
├── src/
│   ├── app/
│   │   ├── core/                    # Modelos globales y capa API
│   │   │   ├── models/
│   │   │   │   ├── servicio.model.ts       # Interfaz Servicio + 14 datos semilla
│   │   │   │   ├── turno.model.ts          # Interfaz Turno + tipo EstadoTurno
│   │   │   │   └── franja-laboral.model.ts # Interfaz FranjaLaboral + 7 franjas semilla
│   │   │   └── api/                  # Conexión con el backend real (FastAPI)
│   │   │       ├── environment.ts          # API_BASE_URL + API_URL (/api/v1)
│   │   │       ├── backend.models.ts       # Tipos del backend (camelCase)
│   │   │       ├── mappers.ts              # Backend ↔ modelos de dominio
│   │   │       ├── error-utils.ts          # mensajeDeError()
│   │   │       ├── auth.service.ts         # Login/logout/refresh + tokens en localStorage
│   │   │       ├── auth.interceptor.ts     # Bearer + refresh automático en 401
│   │   │       └── auth.guard.ts           # Guard funcional de rutas admin
│   │   │
│   │   ├── shared/                  # Componentes, pipes y utils reutilizables
│   │   │   ├── pipes/
│   │   │   │   └── currency-ars.pipe.ts    # Pipe para formateo pesos ARS
│   │   │   └── utils/
│   │   │       └── whatsapp-utils.ts       # Enlaces wa.me + mensajes de recordatorio
│   │   │
│   │   ├── features/
│   │   │   ├── auth/                # FEATURE 007 — LOGIN
│   │   │   │   ├── auth.routes.ts             # Ruta lazy /login
│   │   │   │   └── login-page.component.ts    # Formulario email + password
│   │   │   ├── turnos/              # ✅ FEATURE 001 y 004 — CORAZÓN OPERATIVO
│   │   │   │   ├── turnos.routes.ts             # Lazy route
│   │   │   │   ├── pages/
│   │   │   │   │   ├── agenda-page.component.ts      # Contenedor principal
│   │   │   │   │   └── recordatorios-page.component.ts  # Recordatorios WhatsApp (004)
│   │   │   │   ├── services/
│   │   │   │   │   ├── turnos-state.service.ts   # Signal state + GET /admin/agenda + PATCH status
│   │   │   │   │   ├── recordatorio.service.ts   # Filtrado pendientes + envío
│   │   │   │   │   └── agenda-pdf.service.ts     # Exportación de agenda a PDF (jsPDF)
│   │   │   │   └── components/
│   │   │   │       ├── hero-turnos/              # Tarjetas de turnos inminentes
│   │   │   │       │   └── hero-turnos.component.ts
│   │   │   │       ├── timeline/                 # Timeline 2 columnas (General / Uñas)
│   │   │   │       │   └── timeline.component.ts
│   │   │   │       ├── header-bar/               # Fecha, reloj, búsqueda, +turno
│   │   │   │       │   └── header-bar.component.ts
│   │   │   │       ├── metricas/                 # Métricas resumen del día
│   │   │   │       │   └── metricas.component.ts
│   │   │   │       └── turno-form-modal/         # Modal alta de turno
│   │   │   │           └── turno-form-modal.component.ts
│   │   │   │
│   │   │   ├── servicios-catalogo/  # ✅ FEATURE 002 — CATÁLOGO DE SERVICIOS
│   │   │   │   ├── servicios.routes.ts             # Lazy route
│   │   │   │   ├── services/
│   │   │   │   │   └── servicios.service.ts        # Signal state + GET /public/services
│   │   │   │   └── components/
│   │   │   │       ├── servicio-list.component.ts  # 4 tarjetas de categoría
│   │   │   │       └── servicio-form-modal.component.ts  # Modal alta/edición
│   │   │   │
│   │   │   └── configuracion/       # ✅ FEATURE 003 — HORARIOS Y AUSENCIAS
│   │   │       ├── configuracion.routes.ts             # Lazy route
│   │   │       ├── services/
│   │   │       │   └── horarios.service.ts             # Signal state + GET/PATCH business-hours
│   │   │       └── components/
│   │   │           ├── horarios-page.component.ts      # Franjas laborales + toast
│   │   │           └── configuracion-placeholder.component.ts  # Placeholder (no usado)
│   │   │
│   │   │   └── analytics/           # ✅ FEATURE 005 — DASHBOARD DE ANALYTICS
│   │   │       ├── analytics.routes.ts             # Lazy route
│   │   │       ├── services/
│   │   │       │   └── analytics.service.ts        # Dataset real 6 meses + computed KPIs/ganancias
│   │   │       └── pages/
│   │   │           └── analytics-page.component.ts # KPIs, gráficos CSS, filtros por mes/categoría
│   │   │
│   │   ├── layout/                  # Shell de maquetación
│   │   │   ├── admin-layout/
│   │   │   │   └── admin-layout.component.ts   # Sidebar + <router-outlet>
│   │   │   └── sidebar/
│   │   │       └── sidebar.component.ts         # Nav, filtros, estado del salón
│   │   │
│   │   ├── app.ts                   # Componente raíz (<router-outlet />)
│   │   ├── app.config.ts            # Providers globales
│   │   ├── app.routes.ts            # Rutas principales (lazy loading)
│   │   └── app.spec.ts              # Test del root
│   │
│   ├── styles.css                   # @import 'tailwindcss'
│   ├── index.html                   # HTML base (lang="es")
│   └── main.ts                      # Bootstrap via bootstrapApplication()
│
├── AGENTS.md                        # Este archivo
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── angular.json
├── .postcssrc.json
└── .prettierrc
```

## 4. Jerarquía Visual y Layout

La interfaz se distribuye de arriba a abajo:

### A. Zona Hero / Superior (Prioridad Máxima)
* **Tarjetas de turnos inminentes:** En Proceso, Próximos 60 min, Sin Confirmar.
* Cada tarjeta: cliente (nombre, teléfono), servicio (categoría + subtipo), profesional, horario inicio/fin, precio, badge de estado.
* Acciones: "Finalizar y Cobrar", "Iniciar Atención", "WhatsApp Recordatorio".

### B. Zona Media (Timeline dos columnas)
* **Columna izquierda:** Servicios Generales (Corte, Tratamientos, Color).
* **Columna derecha:** Uñas & Manicura (Camila).
* Timeline vertical con línea, dot por turno, cards con hora → contenido → acciones.
* Acciones por estado: Pendiente → "Confirmar", Confirmado → "Iniciar", En Proceso → "Completar".

### C. Zona Inferior (Métricas)
* Facturación estimada del día, servicio más demandado, asistencia promedio, recordatorios confirmados.

## 5. Estructura de Datos del Dominio

### Servicio
```typescript
export type CategoriaServicio =
  | 'CORTE UNISEX'
  | 'TRATAMIENTOS CAPILARES'
  | 'COLOR'
  | 'UÑAS';

export interface Servicio {
  id: string;
  categoria: CategoriaServicio;
  subtipo: string;
  duracionMinutos: number;
  precioBase: number;
}
```

### Turno
```typescript
export type EstadoTurno =
  | 'Confirmado' | 'Pendiente' | 'En Proceso' | 'Finalizado' | 'Cancelado';

export interface Turno {
  id: string;
  cliente: { nombre: string; telefono: string };
  servicio: Servicio;
  profesional: string;
  inicio: Date;
  fin: Date;
  estado: EstadoTurno;
  recordatorioEnviado: boolean;
}
```

### Datos semilla (7 turnos)
| Cliente | Servicio | Profesional | Hora | Estado |
|---------|----------|-------------|------|--------|
| Lucía Méndez | COLOR - Global | Sofía | 09:00 | Confirmado |
| Andrea Paez | UÑAS - Semipermanente | Camila | 09:00 | Finalizado |
| Mariana Gómez | COLOR - Mechas en gorro | Sofía | 10:00 | En Proceso |
| Sofía Rivas | UÑAS - Kapping | Camila | 10:00 | Confirmado |
| Valeria Fernández | TRATAMIENTO - Botox | Sofía | 11:30 | Pendiente |
| Carolina Rossi | UÑAS - Soft Gel | Camila | 11:00 | Confirmado |
| Camila Herrera | CORTE - Dama | Sofía | 12:00 | Confirmado |

## 6. Routing

| Ruta | Descripción | Módulo |
|------|-------------|--------|
| `/login`          | Login (email/password, sin layout) | `auth/` (lazy) |
| `/`              | Agenda del día (dashboard principal) | `turnos/` (lazy) |
| `/calendario`    | Calendario semana/mes              | `turnos/` (lazy) |
| `/recordatorios` | Recordatorios por WhatsApp           | `turnos/` (lazy) |
| `/analytics`     | Dashboard de analytics              | `analytics/` (lazy) |
| `/servicios`     | Catálogo de servicios y precios      | `servicios-catalogo/` (lazy) |
| `/configuracion` | Horarios y ausencias                 | `configuracion/` (lazy) |

## Convenciones

- Todo el contenido visible en español (es-AR).
- Seguir `docs/best-practices.md` para reglas detalladas de Angular 22.
- Seguir `docs/CONVENCIONES.md` para convenciones de código.
- Documentar cambios significativos en `docs/CAMBIOS.md`.

## No hagas

- No instalar dependencias sin avisar.
- No usar `any` en TypeScript sin justificarlo.
- No contradecir la constitución por una feature.

## Flujo de trabajo

- Antes de una tarea no trivial, propón un plan y espera mi OK.
- Una tarea a la vez; al terminar, dime qué cambiaste para que lo revise.
- Si no estás seguro al 80%, pregunta. No inventes.
- Después de terminar la tarea, actualizá la documentación.

## Datos de la app

- **Entorno:** SPA construida con **Angular 22 + Vite**.
- **Restricción Clave:** NO framework full-stack. Todo el código corre en el cliente.
- **Backend/API:** FastAPI real en `http://localhost:8000` (prefijo `/api/v1`, camelCase, auth Bearer). API y modelos en `docs/backend/api.md` y `docs/backend/models.md`. Los state services cargan desde la API; si falla se muestra error y vacío (sin fallback a semilla). El ABM de servicios y el alta de turnos siguen en memoria (la API no los expone).
- 4 categorías de servicios: CORTE UNISEX, TRATAMIENTOS CAPILARES, COLOR, UÑAS.
- 14 servicios con precios y duraciones definidos (semilla; el catálogo real se carga de `/public/services`).
- 2 profesionales: Sofía (Peluquería Integral), Camila (Uñas & Manicura).
- Autenticación por email/password contra `/auth/login` (ruta `/login`); los tokens persisten en `localStorage`.
