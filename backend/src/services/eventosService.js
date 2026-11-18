import { ErrorPermiso } from '../domain/errores.js';

/**
 * Eventos desde el lado del organizador: sus eventos, las ventas de cada uno,
 * publicar, y reseñar (FR-019, FR-022, FR-023).
 */
export function crearEventosService({ repositorios, catalogo }) {
  return {
    /** Ventas de un evento: solo su organizador las ve (FR-019). */
    ventas(eventoId, usuario) {
      const evento = catalogo.buscarEvento(eventoId);
      if (evento.organizador.id !== usuario.id) {
        throw new ErrorPermiso('Solo el organizador del evento puede ver sus ventas');
      }
      return evento;
    },

    /** Eventos que organiza el usuario, incluidos los pasados, por fecha. */
    misEventos(usuario) {
      return repositorios.eventos
        .filtrar((evento) => evento.organizador.id === usuario.id)
        .sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
    },
  };
}
