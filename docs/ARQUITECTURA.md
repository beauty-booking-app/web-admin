# Arquitectura — GlowControl Admin

## Estructura del proyecto

```
admin-app/
├── public/                          # Recursos estáticos
│   ├── favicon.ico
│   └── vite.svg
│
├── docs/                            # Documentación técnica
│   ├── ARQUITECTURA.md              # Este archivo
│   ├── CONVENCIONES.md              # Convenciones de código y estilo
│   ├── CAMBIOS.md                   # Registro de cambios significativos
│   ├── best-practices.md            # Reglas de Angular y TypeScript
│   ├── modelo.html                  # Prototipo HTML estático de referencia
│   └── agenda_del_dia.md           # Reference React del componente timeline
│
├── spec/                            # Spec-Driven Development
│   ├── constitution/                # Reglas base y visión estratégica
│   │   ├── mission.md               # Propósito del panel y principios de UX/UI
│   │   ├── tech-stack.md            # Angular 22, TypeScript, Tailwind CSS, etc.
│   │   └── roadmap.md               # Hitos y fases del desarrollo
│   └── features/                    # Especificaciones por feature
│       ├── 001-agenda-dia/          # ✅ Implementado
│       ├── 002-servicios-catalogo/  # ✅ Implementado
│       ├── 003-horarios-ausencias/  # ✅ Implementado
│       ├── 004-recordatorios/       # ✅ Implementado
│       └── 005-dashboard-analytics/ # ✅ Implementado
│       └── 006-exportacion-agenda/  # ✅ Implementado
│
├── src/
│   ├── app/
│   │   ├── core/                    # Modelos globales
│   │   │   └── models/
│   │   │       ├── servicio.model.ts       # Interfaz Servicio + 14 datos semilla
│   │   │       ├── turno.model.ts          # Interfaz Turno + tipo EstadoTurno
│   │   │       └── franja-laboral.model.ts # Interfaz FranjaLaboral + 7 franjas semilla
│   │   │
│   │   ├── shared/                  # Pipes y utils reutilizables
│   │   │   ├── pipes/
│   │   │   │   └── currency-ars.pipe.ts    # Pipe para formateo pesos ARS
│   │   │   └── utils/
│   │   │       └── whatsapp-utils.ts       # Enlaces wa.me + mensajes de recordatorio
│   │   │
│   │   ├── features/
│   │   │   ├── turnos/              # ✅ FEATURE 001 y 004 — CORAZÓN OPERATIVO
│   │   │   │   ├── turnos.routes.ts             # Lazy route
│   │   │   │   ├── pages/
│   │   │   │   │   ├── agenda-page.component.ts      # Contenedor principal
│   │   │   │   │   └── recordatorios-page.component.ts  # 🆕 004 Recordatorios WhatsApp
│   │   │   │   ├── services/
│   │   │   │   │   ├── turnos-state.service.ts   # Signal state + datos semilla
│   │   │   │   │   ├── recordatorio.service.ts   # 🆕 Estado de envío + filtrado pendientes
│   │   │   │   │   └── agenda-pdf.service.ts     # 🆕 Exportación de agenda a PDF (jsPDF)
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
│   │   │   │   │   └── servicios.service.ts        # Signal state + 14 servicios semilla
│   │   │   │   └── components/
│   │   │   │       ├── servicio-list.component.ts  # 4 tarjetas de categoría
│   │   │   │       └── servicio-form-modal.component.ts  # Modal alta/edición
│   │   │   │
│   │   │   ├── configuracion/       # ✅ FEATURE 003 — HORARIOS Y AUSENCIAS
│   │   │   │   ├── configuracion.routes.ts             # Lazy route
│   │   │   │   ├── services/
│   │   │   │   │   └── horarios.service.ts             # Signal state + franjas semilla
│   │   │   │   └── components/
│   │   │   │       ├── horarios-page.component.ts      # Franjas laborales + toast
│   │   │   │       └── configuracion-placeholder.component.ts  # Placeholder (no usado)
│   │   │   │
│   │   │   └── analytics/           # ✅ FEATURE 005 — DASHBOARD DE ANALYTICS
│   │   │       ├── analytics.routes.ts             # Lazy route
│   │   │       ├── services/
│   │   │       │   └── analytics.service.ts        # Dataset histórico 6 meses + computed KPIs/ganancias
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
├── AGENTS.md                        # Contexto y reglas para IA
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── angular.json
├── .postcssrc.json
└── .prettierrc
```

## Flujo de datos

1. **`TurnosStateService`** es la fuente de verdad para la agenda. Mantiene la lista de turnos del día en un `signal()` con 7 datos semilla. Incluye `computed()` para turnos inminentes, filtrados por profesional y métricas.
2. **`ServiciosService`** es la fuente de verdad para el catálogo. Mantiene 14 servicios en un `signal()` con métodos `agregar()` y `editar()`. Incluye `computed()` para categorías y total.
3. **`HorariosService`** es la fuente de verdad para horarios operativos. Mantiene 7 franjas laborales en un `signal()` con toggle por día, horarios editables y estado de guardado.
4. **`RecordatorioService`** filtra los turnos `Pendiente` del día desde `TurnosStateService` y genera enlaces `wa.me` con mensaje preformateado (`whatsapp-utils.ts`). Mantiene el estado de envíos realizados.
5. **`AgendaPdfService`** genera el PDF de la agenda del día con jsPDF: cabecera, secciones por profesional y filas de turnos.
6. **`AnalyticsService`** mantiene un dataset histórico generado de 6 meses (independiente de la agenda operativa) y expone `computed` de KPIs, turnos/ganancias por mes (con diferencia %), servicios más solicitados (filtro por categoría y mes) y clientes frecuentes.
7. El componente página (`AgendaPageComponent`) orquesta los componentes hijos de turnos.
8. Los componentes hijos son "dumb": reciben datos vía signals del state service y emiten eventos vía `output()`.
9. El **sidebar** muestra navegación con filtros por profesional y conteo dinámico de servicios.
10. No hay backend propio; la app consume APIs externas vía HTTP (pendiente).

## Routing

| Ruta             | Descripción                          | Módulo                          |
|------------------|--------------------------------------|---------------------------------|
| `/`              | Agenda del día (dashboard principal) | `turnos/` (lazy)               |
| `/recordatorios` | Recordatorios por WhatsApp           | `turnos/` (lazy)               |
| `/analytics`     | Dashboard de analytics              | `analytics/` (lazy)            |
| `/servicios`     | Catálogo de servicios y precios      | `servicios-catalogo/` (lazy)   |
| `/configuracion` | Horarios y ausencias                 | `configuracion/` (lazy)        |

Todas las rutas usan lazy loading para optimizar el bundle inicial.

## Modelo de datos

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
  | 'Confirmado'
  | 'Pendiente'
  | 'En Proceso'
  | 'Finalizado'
  | 'Cancelado';

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

### FranjaLaboral

```typescript
export type DiaSemana =
  | 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes'
  | 'Sábado' | 'Domingo';

export interface FranjaLaboral {
  dia: DiaSemana;
  activo: boolean;
  horaInicio: string;  // HH:MM
  horaFin: string;     // HH:MM
}
```

## Catálogo de servicios

| Categoría               | Servicios                                                                                       |
|-------------------------|-------------------------------------------------------------------------------------------------|
| **CORTE UNISEX**        | Corte Dama ($12.500, 45m), Corte Caballero ($9.000, 30m), Corte Niño ($7.500, 30m)            |
| **TRATAMIENTOS CAPILARES** | Nutrición ($14.000, 40m), Botox ($22.000, 60m), Anti Frizz ($20.000, 60m), Alisado ($35.000, 120m), Permanente ($28.000, 90m) |
| **COLOR**               | Global ($25.000, 75m), Mechas en gorro ($32.000, 90m), Banda/Balayage ($45.000, 150m)          |
| **UÑAS**                | Semipermanente ($11.000, 50m), Kapping ($15.000, 60m), Soft Gel ($18.500, 75m)                 |

## Profesionales

| Nombre  | Especialidad                                       | Color identificativo |
|---------|-----------------------------------------------------|----------------------|
| Sofía   | Peluquería Integral (Corte, Color, Tratamientos)    | rosa/pink            |
| Camila  | Manicura y Uñas                                     | verde/emerald        |

## Dependencias principales

- **Angular 22** (`^22.0.0`) — Framework UI
- **TypeScript 6** (`~6.0.2`) — Lenguaje con tipado estricto
- **Vite** — Build tool (`@angular/build:application`)
- **Tailwind CSS v4** (`^4.1.12`) — Utility-first CSS con PostCSS plugin
- **Angular Signals** — Gestión de estado reactivo
- **jsPDF** (`^4.2.1`) — Generación del PDF de la agenda
- **Vitest** (`^4.0.8`) — Testing framework con jsdom (`^28.0.0`)
- **Prettier** (`^3.8.1`) — Formateo de código con parser angular para HTML
- **npm** (`12.0.1`) — Package manager

## Paleta de colores

| Token           | Tailwind          | Uso                                    |
|-----------------|-------------------|----------------------------------------|
| `salon-500`     | `rose-500`        | Primario — botones, acentos            |
| `salon-600`     | `rose-600`        | Primario hover/activo                  |
| `salon-accent`  | `#fb7185`         | Acento rosa claro                      |
| `emerald`       | `emerald-500/600` | Éxito, en proceso, confirmado          |
| `amber`         | `amber-500`       | Pendiente, recordatorio                |
| `purple`        | `purple-500/600`  | Confirmado (timeline)                  |
| `slate`         | `slate-50/100/200`| Fondos, bordes, texto secundario       |

## Layout

```
┌──────────┬────────────────────────────────────────────┐
│          │  Header (fecha, reloj, búsqueda, +turno)   │
│ Sidebar  ├────────────────────────────────────────────┤
│  fijo    │  Zona Hero: tarjetas de turnos inminentes  │
│  w-64    ├────────────────────────────────────────────┤
│          │  Zona Media: timeline 2 columnas           │
│          │  (General | Uñas & Manicura)               │
│          ├────────────────────────────────────────────┤
│          │  Zona Inferior: métricas del día           │
└──────────┴────────────────────────────────────────────┘
```

**Jerarquía visual (de arriba a abajo):**
1. **Zona Hero** (prioridad máxima) — Tarjetas de turnos en curso, próximos 60 min, sin confirmar
2. **Zona Media** — Timeline dos columnas: Servicios Generales (Sofía) | Uñas & Manicura (Camila)
3. **Zona Inferior** — Métricas: facturación estimada, servicio demandado, asistencia, recordatorios
