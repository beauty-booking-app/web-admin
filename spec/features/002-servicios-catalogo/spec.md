# 002 · Servicios y Catálogo

**Estado:** implementado ✅

## Qué hace

Pantalla de gestión del catálogo de servicios del salón. El administrador puede:

- Ver todos los servicios organizados en **4 categorías**: CORTE UNISEX, TRATAMIENTOS CAPILARES, COLOR, UÑAS.
- Cada categoría muestra sus subtipos con **precio y duración**.
- **Editar** precio y duración de un servicio existente.
- **Crear un nuevo servicio** dentro de una categoría.
- Ver la **cantidad de subtipos** por categoría como badge.

## Por qué

El catálogo de servicios es la base de datos del negocio. Sin precios y duraciones correctos, los turnos no se pueden agendar correctamente (el precio del turno depende del servicio seleccionado y la duración determina el bloque horario).

## Criterios de aceptación

- [x] Se muestra la vista "Servicios y Precios" con 4 tarjetas de categoría.
- [x] Cada categoría tiene header con ícono, nombre y badge de cantidad de subtipos.
- [x] CORTE UNISEX muestra: Corte Dama ($12.500, 45m), Corte Caballero ($9.000, 30m), Corte Niño ($7.500, 30m).
- [x] TRATAMIENTOS CAPILARES muestra: Nutrición ($14.000, 40m), Botox ($22.000, 60m), Anti Frizz ($20.000, 60m), Alisado ($35.000, 120m), Permanente ($28.000, 90m).
- [x] COLOR muestra: Global ($25.000, 75m), Mechas en gorro ($32.000, 90m), Banda/Balayage ($45.000, 150m).
- [x] UÑAS muestra: Semipermanente ($11.000, 50m), Kapping ($15.000, 60m), Soft Gel ($18.500, 75m).
- [x] Botón "Nuevo Servicio" abre modal de creación.
- [x] Botón "Editar" en cada servicio permite modificar precio/duración.
- [x] Los precios se muestran formateados en pesos argentinos ($).
- [x] Layout responsive: 2 columnas en desktop, 1 columna en móvil.
- [x] Cumple WCAG 2.1 AA.

## Fuera de alcance

- Eliminación de servicios (solo alta y edición).
- Gestión de categorías (las 4 categorías son fijas por ahora).
- Asociación de servicios a profesionales (se asume por especialidad).
