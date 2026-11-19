/**
 * Qué acciones ofrecer en el detalle de una compra (FR-013, data-model).
 * Es solo una guía de interfaz: la regla real la aplica el servidor, y si
 * rechaza algo, la app muestra su mensaje (research D5).
 *
 * `compra` tiene la forma de CompraDetalle (contracts/api.md de la feature 002).
 */
export function accionesDisponibles(compra, usuarioId, ahora, { yaResenio = false } = {}) {
  const acciones = new Set();
  const esComprador = compra.comprador.id === usuarioId;
  const esOrganizador = compra.organizador.id === usuarioId;
  if (!esComprador && !esOrganizador) return acciones;

  const eventoEmpezo = ahora.getTime() >= new Date(compra.evento.fecha).getTime();
  const { estado } = compra;

  acciones.add('chatear');

  if (esComprador) {
    if ((estado === 'PENDIENTE' || estado === 'CONFIRMADA') && !eventoEmpezo) acciones.add('cancelar');
    if (estado === 'UTILIZADA' && !yaResenio) acciones.add('reseniar');
  }

  if (esOrganizador) {
    if (estado === 'PENDIENTE') {
      acciones.add('confirmar');
      acciones.add('rechazar');
    }
    const esElDia = (compra.diasRestantes !== null && compra.diasRestantes <= 0) || eventoEmpezo;
    if (estado === 'CONFIRMADA' && esElDia) acciones.add('registrarIngreso');
  }

  return acciones;
}
