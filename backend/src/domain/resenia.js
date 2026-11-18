import { ErrorValidacion } from './errores.js';
import { idValido, texto } from './validaciones.js';

export const PUNTUACION_MINIMA = 1;
export const PUNTUACION_MAXIMA = 5;

/**
 * Opinión inmutable de un comprador sobre un evento (FR-021).
 * Solo la crea Evento.reseniar, que verifica antes los permisos.
 */
export class Resenia {
  constructor({ id, comprador, evento, detalle, puntuacion } = {}) {
    if (
      !Number.isInteger(puntuacion) ||
      puntuacion < PUNTUACION_MINIMA ||
      puntuacion > PUNTUACION_MAXIMA
    ) {
      throw new ErrorValidacion(
        `La puntuación debe ser un número entero de ${PUNTUACION_MINIMA} a ${PUNTUACION_MAXIMA}`,
      );
    }
    this.id = idValido(id);
    this.comprador = comprador;
    this.evento = evento;
    this.detalle = texto(detalle ?? '', 'comentario');
    this.puntuacion = puntuacion;
    Object.freeze(this);
  }
}
