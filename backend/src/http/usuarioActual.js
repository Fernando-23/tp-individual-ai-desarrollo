import { ErrorNoIdentificado } from './errores.js';

const HEADER = 'x-usuario-id';

/**
 * Identidad simple (constitución, Principio V): el usuario actual llega en el
 * header X-Usuario-Id y se elige entre los del seed. No hay contraseñas.
 */
export function crearMiddlewaresUsuario(usuariosRepo) {
  function buscar(req) {
    const id = req.get(HEADER);
    return id ? usuariosRepo.buscarPorId(id) : undefined;
  }

  /** Exige un usuario válido; si no, 401 (FR-002). */
  function requerirUsuario(req, res, next) {
    const usuario = buscar(req);
    if (!usuario) {
      throw new ErrorNoIdentificado(
        'Elegí un usuario válido: mandá su id en el header X-Usuario-Id',
      );
    }
    req.usuario = usuario;
    next();
  }

  /** Si viene un usuario válido lo usa; si no, sigue con req.usuario = null. */
  function usuarioOpcional(req, res, next) {
    req.usuario = buscar(req) ?? null;
    next();
  }

  return { requerirUsuario, usuarioOpcional };
}
