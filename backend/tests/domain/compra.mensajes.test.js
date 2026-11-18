import { describe, it, expect, beforeEach } from 'vitest';
import { ErrorPermiso, ErrorValidacion } from '../../src/domain/errores.js';
import { AHORA, crearCompra, crearEvento, crearUsuario, en } from './builders.js';

let organizador;
let comprador;
let tercero;
let compra;

beforeEach(() => {
  organizador = crearUsuario({ nombre: 'Ana' });
  comprador = crearUsuario({ nombre: 'Leo' });
  tercero = crearUsuario({ nombre: 'Juan' });
  compra = crearCompra({ evento: crearEvento({ organizador }), comprador });
});

describe('Compra.enviarMensaje (Historia 4, FR-023, FR-024)', () => {
  it('escenarios 1 y 2: el comprador pregunta y el organizador responde, en orden', () => {
    const despues = en('2026-11-18T16:00:00');

    const pregunta = compra.enviarMensaje(comprador, '¿Hay estacionamiento?', AHORA);
    const respuesta = compra.enviarMensaje(organizador, 'Sí, en la esquina', despues);

    expect(compra.mensajes).toEqual([pregunta, respuesta]);
    expect(pregunta).toMatchObject({ usuario: comprador, mensaje: '¿Hay estacionamiento?', enviado: AHORA });
    expect(respuesta).toMatchObject({ usuario: organizador, mensaje: 'Sí, en la esquina', enviado: despues });
  });

  it('escenario 3: un tercero no puede escribir → ErrorPermiso', () => {
    expect(() => compra.enviarMensaje(tercero, 'Hola', AHORA)).toThrow(ErrorPermiso);
    expect(compra.mensajes).toHaveLength(0);
  });

  it('escenario 4: se puede escribir con la compra CANCELADA', () => {
    compra.cancelar(comprador, AHORA);

    compra.enviarMensaje(comprador, '¿Cuándo llega el reembolso?', AHORA);

    expect(compra.mensajes).toHaveLength(1);
  });

  it('escenario 4: se puede escribir con la compra UTILIZADA', () => {
    compra.confirmar(organizador, AHORA);
    compra.marcarUtilizada(organizador, en('2026-11-28T22:00:00'));

    compra.enviarMensaje(organizador, '¡Gracias por venir!', en('2026-11-29T10:00:00'));

    expect(compra.mensajes).toHaveLength(1);
  });

  it.each([
    ['vacío', ''],
    ['de espacios', '   '],
  ])('escenario 5: un mensaje %s → ErrorValidacion', (_caso, texto) => {
    expect(() => compra.enviarMensaje(comprador, texto, AHORA)).toThrow(ErrorValidacion);
  });

  it('guarda el texto sin espacios al principio ni al final', () => {
    expect(compra.enviarMensaje(comprador, '  hola  ', AHORA).mensaje).toBe('hola');
  });

  it('los mensajes son inmutables y la lista no se puede modificar desde afuera', () => {
    const mensaje = compra.enviarMensaje(comprador, 'hola', AHORA);

    expect(() => compra.mensajes.push({})).toThrow(TypeError);
    expect(() => { mensaje.mensaje = 'otro'; }).toThrow(TypeError);
  });
});
