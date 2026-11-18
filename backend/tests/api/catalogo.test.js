import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { appDePrueba, como } from './helpers.js';
import { Evento } from '../../src/domain/evento.js';
import { TipoEntrada } from '../../src/domain/tipoEntrada.js';

const ids = (res) => res.body.map((e) => e.id);

async function buscar(query = '') {
  const { app } = appDePrueba();
  return request(app).get(`/api/eventos${query}`);
}

describe('GET /api/categorias (FR-006)', () => {
  it('escenario 1: lista las 6 categorías del catálogo', async () => {
    const { app } = appDePrueba();

    const res = await request(app).get('/api/categorias');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(6);
    expect(res.body).toContainEqual({ id: 'c-teatro', nombre: 'Teatro', descripcion: 'Obras en sala' });
  });
});

describe('GET /api/eventos: catálogo (Historia 2, FR-007 a FR-013)', () => {
  it('muestra solo los 6 eventos próximos, ordenados por fecha por defecto', async () => {
    const res = await buscar();

    expect(res.status).toBe(200);
    expect(ids(res)).toEqual(['e-standup', 'e-clasico', 'e-hamlet', 'e-jazz', 'e-charla', 'e-rock']);
  });

  it('escenario 2: busca por texto sin distinguir mayúsculas, acentos ni espacios', async () => {
    expect(ids(await buscar('?texto=jazz'))).toEqual(['e-jazz']);
    expect(ids(await buscar('?texto=J%C3%81ZZ'))).toEqual(['e-jazz']);
    expect(ids(await buscar('?texto=%20%20jazz%20'))).toEqual(['e-jazz']);
  });

  it('busca también en la descripción', async () => {
    expect(ids(await buscar('?texto=shakespeare'))).toEqual(['e-hamlet']);
  });

  it('escenario 9: sin resultados devuelve una lista vacía', async () => {
    const res = await buscar('?texto=xyz');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('escenario 3: filtra por categoría', async () => {
    expect(ids(await buscar('?categoria=c-teatro'))).toEqual(['e-hamlet']);
  });

  it('escenario 4: combina texto y categoría', async () => {
    expect(ids(await buscar('?categoria=c-recitales&texto=noche'))).toEqual(['e-jazz']);
  });

  it('una categoría inexistente → 400', async () => {
    const res = await buscar('?categoria=c-nada');

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/categoría/);
  });

  it('filtra por rango de precios con tuPrecioEstaEntre (FR-010)', async () => {
    expect(ids(await buscar('?precioMin=30000'))).toEqual(['e-rock']);
    expect(ids(await buscar('?precioMax=0'))).toEqual(['e-charla']);
    expect(ids(await buscar('?precioMin=9000&precioMax=10000&orden=precio'))).toEqual(['e-clasico', 'e-hamlet']);
  });

  it('un precio que no es número → 400', async () => {
    expect((await buscar('?precioMin=abc')).status).toBe(400);
    expect((await buscar('?precioMax=-5')).status).toBe(400);
  });

  it('escenario 5: ordena por el precio más bajo de cada evento', async () => {
    const res = await buscar('?orden=precio');

    expect(ids(res)).toEqual(['e-charla', 'e-clasico', 'e-standup', 'e-jazz', 'e-hamlet', 'e-rock']);
    expect(res.body.map((e) => e.precioDesde)).toEqual([0, 5000, 6000, 8000, 9000, 15000]);
  });

  it('escenario 6: ordena por fecha, del más próximo al más lejano', async () => {
    expect(ids(await buscar('?orden=fecha'))).toEqual(['e-standup', 'e-clasico', 'e-hamlet', 'e-jazz', 'e-charla', 'e-rock']);
  });

  it('escenario 7: ordena por puntaje del organizador (Ana 4,5 antes que Bruno 3), desempata por fecha', async () => {
    const res = await buscar('?orden=puntaje');

    expect(ids(res)).toEqual(['e-jazz', 'e-charla', 'e-rock', 'e-standup', 'e-clasico', 'e-hamlet']);
  });

  it('un orden desconocido → 400 que nombra los órdenes posibles', async () => {
    const res = await buscar('?orden=raro');

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/precio.*fecha.*puntaje/);
  });

  it('cada evento del catálogo trae su resumen (FR-013)', async () => {
    const jazz = (await buscar('?texto=jazz')).body[0];

    expect(jazz).toMatchObject({
      id: 'e-jazz',
      nombre: 'Noche de Jazz',
      categoria: { id: 'c-recitales', nombre: 'Recitales' },
      precioDesde: 8000,
      hayEntradas: true,
      yaSeRealizo: false,
      organizador: { id: 'u-ana', puntaje: 4.5, cantidadResenias: 2 },
    });
    expect(jazz.fecha).toMatch(/Z$/);
    expect(jazz.imagen).toMatch(/^https:/);
  });
});

describe('GET /api/eventos/:id: detalle (escenario 8, FR-014)', () => {
  it('trae tipos con disponibles, descripción y reseñas de todos los eventos del organizador', async () => {
    const { app } = appDePrueba();

    const res = await request(app).get('/api/eventos/e-jazz');

    expect(res.status).toBe(200);
    expect(res.body.descripcion).toMatch(/cuarteto/);
    expect(res.body.tiposEntrada).toContainEqual(
      expect.objectContaining({ id: 't-jazz-vip', precio: 20000, cupo: 20, disponibles: 18 }),
    );
    expect(res.body.organizador).toMatchObject({ id: 'u-ana', puntaje: 4.5 });
    expect(res.body.reseniasDelOrganizador.map((r) => r.evento.id)).toEqual(['e-tango', 'e-tango']);
  });

  it('un organizador sin reseñas tiene puntaje null ("sin puntaje")', async () => {
    const { app, repositorios } = appDePrueba();
    // En el seed todos los organizadores tienen reseñas: se agrega un evento de Leo.
    repositorios.eventos.guardar(new Evento({
      id: 'e-de-leo',
      nombre: 'Feria de Leo',
      descripcion: 'Prueba',
      categoria: repositorios.categorias.buscarPorId('c-festivales'),
      fecha: new Date('2026-12-20T20:00:00-03:00'),
      tiposEntrada: [new TipoEntrada({ id: 't-de-leo', nombre: 'General', precio: 1000, cupo: 10 })],
      organizador: repositorios.usuarios.buscarPorId('u-leo'),
    }));

    const res = await request(app).get('/api/eventos/e-de-leo');

    expect(res.body.organizador.puntaje).toBeNull();
    expect(res.body.organizador.cantidadResenias).toBe(0);
    expect(res.body.reseniasDelOrganizador).toEqual([]);
  });

  it('también muestra eventos pasados', async () => {
    const { app } = appDePrueba();

    const res = await request(app).get('/api/eventos/e-tango');

    expect(res.status).toBe(200);
    expect(res.body.yaSeRealizo).toBe(true);
  });

  it('un evento inexistente → 404', async () => {
    const { app } = appDePrueba();

    expect((await request(app).get('/api/eventos/e-nada')).status).toBe(404);
  });

  it('esFavorito: null sin usuario; true o false según el usuario', async () => {
    const { app } = appDePrueba();

    expect((await request(app).get('/api/eventos/e-rock')).body.esFavorito).toBeNull();
    expect((await request(app).get('/api/eventos/e-rock').set(como('u-leo'))).body.esFavorito).toBe(true);
    expect((await request(app).get('/api/eventos/e-rock').set(como('u-sofi'))).body.esFavorito).toBe(false);
  });
});
