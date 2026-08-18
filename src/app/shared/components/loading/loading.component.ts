import { Component, input } from '@angular/core';

@Component({
  selector: 'app-loading',
  standalone: true,
  template: `
    <div class="flex flex-col items-center justify-center gap-3" role="status" aria-live="polite">
      <div class="w-8 h-8 rounded-full border-4 border-slate-200 border-t-rose-500 animate-spin"></div>
      <span class="text-sm text-slate-500">{{ texto() }}</span>
    </div>
  `,
})
export class LoadingComponent {
  readonly texto = input('Cargando…');
}
