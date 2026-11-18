import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { appDePrueba } from './helpers.js';

describe('GET /api/usuarios (Historia 1, FR-001)', () => {
  it('escenario 1: lista los 4 usuarios del seed con id, nombre y apellido', async () => {
    const { app } = appDePrueba();

    const res = await request(app).get('/api/usuarios');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(4);
    expect(res.body).toContainEqual({ id: 'u-ana', nombre: 'Ana', apellido: 'Paz' });
    expect(res.body).toContainEqual({ id: 'u-leo', nombre: 'Leo', apellido: 'Sosa' });
  });

  it('no requiere usuario actual: es la lista para elegir uno', async () => {
    const { app } = appDePrueba();

    expect((await request(app).get('/api/usuarios')).status).toBe(200);
  });
});
