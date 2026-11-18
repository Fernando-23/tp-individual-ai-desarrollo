import { describe, it, expect } from 'vitest';
import { TipoEntrada } from '../../src/domain/tipoEntrada.js';
import { ErrorValidacion } from '../../src/domain/errores.js';
import { AHORA, crearCompra, crearEvento, crearTipoEntrada } from './builders.js';

const datosValidos = { id: 't1', nombre: 'Platea', descripcion: 'Butacas', precio: 5000, cupo: 100 };

describe('TipoEntrada: validaciones (FR-002)', () => {
  it('se crea con nombre, descripción, precio y cupo', () => {
    expect(new TipoEntrada(datosValidos)).toMatchObject(datosValidos);
  });

  it('acepta precio 0 (evento gratuito) y descripción vacía', () => {
    const tipo = new TipoEntrada({ ...datosValidos, precio: 0, descripcion: '' });

    expect(tipo.precio).toBe(0);
    expect(tipo.descripcion).toBe('');
  });

  it.each([
    ['precio negativo', { precio: -1 }],
    ['precio NaN', { precio: NaN }],
    ['precio como texto', { precio: '5000' }],
    ['cupo 0', { cupo: 0 }],
    ['cupo negativo', { cupo: -5 }],
    ['cupo con decimales', { cupo: 1.5 }],
    ['nombre vacío', { nombre: '  ' }],
  ])('rechaza %s', (_caso, cambio) => {
    expect(() => new TipoEntrada({ ...datosValidos, ...cambio })).toThrow(ErrorValidacion);
  });
});

describe('TipoEntrada: cupo disponible (FR-004, FR-005)', () => {
  function eventoConPlatea(cupo) {
    const platea = crearTipoEntrada({ nombre: 'Platea', cupo });
    const evento = crearEvento({ tiposEntrada: [platea] });
    return { evento, platea };
  }

  it('sin compras, el disponible es el cupo total', () => {
    const { platea } = eventoConPlatea(100);

    expect(platea.cupoDisponible()).toBe(100);
  });

  it('cada compra descuenta su cantidad', () => {
    const { evento, platea } = eventoConPlatea(100);
    crearCompra({ evento, tipoEntrada: platea, cantidad: 4 });
    crearCompra({ evento, tipoEntrada: platea, cantidad: 10 });

    expect(platea.cupoDisponible()).toBe(86);
    expect(platea.compras).toHaveLength(2);
  });

  it('hayCupoPara es verdadero justo hasta el disponible', () => {
    const { evento, platea } = eventoConPlatea(5);
    crearCompra({ evento, tipoEntrada: platea, cantidad: 2 });

    expect(platea.hayCupoPara(3)).toBe(true);
    expect(platea.hayCupoPara(4)).toBe(false);
  });

  it('al cancelar o reembolsar una compra, su cupo vuelve a estar disponible (escenario 4)', () => {
    const { evento, platea } = eventoConPlatea(10);
    const pendiente = crearCompra({ evento, tipoEntrada: platea, cantidad: 2 });
    const confirmada = crearCompra({ evento, tipoEntrada: platea, cantidad: 3 });
    confirmada.confirmar(evento.organizador, AHORA);
    expect(platea.cupoDisponible()).toBe(5);

    pendiente.cancelar(pendiente.comprador, AHORA);
    expect(platea.cupoDisponible()).toBe(7);

    confirmada.cancelar(confirmada.comprador, AHORA);
    expect(platea.cupoDisponible()).toBe(10);
  });
});
