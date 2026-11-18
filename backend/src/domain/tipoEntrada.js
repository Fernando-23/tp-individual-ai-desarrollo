import { enteroMayorA, idValido, numeroNoNegativo, texto, textoNoVacio } from './validaciones.js';

/** Ubicación o modalidad de un evento con su precio y su cupo (General, Platea, VIP…). */
export class TipoEntrada {
  #compras = [];

  constructor({ id, nombre, descripcion, precio, cupo } = {}) {
    this.id = idValido(id);
    this.nombre = textoNoVacio(nombre, 'nombre del tipo de entrada');
    this.descripcion = texto(descripcion ?? '', 'descripción del tipo de entrada');
    this.precio = numeroNoNegativo(precio, 'precio');
    this.cupo = enteroMayorA(cupo, 0, 'cupo');
  }

  get compras() {
    return Object.freeze([...this.#compras]);
  }

  /**
   * Uso interno: lo llama solo Compra.crear, después de validar el cupo.
   * No llamarlo desde afuera del dominio.
   */
  registrarCompra(compra) {
    this.#compras.push(compra);
  }

  /**
   * Cupo total menos las entradas de las compras que ocupan cupo (FR-005).
   * Se calcula siempre a partir de las compras, sin contador (research D5).
   */
  cupoDisponible() {
    const ocupadas = this.#compras
      .filter((compra) => compra.ocupaCupo())
      .reduce((suma, compra) => suma + compra.cantidad, 0);
    return this.cupo - ocupadas;
  }

  /** ¿Se pueden vender `cantidad` entradas más de este tipo? (FR-004) */
  hayCupoPara(cantidad) {
    return cantidad <= this.cupoDisponible();
  }
}
