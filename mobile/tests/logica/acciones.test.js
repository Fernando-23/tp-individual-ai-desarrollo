import { describe, it, expect } from 'vitest';
import { accionesDisponibles } from '../../src/logica/acciones.js';

const AHORA = new Date('2026-11-18T18:00:00.000Z');
const FUTURO = '2026-11-28T21:00:00.000Z';
const PASADO = '2026-11-10T21:00:00.000Z';

function compra({ estado, comprador = 'u-leo', organizador = 'u-ana', fecha = FUTURO, diasRestantes = null }) {
  return {
    estado,
    diasRestantes,
    comprador: { id: comprador },
    organizador: { id: organizador },
    evento: { id: 'e-1', fecha },
  };
}

const acciones = (c, usuarioId, extra = {}) => [...accionesDisponibles(c, usuarioId, AHORA, extra)].sort();

describe('accionesDisponibles (FR-013, data-model)', () => {
  it('comprador con una PENDIENTE de un evento futuro → cancelar y chatear', () => {
    expect(acciones(compra({ estado: 'PENDIENTE' }), 'u-leo')).toEqual(['cancelar', 'chatear']);
  });

  it('comprador con una CONFIRMADA futura → cancelar y chatear', () => {
    expect(acciones(compra({ estado: 'CONFIRMADA', diasRestantes: 10 }), 'u-leo')).toEqual(['cancelar', 'chatear']);
  });

  it('comprador con un evento que ya pasó → no puede cancelar', () => {
    expect(acciones(compra({ estado: 'CONFIRMADA', fecha: PASADO, diasRestantes: -8 }), 'u-leo')).toEqual(['chatear']);
  });

  it('organizador con una PENDIENTE → confirmar, rechazar y chatear', () => {
    expect(acciones(compra({ estado: 'PENDIENTE' }), 'u-ana')).toEqual(['chatear', 'confirmar', 'rechazar']);
  });

  it('organizador con una CONFIRMADA el día del evento → registrarIngreso', () => {
    expect(acciones(compra({ estado: 'CONFIRMADA', diasRestantes: 0 }), 'u-ana')).toEqual(['chatear', 'registrarIngreso']);
  });

  it('organizador con una CONFIRMADA dentro de 10 días → todavía no puede registrar el ingreso', () => {
    expect(acciones(compra({ estado: 'CONFIRMADA', diasRestantes: 10 }), 'u-ana')).toEqual(['chatear']);
  });

  it('comprador con una UTILIZADA sin reseñar → reseniar; si ya reseñó, no', () => {
    const utilizada = compra({ estado: 'UTILIZADA', fecha: PASADO });

    expect(acciones(utilizada, 'u-leo', { yaResenio: false })).toEqual(['chatear', 'reseniar']);
    expect(acciones(utilizada, 'u-leo', { yaResenio: true })).toEqual(['chatear']);
  });

  it.each(['CANCELADA', 'REEMBOLSADA'])('en %s solo queda el chat', (estado) => {
    expect(acciones(compra({ estado }), 'u-leo')).toEqual(['chatear']);
    expect(acciones(compra({ estado }), 'u-ana')).toEqual(['chatear']);
  });

  it('un tercero no tiene ninguna acción', () => {
    expect(acciones(compra({ estado: 'PENDIENTE' }), 'u-sofi')).toEqual([]);
  });

  it('el organizador que también es comprador tiene las acciones de los dos roles', () => {
    const propia = compra({ estado: 'PENDIENTE', comprador: 'u-ana', organizador: 'u-ana' });

    expect(acciones(propia, 'u-ana')).toEqual(['cancelar', 'chatear', 'confirmar', 'rechazar']);
  });
});
