export type CategoriaServicio = string;

export interface Servicio {
  id: string;
  /** Id del Service (categoría) al que pertenece en el backend. */
  serviceId?: string;
  categoria: CategoriaServicio;
  subtipo: string;
  duracionMinutos: number;
  precioBase: number;
}

export const SERVICIOS_SEMILLA: Servicio[] = [
  { id: 'corte-dama', categoria: 'CORTE UNISEX', subtipo: 'Corte Dama', duracionMinutos: 45, precioBase: 12500 },
  { id: 'corte-caballero', categoria: 'CORTE UNISEX', subtipo: 'Corte Caballero', duracionMinutos: 30, precioBase: 9000 },
  { id: 'corte-nino', categoria: 'CORTE UNISEX', subtipo: 'Corte Niño', duracionMinutos: 30, precioBase: 7500 },
  { id: 'trat-nutricion', categoria: 'TRATAMIENTOS CAPILARES', subtipo: 'Nutrición Intensa', duracionMinutos: 40, precioBase: 14000 },
  { id: 'trat-botox', categoria: 'TRATAMIENTOS CAPILARES', subtipo: 'Botox Capilar', duracionMinutos: 60, precioBase: 22000 },
  { id: 'trat-antifrizz', categoria: 'TRATAMIENTOS CAPILARES', subtipo: 'Anti Frizz', duracionMinutos: 60, precioBase: 20000 },
  { id: 'trat-alisado', categoria: 'TRATAMIENTOS CAPILARES', subtipo: 'Alisado Definitivo', duracionMinutos: 120, precioBase: 35000 },
  { id: 'trat-permanente', categoria: 'TRATAMIENTOS CAPILARES', subtipo: 'Permanente', duracionMinutos: 90, precioBase: 28000 },
  { id: 'color-global', categoria: 'COLOR', subtipo: 'Color Global', duracionMinutos: 75, precioBase: 25000 },
  { id: 'color-mechas', categoria: 'COLOR', subtipo: 'Mechas en Gorro', duracionMinutos: 90, precioBase: 32000 },
  { id: 'color-banda', categoria: 'COLOR', subtipo: 'Técnica Banda / Balayage', duracionMinutos: 150, precioBase: 45000 },
  { id: 'unas-semi', categoria: 'UÑAS', subtipo: 'Semipermanente', duracionMinutos: 50, precioBase: 11000 },
  { id: 'unas-kapping', categoria: 'UÑAS', subtipo: 'Kapping', duracionMinutos: 60, precioBase: 15000 },
  { id: 'unas-softgel', categoria: 'UÑAS', subtipo: 'Soft Gel', duracionMinutos: 75, precioBase: 18500 },
];
