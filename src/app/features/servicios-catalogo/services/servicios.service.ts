import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import type { Servicio } from '../../../core/models/servicio.model';
import { API_URL } from '../../../core/api/environment';
import type { ReferenceImage, Service } from '../../../core/api/backend.models';
import { serviceToServicios } from '../../../core/api/mappers';
import { mensajeDeError } from '../../../core/api/error-utils';

export interface CategoriaGrupo {
  id: string;
  categoria: string;
  descripcion: string | null;
  imagenUrl: string | null;
  servicios: Servicio[];
}

export interface CategoriaInput {
  nombre: string;
  descripcion?: string | null;
  imagenFile?: File | null;
}

export interface TipoInput {
  nombre: string;
  precio: number;
  duracionMinutos: number;
}

@Injectable({ providedIn: 'root' })
export class ServiciosService {
  private readonly http = inject(HttpClient);

  /** Categorías tal como las devuelve la API admin (backend Service). */
  private readonly _services = signal<Service[]>([]);
  private readonly _cargando = signal(false);
  private readonly _error = signal<string | null>(null);
  private cargado = false;

  readonly cargando = this._cargando.asReadonly();
  readonly error = this._error.asReadonly();

  /** Subtipos aplanados (compatibilidad con turnos/analytics/calendario). */
  readonly servicios = computed(() => this._services().flatMap(serviceToServicios));

  readonly categorias = computed<CategoriaGrupo[]>(() =>
    this._services().map((svc) => ({
      id: svc.id,
      categoria: svc.name,
      descripcion: svc.description,
      imagenUrl: svc.referenceImage?.url ?? null,
      servicios: serviceToServicios(svc),
    })),
  );

  readonly categoriasList = computed(() => this.categorias().map((c) => c.categoria));

  readonly totalServicios = computed(() => this.servicios().length);

  async cargarServiciosSiNecesario(): Promise<void> {
    if (this.cargado || this._cargando()) return;
    await this.cargarServicios();
  }

  async cargarServicios(): Promise<void> {
    if (this._cargando()) return;
    this._cargando.set(true);
    this._error.set(null);
    try {
      const services = await firstValueFrom(
        this.http.get<Service[]>(`${API_URL}/admin/services`),
      );
      this._services.set(services);
      this.cargado = true;
    } catch (err) {
      this._error.set(mensajeDeError(err));
    } finally {
      this._cargando.set(false);
    }
  }

  catalogoPorSubtipo(): Map<string, Servicio> {
    const mapa = new Map<string, Servicio>();
    for (const servicio of this.servicios()) {
      mapa.set(servicio.subtipo, servicio);
    }
    return mapa;
  }

  // --- Categorías (backend Service) ---

  async crearCategoria(datos: CategoriaInput): Promise<void> {
    const referenceImageId = await this.resolverImagen(datos.imagenFile);
    await this.request(
      this.http.post<Service>(`${API_URL}/admin/services`, {
        name: datos.nombre,
        description: datos.descripcion ?? null,
        referenceImageId,
      }),
    );
  }

  async actualizarCategoria(id: string, datos: CategoriaInput): Promise<void> {
    const referenceImageId = await this.resolverImagen(datos.imagenFile);
    await this.request(
      this.http.patch<Service>(`${API_URL}/admin/services/${id}`, {
        name: datos.nombre,
        description: datos.descripcion ?? null,
        ...(referenceImageId !== undefined ? { referenceImageId } : {}),
      }),
    );
  }

  async eliminarCategoria(id: string): Promise<void> {
    await this.request(this.http.delete(`${API_URL}/admin/services/${id}`));
  }

  // --- Subtipos (backend ServiceType) ---

  async crearTipo(categoriaId: string, datos: TipoInput): Promise<void> {
    await this.request(
      this.http.post<Service>(`${API_URL}/admin/service-types`, {
        serviceId: categoriaId,
        name: datos.nombre,
        durationMinutes: datos.duracionMinutos,
        price: datos.precio,
        referenceImageId: null,
      }),
    );
  }

  async actualizarTipo(tipoId: string, datos: TipoInput): Promise<void> {
    await this.request(
      this.http.patch<Service>(`${API_URL}/admin/service-types/${tipoId}`, {
        name: datos.nombre,
        durationMinutes: datos.duracionMinutos,
        price: datos.precio,
      }),
    );
  }

  async eliminarTipo(tipoId: string): Promise<void> {
    await this.request(this.http.delete(`${API_URL}/admin/service-types/${tipoId}`));
  }

  // --- Internos ---

  /** Sube la imagen si hay una nueva; undefined = no cambiar la actual. */
  private async resolverImagen(file: File | null | undefined): Promise<string | null | undefined> {
    if (file === undefined) return undefined;
    if (file === null) return null;
    const imagen = await this.subirImagen(file);
    return imagen.id;
  }

  async subirImagen(file: File): Promise<ReferenceImage> {
    const form = new FormData();
    form.append('file', file);
    form.append('entity', 'service_reference');
    // No forzar Content-Type: el browser agrega el boundary del multipart.
    const headers = new HttpHeaders({ Accept: 'application/json' });
    return firstValueFrom(
      this.http.post<ReferenceImage>(`${API_URL}/files`, form, { headers }),
    );
  }

  private async request(observable: Observable<unknown>): Promise<void> {
    try {
      await firstValueFrom(observable);
    } catch (err) {
      throw new Error(mensajeDeError(err));
    }
  }
}
