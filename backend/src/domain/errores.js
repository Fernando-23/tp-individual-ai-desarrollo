/**
 * Errores del dominio. La capa HTTP (feature siguiente) los traduce a códigos
 * de estado sin leer el mensaje: ver specs/001-modelo-dominio/contracts/dominio.md.
 */
export class ErrorDeDominio extends Error {
  constructor(mensaje) {
    super(mensaje);
    this.name = new.target.name;
  }
}

/** Datos inválidos: cantidad 0, texto vacío, puntuación fuera de rango… (→ 400) */
export class ErrorValidacion extends ErrorDeDominio {}

/** El usuario no tiene el rol necesario sobre la compra o el evento (→ 403) */
export class ErrorPermiso extends ErrorDeDominio {}

/** El estado, el cupo o la fecha no permiten la operación (→ 409) */
export class ErrorConflicto extends ErrorDeDominio {}
