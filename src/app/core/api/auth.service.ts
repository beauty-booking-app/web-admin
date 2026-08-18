import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, map, tap, type Observable } from 'rxjs';
import { API_URL } from './environment';
import type { AuthResponse, User } from './backend.models';

const STORAGE_KEYS = {
  accessToken: 'glow_access_token',
  refreshToken: 'glow_refresh_token',
  usuario: 'glow_usuario',
} as const;

function leerUsuarioGuardado(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.usuario);
    if (!raw) return null;
    const usuario = JSON.parse(raw) as User;
    return usuario && typeof usuario === 'object' ? usuario : null;
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly _accessToken = signal<string | null>(
    localStorage.getItem(STORAGE_KEYS.accessToken),
  );
  private readonly _refreshToken = signal<string | null>(
    localStorage.getItem(STORAGE_KEYS.refreshToken),
  );
  private readonly _usuario = signal<User | null>(leerUsuarioGuardado());

  private refreshEnCurso: Promise<boolean> | null = null;

  readonly accessToken = this._accessToken.asReadonly();
  readonly refreshToken = this._refreshToken.asReadonly();
  readonly usuario = this._usuario.asReadonly();

  readonly estaAutenticado = computed(() => this._accessToken() !== null);

  login(email: string, password: string): Observable<void> {
    return this.http.post<AuthResponse>(`${API_URL}/auth/login`, { email, password }).pipe(
      tap((respuesta) => this.guardarSesion(respuesta)),
      map(() => undefined),
    );
  }

  cerrarSesion(): void {
    const refreshToken = this._refreshToken();
    if (refreshToken) {
      this.http
        .post(`${API_URL}/auth/logout`, { refreshToken })
        .subscribe({ error: () => undefined });
    }
    this.limpiarSesion();
  }

  refrescar(): Promise<boolean> {
    if (this.refreshEnCurso) return this.refreshEnCurso;

    const refreshToken = this._refreshToken();
    if (!refreshToken) return Promise.resolve(false);

    const promesa = firstValueFrom(
      this.http.post<AuthResponse>(`${API_URL}/auth/refresh`, { refreshToken }),
    )
      .then((respuesta) => {
        this.guardarSesion(respuesta);
        return true;
      })
      .catch(() => {
        this.limpiarSesion();
        return false;
      })
      .finally(() => {
        this.refreshEnCurso = null;
      });

    this.refreshEnCurso = promesa;
    return promesa;
  }

  private guardarSesion(respuesta: AuthResponse): void {
    localStorage.setItem(STORAGE_KEYS.accessToken, respuesta.accessToken);
    localStorage.setItem(STORAGE_KEYS.refreshToken, respuesta.refreshToken);
    localStorage.setItem(STORAGE_KEYS.usuario, JSON.stringify(respuesta.user));
    this._accessToken.set(respuesta.accessToken);
    this._refreshToken.set(respuesta.refreshToken);
    this._usuario.set(respuesta.user);
  }

  private limpiarSesion(): void {
    localStorage.removeItem(STORAGE_KEYS.accessToken);
    localStorage.removeItem(STORAGE_KEYS.refreshToken);
    localStorage.removeItem(STORAGE_KEYS.usuario);
    this._accessToken.set(null);
    this._refreshToken.set(null);
    this._usuario.set(null);
  }
}
