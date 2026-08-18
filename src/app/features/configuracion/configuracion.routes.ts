import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/horarios-page.component').then((m) => m.HorariosPageComponent),
  },
];
