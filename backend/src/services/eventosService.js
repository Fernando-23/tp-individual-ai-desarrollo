import { ErrorPermiso, ErrorValidacion } from '../domain/errores.js';
import { Evento } from '../domain/evento.js';
import { TipoEntrada } from '../domain/tipoEntrada.js';

/**
 * Eventos desde el lado del organizador: sus eventos, las ventas de cada uno,
 * publicar, y reseñar (FR-019, FR-022, FR-023).
 */
export function crearEventosService({ repositorios, reloj, generarId, catalogo }) {
  function leerFecha(valor) {
    const fecha = typeof valor === 'string' ? new Date(valor) : null;
    if (!fecha || Number.isNaN(fecha.getTime())) {
      throw new ErrorValidacion('fecha debe ser una fecha y hora en formato ISO 8601');
    }
    if (fecha.getTime() <= reloj().getTime()) {
      throw new ErrorValidacion('La fecha del evento debe ser futura');
    }
    return fecha;
  }

  return {
    /** Ventas de un evento: solo su organizador las ve (FR-019). */
    ventas(eventoId, usuario) {
      const evento = catalogo.buscarEvento(eventoId);
      if (evento.organizador.id !== usuario.id) {
        throw new ErrorPermiso('Solo el organizador del evento puede ver sus ventas');
      }
      return evento;
    },

    /** Eventos que organiza el usuario, incluidos los pasados, por fecha. */
    misEventos(usuario) {
      return repositorios.eventos
        .filtrar((evento) => evento.organizador.id === usuario.id)
        .sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
    },

    /**
     * Publicar un evento (FR-023). Este servicio valida lo que el dominio no
     * puede saber (categoría del catálogo, fecha futura, forma del body); el
     * resto (tipos válidos, nombres repetidos…) lo valida Evento.
     */
    publicar(datos = {}, usuario) {
      const categoria = repositorios.categorias.buscarPorId(datos.categoriaId);
      if (!categoria) {
        throw new ErrorValidacion(`No existe la categoría ${datos.categoriaId}`);
      }
      if (!Array.isArray(datos.tiposEntrada)) {
        throw new ErrorValidacion('tiposEntrada debe ser una lista con al menos un tipo de entrada');
      }
      const evento = new Evento({
        id: generarId(),
        nombre: datos.nombre,
        descripcion: datos.descripcion,
        categoria,
        fecha: leerFecha(datos.fecha),
        multimedia: datos.multimedia ?? [],
        organizador: usuario,
        tiposEntrada: datos.tiposEntrada.map((tipo) => new TipoEntrada({
          id: generarId(),
          nombre: tipo?.nombre,
          descripcion: tipo?.descripcion,
          precio: tipo?.precio,
          cupo: tipo?.cupo,
        })),
      });
      return repositorios.eventos.guardar(evento);
    },

    /** Reseñar (FR-022): los permisos y la unicidad son reglas de Evento.reseniar. */
    reseniar(eventoId, { puntuacion, detalle } = {}, usuario) {
      const evento = catalogo.buscarEvento(eventoId);
      return evento.reseniar({ id: generarId(), comprador: usuario, puntuacion, detalle });
    },
  };
}
