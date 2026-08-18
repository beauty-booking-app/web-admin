import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./features/turnos/turnos.routes').then((m) => m.routes),
      },
      {
        path: 'servicios',
        loadChildren: () =>
          import('./features/servicios-catalogo/servicios.routes').then((m) => m.routes),
      },
      {
        path: 'analytics',
        loadChildren: () =>
          import('./features/analytics/analytics.routes').then((m) => m.routes),
      },
      {
        path: 'configuracion',
        loadChildren: () =>
          import('./features/configuracion/configuracion.routes').then((m) => m.routes),
      },
    ],
  },
];
