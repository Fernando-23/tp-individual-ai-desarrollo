/** Usuarios disponibles para elegir con quién operar (FR-001). */
export function crearUsuariosService({ repositorios }) {
  return {
    listar() {
      return repositorios.usuarios.todos();
    },
  };
}
