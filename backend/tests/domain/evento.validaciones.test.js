import { describe, it, expect } from 'vitest';
import { Evento } from '../../src/domain/evento.js';
import { ErrorValidacion } from '../../src/domain/errores.js';
import { crearCategoria, crearTipoEntrada, crearUsuario, en } from './builders.js';

function datosValidos() {
  return {
    id: 'e1',
    nombre: 'Recital',
    descripcion: 'En vivo',
    categoria: crearCategoria(),
    fecha: en('2026-11-28T21:00:00'),
    tiposEntrada: [crearTipoEntrada({ nombre: 'General' }), crearTipoEntrada({ nombre: 'VIP' })],
    multimedia: ['https://ejemplo.com/afiche.jpg'],
    organizador: crearUsuario(),
  };
}

describe('Evento: validaciones (Historia 5, FR-001, FR-002)', () => {
  it('se crea con todos sus datos válidos', () => {
    const evento = new Evento(datosValidos());

    expect(evento.nombre).toBe('Recital');
    expect(evento.tiposEntrada).toHaveLength(2);
  });

  it('acepta multimedia vacío', () => {
    expect(() => new Evento({ ...datosValidos(), multimedia: [] })).not.toThrow();
  });

  it('escenario 1: sin tipos de entrada → ErrorValidacion', () => {
    expect(() => new Evento({ ...datosValidos(), tiposEntrada: [] })).toThrow(ErrorValidacion);
    expect(() => new Evento({ ...datosValidos(), tiposEntrada: undefined })).toThrow(ErrorValidacion);
  });

  it('escenario 2: un tipo con cupo 0 o precio negativo no se puede ni crear', () => {
    expect(() => crearTipoEntrada({ cupo: 0 })).toThrow(ErrorValidacion);
    expect(() => crearTipoEntrada({ precio: -100 })).toThrow(ErrorValidacion);
  });

  it.each([
    ['nombre vacío', { nombre: '  ' }],
    ['descripción vacía', { descripcion: '' }],
    ['categoría que no es una Categoria', { categoria: { nombre: 'Recitales' } }],
    ['organizador que no es un Usuario', { organizador: { id: 'u1' } }],
    ['fecha inválida', { fecha: new Date('no es fecha') }],
    ['fecha como texto', { fecha: '2026-11-28' }],
    ['multimedia que no es arreglo', { multimedia: 'foto.jpg' }],
    ['multimedia con algo que no es texto', { multimedia: [42] }],
    ['tipos de entrada que no son TipoEntrada', { tiposEntrada: [{ nombre: 'General' }] }],
  ])('rechaza %s', (_caso, cambio) => {
    expect(() => new Evento({ ...datosValidos(), ...cambio })).toThrow(ErrorValidacion);
  });

  it('rechaza dos tipos de entrada con el mismo nombre ("VIP" y " vip ")', () => {
    const tiposEntrada = [crearTipoEntrada({ nombre: 'VIP' }), crearTipoEntrada({ nombre: ' vip ' })];

    expect(() => new Evento({ ...datosValidos(), tiposEntrada })).toThrow(ErrorValidacion);
  });
});
