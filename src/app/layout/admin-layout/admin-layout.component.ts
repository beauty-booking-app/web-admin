import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, SidebarComponent],
  template: `
    <div class="flex h-full w-full overflow-hidden">
      <app-sidebar />
      <main class="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-hidden">
        <router-outlet />
      </main>
    </div>
  `,
})
export class AdminLayoutComponent {}
