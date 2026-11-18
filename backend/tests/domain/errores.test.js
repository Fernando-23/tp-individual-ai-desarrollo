import { describe, it, expect } from 'vitest';
import {
  ErrorDeDominio,
  ErrorValidacion,
  ErrorPermiso,
  ErrorConflicto,
} from '../../src/domain/errores.js';

describe('errores de dominio', () => {
  it.each([
    ['ErrorValidacion', ErrorValidacion],
    ['ErrorPermiso', ErrorPermiso],
    ['ErrorConflicto', ErrorConflicto],
  ])('%s es un ErrorDeDominio y un Error, con su nombre y mensaje', (nombre, Clase) => {
    const error = new Clase('algo salió mal');

    expect(error).toBeInstanceOf(ErrorDeDominio);
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe(nombre);
    expect(error.message).toBe('algo salió mal');
  });

  it('las tres clases se distinguen entre sí', () => {
    expect(new ErrorPermiso('x')).not.toBeInstanceOf(ErrorConflicto);
    expect(new ErrorConflicto('x')).not.toBeInstanceOf(ErrorValidacion);
  });
});
