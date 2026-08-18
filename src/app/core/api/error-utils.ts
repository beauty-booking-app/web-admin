import { HttpErrorResponse } from '@angular/common/http';
import type { ApiError } from './backend.models';

export function mensajeDeError(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    const body = error.error as ApiError | null;
    if (body?.message) return body.message;
    if (error.status === 0) return 'No se pudo conectar con el servidor.';
    return `Error ${error.status}: ${error.statusText ?? 'algo salió mal'}`;
  }
  if (error instanceof Error) return error.message;
  return 'Ocurrió un error inesperado.';
}
