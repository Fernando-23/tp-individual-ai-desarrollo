/**
 * Formatos para mostrar (FR-005). Se arman a mano en lugar de con Intl para que
 * el resultado sea idéntico en los tests (Node) y en el celular (Hermes), cuyos
 * datos de idioma pueden variar. Las fechas se muestran en la zona del dispositivo.
 */
const DIAS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

const dosDigitos = (n) => String(n).padStart(2, '0');
const conMiles = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

/** 0 → "Gratis"; 20000 → "$ 20.000" (sin centavos, redondeado). */
export function formatearPrecio(monto) {
  if (monto === 0) return 'Gratis';
  return `$ ${conMiles(Math.round(monto))}`;
}

/** "sáb 28 nov, 21:00" */
export function formatearFecha(iso) {
  const f = new Date(iso);
  return `${DIAS[f.getDay()]} ${f.getDate()} ${MESES[f.getMonth()]}, ${formatearHora(iso)}`;
}

/** "28/11/2026 21:00", para el historial de una compra. */
export function formatearFechaHora(iso) {
  const f = new Date(iso);
  return `${dosDigitos(f.getDate())}/${dosDigitos(f.getMonth() + 1)}/${f.getFullYear()} ${formatearHora(iso)}`;
}

/** "21:00", para el chat. */
export function formatearHora(iso) {
  const f = new Date(iso);
  return `${dosDigitos(f.getHours())}:${dosDigitos(f.getMinutes())}`;
}

/**
 * Texto de los días que faltan (caso de uso 1). El número ya viene calculado
 * por el servidor en hora de Buenos Aires; la app solo arma la frase.
 */
export function textoDiasRestantes(dias) {
  if (dias === null || dias === undefined || dias < 0) return null;
  if (dias === 0) return 'Es hoy';
  if (dias === 1) return 'Mañana';
  return `Faltan ${dias} días`;
}
