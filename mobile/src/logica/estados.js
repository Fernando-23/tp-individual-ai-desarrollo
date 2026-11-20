/**
 * Cómo se muestra cada estado de compra (FR-004): etiqueta, colores e ícono
 * (Ionicons). Nunca solo color: cada estado tiene texto e ícono propios.
 */
import { coloresEstado } from '../tema.js';

const estado = (clave, etiqueta, icono) => Object.freeze({ clave, etiqueta, icono, ...coloresEstado[clave] });

export const ESTADOS = Object.freeze({
  PENDIENTE: estado('PENDIENTE', 'Pendiente de pago', 'time-outline'),
  CONFIRMADA: estado('CONFIRMADA', 'Confirmada', 'checkmark-circle'),
  UTILIZADA: estado('UTILIZADA', 'Utilizada', 'ticket'),
  CANCELADA: estado('CANCELADA', 'Cancelada', 'close-circle'),
  REEMBOLSADA: estado('REEMBOLSADA', 'Reembolsada', 'arrow-undo-circle'),
});

const DESCONOCIDO = estado('DESCONOCIDO', 'Desconocido', 'help-circle');

export function infoEstado(clave) {
  return ESTADOS[clave] ?? DESCONOCIDO;
}
