import { describe, it, expect } from 'vitest';
import { RepositorioEnMemoria, crearRepositorios } from '../../src/repositories/repositorioEnMemoria.js';

describe('RepositorioEnMemoria', () => {
  it('guarda, busca por id y lista en orden de inserción', () => {
    const repo = new RepositorioEnMemoria();
    const a = { id: 'a' };
    const b = { id: 'b' };

    expect(repo.guardar(a)).toBe(a);
    repo.guardar(b);

    expect(repo.buscarPorId('b')).toBe(b);
    expect(repo.buscarPorId('x')).toBeUndefined();
    expect(repo.todos()).toEqual([a, b]);
  });

  it('guardar con un id existente reemplaza sin duplicar', () => {
    const repo = new RepositorioEnMemoria();
    repo.guardar({ id: 'a', v: 1 });
    repo.guardar({ id: 'a', v: 2 });

    expect(repo.todos()).toEqual([{ id: 'a', v: 2 }]);
  });

  it('filtra con un predicado', () => {
    const repo = new RepositorioEnMemoria();
    [1, 2, 3, 4].forEach((n) => repo.guardar({ id: `n${n}`, n }));

    expect(repo.filtrar((x) => x.n % 2 === 0).map((x) => x.id)).toEqual(['n2', 'n4']);
  });
});

describe('crearRepositorios', () => {
  it('devuelve los 4 repositorios, independientes entre sí y entre llamadas', () => {
    const uno = crearRepositorios();
    const otro = crearRepositorios();
    uno.usuarios.guardar({ id: 'u1' });

    expect(Object.keys(uno).sort()).toEqual(['categorias', 'compras', 'eventos', 'usuarios']);
    expect(uno.eventos.todos()).toEqual([]);
    expect(otro.usuarios.todos()).toEqual([]);
  });
});
