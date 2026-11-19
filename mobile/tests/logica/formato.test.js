import { describe, it, expect, beforeAll } from 'vitest';

// Las fechas se muestran en la zona del dispositivo: el test fija la de Buenos Aires.
beforeAll(() => {
  process.env.TZ = 'America/Argentina/Buenos_Aires';
});

const { formatearPrecio, formatearFecha, formatearFechaHora, formatearHora, textoDiasRestantes } =
  await import('../../src/logica/formato.js');

describe('formatearPrecio (FR-005)', () => {
  it.each([
    [0, 'Gratis'],
    [20000, '$ 20.000'],
    [5000, '$ 5.000'],
    [950, '$ 950'],
    [1234567, '$ 1.234.567'],
    [1500.5, '$ 1.501'],
  ])('%s → %s', (monto, esperado) => {
    expect(formatearPrecio(monto)).toBe(esperado);
  });
});

describe('formatearFecha y formatearFechaHora (FR-005)', () => {
  // 29/11/2026 00:00 UTC = sábado 28/11/2026 21:00 en Buenos Aires
  const iso = '2026-11-29T00:00:00.000Z';

  it('día de la semana, día, mes abreviado y hora, en español', () => {
    expect(formatearFecha(iso)).toBe('sáb 28 nov, 21:00');
  });

  it('formatearFechaHora agrega el año para el historial', () => {
    expect(formatearFechaHora(iso)).toBe('28/11/2026 21:00');
  });

  it('formatearHora muestra solo la hora (chat)', () => {
    expect(formatearHora('2026-11-18T18:05:00.000Z')).toBe('15:05');
  });

  it('completa con ceros', () => {
    expect(formatearFecha('2026-03-02T12:05:00.000Z')).toBe('lun 2 mar, 09:05');
  });
});

describe('textoDiasRestantes (caso de uso 1)', () => {
  it.each([
    [0, 'Es hoy'],
    [1, 'Mañana'],
    [2, 'Faltan 2 días'],
    [10, 'Faltan 10 días'],
    [null, null],
    [undefined, null],
    [-1, null],
  ])('%s → %s', (dias, esperado) => {
    expect(textoDiasRestantes(dias)).toBe(esperado);
  });
});
