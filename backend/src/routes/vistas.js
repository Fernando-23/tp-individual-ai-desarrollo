import * as presentar from '../http/presentadores.js';

/**
 * Arma las vistas de eventos que necesitan datos de más de un servicio
 * (la reputación del organizador) y la hora actual.
 */
export function crearVistas({ servicios, reloj }) {
  const { catalogo } = servicios;

  return {
    eventoResumen(evento) {
      return presentar.eventoResumen(evento, {
        reputacion: catalogo.reputacionDe(evento.organizador),
        ahora: reloj(),
      });
    },

    eventoDetalle(evento, usuario) {
      return presentar.eventoDetalle(evento, {
        reputacion: catalogo.reputacionDe(evento.organizador),
        resenias: catalogo.reseniasDe(evento.organizador),
        esFavorito: usuario ? usuario.esFavorito(evento) : null,
        ahora: reloj(),
      });
    },
  };
}
