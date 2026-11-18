import { describe, it, expect } from 'vitest';
import { EstadoCompra, TRANSICIONES } from '../../src/domain/estadoCompra.js';

const { PENDIENTE, CONFIRMADA, UTILIZADA, CANCELADA, REEMBOLSADA } = EstadoCompra;

// Copia literal de la tabla FR-016b de specs/001-modelo-dominio/spec.md.
// Si la regla cambia en la spec, este test obliga a cambiarla también en el código.
const TABLA_DE_LA_SPEC = [
  { desde: PENDIENTE, hacia: CONFIRMADA, rol: 'organizador' },
  { desde: PENDIENTE, hacia: CANCELADA, rol: 'comprador' },
  { desde: PENDIENTE, hacia: CANCELADA, rol: 'organizador' },
  { desde: CONFIRMADA, hacia: REEMBOLSADA, rol: 'comprador' },
  { desde: CONFIRMADA, hacia: UTILIZADA, rol: 'organizador' },
];

describe('TRANSICIONES (FR-016b)', () => {
  it('coincide fila por fila con la tabla de la spec', () => {
    const filas = TRANSICIONES.map(({ desde, hacia, rol }) => ({ desde, hacia, rol }));

    expect(filas).toEqual(TABLA_DE_LA_SPEC);
  });

  it('está congelada, igual que cada fila', () => {
    expect(Object.isFrozen(TRANSICIONES)).toBe(true);
    for (const fila of TRANSICIONES) {
      expect(Object.isFrozen(fila)).toBe(true);
    }
  });

  it('UTILIZADA, CANCELADA y REEMBOLSADA son finales: no salen transiciones de ellos', () => {
    const origenes = new Set(TRANSICIONES.map((fila) => fila.desde));

    for (const final of [UTILIZADA, CANCELADA, REEMBOLSADA]) {
      expect(origenes.has(final)).toBe(false);
    }
  });

  it('cada fila tiene una condición y un motivo en español', () => {
    for (const fila of TRANSICIONES) {
      expect(typeof fila.condicion).toBe('function');
      expect(typeof fila.motivo).toBe('string');
    }
  });
});
