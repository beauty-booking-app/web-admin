import type { Turno } from '../../core/models/turno.model';

export function construirMensajeRecordatorio(turno: Turno): string {
  const hora = turno.inicio.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  return (
    `Hola ${turno.cliente.nombre}, te recordamos tu turno de ` +
    `${turno.servicio.subtipo} (${turno.servicio.categoria}) hoy a las ${hora}. ` +
    `¡Te esperamos! - Velvet & Glow`
  );
}

export function construirWhatsAppLink(telefono: string, mensaje: string): string {
  const numero = telefono.replace(/\D/g, '');
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}