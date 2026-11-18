import { idValido, textoNoVacio } from './validaciones.js';

/** Catálogo precargado de clasificación de eventos (Recitales, Teatro…). */
export class Categoria {
  constructor({ id, nombre, descripcion } = {}) {
    this.id = idValido(id);
    this.nombre = textoNoVacio(nombre, 'nombre');
    this.descripcion = textoNoVacio(descripcion, 'descripción');
  }
}

/**
 * Forma comparable de un nombre: sin mayúsculas ni espacios de más.
 * Sirve para validar unicidad de categorías (FR-027) y de tipos de entrada (FR-002).
 */
export function normalizarNombre(nombre) {
  return nombre.trim().toLowerCase().replace(/\s+/g, ' ');
}
