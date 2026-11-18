/**
 * Persistencia en memoria (requisito del enunciado): un Map por agregado.
 * Guarda las instancias vivas del dominio; se pierde al reiniciar el proceso.
 */
export class RepositorioEnMemoria {
  #items = new Map();

  guardar(entidad) {
    this.#items.set(entidad.id, entidad);
    return entidad;
  }

  buscarPorId(id) {
    return this.#items.get(id);
  }

  todos() {
    return [...this.#items.values()];
  }

  filtrar(predicado) {
    return this.todos().filter(predicado);
  }
}

/**
 * Un repositorio nuevo por agregado. Las reseñas viven dentro de Evento y los
 * mensajes dentro de Compra, así que no tienen repositorio propio.
 */
export function crearRepositorios() {
  return {
    usuarios: new RepositorioEnMemoria(),
    categorias: new RepositorioEnMemoria(),
    eventos: new RepositorioEnMemoria(),
    compras: new RepositorioEnMemoria(),
  };
}
