import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { appDePrueba, como } from './helpers.js';

describe('Infraestructura HTTP y errores (FR-002, FR-025)', () => {
  it('GET /api/salud responde ok', async () => {
    const { app } = appDePrueba();

    const res = await request(app).get('/api/salud');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it('una ruta inexistente responde 404 con { error }', async () => {
    const { app } = appDePrueba();

    const res = await request(app).get('/api/no-existe');

    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/No existe la ruta/);
  });

  it('un JSON mal formado responde 400 con { error }', async () => {
    const { app } = appDePrueba();

    const res = await request(app)
      .post('/api/compras')
      .set(como('u-leo'))
      .set('Content-Type', 'application/json')
      .send('{ esto no es json');

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/JSON/);
  });

  it('una ruta que requiere usuario, sin header → 401', async () => {
    const { app } = appDePrueba();

    const res = await request(app).get('/api/mis-compras');

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/Elegí un usuario/);
  });

  it('con un usuario que no existe → 401', async () => {
    const { app } = appDePrueba();

    const res = await request(app).get('/api/mis-compras').set(como('u-nadie'));

    expect(res.status).toBe(401);
  });
});
