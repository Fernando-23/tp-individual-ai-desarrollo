/**
 * Cálculos por día calendario en la hora de Argentina (constitución, Principio VIII).
 * Funciones puras: reciben las fechas como parámetro y nunca leen el reloj.
 */
export const ZONA_HORARIA = 'America/Argentina/Buenos_Aires';

const MS_POR_DIA = 86_400_000;

// 'en-CA' formatea como YYYY-MM-DD.
const formatoDia = new Intl.DateTimeFormat('en-CA', {
  timeZone: ZONA_HORARIA,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** Día calendario de `fecha` en Buenos Aires, como 'YYYY-MM-DD'. */
export function diaCalendario(fecha) {
  return formatoDia.format(fecha);
}

function diaComoNumero(fecha) {
  const [anio, mes, dia] = diaCalendario(fecha).split('-').map(Number);
  return Date.UTC(anio, mes - 1, dia) / MS_POR_DIA;
}

/**
 * Cantidad de días calendario de Buenos Aires desde `desde` hasta `hasta`.
 * Es 0 el mismo día, 1 al día siguiente y negativo si `hasta` ya pasó.
 */
export function diasEntre(desde, hasta) {
  return diaComoNumero(hasta) - diaComoNumero(desde);
}
