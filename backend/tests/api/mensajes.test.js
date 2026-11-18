import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { AHORA, appDePrueba, como } from './helpers.js';

const leer = (app, compraId, usuario) => request(app).get(`/api/compras/${compraId}/mensajes`).set(como(usuario));
const escribir = (app, compraId, usuario, mensaje) =>
  request(app).post(`/api/compras/${compraId}/mensajes`).set(como(usuario)).send({ mensaje });

describe('Chat de una compra (Historia 6, FR-021)', () => {
  it('escenario 2: el organizador lee los mensajes en orden', async () => {
    const { app } = appDePrueba();

    const res = await leer(app, 'k-001', 'u-ana');

    expect(res.status).toBe(200);
    expect(res.body.map((m) => [m.usuario.id, m.mensaje])).toEqual([
      ['u-leo', '¿A qué hora abren las puertas?'],
      ['u-ana', 'A las 20:00. ¡Los esperamos!'],
    ]);
  });

  it('escenario 1: el comprador escribe y el mensaje queda al final con su autor y hora', async () => {
    const { app } = appDePrueba();

    const res = await escribir(app, 'k-001', 'u-leo', 'Gracias');
    const chat = await leer(app, 'k-001', 'u-leo');

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      usuario: { id: 'u-leo', nombre: 'Leo', apellido: 'Sosa' },
      mensaje: 'Gracias',
      enviado: AHORA.toISOString(),
    });
    expect(chat.body.at(-1).mensaje).toBe('Gracias');
  });

  it('el organizador responde en una compra de su evento', async () => {
    const { app } = appDePrueba();

    expect((await escribir(app, 'k-003', 'u-bruno', 'Sí, te paso el CBU')).status).toBe(201);
  });

  it('escenario 3: un tercero no puede leer ni escribir → 403', async () => {
    const { app } = appDePrueba();

    expect((await leer(app, 'k-001', 'u-sofi')).status).toBe(403);
    expect((await escribir(app, 'k-001', 'u-sofi', 'hola')).status).toBe(403);
  });

  it('escenario 4: un mensaje vacío o sin campo → 400', async () => {
    const { app } = appDePrueba();

    expect((await escribir(app, 'k-001', 'u-leo', '   ')).status).toBe(400);
    expect((await request(app).post('/api/compras/k-001/mensajes').set(como('u-leo')).send({})).status).toBe(400);
  });

  it('compra inexistente → 404', async () => {
    const { app } = appDePrueba();

    expect((await leer(app, 'k-nada', 'u-leo')).status).toBe(404);
  });
});
