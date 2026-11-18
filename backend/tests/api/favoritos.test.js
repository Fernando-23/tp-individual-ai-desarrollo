import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { appDePrueba, como } from './helpers.js';

const idsFavoritos = async (app, usuario) =>
  (await request(app).get('/api/mis-favoritos').set(como(usuario))).body.map((e) => e.id);

describe('Favoritos (FR-024)', () => {
  it('lista los favoritos del usuario actual, en el orden en que los marcó', async () => {
    const { app } = appDePrueba();

    const res = await request(app).get('/api/mis-favoritos').set(como('u-leo'));

    expect(res.status).toBe(200);
    expect(res.body.map((e) => e.id)).toEqual(['e-rock', 'e-hamlet']);
    expect(res.body[0]).toHaveProperty('precioDesde');
  });

  it('PUT marca un favorito (204) y no lo duplica si se repite', async () => {
    const { app } = appDePrueba();

    expect((await request(app).put('/api/mis-favoritos/e-jazz').set(como('u-leo'))).status).toBe(204);
    await request(app).put('/api/mis-favoritos/e-jazz').set(como('u-leo'));

    expect(await idsFavoritos(app, 'u-leo')).toEqual(['e-rock', 'e-hamlet', 'e-jazz']);
  });

  it('DELETE desmarca (204); desmarcar algo que no está también es 204', async () => {
    const { app } = appDePrueba();

    expect((await request(app).delete('/api/mis-favoritos/e-rock').set(como('u-leo'))).status).toBe(204);
    expect((await request(app).delete('/api/mis-favoritos/e-jazz').set(como('u-leo'))).status).toBe(204);

    expect(await idsFavoritos(app, 'u-leo')).toEqual(['e-hamlet']);
  });

  it('cada usuario tiene sus propios favoritos', async () => {
    const { app } = appDePrueba();

    expect(await idsFavoritos(app, 'u-sofi')).toEqual([]);
  });

  it('un evento inexistente → 404', async () => {
    const { app } = appDePrueba();

    expect((await request(app).put('/api/mis-favoritos/e-nada').set(como('u-leo'))).status).toBe(404);
    expect((await request(app).delete('/api/mis-favoritos/e-nada').set(como('u-leo'))).status).toBe(404);
  });

  it('sin usuario → 401', async () => {
    const { app } = appDePrueba();

    expect((await request(app).get('/api/mis-favoritos')).status).toBe(401);
  });
});
