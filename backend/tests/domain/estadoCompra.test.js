import { describe, it, expect } from 'vitest';
import { EstadoCompra, ESTADOS_QUE_OCUPAN_CUPO } from '../../src/domain/estadoCompra.js';

describe('EstadoCompra', () => {
  it('tiene exactamente los 5 estados del enunciado, con valor igual a la clave', () => {
    expect(Object.keys(EstadoCompra)).toEqual([
      'PENDIENTE',
      'CONFIRMADA',
      'UTILIZADA',
      'CANCELADA',
      'REEMBOLSADA',
    ]);
    for (const [clave, valor] of Object.entries(EstadoCompra)) {
      expect(valor).toBe(clave);
    }
  });

  it('está congelado', () => {
    expect(Object.isFrozen(EstadoCompra)).toBe(true);
  });
});

describe('ESTADOS_QUE_OCUPAN_CUPO', () => {
  it('son PENDIENTE, CONFIRMADA y UTILIZADA', () => {
    expect([...ESTADOS_QUE_OCUPAN_CUPO].sort()).toEqual(['CONFIRMADA', 'PENDIENTE', 'UTILIZADA']);
  });

  it('CANCELADA y REEMBOLSADA liberan cupo', () => {
    expect(ESTADOS_QUE_OCUPAN_CUPO.has(EstadoCompra.CANCELADA)).toBe(false);
    expect(ESTADOS_QUE_OCUPAN_CUPO.has(EstadoCompra.REEMBOLSADA)).toBe(false);
  });
});
