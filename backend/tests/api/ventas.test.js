import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { appDePrueba, como } from './helpers.js';

const accion = (app, compraId, nombre, usuario) =>
  request(app).post(`/api/compras/${compraId}/${nombre}`).set(como(usuario));

describe('GET /api/eventos/:id/ventas (Historia 4, FR-019)', () => {
  it('escenario 1: Ana ve las compras de Jazz y, por tipo, cupo, ocupadas y disponibles', async () => {
    const { app } = appDePrueba();

    const res = await request(app).get('/api/eventos/e-jazz/ventas').set(como('u-ana'));

    expect(res.status).toBe(200);
    expect(res.body.evento).toMatchObject({ id: 'e-jazz', nombre: 'Noche de Jazz' });
    expect(res.body.tiposEntrada).toEqual([
      { id: 't-jazz-general', nombre: 'General', precio: 8000, cupo: 150, ocupadas: 4, disponibles: 146 },
      { id: 't-jazz-vip', nombre: 'VIP', precio: 20000, cupo: 20, ocupadas: 2, disponibles: 18 },
    ]);
    expect(res.body.cantidadPorEstado).toEqual({
      PENDIENTE: 1, CONFIRMADA: 1, UTILIZADA: 0, CANCELADA: 0, REEMBOLSADA: 0,
    });
    expect(res.body.compras.map((c) => [c.id, c.comprador.id, c.estado])).toEqual([
      ['k-002', 'u-sofi', 'PENDIENTE'],
      ['k-001', 'u-leo', 'CONFIRMADA'],
    ]);
  });

  it('escenario 2: alguien que no es el organizador → 403', async () => {
    const { app } = appDePrueba();

    expect((await request(app).get('/api/eventos/e-jazz/ventas').set(como('u-leo'))).status).toBe(403);
    expect((await request(app).get('/api/eventos/e-jazz/ventas').set(como('u-bruno'))).status).toBe(403);
  });

  it('evento inexistente → 404; sin usuario → 401', async () => {
    const { app } = appDePrueba();

    expect((await request(app).get('/api/eventos/e-nada/ventas').set(como('u-ana'))).status).toBe(404);
    expect((await request(app).get('/api/eventos/e-jazz/ventas')).status).toBe(401);
  });
});

describe('GET /api/mis-eventos (requisito derivado de FR-019)', () => {
  it('Ana ve sus 4 eventos, incluido el pasado, por fecha', async () => {
    const { app } = appDePrueba();

    const res = await request(app).get('/api/mis-eventos').set(como('u-ana'));

    expect(res.status).toBe(200);
    expect(res.body.map((e) => e.id)).toEqual(['e-tango', 'e-jazz', 'e-charla', 'e-rock']);
    expect(res.body[0].yaSeRealizo).toBe(true);
  });

  it('un usuario que no organiza nada ve una lista vacía', async () => {
    const { app } = appDePrueba();

    expect((await request(app).get('/api/mis-eventos').set(como('u-leo'))).body).toEqual([]);
  });
});

describe('Acciones del organizador sobre una compra (Historia 4, FR-020)', () => {
  it('escenario 3: Ana confirma k-002 → CONFIRMADA y queda en el historial a su nombre', async () => {
    const { app } = appDePrueba();

    const res = await accion(app, 'k-002', 'confirmar', 'u-ana');

    expect(res.status).toBe(200);
    expect(res.body.estado).toBe('CONFIRMADA');
    expect(res.body.historial.at(-1)).toMatchObject({ estado: 'CONFIRMADA', quien: { id: 'u-ana' } });
    expect(res.body.diasRestantes).toBe(10);
  });

  it('el comprador no puede confirmar su compra → 403', async () => {
    const { app } = appDePrueba();

    expect((await accion(app, 'k-002', 'confirmar', 'u-sofi')).status).toBe(403);
  });

  it('confirmar una compra ya confirmada → 409', async () => {
    const { app } = appDePrueba();

    const res = await accion(app, 'k-001', 'confirmar', 'u-ana');

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/CONFIRMADA/);
  });

  it('escenario 4: Bruno rechaza k-003 → CANCELADA y el cupo vuelve', async () => {
    const { app } = appDePrueba();

    const res = await accion(app, 'k-003', 'rechazar', 'u-bruno');
    const ventas = await request(app).get('/api/eventos/e-hamlet/ventas').set(como('u-bruno'));

    expect(res.status).toBe(200);
    expect(res.body.estado).toBe('CANCELADA');
    expect(ventas.body.tiposEntrada.find((t) => t.nombre === 'Platea').disponibles).toBe(100);
  });

  it('escenario 5: Bruno registra el ingreso de k-006 (el stand up es hoy) → UTILIZADA', async () => {
    const { app } = appDePrueba();

    const res = await accion(app, 'k-006', 'registrar-ingreso', 'u-bruno');

    expect(res.status).toBe(200);
    expect(res.body.estado).toBe('UTILIZADA');
  });

  it('escenario 6: registrar el ingreso antes del día del evento → 409 con el motivo', async () => {
    const { app } = appDePrueba();

    const res = await accion(app, 'k-001', 'registrar-ingreso', 'u-ana');

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/día del evento/);
  });

  it('escenario 7: el detalle muestra todo el historial con quién y cuándo', async () => {
    const { app } = appDePrueba();
    await accion(app, 'k-002', 'confirmar', 'u-ana');

    const res = await request(app).get('/api/compras/k-002').set(como('u-sofi'));

    expect(res.body.historial.map((h) => [h.estado, h.quien.id])).toEqual([
      ['PENDIENTE', 'u-sofi'],
      ['CONFIRMADA', 'u-ana'],
    ]);
    expect(res.body.historial[1].fechaHora).toBe('2026-11-18T18:00:00.000Z');
  });

  it('compra inexistente → 404; acción inexistente → 404', async () => {
    const { app } = appDePrueba();

    expect((await accion(app, 'k-nada', 'confirmar', 'u-ana')).status).toBe(404);
    expect((await accion(app, 'k-002', 'aprobar', 'u-ana')).status).toBe(404);
  });
});
