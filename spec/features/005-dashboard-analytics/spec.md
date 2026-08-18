# 005 · Dashboard de Analytics

**Estado:** implementado ✅

## Qué hace

Nueva sección `/analytics` del panel con una vista analítica del negocio. El administrador puede:

- Ver **cantidad de turnos por mes** en un gráfico de barras (últimos 6 meses + mes actual).
- Ver los **servicios más solicitados** con **filtro por categoría** (CORTE UNISEX, TRATAMIENTOS CAPILARES, COLOR, UÑAS) y por mes.
- Ver los **clientes frecuentes** (top 5 por cantidad de turnos en el período seleccionado).
- Ver las **ganancias mes a mes** (facturación por turnos finalizados/confirmados) y la **diferencia porcentual** contra el mes anterior.

## Por qué

El roadmap lo tiene en backlog y `FrontendCliente.md` lo pide explícitamente para la consola admin: poder leer tendencias de demanda, clientes recurrentes y evolución de ingresos sin salir del panel. Complementa al dashboard operativo actual aportando la vista estratégica de mediano plazo.

## Criterios de aceptación

- [x] La ruta `/analytics` carga con lazy loading y aparece como ítem en el sidebar.
- [x] Se muestran KPIs resumidos: turnos totales, clientes únicos, facturación del período y ticket promedio.
- [x] El gráfico de turnos por mes muestra barras comparativas de los últimos 6 meses.
- [x] El gráfico de servicios más solicitados se filtra por categoría y por mes, y muestra el top 5.
- [x] La lista de clientes frecuentes muestra el top 5 por cantidad de turnos en el período.
- [x] El gráfico de ganancias por mes incluye la diferencia porcentual contra el mes anterior.
- [x] Todos los componentes son accesibles (WCAG 2.1 AA): estructura semántica, contraste, focus visible y navegación por teclado en los filtros.
- [x] No se instalan dependencias nuevas: los gráficos se construyen con CSS/SVG propio.

## Fuera de alcance

- Dashboard del **cliente** (se hace en otra app).
- Persistencia de datos (se usan datos semilla en memoria como el resto del panel).
- Intervalos de tiempo personalizables más allá de mes (semana/año).
- Exportación de reportes (está en backlog como feature separada).