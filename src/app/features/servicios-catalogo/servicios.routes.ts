import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/servicio-list.component').then((m) => m.ServicioListComponent),
  },
];
