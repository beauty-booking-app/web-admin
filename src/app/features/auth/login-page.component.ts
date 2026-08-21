import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { hugeScissor } from '@ng-icons/huge-icons';
import { AuthService } from '../../core/api/auth.service';
import { mensajeDeError } from '../../core/api/error-utils';

@Component({
  selector: 'app-login-page',
  imports: [FormsModule, NgIcon],
  providers: [provideIcons({ hugeScissor })],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-rose-50 via-slate-50 to-pink-100 flex items-center justify-center p-4">
      <div class="w-full max-w-sm">
        <div class="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div class="px-6 py-6 bg-gradient-to-tr from-rose-600 to-pink-500 text-white text-center">
            <div class="w-12 h-12 mx-auto rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-xl font-bold shadow-inner">
              <ng-icon name="hugeScissor" />
            </div>
            <h1 class="font-bold text-lg tracking-wide mt-3">Tammi</h1>
            <p class="text-[11px] text-rose-100 font-medium">Panel de Gestión Operativa</p>
          </div>

          <form (ngSubmit)="iniciarSesion()" class="p-6 space-y-4 text-xs" novalidate>
            @if (error(); as msg) {
              <div role="alert" class="bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-red-700 font-medium">
                {{ msg }}
              </div>
            }

            <div>
              <label class="block text-slate-700 font-medium mb-1" for="login-email">Email</label>
              <input id="login-email" type="email" required
                     [(ngModel)]="email" name="email" autocomplete="username"
                     class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none transition min-h-[44px]"
                     placeholder="admin@tammi.com">
            </div>

            <div>
              <label class="block text-slate-700 font-medium mb-1" for="login-password">Contraseña</label>
              <input id="login-password" type="password" required
                     [(ngModel)]="password" name="password" autocomplete="current-password"
                     class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none transition min-h-[44px]"
                     placeholder="••••••••">
            </div>

            <button type="submit"
                    [disabled]="enviando() || !email.trim() || !password"
                    class="w-full bg-rose-700 hover:bg-rose-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg shadow-md shadow-rose-200 transition min-h-[44px]">
              {{ enviando() ? 'Ingresando…' : 'Ingresar al Panel' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class LoginPageComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected email = '';
  protected password = '';
  protected enviando = signal(false);
  protected error = signal<string | null>(null);

  protected iniciarSesion(): void {
    if (this.enviando() || !this.email.trim() || !this.password) return;

    this.enviando.set(true);
    this.error.set(null);

    this.auth.login(this.email.trim(), this.password).subscribe({
      next: () => void this.router.navigate(['/']),
      error: (err: unknown) => {
        this.enviando.set(false);
        const status = err instanceof HttpErrorResponse ? err.status : 0;
        this.error.set(
          status === 401 ? 'Email o contraseña incorrectos.' : mensajeDeError(err),
        );
      },
    });
  }
}
