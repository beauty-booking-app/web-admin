import { Component, inject, signal, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { hugeCancel01, hugeEdit02, hugeImageAdd01, hugeSparkles } from '@ng-icons/huge-icons';
import { ServiciosService } from '../services/servicios.service';

@Component({
  selector: 'app-categoria-form-modal',
  imports: [FormsModule, NgIcon],
  providers: [provideIcons({ hugeCancel01, hugeEdit02, hugeImageAdd01, hugeSparkles })],
  template: `
    @if (visible()) {
      <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
           (click)="cerrar()" role="dialog" aria-modal="true"
           [attr.aria-label]="esEdicion() ? 'Editar categoría' : 'Nueva categoría'">
        <div class="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
             (click)="$event.stopPropagation()">
          <div class="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <h3 class="font-bold text-slate-900 text-sm flex items-center gap-2">
              @if (esEdicion()) {
                <ng-icon name="hugeEdit02" size="16" class="shrink-0" />
                Editar Categoría
              } @else {
                <ng-icon name="hugeSparkles" size="16" class="shrink-0" />
                Nueva Categoría
              }
            </h3>
            <button type="button" (click)="cerrar()" class="cursor-pointer text-slate-500 hover:text-slate-600 transition p-1"
                    aria-label="Cerrar modal">
              <ng-icon name="hugeCancel01" size="14" />
            </button>
          </div>

          <form (ngSubmit)="guardar()" class="p-5 space-y-4 text-xs">
            @if (error(); as msg) {
              <div role="alert"
                   class="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-red-700 font-medium">
                {{ msg }}
              </div>
            }

            <div>
              <label class="block text-slate-700 font-medium mb-1" for="cat-nombre">Nombre de la categoría</label>
              <input id="cat-nombre" type="text" required
                     [(ngModel)]="nombre" name="nombre"
                     placeholder="Ej: DEPILACIÓN"
                     class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none transition">
            </div>

            <div>
              <label class="block text-slate-700 font-medium mb-1" for="cat-descripcion">Descripción (opcional)</label>
              <textarea id="cat-descripcion" rows="2"
                        [(ngModel)]="descripcion" name="descripcion"
                        placeholder="Texto corto para la landing page"
                        class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none transition resize-none"></textarea>
            </div>

            <div>
              <span class="block text-slate-700 font-medium mb-1">Imagen de referencia</span>
              <p class="text-[11px] text-slate-500 mb-2">
                Se muestra en la landing page junto a la categoría. JPG o PNG, máx. 5 MB.
              </p>
              <div class="flex items-start gap-3">
                @if (previewUrl(); as url) {
                  <img [src]="url"
                       alt="Vista previa de la imagen de la categoría"
                       class="w-20 h-20 rounded-lg object-cover border border-slate-200 shrink-0">
                } @else {
                  <div class="w-20 h-20 rounded-lg bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400 shrink-0">
                    <ng-icon name="hugeImageAdd01" size="20" />
                  </div>
                }
                <div class="flex-1 space-y-2">
                  <input #fileInput id="cat-imagen" type="file" accept="image/png,image/jpeg,image/webp"
                         class="hidden"
                         (change)="onImagenSeleccionada($event)">
                  <button type="button" (click)="fileInput.click()"
                          class="cursor-pointer w-full border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold px-3 py-2 rounded-lg transition">
                    {{ previewUrl() ? 'Cambiar imagen' : 'Elegir imagen' }}
                  </button>
                  @if (previewUrl()) {
                    <button type="button" (click)="quitarImagen()"
                            class="cursor-pointer w-full text-rose-600 hover:text-rose-700 font-medium transition">
                      Quitar imagen
                    </button>
                  }
                </div>
              </div>
            </div>

            <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button type="button" (click)="cerrar()"
                      class="cursor-pointer px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium transition">
                Cancelar
              </button>
              <button type="submit"
                      [disabled]="guardando()"
                      class="cursor-pointer text-sm bg-rose-500 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-5 py-2 rounded-lg shadow-md shadow-rose-200 transition">
                {{ guardando() ? 'Guardando…' : esEdicion() ? 'Guardar Cambios' : 'Crear Categoría' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class CategoriaFormModalComponent {
  private readonly serviciosService = inject(ServiciosService);

  readonly visible = signal(false);
  readonly onGuardada = output<string>();

  protected readonly guardando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly previewUrl = signal<string | null>(null);

  protected esEdicion = signal(false);
  protected categoriaId: string | null = null;
  protected nombre = '';
  protected descripcion = '';

  private imagenNueva: File | null | undefined;

  abrir(): void {
    this.esEdicion.set(false);
    this.categoriaId = null;
    this.nombre = '';
    this.descripcion = '';
    this.resetImagen(null);
    this.error.set(null);
    this.visible.set(true);
  }

  abrirEdicion(datos: { id: string; categoria: string; descripcion: string | null; imagenUrl: string | null }): void {
    this.esEdicion.set(true);
    this.categoriaId = datos.id;
    this.nombre = datos.categoria;
    this.descripcion = datos.descripcion ?? '';
    this.resetImagen(datos.imagenUrl);
    this.error.set(null);
    this.visible.set(true);
  }

  cerrar(): void {
    if (this.guardando()) return;
    this.liberarPreview();
    this.visible.set(false);
  }

  onImagenSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.imagenNueva = file;
    this.setPreview(URL.createObjectURL(file));
    input.value = '';
  }

  quitarImagen(): void {
    this.imagenNueva = null;
    this.setPreview(null);
  }

  async guardar(): Promise<void> {
    const nombreLimpio = this.nombre.trim();
    if (!nombreLimpio || this.guardando()) return;

    this.guardando.set(true);
    this.error.set(null);
    try {
      const datos = {
        nombre: nombreLimpio,
        descripcion: this.descripcion.trim() || null,
        // undefined = no tocar la imagen; null = quitarla; File = reemplazarla.
        imagenFile: this.esEdicion() ? this.imagenNueva : (this.imagenNueva ?? null),
      };
      if (this.esEdicion() && this.categoriaId) {
        await this.serviciosService.actualizarCategoria(this.categoriaId, datos);
        this.onGuardada.emit(nombreLimpio);
      } else {
        await this.serviciosService.crearCategoria(datos);
        this.onGuardada.emit(nombreLimpio);
      }
      this.liberarPreview();
      this.visible.set(false);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Error al guardar la categoría');
    } finally {
      this.guardando.set(false);
    }
  }

  private setPreview(url: string | null): void {
    this.liberarPreview();
    this.previewUrl.set(url);
  }

  private liberarPreview(): void {
    const actual = this.previewUrl();
    // Solo los blob: URLs creados localmente se revocan; los remotos no.
    if (actual?.startsWith('blob:')) URL.revokeObjectURL(actual);
  }

  private resetImagen(urlRemota: string | null): void {
    this.imagenNueva = undefined;
    this.previewUrl.set(urlRemota);
  }
}
