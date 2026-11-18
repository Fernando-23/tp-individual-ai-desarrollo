import { describe, it, expect } from 'vitest';
import { Compra } from '../../src/domain/compra.js';
import { EstadoCompra } from '../../src/domain/estadoCompra.js';
import { ErrorConflicto, ErrorValidacion } from '../../src/domain/errores.js';
import { AHORA, crearCompra, crearEvento, crearTipoEntrada, crearUsuario } from './builders.js';

function eventoConPlatea({ cupo = 100, precio = 5000 } = {}) {
  const platea = crearTipoEntrada({ nombre: 'Platea', cupo, precio });
  const evento = crearEvento({ tiposEntrada: [platea] });
  return { evento, platea };
}

describe('Compra.crear: comprar sin superar el cupo y a precio correcto (Historia 1)', () => {
  it('escenario 1: 4 Platea a $5.000 → PENDIENTE, total $20.000 y quedan 96', () => {
    const { evento, platea } = eventoConPlatea({ cupo: 100, precio: 5000 });

    const compra = crearCompra({ evento, tipoEntrada: platea, cantidad: 4 });

    expect(compra.estado).toBe(EstadoCompra.PENDIENTE);
    expect(compra.total).toBe(20000);
    expect(compra.cantidad).toBe(4);
    expect(platea.cupoDisponible()).toBe(96);
  });

  it('escenario 2: pedir 4 con 3 disponibles → ErrorConflicto, y el disponible sigue en 3', () => {
    const { evento, platea } = eventoConPlatea({ cupo: 3 });

    expect(() => crearCompra({ evento, tipoEntrada: platea, cantidad: 4 })).toThrow(ErrorConflicto);
    expect(platea.cupoDisponible()).toBe(3);
    expect(platea.compras).toHaveLength(0);
  });

  it('escenario 3: pedir exactamente las 3 disponibles → se acepta y queda 0', () => {
    const { evento, platea } = eventoConPlatea({ cupo: 3 });

    crearCompra({ evento, tipoEntrada: platea, cantidad: 3 });

    expect(platea.cupoDisponible()).toBe(0);
  });

  it.each([
    ['0', 0],
    ['negativa', -1],
    ['con decimales', 1.5],
    ['como texto', '2'],
  ])('escenario 5: cantidad %s → ErrorValidacion', (_caso, cantidad) => {
    const { evento, platea } = eventoConPlatea();

    expect(() => crearCompra({ evento, tipoEntrada: platea, cantidad })).toThrow(ErrorValidacion);
  });

  it('rechaza un tipo de entrada que no pertenece al evento', () => {
    const { evento } = eventoConPlatea();
    const deOtroEvento = crearTipoEntrada({ nombre: 'VIP' });
    crearEvento({ tiposEntrada: [deOtroEvento] });

    expect(() => crearCompra({ evento, tipoEntrada: deOtroEvento })).toThrow(ErrorValidacion);
  });

  it('el historial arranca con un registro PENDIENTE a nombre del comprador (FR-009)', () => {
    const comprador = crearUsuario();

    const compra = crearCompra({ comprador, ahora: AHORA });

    expect(compra.historial).toHaveLength(1);
    expect(compra.historial[0]).toMatchObject({
      compra,
      estado: EstadoCompra.PENDIENTE,
      quien: comprador,
      fechaHora: AHORA,
    });
  });

  it('el total no cambia si después cambia el precio del tipo de entrada (FR-008)', () => {
    const { evento, platea } = eventoConPlatea({ precio: 5000 });
    const compra = crearCompra({ evento, tipoEntrada: platea, cantidad: 2 });

    platea.precio = 8000;

    expect(compra.total).toBe(10000);
  });

  it('dos compras que juntas superan el cupo: la segunda se rechaza', () => {
    const { evento, platea } = eventoConPlatea({ cupo: 5 });
    crearCompra({ evento, tipoEntrada: platea, cantidad: 3 });

    expect(() => crearCompra({ evento, tipoEntrada: platea, cantidad: 3 })).toThrow(ErrorConflicto);
    expect(platea.cupoDisponible()).toBe(2);
  });

  it('un organizador puede comprar entradas de su propio evento', () => {
    const organizador = crearUsuario({ nombre: 'Ana' });
    const evento = crearEvento({ organizador });

    expect(() => crearCompra({ evento, comprador: organizador })).not.toThrow();
  });

  it('no se puede crear una compra con new: solo con Compra.crear', () => {
    expect(() => new Compra({})).toThrow(Error);
  });
});
