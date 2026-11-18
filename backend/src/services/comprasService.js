import { Compra } from '../domain/compra.js';
import { ErrorPermiso, ErrorValidacion } from '../domain/errores.js';
import { ErrorNoEncontrado } from './errores.js';

/**
 * Compras: comprar, mis compras, detalle, cambios de estado y chat
 * (FR-015 a FR-018, FR-020, FR-021). Las reglas son del dominio: este
 * servicio busca lo necesario, delega en Compra y guarda.
 */
export function crearComprasService({ repositorios, reloj, generarId }) {
  const esParte = (compra, usuario) =>
    compra.comprador.id === usuario.id || compra.evento.organizador.id === usuario.id;

  function buscarCompra(id) {
    const compra = repositorios.compras.buscarPorId(id);
    if (!compra) {
      throw new ErrorNoEncontrado(`No existe la compra ${id}`);
    }
    return compra;
  }

  /** Compra a la que el usuario tiene acceso: su comprador o el organizador (FR-017). */
  function compraVisiblePara(id, usuario) {
    const compra = buscarCompra(id);
    if (!esParte(compra, usuario)) {
      throw new ErrorPermiso('Solo el comprador y el organizador del evento pueden ver esta compra');
    }
    return compra;
  }

  return {
    /** FR-015: las referencias del body que no existen son datos inválidos (400). */
    comprar({ eventoId, tipoEntradaId, cantidad } = {}, usuario) {
      const evento = repositorios.eventos.buscarPorId(eventoId);
      if (!evento) {
        throw new ErrorValidacion(`No existe el evento ${eventoId}`);
      }
      const tipoEntrada = evento.tiposEntrada.find((tipo) => tipo.id === tipoEntradaId);
      if (!tipoEntrada) {
        throw new ErrorValidacion(`El evento no tiene el tipo de entrada ${tipoEntradaId}`);
      }
      const compra = Compra.crear({
        id: generarId(),
        comprador: usuario,
        evento,
        tipoEntrada,
        cantidad,
        ahora: reloj(),
      });
      return repositorios.compras.guardar(compra);
    },

    /** FR-016: las compras del usuario, por fecha del evento. */
    misCompras(usuario) {
      return repositorios.compras
        .filtrar((compra) => compra.comprador.id === usuario.id)
        .sort((a, b) => a.evento.fecha.getTime() - b.evento.fecha.getTime());
    },

    detalle: compraVisiblePara,
  };
}
