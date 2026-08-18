# 003 · Horarios y Ausencias

**Estado:** implementado ✅

## Qué hace

Pantalla de configuración de los horarios operativos del salón. El administrador puede:

- Definir los **horarios de atención** por día de la semana (Lunes a Viernes, Sábados).
- Establecer **horario de inicio y fin** para cada franja.
- Marcar días como **no laborables** (Domingos cerrados).
- **Guardar** los cambios de configuración.

## Por qué

Los horarios operativos determinan los bloques disponibles en la agenda. Sin esta configuración, la timeline mostraría horarios que no corresponden a la realidad del salón (ej: mostrar turnos los domingos cuando está cerrado).

## Criterios de aceptación

- [x] Se muestra la vista "Horarios y Ausencias" con las franjas laborales configuradas.
- [x] Lunes a Viernes: checkbox activado, horario 09:00 a 20:00.
- [x] Sábados: checkbox activado, horario 09:00 a 18:00.
- [x] Domingos: checkbox desactivado, mostrando "No Laboral".
- [x] Los inputs de hora permiten modificar inicio y fin de cada franja.
- [x] Botón "Guardar Cambios de Horario" persiste la configuración (en memoria).
- [x] Feedback visual al guardar (toast o mensaje de confirmación).
- [x] Layout limpio y consistente con el resto del panel.
- [x] Cumple WCAG 2.1 AA.

## Fuera de alcance

- Gestión de días feriados específicos (fechas puntuales).
- Horarios especiales por evento o temporada.
- Asociación de horarios a profesionales individuales.
