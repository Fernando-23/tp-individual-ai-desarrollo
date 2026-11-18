/**
 * Favoritos del usuario actual (FR-024). Las reglas (sin duplicados, desmarcar
 * algo que no está no falla) son de Usuario, en el dominio.
 */
export function crearFavoritosService({ catalogo }) {
  return {
    listar(usuario) {
      return usuario.favoritos;
    },
    marcar(usuario, eventoId) {
      usuario.agregarFavorito(catalogo.buscarEvento(eventoId));
    },
    desmarcar(usuario, eventoId) {
      usuario.quitarFavorito(catalogo.buscarEvento(eventoId));
    },
  };
}
