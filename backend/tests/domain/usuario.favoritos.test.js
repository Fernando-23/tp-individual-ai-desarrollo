import { describe, it, expect, beforeEach } from 'vitest';
import { crearEvento, crearUsuario } from './builders.js';

let usuario;
let recital;
let obra;

beforeEach(() => {
  usuario = crearUsuario();
  recital = crearEvento({ nombre: 'Recital' });
  obra = crearEvento({ nombre: 'Obra' });
});

describe('Usuario: favoritos (Historia 5, FR-026)', () => {
  it('escenario 5: agregar dos veces el mismo evento lo deja una sola vez', () => {
    usuario.agregarFavorito(recital);
    usuario.agregarFavorito(recital);

    expect(usuario.favoritos).toEqual([recital]);
  });

  it('escenario 5: quitar un favorito lo saca', () => {
    usuario.agregarFavorito(recital);
    usuario.agregarFavorito(obra);

    usuario.quitarFavorito(recital);

    expect(usuario.favoritos).toEqual([obra]);
  });

  it('quitar un evento que no está no falla', () => {
    expect(() => usuario.quitarFavorito(recital)).not.toThrow();
    expect(usuario.favoritos).toEqual([]);
  });

  it('esFavorito responde según la lista', () => {
    usuario.agregarFavorito(recital);

    expect(usuario.esFavorito(recital)).toBe(true);
    expect(usuario.esFavorito(obra)).toBe(false);
  });

  it('la lista de favoritos no se puede modificar desde afuera', () => {
    expect(() => usuario.favoritos.push(recital)).toThrow(TypeError);
    expect(usuario.favoritos).toEqual([]);
  });
});
