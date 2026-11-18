import { describe, it, expect, beforeEach } from 'vitest';
import { EstadoCompra } from '../../src/domain/estadoCompra.js';
import { ErrorConflicto, ErrorPermiso, ErrorValidacion } from '../../src/domain/errores.js';
import { AHORA, crearCompra, crearEvento, crearUsuario, en } from './builders.js';

const { PENDIENTE, CONFIRMADA, UTILIZADA, CANCELADA, REEMBOLSADA } = EstadoCompra;

// Evento: 28/11/2026 21:00 en Buenos Aires. AHORA: 18/11/2026 15:00.
const DIA_ANTERIOR = en('2026-11-27T23:59:00');
const DIA_DEL_EVENTO = en('2026-11-28T00:01:00');
const DESPUES_DEL_EVENTO = en('2026-11-28T23:30:00');

let organizador;
let comprador;
let tercero;
let evento;

beforeEach(() => {
  organizador = crearUsuario({ nombre: 'Ana' });
  comprador = crearUsuario({ nombre: 'Leo' });
  tercero = crearUsuario({ nombre: 'Juan' });
  evento = crearEvento({ organizador, fecha: en('2026-11-28T21:00:00') });
});

const compraPendiente = (cantidad = 2) => crearCompra({ evento, comprador, cantidad });

function compraConfirmada(cantidad = 2) {
  const compra = compraPendiente(cantidad);
  compra.confirmar(organizador, AHORA);
  return compra;
}

describe('Transiciones válidas (FR-016b)', () => {
  it('escenario 1: el organizador confirma una PENDIENTE → CONFIRMADA, registrado a su nombre', () => {
    const compra = compraPendiente();

    compra.confirmar(organizador, AHORA);

    expect(compra.estado).toBe(CONFIRMADA);
    expect(compra.historial.at(-1)).toMatchObject({ estado: CONFIRMADA, quien: organizador, fechaHora: AHORA });
  });

  it('escenario 3: el comprador cancela una CONFIRMADA → REEMBOLSADA y libera el cupo (FR-014)', () => {
    const compra = compraConfirmada(2);
    const tipo = compra.tipoEntrada;
    const disponibleAntes = tipo.cupoDisponible();

    compra.cancelar(comprador, AHORA);

    expect(compra.estado).toBe(REEMBOLSADA);
    expect(tipo.cupoDisponible()).toBe(disponibleAntes + 2);
  });

  it('escenario 4: el comprador cancela una PENDIENTE → CANCELADA y libera el cupo (FR-014)', () => {
    const compra = compraPendiente(3);
    const tipo = compra.tipoEntrada;
    const disponibleAntes = tipo.cupoDisponible();

    compra.cancelar(comprador, AHORA);

    expect(compra.estado).toBe(CANCELADA);
    expect(tipo.cupoDisponible()).toBe(disponibleAntes + 3);
  });

  it('escenario 7: el organizador marca UTILIZADA una CONFIRMADA el día del evento', () => {
    const compra = compraConfirmada();

    compra.marcarUtilizada(organizador, DIA_DEL_EVENTO);

    expect(compra.estado).toBe(UTILIZADA);
    expect(compra.historial.at(-1)).toMatchObject({ estado: UTILIZADA, quien: organizador });
  });

  it('escenario 12: el organizador rechaza una PENDIENTE → CANCELADA, libera cupo y queda registrado', () => {
    const compra = compraPendiente(2);
    const disponibleAntes = compra.tipoEntrada.cupoDisponible();

    compra.rechazar(organizador, AHORA);

    expect(compra.estado).toBe(CANCELADA);
    expect(compra.tipoEntrada.cupoDisponible()).toBe(disponibleAntes + 2);
    expect(compra.historial.at(-1)).toMatchObject({ estado: CANCELADA, quien: organizador });
  });

  it('actualizarEstado es el mismo camino que los atajos', () => {
    const compra = compraPendiente();

    compra.actualizarEstado(CONFIRMADA, organizador, AHORA);
    compra.actualizarEstado(UTILIZADA, organizador, DIA_DEL_EVENTO);

    expect(compra.estado).toBe(UTILIZADA);
  });
});

describe('Permisos (FR-012, FR-015, FR-017)', () => {
  it('escenario 2: el comprador no puede confirmar su propia compra → ErrorPermiso', () => {
    const compra = compraPendiente();

    expect(() => compra.confirmar(comprador, AHORA)).toThrow(ErrorPermiso);
    expect(compra.estado).toBe(PENDIENTE);
  });

  it('un tercero no puede confirmar, cancelar, rechazar ni marcar utilizada', () => {
    const pendiente = compraPendiente();
    const confirmada = compraConfirmada();

    expect(() => pendiente.confirmar(tercero, AHORA)).toThrow(ErrorPermiso);
    expect(() => pendiente.cancelar(tercero, AHORA)).toThrow(ErrorPermiso);
    expect(() => pendiente.rechazar(tercero, AHORA)).toThrow(ErrorPermiso);
    expect(() => confirmada.marcarUtilizada(tercero, DIA_DEL_EVENTO)).toThrow(ErrorPermiso);
  });

  it('escenario 9: el comprador no puede marcar UTILIZADA su compra → ErrorPermiso', () => {
    const compra = compraConfirmada();

    expect(() => compra.marcarUtilizada(comprador, DIA_DEL_EVENTO)).toThrow(ErrorPermiso);
  });

  it('el organizador no puede reembolsar por su cuenta una CONFIRMADA → ErrorPermiso', () => {
    const compra = compraConfirmada();

    expect(() => compra.actualizarEstado(REEMBOLSADA, organizador, AHORA)).toThrow(ErrorPermiso);
  });

  it('un organizador de otro evento no tiene permisos sobre esta compra', () => {
    const otroOrganizador = crearUsuario({ nombre: 'Marta' });
    crearEvento({ organizador: otroOrganizador });
    const compra = compraPendiente();

    expect(() => compra.confirmar(otroOrganizador, AHORA)).toThrow(ErrorPermiso);
  });
});

describe('Condiciones de fecha (FR-013, FR-015)', () => {
  it('escenario 6: no se puede cancelar una CONFIRMADA cuyo evento ya se realizó → ErrorConflicto', () => {
    const compra = compraConfirmada();

    expect(() => compra.cancelar(comprador, DESPUES_DEL_EVENTO)).toThrow(ErrorConflicto);
    expect(() => compra.cancelar(comprador, DESPUES_DEL_EVENTO)).toThrow(/ya se realizó/);
    expect(compra.estado).toBe(CONFIRMADA);
  });

  it('tampoco se puede cancelar una PENDIENTE cuyo evento ya se realizó', () => {
    const compra = compraPendiente();

    expect(() => compra.cancelar(comprador, DESPUES_DEL_EVENTO)).toThrow(ErrorConflicto);
  });

  it('el día del evento, antes de que empiece, todavía se puede cancelar', () => {
    const compra = compraConfirmada();

    compra.cancelar(comprador, en('2026-11-28T20:00:00'));

    expect(compra.estado).toBe(REEMBOLSADA);
  });

  it('escenario 8: marcar UTILIZADA el día anterior → ErrorConflicto', () => {
    const compra = compraConfirmada();

    expect(() => compra.marcarUtilizada(organizador, DIA_ANTERIOR)).toThrow(ErrorConflicto);
    expect(() => compra.marcarUtilizada(organizador, DIA_ANTERIOR)).toThrow(/día del evento/);
  });

  it('el organizador puede rechazar una PENDIENTE aunque el evento ya se haya realizado', () => {
    const compra = compraPendiente();

    compra.rechazar(organizador, DESPUES_DEL_EVENTO);

    expect(compra.estado).toBe(CANCELADA);
  });
});

describe('Transiciones inexistentes y estados finales (FR-016b, FR-017)', () => {
  it('PENDIENTE → UTILIZADA no existe → ErrorConflicto', () => {
    const compra = compraPendiente();

    expect(() => compra.actualizarEstado(UTILIZADA, organizador, DIA_DEL_EVENTO)).toThrow(ErrorConflicto);
  });

  it('escenario 5: no se puede cancelar una UTILIZADA → ErrorConflicto', () => {
    const compra = compraConfirmada();
    compra.marcarUtilizada(organizador, DIA_DEL_EVENTO);

    expect(() => compra.cancelar(comprador, DIA_DEL_EVENTO)).toThrow(ErrorConflicto);
  });

  it('escenario 13: el organizador no puede rechazar una CONFIRMADA → ErrorConflicto', () => {
    const compra = compraConfirmada();

    expect(() => compra.rechazar(organizador, AHORA)).toThrow(ErrorConflicto);
  });

  it.each([
    ['CANCELADA', (c) => c.cancelar(comprador, AHORA)],
    ['REEMBOLSADA', (c) => { c.confirmar(organizador, AHORA); c.cancelar(comprador, AHORA); }],
  ])('escenario 10: desde %s no se puede pasar a ningún estado', (_final, llevarAlFinal) => {
    const compra = compraPendiente();
    llevarAlFinal(compra);

    for (const destino of [PENDIENTE, CONFIRMADA, UTILIZADA, CANCELADA, REEMBOLSADA]) {
      expect(() => compra.actualizarEstado(destino, organizador, DIA_DEL_EVENTO)).toThrow(ErrorConflicto);
      expect(() => compra.actualizarEstado(destino, comprador, AHORA)).toThrow(ErrorConflicto);
    }
  });

  it('un estado que no existe → ErrorValidacion', () => {
    const compra = compraPendiente();

    expect(() => compra.actualizarEstado('PAGADA', organizador, AHORA)).toThrow(ErrorValidacion);
  });

  it('los motivos distinguen estado de permiso: el error nombra los estados', () => {
    const compra = compraPendiente();

    expect(() => compra.actualizarEstado(UTILIZADA, organizador, DIA_DEL_EVENTO)).toThrow(/PENDIENTE.*UTILIZADA/);
  });
});

describe('Historial (FR-011, SC-003)', () => {
  it('escenario 11: PENDIENTE → CONFIRMADA → UTILIZADA queda en orden con quién y cuándo', () => {
    const compra = compraPendiente();
    compra.confirmar(organizador, AHORA);
    compra.marcarUtilizada(organizador, DIA_DEL_EVENTO);

    expect(compra.historial.map((c) => [c.estado, c.quien, c.fechaHora])).toEqual([
      [PENDIENTE, comprador, AHORA],
      [CONFIRMADA, organizador, AHORA],
      [UTILIZADA, organizador, DIA_DEL_EVENTO],
    ]);
  });

  it('el estado actual siempre coincide con el último registro del historial', () => {
    const compra = compraPendiente();
    expect(compra.estado).toBe(compra.historial.at(-1).estado);

    compra.confirmar(organizador, AHORA);
    expect(compra.estado).toBe(compra.historial.at(-1).estado);
  });

  it('una transición rechazada no agrega historial ni cambia el estado', () => {
    const compra = compraPendiente();

    expect(() => compra.confirmar(comprador, AHORA)).toThrow();
    expect(() => compra.marcarUtilizada(organizador, AHORA)).toThrow();

    expect(compra.historial).toHaveLength(1);
    expect(compra.estado).toBe(PENDIENTE);
  });
});

describe('Inmutabilidad del estado (FR-010)', () => {
  it('no se puede asignar el estado directamente', () => {
    const compra = compraPendiente();

    expect(() => { compra.estado = CONFIRMADA; }).toThrow(TypeError);
    expect(compra.estado).toBe(PENDIENTE);
  });

  it('no se puede modificar el historial desde afuera', () => {
    const compra = compraPendiente();

    expect(() => compra.historial.push({})).toThrow(TypeError);
    expect(compra.historial).toHaveLength(1);
  });
});

describe('Comprador que también es organizador del evento', () => {
  it('puede rechazar su propia compra pendiente aunque el evento ya se haya realizado', () => {
    const compra = crearCompra({ evento, comprador: organizador });

    compra.rechazar(organizador, DESPUES_DEL_EVENTO);

    expect(compra.estado).toBe(CANCELADA);
  });

  it('puede confirmar su propia compra (es el organizador)', () => {
    const compra = crearCompra({ evento, comprador: organizador });

    compra.confirmar(organizador, AHORA);

    expect(compra.estado).toBe(CONFIRMADA);
  });
});
