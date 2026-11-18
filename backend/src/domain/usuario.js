import { idValido, textoNoVacio } from './validaciones.js';

/**
 * Persona de la plataforma. Es comprador u organizador según su relación con
 * cada evento o compra: no hay un atributo de rol (constitución, Roles).
 */
export class Usuario {
  #favoritos = [];

  constructor({ id, nombre, apellido } = {}) {
    this.id = idValido(id);
    this.nombre = textoNoVacio(nombre, 'nombre');
    this.apellido = textoNoVacio(apellido, 'apellido');
  }

  get favoritos() {
    return Object.freeze([...this.#favoritos]);
  }

  /** Agrega un evento a favoritos; si ya está, no hace nada (FR-026). */
  agregarFavorito(evento) {
    if (!this.esFavorito(evento)) {
      this.#favoritos.push(evento);
    }
  }

  /** Quita un evento de favoritos; si no está, no hace nada. */
  quitarFavorito(evento) {
    this.#favoritos = this.#favoritos.filter((favorito) => favorito.id !== evento.id);
  }

  esFavorito(evento) {
    return this.#favoritos.some((favorito) => favorito.id === evento.id);
  }
}
