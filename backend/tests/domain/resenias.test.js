import { describe, it, expect, beforeEach } from 'vitest';
import { puntajeOrganizador } from '../../src/domain/reputacion.js';
import { ErrorConflicto, ErrorPermiso, ErrorValidacion } from '../../src/domain/errores.js';
import { AHORA, crearCompra, crearEvento, crearUsuario, en } from './builders.js';

const DIA_DEL_EVENTO = en('2026-11-28T22:00:00');

let organizador;
let comprador;
let evento;

beforeEach(() => {
  organizador = crearUsuario({ nombre: 'Ana' });
  comprador = crearUsuario({ nombre: 'Leo' });
  evento = crearEvento({ organizador });
});

/** Compra del comprador llevada hasta UTILIZADA en `elEvento`. */
function compraUtilizada(elEvento = evento, elComprador = comprador) {
  const compra = crearCompra({ evento: elEvento, comprador: elComprador });
  compra.confirmar(elEvento.organizador, AHORA);
  compra.marcarUtilizada(elEvento.organizador, DIA_DEL_EVENTO);
  return compra;
}

const reseniar = (datos = {}) =>
  evento.reseniar({ id: 'r1', comprador, puntuacion: 4, detalle: 'Muy bueno', ...datos });

describe('Evento.reseniar (Historia 3, FR-019 a FR-021)', () => {
  it('escenario 1: con una compra UTILIZADA, la reseña se registra en el evento', () => {
    compraUtilizada();

    const resenia = reseniar({ puntuacion: 4, detalle: 'Excelente sonido' });

    expect(resenia).toMatchObject({ comprador, evento, puntuacion: 4, detalle: 'Excelente sonido' });
    expect(evento.resenias).toEqual([resenia]);
  });

  it('el comentario puede estar vacío', () => {
    compraUtilizada();

    expect(reseniar({ detalle: '' }).detalle).toBe('');
  });

  it('escenario 2: con la compra solo CONFIRMADA → ErrorPermiso', () => {
    const compra = crearCompra({ evento, comprador });
    compra.confirmar(organizador, AHORA);

    expect(() => reseniar()).toThrow(ErrorPermiso);
    expect(evento.resenias).toHaveLength(0);
  });

  it('sin ninguna compra del evento → ErrorPermiso', () => {
    expect(() => reseniar()).toThrow(ErrorPermiso);
  });

  it('una compra UTILIZADA de otro evento no habilita a reseñar este', () => {
    const otroEvento = crearEvento({ organizador });
    compraUtilizada(otroEvento);

    expect(() => reseniar()).toThrow(ErrorPermiso);
  });

  it('escenario 3: una segunda reseña del mismo comprador → ErrorConflicto, aunque tenga otra compra utilizada', () => {
    compraUtilizada();
    compraUtilizada();
    reseniar({ id: 'r1' });

    expect(() => reseniar({ id: 'r2' })).toThrow(ErrorConflicto);
    expect(evento.resenias).toHaveLength(1);
  });

  it.each([
    ['0', 0],
    ['6', 6],
    ['4,5', 4.5],
    ['"4" como texto', '4'],
  ])('escenario 6: puntuación %s → ErrorValidacion', (_caso, puntuacion) => {
    compraUtilizada();

    expect(() => reseniar({ puntuacion })).toThrow(ErrorValidacion);
  });

  it('acepta los extremos 1 y 5', () => {
    const otro = crearUsuario({ nombre: 'Juan' });
    compraUtilizada();
    compraUtilizada(evento, otro);

    expect(reseniar({ id: 'r1', puntuacion: 1 }).puntuacion).toBe(1);
    expect(evento.reseniar({ id: 'r2', comprador: otro, puntuacion: 5, detalle: '' }).puntuacion).toBe(5);
  });

  it('las reseñas del evento no se pueden modificar desde afuera', () => {
    compraUtilizada();
    reseniar();

    expect(() => evento.resenias.push({})).toThrow(TypeError);
  });
});

describe('puntajeOrganizador (FR-022)', () => {
  it('escenario 4: reseñas de 5, 4 y 3 entre dos eventos → 4', () => {
    const otroEvento = crearEvento({ organizador });
    const [a, b, c] = [crearUsuario(), crearUsuario(), crearUsuario()];
    compraUtilizada(evento, a);
    compraUtilizada(evento, b);
    compraUtilizada(otroEvento, c);
    evento.reseniar({ id: 'r1', comprador: a, puntuacion: 5, detalle: '' });
    evento.reseniar({ id: 'r2', comprador: b, puntuacion: 4, detalle: '' });
    otroEvento.reseniar({ id: 'r3', comprador: c, puntuacion: 3, detalle: '' });

    expect(puntajeOrganizador([evento, otroEvento])).toBe(4);
  });

  it('escenario 5: sin reseñas → null ("sin puntaje"), no 0', () => {
    expect(puntajeOrganizador([evento])).toBeNull();
    expect(puntajeOrganizador([])).toBeNull();
  });

  it('los eventos sin reseñas no bajan el promedio', () => {
    const sinResenias = crearEvento({ organizador });
    compraUtilizada();
    reseniar({ puntuacion: 5 });

    expect(puntajeOrganizador([evento, sinResenias])).toBe(5);
  });
});
