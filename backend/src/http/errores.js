import {
  ErrorConflicto,
  ErrorDeDominio,
  ErrorPermiso,
  ErrorValidacion,
} from '../domain/errores.js';
import { ErrorNoEncontrado } from '../services/errores.js';

/** Falta X-Usuario-Id o el usuario no existe (→ 401). */
export class ErrorNoIdentificado extends ErrorDeDominio {}

// Tabla de research D7: clase de error → código HTTP.
const CODIGOS = [
  [ErrorValidacion, 400],
  [ErrorNoIdentificado, 401],
  [ErrorPermiso, 403],
  [ErrorNoEncontrado, 404],
  [ErrorConflicto, 409],
];

/** 404 para cualquier ruta que no exista. */
export function rutaNoEncontrada(req, res) {
  res.status(404).json({ error: `No existe la ruta ${req.method} ${req.originalUrl}` });
}

/**
 * Traduce cualquier error a { error } con su código (FR-025).
 * Los errores inesperados responden 500 con un mensaje genérico y se registran.
 */
// eslint-disable-next-line no-unused-vars -- Express reconoce el middleware de errores por sus 4 parámetros
export function manejarErrores(err, req, res, next) {
  const fila = CODIGOS.find(([Clase]) => err instanceof Clase);
  if (fila) {
    return res.status(fila[1]).json({ error: err.message });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo del pedido no es un JSON válido' });
  }
  console.error(err);
  return res.status(500).json({ error: 'Ocurrió un error inesperado. Probá de nuevo.' });
}
