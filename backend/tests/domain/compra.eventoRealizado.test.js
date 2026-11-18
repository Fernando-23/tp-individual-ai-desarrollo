import { describe, it, expect } from 'vitest';
import { ErrorConflicto } from '../../src/domain/errores.js';
import { crearCompra, crearEvento, en } from './builders.js';

// Regla agregada en la feature 002 (plan, requisito derivado 2):
// no se pueden comprar entradas de un evento que ya empezó.
describe('Compra.crear: evento ya realizado', () => {
  it('rechaza comprar cuando el evento ya empezó, sin registrar la compra', () => {
    const evento = crearEvento({ fecha: en('2026-11-28T21:00:00') });
    const tipo = evento.tiposEntrada[0];

    expect(() => crearCompra({ evento, ahora: en('2026-11-28T21:00:00') })).toThrow(ErrorConflicto);
    expect(() => crearCompra({ evento, ahora: en('2026-11-29T10:00:00') })).toThrow(/ya se realizó/);
    expect(tipo.compras).toHaveLength(0);
  });

  it('permite comprar un minuto antes de que empiece', () => {
    const evento = crearEvento({ fecha: en('2026-11-28T21:00:00') });

    expect(() => crearCompra({ evento, ahora: en('2026-11-28T20:59:00') })).not.toThrow();
  });
});
