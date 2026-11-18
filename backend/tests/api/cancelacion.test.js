import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { appDePrueba, como } from './helpers.js';

const cancelar = (app, compraId, usuario) =>
  request(app).post(`/api/compras/${compraId}/cancelar`).set(como(usuario));

describe('POST /api/compras/:id/cancelar (Historia 5, FR-018)', () => {
  it('escenario 1: Leo cancela k-001 (CONFIRMADA) → REEMBOLSADA y el cupo VIP vuelve a 20', async () => {
    const { app } = appDePrueba();

    const res = await cancelar(app, 'k-001', 'u-leo');
    const detalle = await request(app).get('/api/eventos/e-jazz');

    expect(res.status).toBe(200);
    expect(res.body.estado).toBe('REEMBOLSADA');
    expect(res.body.diasRestantes).toBeNull();
    expect(detalle.body.tiposEntrada.find((t) => t.id === 't-jazz-vip').disponibles).toBe(20);
  });

  it('escenario 2: Sofía cancela k-002 (PENDIENTE) → CANCELADA', async () => {
    const { app } = appDePrueba();

    const res = await cancelar(app, 'k-002', 'u-sofi');

    expect(res.status).toBe(200);
    expect(res.body.estado).toBe('CANCELADA');
  });

  it('escenario 3: cancelar una UTILIZADA → 409', async () => {
    const { app } = appDePrueba();

    const res = await cancelar(app, 'k-008', 'u-sofi');

    expect(res.status).toBe(409);
  });

  it('escenario 3: cancelar cuando el evento ya se realizó → 409 con el motivo', async () => {
    const { app } = appDePrueba({ ahora: new Date('2026-11-28T23:00:00-03:00') });

    const res = await cancelar(app, 'k-001', 'u-leo');

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/ya se realizó/);
  });

  it('escenario 4: cancelar una compra ajena → 403', async () => {
    const { app } = appDePrueba();

    expect((await cancelar(app, 'k-001', 'u-sofi')).status).toBe(403);
  });

  it('una compra rechazada no cambia: el estado sigue igual tras el error', async () => {
    const { app } = appDePrueba();
    await cancelar(app, 'k-001', 'u-sofi');

    const res = await request(app).get('/api/compras/k-001').set(como('u-leo'));

    expect(res.body.estado).toBe('CONFIRMADA');
    expect(res.body.historial).toHaveLength(2);
  });
});
