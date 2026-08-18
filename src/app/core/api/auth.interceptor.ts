import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { API_URL } from './environment';

const ES_ENDPOINT_AUTH = new RegExp(`${API_URL}/auth/(login|refresh|logout)`);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const esAuth = ES_ENDPOINT_AUTH.test(req.url);
  const token = auth.accessToken();

  const reqConToken =
    token && !esAuth ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(reqConToken).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401 || esAuth) return throwError(() => error);

      if (!token) {
        void router.navigate(['/login']);
        return throwError(() => error);
      }

      return from(auth.refrescar()).pipe(
        switchMap((ok) => {
          const nuevoToken = auth.accessToken();
          if (!ok || !nuevoToken) {
            void router.navigate(['/login']);
            return throwError(() => error);
          }
          return next(req.clone({ setHeaders: { Authorization: `Bearer ${nuevoToken}` } }));
        }),
      );
    }),
  );
};
