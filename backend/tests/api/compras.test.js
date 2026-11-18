import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { appDePrueba, como } from './helpers.js';

const comprar = (app, usuario, body) => request(app).post('/api/compras').set(como(usuario)).send(body);
const disponiblesDe = async (app, eventoId, tipoId) =>
  (await request(app).get(`/api/eventos/${eventoId}`)).body.tiposEntrada.find((t) => t.id === tipoId).disponibles;

describe('POST /api/compras (Historia 3, FR-015)', () => {
  it('escenario 1: Sofía compra 2 VIP de Rock → 201 PENDIENTE, total calculado, baja la disponibilidad', async () => {
    const { app } = appDePrueba();
    const antes = await disponiblesDe(app, 'e-rock', 't-rock-vip');

    const res = await comprar(app, 'u-sofi', { eventoId: 'e-rock', tipoEntradaId: 't-rock-vip', cantidad: 2 });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      estado: 'PENDIENTE',
      total: 70000,
      cantidad: 2,
      comprador: { id: 'u-sofi' },
      organizador: { id: 'u-ana' },
      evento: { id: 'e-rock' },
      tipoEntrada: { id: 't-rock-vip', nombre: 'VIP' },
    });
    expect(res.body.historial).toHaveLength(1);
    expect(await disponiblesDe(app, 'e-rock', 't-rock-vip')).toBe(antes - 2);
  });

  it('el total lo calcula el servidor aunque el cliente mande otro', async () => {
    const { app } = appDePrueba();

    const res = await comprar(app, 'u-sofi', { eventoId: 'e-rock', tipoEntradaId: 't-rock-vip', cantidad: 1, total: 1 });

    expect(res.body.total).toBe(35000);
  });

  it('escenario 2: pedir más que lo disponible → 409 y la disponibilidad no cambia', async () => {
    const { app } = appDePrueba();

    const res = await comprar(app, 'u-sofi', { eventoId: 'e-jazz', tipoEntradaId: 't-jazz-vip', cantidad: 19 });

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/cupo/);
    expect(await disponiblesDe(app, 'e-jazz', 't-jazz-vip')).toBe(18);
  });

  it.each([
    ['cantidad como texto', { cantidad: '2' }],
    ['cantidad 0', { cantidad: 0 }],
    ['sin cantidad', { cantidad: undefined }],
    ['evento inexistente', { eventoId: 'e-nada' }],
    ['tipo inexistente', { tipoEntradaId: 't-nada' }],
    ['tipo de otro evento', { tipoEntradaId: 't-jazz-vip' }],
  ])('%s → 400', async (_caso, cambio) => {
    const { app } = appDePrueba();

    const res = await comprar(app, 'u-sofi', { eventoId: 'e-rock', tipoEntradaId: 't-rock-vip', cantidad: 1, ...cambio });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeTruthy();
  });

  it('comprar para un evento que ya se realizó → 409', async () => {
    const { app } = appDePrueba();

    const res = await comprar(app, 'u-sofi', { eventoId: 'e-tango', tipoEntradaId: 't-tango-general', cantidad: 1 });

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/ya se realizó/);
  });

  it('sin usuario → 401', async () => {
    const { app } = appDePrueba();

    const res = await request(app).post('/api/compras').send({ eventoId: 'e-rock', tipoEntradaId: 't-rock-vip', cantidad: 1 });

    expect(res.status).toBe(401);
  });
});

describe('GET /api/mis-compras (Historia 3, FR-016)', () => {
  it('escenario 3: Leo ve solo sus compras, ordenadas por fecha del evento', async () => {
    const { app } = appDePrueba();

    const res = await request(app).get('/api/mis-compras').set(como('u-leo'));

    expect(res.status).toBe(200);
    expect(res.body.map((c) => c.id)).toEqual(['k-009', 'k-007', 'k-003', 'k-001', 'k-011', 'k-005']);
    expect(res.body.every((c) => c.evento && c.tipoEntrada && c.total !== undefined)).toBe(true);
  });

  it('escenario 4: la confirmada indica los días que faltan; las demás, null', async () => {
    const { app } = appDePrueba();

    const res = await request(app).get('/api/mis-compras').set(como('u-leo'));
    const porId = Object.fromEntries(res.body.map((c) => [c.id, c]));

    expect(porId['k-001']).toMatchObject({ estado: 'CONFIRMADA', diasRestantes: 10 });
    expect(porId['k-003']).toMatchObject({ estado: 'PENDIENTE', diasRestantes: null });
    expect(porId['k-007']).toMatchObject({ estado: 'UTILIZADA', diasRestantes: null });
  });
});

describe('GET /api/compras/:id (Historia 3, FR-017)', () => {
  it('el comprador ve el detalle con historial y mensajes', async () => {
    const { app } = appDePrueba();

    const res = await request(app).get('/api/compras/k-001').set(como('u-leo'));

    expect(res.status).toBe(200);
    expect(res.body.historial.map((h) => h.estado)).toEqual(['PENDIENTE', 'CONFIRMADA']);
    expect(res.body.historial[1].quien.id).toBe('u-ana');
    expect(res.body.mensajes).toHaveLength(2);
  });

  it('el organizador del evento también la ve', async () => {
    const { app } = appDePrueba();

    expect((await request(app).get('/api/compras/k-001').set(como('u-ana'))).status).toBe(200);
  });

  it('escenario 5: otro usuario → 403', async () => {
    const { app } = appDePrueba();

    const res = await request(app).get('/api/compras/k-001').set(como('u-sofi'));

    expect(res.status).toBe(403);
  });

  it('una compra inexistente → 404', async () => {
    const { app } = appDePrueba();

    expect((await request(app).get('/api/compras/k-nada').set(como('u-leo'))).status).toBe(404);
  });
});
