import { Categoria, normalizarNombre } from './categoria.js';
import { ErrorConflicto, ErrorPermiso, ErrorValidacion } from './errores.js';
import { EstadoCompra } from './estadoCompra.js';
import { diasEntre } from './fechas.js';
import { Resenia } from './resenia.js';
import { TipoEntrada } from './tipoEntrada.js';
import { Usuario } from './usuario.js';
import { fechaValida, idValido, instanciaDe, textoNoVacio } from './validaciones.js';

/** Lo que un organizador publica y vende. */
export class Evento {
  #resenias = [];

  constructor({ id, nombre, descripcion, categoria, fecha, tiposEntrada, multimedia, organizador } = {}) {
    this.id = idValido(id);
    this.nombre = textoNoVacio(nombre, 'nombre del evento');
    this.descripcion = textoNoVacio(descripcion, 'descripción del evento');
    this.categoria = instanciaDe(categoria, Categoria, 'categoría');
    this.fecha = fechaValida(fecha, 'fecha del evento');
    this.tiposEntrada = Object.freeze(validarTiposEntrada(tiposEntrada));
    this.multimedia = Object.freeze(validarMultimedia(multimedia));
    this.organizador = instanciaDe(organizador, Usuario, 'organizador');
  }

  get resenias() {
    return Object.freeze([...this.#resenias]);
  }

  /** ¿El tipo de entrada pertenece a este evento? */
  incluyeTipo(tipoEntrada) {
    return this.tiposEntrada.some((tipo) => tipo.id === tipoEntrada.id);
  }

  /** Todas las compras de todos los tipos de entrada del evento. */
  compras() {
    return this.tiposEntrada.flatMap((tipo) => tipo.compras);
  }

  /**
   * ¿Alguno de sus tipos de entrada tiene un precio en [min, max]? (FR-003)
   * Un rango con min > max no coincide con nada.
   */
  tuPrecioEstaEntre(min, max) {
    if (min > max) {
      return false;
    }
    return this.tiposEntrada.some((tipo) => tipo.precio >= min && tipo.precio <= max);
  }

  /** El evento ya empezó: su fecha y hora de inicio ya pasaron. */
  yaSeRealizo(ahora) {
    return ahora.getTime() >= this.fecha.getTime();
  }

  /** Es el día calendario del evento (en Buenos Aires) o uno posterior (FR-015). */
  esElDiaDelEvento(ahora) {
    return diasEntre(ahora, this.fecha) <= 0;
  }

  /** Días calendario de Buenos Aires que faltan: 0 el mismo día, negativo si pasó (FR-018). */
  diasRestantes(ahora) {
    return diasEntre(ahora, this.fecha);
  }

  /**
   * Un comprador reseña el evento (FR-019 a FR-021). Las reglas se aplican en orden:
   * 1. permiso: tiene al menos una compra UTILIZADA de este evento;
   * 2. unicidad: no lo reseñó antes;
   * 3. datos válidos (los valida Resenia).
   */
  reseniar({ id, comprador, puntuacion, detalle } = {}) {
    instanciaDe(comprador, Usuario, 'comprador');

    const asistio = this.compras().some(
      (compra) => compra.comprador.id === comprador.id && compra.estado === EstadoCompra.UTILIZADA,
    );
    if (!asistio) {
      throw new ErrorPermiso('Solo puede reseñar quien tiene una entrada utilizada de este evento');
    }
    if (this.#resenias.some((resenia) => resenia.comprador.id === comprador.id)) {
      throw new ErrorConflicto('Ya reseñaste este evento');
    }

    const resenia = new Resenia({ id, comprador, evento: this, detalle, puntuacion });
    this.#resenias.push(resenia);
    return resenia;
  }
}

function validarTiposEntrada(tiposEntrada) {
  if (!Array.isArray(tiposEntrada) || tiposEntrada.length === 0) {
    throw new ErrorValidacion('El evento debe tener al menos un tipo de entrada');
  }
  tiposEntrada.forEach((tipo) => instanciaDe(tipo, TipoEntrada, 'tipo de entrada'));

  const nombres = tiposEntrada.map((tipo) => normalizarNombre(tipo.nombre));
  const repetido = nombres.find((nombre, i) => nombres.indexOf(nombre) !== i);
  if (repetido !== undefined) {
    throw new ErrorValidacion(`Hay dos tipos de entrada con el nombre "${repetido}"`);
  }
  return [...tiposEntrada];
}

function validarMultimedia(multimedia) {
  const lista = multimedia ?? [];
  if (!Array.isArray(lista) || lista.some((item) => typeof item !== 'string')) {
    throw new ErrorValidacion('El multimedia debe ser una lista de direcciones (textos)');
  }
  return [...lista];
}
