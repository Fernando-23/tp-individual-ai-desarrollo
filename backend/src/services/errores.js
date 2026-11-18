import { ErrorDeDominio } from '../domain/errores.js';

/** El recurso pedido en la URL no existe (→ 404). */
export class ErrorNoEncontrado extends ErrorDeDominio {}
