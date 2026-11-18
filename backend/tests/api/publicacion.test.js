import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { appDePrueba, como } from './helpers.js';

const eventoValido = () => ({
  nombre: 'Festival de Leo',
  descripcion: 'Bandas emergentes del barrio',
  categoriaId: 'c-recitales',
  fecha: '2026-12-08T20:00:00-03:00',
  multimedia: ['https://ejemplo.com/afiche.jpg'],
  tiposEntrada: [
    { nombre: 'General', descripcion: 'De pie', precio: 5000, cupo: 200 },
    { nombre: 'VIP', precio: 15000, cupo: 20 },
  ],
});

const publicar = (app, usuario, body) => request(app).post('/api/eventos').set(como(usuario)).send(body);

describe('POST /api/eventos (Historia 8, FR-023)', () => {
  it('escenario 1: Leo publica un evento → 201, queda como organizador y aparece en el catálogo', async () => {
    const { app } = appDePrueba();

    const res = await publicar(app, 'u-leo', eventoValido());
    const catalogo = await request(app).get('/api/eventos?texto=festival de leo');

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      nombre: 'Festival de Leo',
      organizador: { id: 'u-leo', puntaje: null },
      categoria: { id: 'c-recitales' },
      fecha: '2026-12-08T23:00:00.000Z',
      precioDesde: 5000,
    });
    expect(res.body.id).toBeTruthy();
    expect(res.body.tiposEntrada.map((t) => [t.nombre, t.disponibles])).toEqual([['General', 200], ['VIP', 20]]);
    expect(res.body.tiposEntrada.every((t) => t.id)).toBe(true);
    expect(catalogo.body.map((e) => e.id)).toEqual([res.body.id]);
  });

  it('escenario 3: otro usuario compra entradas del evento publicado', async () => {
    const { app } = appDePrueba();
    const evento = (await publicar(app, 'u-leo', eventoValido())).body;

    const compra = await request(app)
      .post('/api/compras')
      .set(como('u-sofi'))
      .send({ eventoId: evento.id, tipoEntradaId: evento.tiposEntrada[1].id, cantidad: 2 });

    expect(compra.status).toBe(201);
    expect(compra.body.total).toBe(30000);
  });

  it('aparece en mis eventos del que lo publicó', async () => {
    const { app } = appDePrueba();
    const evento = (await publicar(app, 'u-leo', eventoValido())).body;

    const res = await request(app).get('/api/mis-eventos').set(como('u-leo'));

    expect(res.body.map((e) => e.id)).toEqual([evento.id]);
  });

  it.each([
    ['sin tipos de entrada', { tiposEntrada: [] }],
    ['tipos que no son una lista', { tiposEntrada: 'General' }],
    ['categoría inexistente', { categoriaId: 'c-nada' }],
    ['fecha pasada', { fecha: '2026-11-01T20:00:00-03:00' }],
    ['fecha inválida', { fecha: 'mañana' }],
    ['precio negativo', { tiposEntrada: [{ nombre: 'General', precio: -1, cupo: 10 }] }],
    ['cupo 0', { tiposEntrada: [{ nombre: 'General', precio: 100, cupo: 0 }] }],
    ['nombre vacío', { nombre: '  ' }],
    ['tipos con el mismo nombre', { tiposEntrada: [{ nombre: 'VIP', precio: 1, cupo: 1 }, { nombre: 'vip', precio: 2, cupo: 2 }] }],
  ])('escenario 2: %s → 400', async (_caso, cambio) => {
    const { app } = appDePrueba();

    const res = await publicar(app, 'u-leo', { ...eventoValido(), ...cambio });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeTruthy();
  });

  it('un evento inválido no queda guardado', async () => {
    const { app } = appDePrueba();
    await publicar(app, 'u-leo', { ...eventoValido(), categoriaId: 'c-nada' });

    expect((await request(app).get('/api/mis-eventos').set(como('u-leo'))).body).toEqual([]);
  });

  it('sin usuario → 401', async () => {
    const { app } = appDePrueba();

    expect((await request(app).post('/api/eventos').send(eventoValido())).status).toBe(401);
  });
});
