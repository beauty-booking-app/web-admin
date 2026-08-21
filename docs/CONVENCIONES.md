# Convenciones del proyecto

## Regla de documentación

Cada cambio significativo debe documentarse en `docs/`:
- Nuevos componentes o servicios → actualizar `ARQUITECTURA.md`
- Cambios de convención → actualizar este archivo (`CONVENCIONES.md`)
- Bugs corregidos → agregar nota en `CAMBIOS.md`

## TypeScript

- **Tipado estricto:** habilitar `strict: true` en `tsconfig.json`.
- **Sin `any`:** no usar `any` injustificado; usar `unknown` cuando el tipo sea incierto.
- **Inferencia:** preferir inferencia de tipos cuando el valor sea obvio.
- **Enums y tipos:** usar `type` o `const` objects para uniones de strings (ej. estados de turno).

## Angular

- **Standalone components:** siempre usar componentes standalone; no crear NgModules.
- **Sin `standalone: true`:** en Angular v20+ es el default, no declararlo explícitamente.
- **Sin `OnPush`:** en Angular v22+ es el default, no declararlo explícitamente.
- **Signals para estado:** usar `signal()` y `computed()` para estado local y derivado.
- **Sin `mutate`:** usar `update()` o `set()` en signals, nunca `mutate`.
- **Lazy loading:** todas las rutas de features se cargan con lazy loading.
- **Formularios:** preferir Signal Forms (`@angular/forms/signals`) en Angular v22+. Si no se usan, preferir Reactive Forms sobre Template-driven.
- **Inputs/Outputs:** usar funciones `input()` y `output()` en lugar de decoradores.
- **inyección:** usar `inject()` en lugar de inyección por constructor.
- **Servicios:** usar `@Service()` decorator (Angular v22+) para servicios singleton.
- **Host bindings:** no usar `@HostBinding`/`@HostListener`; usar el objeto `host` en el decorador `@Component`/`@Directive`.
- **Templates inline:** todos los templates son inline en el archivo `.ts` del componente. No usar archivos `.html` separados.

## Templates

- **Control flow nativo:** usar `@if`, `@for`, `@switch` en lugar de `*ngIf`, `*ngFor`, `*ngSwitch`.
- **Sin `ngClass`:** usar bindings de clase: `[class.activo]="..."`.
- **Sin `ngStyle`:** usar bindings de estilo directo: `[style.width.px]="..."`.
- **Templates simples:** mantener templates limpios; lógica compleja en el componente o servicio.
- **Async pipe:** usar para manejar observables en templates.
- **Iconos:** usar `<ng-icon name="..." />` (`@ng-icons/core`); nunca emojis en la UI. Prioridad de packs: `huge-icons` → `heroicons/outline` → `mynaui/outline`. Importar `NgIcon` + `provideIcons({...})` por componente, solo con los iconos usados. Tamaño con el input `size="14"` (px) y color heredado vía `currentColor`.

## Componentes

- **Responsabilidad única:** cada componente hace una sola cosa.
- **Componentes pequeños:** preferir componentes chicos y composition sobre componentes monolíticos.
- **Inline templates:** preferir templates inline para componentes pequeños.
- **`NgOptimizedImage`:** usar para todas las imágenes estáticas (no funciona con base64 inline).

## Estado

- **`signal()`** para estado local del componente.
- **`computed()`** para estado derivado.
- **Transformaciones puras:** las mutaciones de estado deben ser predecibles.
- **Servicios de estado:** un servicio por dominio (TurnosStateService, ServiciosService, etc.).

## Servicios

- **Responsabilidad única:** cada servicio maneja un solo dominio.
- **`providedIn: 'root'`** o `@Service()` para servicios singleton.
- **`inject()`** para dependencias, no constructor.

## Estilos

- **Tailwind CSS:** utility-first; no usar CSS modules ni styled-components.
- **Tokens de color:** usar clases de Tailwind (`bg-rose-600`, `text-slate-900`) en lugar de valores hardcodeados.
- **Responsive:** breakpoints `md:` y `lg:` para layout adaptativo.
- **Densidad de información:** equilibrada; no saturar ni dejar demasiado espacio vacío.

## Accesibilidad (a11y)

- **WCAG 2.1 AA:** cumplimiento estricto en contraste, focus, ARIA.
- **`aria-label`** en botones interactivos y elementos sin texto visible.
- **`role`** semánticos en la timeline y calendario (grid, gridcell, etc.).
- **`focus-visible`** con outline visible en todos los elementos interactivos.
- **Jerarquía de headings:** h1 → h2 → h3 correcta.
- **Tap targets:** mínimo 44px en todos los elementos interactivos.
- **Navegación por teclado:** soporte completo en la agenda y modales.
- **`prefers-reduced-motion`:** respetar desactivando animaciones no esenciales.

## Idioma

- **Todo el contenido visible en español** (es-AR).
- **Nombres de archivos y variables en español** cuando sea claro; en inglés para conceptos técnicos genéricos (service, component, model).

## Archivos y estructura

- **Un componente por archivo:** archivo `.ts` + template inline o `.html` separado.
- **Models en `core/models/`:** interfaces de dominio compartidas.
- **Services en `features/xxx/services/`:** servicios específicos de cada feature.
- **Components en `features/xxx/components/`:** componentes de cada feature.
- **Shared en `shared/`:** pipes reutilizables (por ahora solo `currency-ars.pipe.ts`).
- **Imports:** usar paths relativos (`../../core/models/...`). No usar path aliases (no están configurados en tsconfig).

## Git

- **Commits descriptivos en español.**
- **No commitear** `node_modules/`, archivos de build (`.angular/`, `dist/`), ni `.env*`.
- **Un feature por branch** cuando sea posible.
