import { CambioEstadoCompra } from './cambioEstadoCompra.js';
import { ErrorConflicto, ErrorPermiso, ErrorValidacion } from './errores.js';
import { ESTADOS_QUE_OCUPAN_CUPO, EstadoCompra, TRANSICIONES } from './estadoCompra.js';
import { Evento } from './evento.js';
import { Mensaje } from './mensaje.js';
import { TipoEntrada } from './tipoEntrada.js';
import { Usuario } from './usuario.js';
import { enteroMayorA, fechaValida, idValido, instanciaDe } from './validaciones.js';

// Solo Compra.crear conoce este token: así no se puede crear una compra
// salteando la validación de cupo ni el historial inicial.
const CREACION_INTERNA = Symbol('Compra.crear');

/** La adquisición de una cantidad de entradas de un tipo por un comprador. */
export class Compra {
  #id;
  #comprador;
  #evento;
  #tipoEntrada;
  #cantidad;
  #total;
  #estado;
  #historial = [];
  #mensajes = [];

  constructor(token, { id, comprador, evento, tipoEntrada, cantidad, total } = {}) {
    if (token !== CREACION_INTERNA) {
      throw new Error('Usá Compra.crear para crear una compra');
    }
    this.#id = id;
    this.#comprador = comprador;
    this.#evento = evento;
    this.#tipoEntrada = tipoEntrada;
    this.#cantidad = cantidad;
    this.#total = total;
  }

  /**
   * Única forma de crear una compra (FR-006 a FR-009): valida los datos y el
   * cupo, calcula el total, nace PENDIENTE con su primer registro de historial
   * y queda registrada en el tipo de entrada.
   */
  static crear({ id, comprador, evento, tipoEntrada, cantidad, ahora } = {}) {
    idValido(id);
    instanciaDe(comprador, Usuario, 'comprador');
    instanciaDe(evento, Evento, 'evento');
    instanciaDe(tipoEntrada, TipoEntrada, 'tipo de entrada');
    enteroMayorA(cantidad, 0, 'cantidad');
    fechaValida(ahora, 'ahora');

    if (!evento.incluyeTipo(tipoEntrada)) {
      throw new ErrorValidacion(`El tipo de entrada "${tipoEntrada.nombre}" no pertenece al evento`);
    }
    // Agregada en la feature 002 (plan 002, requisito derivado 2).
    if (evento.yaSeRealizo(ahora)) {
      throw new ErrorConflicto('El evento ya se realizó: no se pueden comprar entradas');
    }
    if (!tipoEntrada.hayCupoPara(cantidad)) {
      throw new ErrorConflicto(
        `No hay cupo suficiente de "${tipoEntrada.nombre}": quedan ${tipoEntrada.cupoDisponible()} y se pidieron ${cantidad}`,
      );
    }

    const compra = new Compra(CREACION_INTERNA, {
      id,
      comprador,
      evento,
      tipoEntrada,
      cantidad,
      total: tipoEntrada.precio * cantidad,
    });
    compra.#registrarEstado(EstadoCompra.PENDIENTE, comprador, ahora);
    tipoEntrada.registrarCompra(compra);
    return compra;
  }

  get id() { return this.#id; }
  get comprador() { return this.#comprador; }
  get evento() { return this.#evento; }
  get tipoEntrada() { return this.#tipoEntrada; }
  get cantidad() { return this.#cantidad; }
  get total() { return this.#total; }
  get estado() { return this.#estado; }
  get historial() { return Object.freeze([...this.#historial]); }
  get mensajes() { return Object.freeze([...this.#mensajes]); }

  /** ¿Sus entradas cuentan contra el cupo? (FR-005) */
  ocupaCupo() {
    return ESTADOS_QUE_OCUPAN_CUPO.has(this.#estado);
  }

  /**
   * Único punto de cambio de estado (FR-010, FR-011, FR-016b). Consulta
   * TRANSICIONES en este orden, para que el error diga el motivo real (FR-017):
   *   1. ¿el estado destino existe?            → si no, ErrorValidacion
   *   2. ¿existe la transición desde → hacia?  → si no, ErrorConflicto
   *   3. ¿quien tiene alguno de esos roles?    → si no, ErrorPermiso
   *   4. ¿se cumple alguna condición?          → si no, ErrorConflicto con el motivo
   * Si pasa todo, cambia el estado y deja el registro en el historial.
   */
  actualizarEstado(nuevoEstado, quien, ahora) {
    if (!Object.values(EstadoCompra).includes(nuevoEstado)) {
      throw new ErrorValidacion(`"${nuevoEstado}" no es un estado de compra válido`);
    }
    instanciaDe(quien, Usuario, 'quien');
    fechaValida(ahora, 'ahora');

    const desde = this.#estado;
    const candidatas = TRANSICIONES.filter((t) => t.desde === desde && t.hacia === nuevoEstado);
    if (candidatas.length === 0) {
      throw new ErrorConflicto(`Una compra no puede pasar de ${desde} a ${nuevoEstado}`);
    }

    const roles = this.#rolesDe(quien);
    const permitidas = candidatas.filter((t) => roles.has(t.rol));
    if (permitidas.length === 0) {
      const quienPuede = [...new Set(candidatas.map((t) => t.rol))].join(' o el ');
      throw new ErrorPermiso(
        `Solo el ${quienPuede} puede pasar la compra de ${desde} a ${nuevoEstado}`,
      );
    }

    const aplicable = permitidas.find((t) => t.condicion(this, ahora));
    if (!aplicable) {
      const motivos = [...new Set(permitidas.map((t) => t.motivo))].join('; ');
      throw new ErrorConflicto(`No se puede pasar la compra de ${desde} a ${nuevoEstado}: ${motivos}`);
    }

    this.#registrarEstado(nuevoEstado, quien, ahora);
  }

  // Atajos con intención: solo eligen el estado destino y delegan en
  // actualizarEstado. No tienen reglas propias (research D4).

  /** El organizador confirma una compra pendiente (FR-012). */
  confirmar(quien, ahora) {
    this.actualizarEstado(EstadoCompra.CONFIRMADA, quien, ahora);
  }

  /** El organizador rechaza una compra pendiente (FR-016). */
  rechazar(quien, ahora) {
    this.actualizarEstado(EstadoCompra.CANCELADA, quien, ahora);
  }

  /** El organizador registra el ingreso al evento (FR-015). */
  marcarUtilizada(quien, ahora) {
    this.actualizarEstado(EstadoCompra.UTILIZADA, quien, ahora);
  }

  /**
   * El comprador cancela (FR-014): una CONFIRMADA (ya pagada) pasa directo a
   * REEMBOLSADA; cualquier otra intenta pasar a CANCELADA y la tabla decide.
   */
  cancelar(quien, ahora) {
    const destino = this.#estado === EstadoCompra.CONFIRMADA
      ? EstadoCompra.REEMBOLSADA
      : EstadoCompra.CANCELADA;
    this.actualizarEstado(destino, quien, ahora);
  }

  /**
   * Chat de la compra (FR-023, FR-024): solo escriben el comprador y el
   * organizador del evento, en cualquier estado de la compra.
   */
  enviarMensaje(quien, texto, ahora) {
    instanciaDe(quien, Usuario, 'quien');
    fechaValida(ahora, 'ahora');
    if (this.#rolesDe(quien).size === 0) {
      throw new ErrorPermiso('Solo el comprador y el organizador del evento pueden escribir en esta compra');
    }
    const mensaje = new Mensaje({ usuario: quien, mensaje: texto, enviado: ahora });
    this.#mensajes.push(mensaje);
    return mensaje;
  }

  /** Roles de `quien` sobre esta compra, comparando por id (research D9). */
  #rolesDe(quien) {
    const roles = new Set();
    if (quien.id === this.#comprador.id) roles.add('comprador');
    if (quien.id === this.#evento.organizador.id) roles.add('organizador');
    return roles;
  }

  #registrarEstado(estado, quien, ahora) {
    this.#estado = estado;
    this.#historial.push(new CambioEstadoCompra({ compra: this, estado, quien, fechaHora: ahora }));
  }
}
