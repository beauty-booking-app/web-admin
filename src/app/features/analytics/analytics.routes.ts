import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/analytics-page.component').then((m) => m.AnalyticsPageComponent),
  },
];