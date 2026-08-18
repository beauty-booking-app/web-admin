import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/agenda-page.component').then((m) => m.AgendaPageComponent),
  },
  {
    path: 'recordatorios',
    loadComponent: () =>
      import('./pages/recordatorios-page.component').then((m) => m.RecordatoriosPageComponent),
  },
];
