import { describe, it, expect } from 'vitest';
import { Usuario } from '../../src/domain/usuario.js';
import { ErrorValidacion } from '../../src/domain/errores.js';

describe('Usuario (FR-025)', () => {
  it('se crea con id, nombre y apellido', () => {
    const usuario = new Usuario({ id: 'u1', nombre: 'Ana', apellido: 'Paz' });

    expect(usuario.id).toBe('u1');
    expect(usuario.nombre).toBe('Ana');
    expect(usuario.apellido).toBe('Paz');
  });

  it('recorta los espacios del nombre y el apellido', () => {
    const usuario = new Usuario({ id: 'u1', nombre: '  Ana ', apellido: ' Paz  ' });

    expect(usuario.nombre).toBe('Ana');
    expect(usuario.apellido).toBe('Paz');
  });

  it.each([
    ['sin id', { nombre: 'Ana', apellido: 'Paz' }],
    ['id vacío', { id: '', nombre: 'Ana', apellido: 'Paz' }],
    ['sin nombre', { id: 'u1', apellido: 'Paz' }],
    ['nombre de espacios', { id: 'u1', nombre: '   ', apellido: 'Paz' }],
    ['sin apellido', { id: 'u1', nombre: 'Ana' }],
    ['apellido vacío', { id: 'u1', nombre: 'Ana', apellido: '' }],
  ])('rechaza un usuario %s', (_caso, datos) => {
    expect(() => new Usuario(datos)).toThrow(ErrorValidacion);
  });

  it('arranca sin favoritos', () => {
    const usuario = new Usuario({ id: 'u1', nombre: 'Ana', apellido: 'Paz' });

    expect(usuario.favoritos).toEqual([]);
  });
});
