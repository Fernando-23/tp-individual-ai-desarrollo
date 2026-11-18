import { textoNoVacio } from './validaciones.js';

/**
 * Mensaje inmutable del chat de una compra (FR-024). Solo lo crea
 * Compra.enviarMensaje, que verifica antes quién puede escribir.
 */
export class Mensaje {
  constructor({ usuario, mensaje, enviado }) {
    this.usuario = usuario;
    this.mensaje = textoNoVacio(mensaje, 'mensaje');
    this.enviado = enviado;
    Object.freeze(this);
  }
}
