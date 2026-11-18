import { describe, it, expect } from 'vitest';
import { diaCalendario, diasEntre, ZONA_HORARIA } from '../../src/domain/fechas.js';

describe('diaCalendario (hora de Buenos Aires)', () => {
  it('usa la zona de Buenos Aires', () => {
    expect(ZONA_HORARIA).toBe('America/Argentina/Buenos_Aires');
  });

  it('a las 23:59 de Buenos Aires todavía es el mismo día, aunque en UTC ya sea el siguiente', () => {
    expect(diaCalendario(new Date('2026-11-19T02:59:00Z'))).toBe('2026-11-18');
  });

  it('a las 00:00 de Buenos Aires cambia el día', () => {
    expect(diaCalendario(new Date('2026-11-19T03:00:00Z'))).toBe('2026-11-19');
  });
});

describe('diasEntre (días calendario de Buenos Aires)', () => {
  const ba = (texto) => new Date(`${texto}-03:00`);

  it('es 0 dentro del mismo día, de 00:01 a 23:59', () => {
    expect(diasEntre(ba('2026-11-18T00:01:00'), ba('2026-11-18T23:59:00'))).toBe(0);
  });

  it('es 1 al día siguiente, aunque falten 2 minutos (23:59 → 00:01)', () => {
    expect(diasEntre(ba('2026-11-18T23:59:00'), ba('2026-11-19T00:01:00'))).toBe(1);
  });

  it('es negativo si la fecha destino ya pasó', () => {
    expect(diasEntre(ba('2026-11-20T10:00:00'), ba('2026-11-18T10:00:00'))).toBe(-2);
  });

  it('cruza fin de mes', () => {
    expect(diasEntre(ba('2026-11-30T12:00:00'), ba('2026-12-01T12:00:00'))).toBe(1);
  });

  it('cruza fin de año', () => {
    expect(diasEntre(ba('2026-12-31T22:00:00'), ba('2027-01-01T01:00:00'))).toBe(1);
  });

  it('cuenta los días de un período largo', () => {
    expect(diasEntre(ba('2026-11-18T15:00:00'), ba('2026-11-28T21:00:00'))).toBe(10);
  });
});
