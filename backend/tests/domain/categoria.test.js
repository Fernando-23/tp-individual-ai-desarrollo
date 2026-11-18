import { describe, it, expect } from 'vitest';
import { Categoria, normalizarNombre } from '../../src/domain/categoria.js';
import { ErrorValidacion } from '../../src/domain/errores.js';

describe('Categoria', () => {
  it('se crea con id, nombre y descripción', () => {
    const categoria = new Categoria({ id: 'c1', nombre: 'Teatro', descripcion: 'Obras en sala' });

    expect(categoria).toMatchObject({ id: 'c1', nombre: 'Teatro', descripcion: 'Obras en sala' });
  });

  it.each([
    ['sin nombre', { id: 'c1', descripcion: 'x' }],
    ['nombre vacío', { id: 'c1', nombre: ' ', descripcion: 'x' }],
    ['sin descripción', { id: 'c1', nombre: 'Teatro' }],
    ['sin id', { nombre: 'Teatro', descripcion: 'x' }],
  ])('rechaza una categoría %s', (_caso, datos) => {
    expect(() => new Categoria(datos)).toThrow(ErrorValidacion);
  });
});

describe('normalizarNombre (base de FR-027)', () => {
  it('ignora mayúsculas y espacios de más', () => {
    expect(normalizarNombre('  Recitales ')).toBe(normalizarNombre('recitales'));
    expect(normalizarNombre('Stand   Up')).toBe(normalizarNombre('stand up'));
  });

  it('distingue nombres distintos', () => {
    expect(normalizarNombre('Teatro')).not.toBe(normalizarNombre('Recitales'));
  });
});
