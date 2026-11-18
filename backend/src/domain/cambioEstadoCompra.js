/**
 * Registro inmutable del historial de una compra: qué estado, quién y cuándo
 * (FR-011). Solo lo crea Compra.
 */
export class CambioEstadoCompra {
  constructor({ compra, estado, quien, fechaHora }) {
    this.compra = compra;
    this.estado = estado;
    this.quien = quien;
    this.fechaHora = fechaHora;
    Object.freeze(this);
  }
}
