# Tech stack y convenciones

## Tecnologías

- **Lenguaje:** TypeScript 6 estricto (sin `any` injustificado)
- **Framework / runtime:** Angular 22 (`^22.0.0`) con Vite (`@angular/build:application`)
- **Gestión de estado:** Angular Signals (evitar RxJS innecesario para estado local; reservar para flujos HTTP/asíncronos complejos)
- **Estilos:** Tailwind CSS v4 (`^4.1.12`) con PostCSS plugin (`@tailwindcss/postcss`)
- **Package manager:** pnpm (`10.31.0`)
- **Base de datos:** No aplica — los datos no persisten
- **Tests:** Vitest (`^4.0.8`) + jsdom (`^28.0.0`)
- **Formateo:** Prettier (`^3.8.1`) con parser angular para HTML
- **Despliegue:** SPA estática (Client-Side Rendering)

## Archivos / módulos clave

- `src/app/core/models/` — Interfaces de dominio (servicio, turno, franja-laboral)
- `src/app/shared/pipes/` — Pipes reutilizables (currency-ars)
- `src/app/shared/components/` — Componentes UI reutilizables (badge/ y modal/ vacíos)
- `src/app/features/turnos/` — CORAZÓN OPERATIVO: agenda, turnos, calendario
- `src/app/features/servicios-catalogo/` — ABM de servicios y precios
- `src/app/features/configuracion/` — Horarios laborales y días no laborables
- `src/app/layout/` — Shell de maquetación (admin-layout, sidebar)
- `src/app/app.routes.ts` — Definición principal de rutas (lazy loading)
- `src/app/app.config.ts` — Providers globales

## Comandos

- `pnpm start` — arranca el servidor de desarrollo (ng serve)
- `pnpm run build` — compila para producción (se usa como validación)
- `pnpm test` — ejecuta tests unitarios (vitest)

## Modelo de datos / dominio

- **Servicio:**
  - `id: string` — identificador único
  - `categoria: 'CORTE UNISEX' | 'TRATAMIENTOS CAPILARES' | 'COLOR' | 'UÑAS'`
  - `subtipo: string` — nombre específico del servicio
  - `duracionMinutos: number`
  - `precioBase: number`
- **Datos semilla — CORTE UNISEX:** Dama ($12.500, 45m), Caballero ($9.000, 30m), Niño ($7.500, 30m)
- **Datos semilla — TRATAMIENTOS CAPILARES:** Nutrición ($14.000, 40m), Botox ($22.000, 60m), Anti Frizz ($20.000, 60m), Alisado ($35.000, 120m), Permanente ($28.000, 90m)
- **Datos semilla — COLOR:** Global ($25.000, 75m), Mechas en gorro ($32.000, 90m), Banda/Balayage ($45.000, 150m)
- **Datos semilla — UÑAS:** Semipermanente ($11.000, 50m), Kapping ($15.000, 60m), Soft Gel ($18.500, 75m)
- **Turno:**
  - `id: string`
  - `cliente: { nombre: string; telefono: string }`
  - `servicio: Servicio`
  - `profesional: string` — nombre del profesional asignado
  - `inicio: Date`
  - `fin: Date`
  - `estado: 'Confirmado' | 'Pendiente' | 'En Proceso' | 'Finalizado' | 'Cancelado'`
  - `recordatorioEnviado: boolean`
- **FranjaLaboral:**
  - `dia: 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' | 'Domingo'`
  - `activo: boolean`
  - `horaInicio: string` — HH:MM
  - `horaFin: string` — HH:MM
- **Profesionales:** Sofía (Peluquería Integral), Camila (Manicura y Uñas)

## Convenciones

- Componentes standalone por defecto (sin NgModules)
- Routing con lazy loading
- Todo el contenido visible en español (es-AR)
- Tailwind CSS para estilos — limpio, moderno, densidad de información equilibrada
- Seguir `docs/best-practices.md` para reglas detalladas de Angular
- Path aliases: `@core`, `@shared`, `@features`
- No instalar dependencias sin avisar
- No usar `any` en TypeScript sin justificarlo

## Estilo visual

- **Sistema de colores:** Paleta salon (rose/pink) con variantes slate para fondos
  - Primario: rose-600 (#e11d48), rose-500 (#f43f5e)
  - Acento: salon-accent (#fb7185)
  - Estados: emerald (éxito/en proceso), amber (pendiente/recordatorio), purple (confirmado)
- **Tipografía:** Inter (sans-serif), font-sans de Tailwind
- **Layout:** Sidebar fijo (w-64) + contenido principal con scroll vertical
- **Responsive:** breakpoints md/lg para columnas de timeline y métricas
- **Iconos:** Lucide icons (vía CDN en prototipo, luego integrar en Angular)
- **Animaciones:** Pulse ring para atención en curso, transiciones hover en cards

## Límites duros

- No instalar dependencias sin avisar al usuario
- No usar `any` en TypeScript sin justificarlo
- No subir `.env*` al repo
- No contradecir la constitución por una feature — si una feature choca, se replantea la feature
- No crear documentación proactivamente (solo si se pide)
- No usar RxJS innecesariamente — preferir Angular Signals para estado local
