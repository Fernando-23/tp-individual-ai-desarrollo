import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { appDePrueba, como } from './helpers.js';

const reseniar = (app, eventoId, usuario, body) =>
  request(app).post(`/api/eventos/${eventoId}/resenias`).set(como(usuario)).send(body);

describe('POST /api/eventos/:id/resenias (Historia 7, FR-022)', () => {
  it('escenario 1: Leo reseña Impro → 201 y el puntaje de Bruno pasa de 3 a 4', async () => {
    const { app } = appDePrueba();

    const res = await reseniar(app, 'e-impro', 'u-leo', { puntuacion: 5, detalle: 'Genial' });
    const hamlet = await request(app).get('/api/eventos/e-hamlet');

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      evento: { id: 'e-impro' },
      comprador: { id: 'u-leo' },
      puntuacion: 5,
      detalle: 'Genial',
    });
    expect(res.body.id).toBeTruthy();
    expect(hamlet.body.organizador).toMatchObject({ puntaje: 4, cantidadResenias: 2 });
  });

  it('el detalle es opcional', async () => {
    const { app } = appDePrueba();

    const res = await reseniar(app, 'e-impro', 'u-leo', { puntuacion: 4 });

    expect(res.status).toBe(201);
    expect(res.body.detalle).toBe('');
  });

  it('escenario 2: sin una compra utilizada del evento → 403', async () => {
    const { app } = appDePrueba();

    expect((await reseniar(app, 'e-impro', 'u-ana', { puntuacion: 5 })).status).toBe(403);
    expect((await reseniar(app, 'e-jazz', 'u-leo', { puntuacion: 5 })).status).toBe(403);
  });

  it('escenario 3: Sofía ya reseñó Impro → 409', async () => {
    const { app } = appDePrueba();

    const res = await reseniar(app, 'e-impro', 'u-sofi', { puntuacion: 2 });

    expect(res.status).toBe(409);
  });

  it.each([[6], [0], [4.5], ['5']])('puntuación %s → 400', async (puntuacion) => {
    const { app } = appDePrueba();

    expect((await reseniar(app, 'e-impro', 'u-leo', { puntuacion })).status).toBe(400);
  });

  it('evento inexistente → 404; sin usuario → 401', async () => {
    const { app } = appDePrueba();

    expect((await reseniar(app, 'e-nada', 'u-leo', { puntuacion: 5 })).status).toBe(404);
    expect((await request(app).post('/api/eventos/e-impro/resenias').send({ puntuacion: 5 })).status).toBe(401);
  });
});
