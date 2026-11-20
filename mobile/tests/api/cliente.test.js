import { describe, it, expect, vi } from 'vitest';
import { crearCliente, ErrorApi } from '../../src/api/cliente.js';

const BASE = 'http://192.168.0.3:3000/api';

function respuesta(status, cuerpo) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => cuerpo,
  };
}

function armar({ fetch, usuarioId = 'u-leo', alNoIdentificado = vi.fn(), timeoutMs = 50 } = {}) {
  const cliente = crearCliente({
    baseUrl: BASE,
    obtenerUsuarioId: () => usuarioId,
    alNoIdentificado,
    fetch,
    timeoutMs,
  });
  return { cliente, alNoIdentificado };
}

describe('crearCliente', () => {
  it('GET: arma la URL, manda X-Usuario-Id y devuelve el JSON', async () => {
    const fetch = vi.fn().mockResolvedValue(respuesta(200, [{ id: 'e-1' }]));
    const { cliente } = armar({ fetch });

    const datos = await cliente.get('/eventos?texto=jazz');

    expect(datos).toEqual([{ id: 'e-1' }]);
    const [url, opciones] = fetch.mock.calls[0];
    expect(url).toBe(`${BASE}/eventos?texto=jazz`);
    expect(opciones.method).toBe('GET');
    expect(opciones.headers['X-Usuario-Id']).toBe('u-leo');
  });

  it('sin usuario elegido no manda el header', async () => {
    const fetch = vi.fn().mockResolvedValue(respuesta(200, []));
    const { cliente } = armar({ fetch, usuarioId: null });

    await cliente.get('/usuarios');

    expect(fetch.mock.calls[0][1].headers).not.toHaveProperty('X-Usuario-Id');
  });

  it('POST: manda el cuerpo en JSON con su Content-Type', async () => {
    const fetch = vi.fn().mockResolvedValue(respuesta(201, { id: 'k-1' }));
    const { cliente } = armar({ fetch });

    await cliente.post('/compras', { cantidad: 2 });

    const opciones = fetch.mock.calls[0][1];
    expect(opciones.method).toBe('POST');
    expect(opciones.headers['Content-Type']).toBe('application/json');
    expect(opciones.body).toBe('{"cantidad":2}');
  });

  it('204 → null', async () => {
    const fetch = vi.fn().mockResolvedValue(respuesta(204));
    const { cliente } = armar({ fetch });

    expect(await cliente.put('/mis-favoritos/e-1')).toBeNull();
    expect(fetch.mock.calls[0][1].method).toBe('PUT');
  });

  it('un error del servidor → ErrorApi con su status y su mensaje en español', async () => {
    const fetch = vi.fn().mockResolvedValue(respuesta(409, { error: 'No hay cupo suficiente' }));
    const { cliente } = armar({ fetch });

    const error = await cliente.post('/compras', {}).catch((e) => e);

    expect(error).toBeInstanceOf(ErrorApi);
    expect(error.status).toBe(409);
    expect(error.mensaje).toBe('No hay cupo suficiente');
    expect(error.message).toBe('No hay cupo suficiente');
  });

  it('un error sin cuerpo legible → mensaje genérico', async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => { throw new Error('no json'); } });
    const { cliente } = armar({ fetch });

    const error = await cliente.get('/eventos').catch((e) => e);

    expect(error.status).toBe(500);
    expect(error.mensaje).toMatch(/inesperado/i);
  });

  it('si fetch falla (sin red) → ErrorApi status 0 con un mensaje de conexión', async () => {
    const fetch = vi.fn().mockRejectedValue(new TypeError('Network request failed'));
    const { cliente } = armar({ fetch });

    const error = await cliente.get('/eventos').catch((e) => e);

    expect(error).toBeInstanceOf(ErrorApi);
    expect(error.status).toBe(0);
    expect(error.mensaje).toMatch(/conexión con el servidor/);
  });

  it('si el servidor no responde a tiempo → ErrorApi status 0', async () => {
    const fetch = vi.fn((url, { signal }) => new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' })));
    }));
    const { cliente } = armar({ fetch, timeoutMs: 20 });

    const error = await cliente.get('/eventos').catch((e) => e);

    expect(error.status).toBe(0);
    expect(error.mensaje).toMatch(/no respondió/);
  });

  it('401 → avisa con alNoIdentificado y lanza', async () => {
    const fetch = vi.fn().mockResolvedValue(respuesta(401, { error: 'Elegí un usuario válido' }));
    const { cliente, alNoIdentificado } = armar({ fetch });

    const error = await cliente.get('/mis-compras').catch((e) => e);

    expect(alNoIdentificado).toHaveBeenCalledOnce();
    expect(error.status).toBe(401);
  });
});
