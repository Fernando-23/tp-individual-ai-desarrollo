import { ErrorValidacion } from '../domain/errores.js';
import { puntajeOrganizador } from '../domain/reputacion.js';
import { coincideTexto } from './busqueda.js';
import { ErrorNoEncontrado } from './errores.js';

export const ORDENES = Object.freeze(['precio', 'fecha', 'puntaje']);

const precioDesde = (evento) => Math.min(...evento.tiposEntrada.map((tipo) => tipo.precio));

/**
 * Catálogo: categorías, búsqueda con filtros y órdenes, detalle y reputación
 * de los organizadores (FR-006 a FR-014). Las reglas de precio y fechas son
 * del dominio (tuPrecioEstaEntre, yaSeRealizo, puntajeOrganizador).
 */
export function crearCatalogoService({ repositorios, reloj }) {
  const eventosDe = (organizador) =>
    repositorios.eventos.filtrar((evento) => evento.organizador.id === organizador.id);

  function reputacionDe(organizador) {
    const eventos = eventosDe(organizador);
    return {
      puntaje: puntajeOrganizador(eventos),
      cantidadResenias: eventos.reduce((total, evento) => total + evento.resenias.length, 0),
    };
  }

  function reseniasDe(organizador) {
    return eventosDe(organizador).flatMap((evento) => evento.resenias);
  }

  function buscarEvento(id) {
    const evento = repositorios.eventos.buscarPorId(id);
    if (!evento) {
      throw new ErrorNoEncontrado(`No existe el evento ${id}`);
    }
    return evento;
  }

  function leerPrecio(valor, campo) {
    if (valor === undefined) return undefined;
    const numero = typeof valor === 'string' && valor.trim() !== '' ? Number(valor) : NaN;
    if (!Number.isFinite(numero) || numero < 0) {
      throw new ErrorValidacion(`${campo} debe ser un número mayor o igual a 0`);
    }
    return numero;
  }

  function leerTexto(valor, campo) {
    if (valor !== undefined && typeof valor !== 'string') {
      throw new ErrorValidacion(`${campo} debe aparecer una sola vez`);
    }
    return valor;
  }

  /** Clave de orden de cada criterio: menor primero. Sin puntaje va al final. */
  const claves = {
    precio: (evento) => precioDesde(evento),
    fecha: (evento) => evento.fecha.getTime(),
    puntaje: (evento) => -(reputacionDe(evento.organizador).puntaje ?? -Infinity),
  };

  return {
    categorias() {
      return repositorios.categorias.todos();
    },

    reputacionDe,
    reseniasDe,
    buscarEvento,

    /** Eventos próximos que cumplen los filtros, en el orden pedido (FR-007 a FR-012). */
    buscar(query = {}) {
      const texto = leerTexto(query.texto, 'texto');
      const categoriaId = leerTexto(query.categoria, 'categoria');
      const orden = leerTexto(query.orden, 'orden') ?? 'fecha';
      const precioMin = leerPrecio(query.precioMin, 'precioMin');
      const precioMax = leerPrecio(query.precioMax, 'precioMax');

      if (categoriaId !== undefined && !repositorios.categorias.buscarPorId(categoriaId)) {
        throw new ErrorValidacion(`No existe la categoría ${categoriaId}`);
      }
      if (!ORDENES.includes(orden)) {
        throw new ErrorValidacion(`El orden "${orden}" no existe. Usá: ${ORDENES.join(', ')}`);
      }

      const ahora = reloj();
      const clave = claves[orden];
      return repositorios.eventos
        .filtrar((evento) =>
          !evento.yaSeRealizo(ahora) &&
          (categoriaId === undefined || evento.categoria.id === categoriaId) &&
          coincideTexto(texto, evento.nombre, evento.descripcion) &&
          evento.tuPrecioEstaEntre(precioMin ?? 0, precioMax ?? Infinity))
        .sort((a, b) =>
          clave(a) - clave(b) ||
          a.fecha.getTime() - b.fecha.getTime() ||
          a.nombre.localeCompare(b.nombre, 'es'));
    },
  };
}
