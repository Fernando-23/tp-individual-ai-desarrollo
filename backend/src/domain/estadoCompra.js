/** Etapas de una compra (enunciado). */
export const EstadoCompra = Object.freeze({
  PENDIENTE: 'PENDIENTE',
  CONFIRMADA: 'CONFIRMADA',
  UTILIZADA: 'UTILIZADA',
  CANCELADA: 'CANCELADA',
  REEMBOLSADA: 'REEMBOLSADA',
});

/** Estados cuyas entradas cuentan contra el cupo (FR-005). */
export const ESTADOS_QUE_OCUPAN_CUPO = new Set([
  EstadoCompra.PENDIENTE,
  EstadoCompra.CONFIRMADA,
  EstadoCompra.UTILIZADA,
]);

const { PENDIENTE, CONFIRMADA, UTILIZADA, CANCELADA, REEMBOLSADA } = EstadoCompra;

const siempre = () => true;
const eventoNoRealizado = (compra, ahora) => !compra.evento.yaSeRealizo(ahora);
const esDiaDelEvento = (compra, ahora) => compra.evento.esElDiaDelEvento(ahora);

const fila = (desde, hacia, rol, condicion = siempre, motivo = '') =>
  Object.freeze({ desde, hacia, rol, condicion, motivo });

/**
 * Transiciones válidas de una compra: copia de la tabla FR-016b de la spec
 * (specs/001-modelo-dominio/spec.md). Cualquier otra transición se rechaza.
 * `condicion(compra, ahora)` dice si la fila aplica; `motivo` explica por qué no.
 * UTILIZADA, CANCELADA y REEMBOLSADA son estados finales.
 */
export const TRANSICIONES = Object.freeze([
  fila(PENDIENTE, CONFIRMADA, 'organizador'),
  fila(PENDIENTE, CANCELADA, 'comprador', eventoNoRealizado, 'el evento ya se realizó'),
  fila(PENDIENTE, CANCELADA, 'organizador'),
  fila(CONFIRMADA, REEMBOLSADA, 'comprador', eventoNoRealizado, 'el evento ya se realizó'),
  fila(CONFIRMADA, UTILIZADA, 'organizador', esDiaDelEvento, 'todavía no es el día del evento'),
]);
