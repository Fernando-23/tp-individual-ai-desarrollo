import { describe, it, expect } from 'vitest';
import { cargarDatosDemo } from '../../src/seed/datosDemo.js';
import { crearRepositorios } from '../../src/repositories/repositorioEnMemoria.js';
import { EstadoCompra } from '../../src/domain/estadoCompra.js';
import { puntajeOrganizador } from '../../src/domain/reputacion.js';

const AHORA = new Date('2026-11-18T15:00:00-03:00');

function cargar(ahora = AHORA) {
  const repos = crearRepositorios();
  cargarDatosDemo(repos, ahora);
  return repos;
}

const eventosDe = (repos, usuarioId) => repos.eventos.filtrar((e) => e.organizador.id === usuarioId);

describe('Datos de demostración (Historia 1, FR-003 a FR-005)', () => {
  it('carga 4 usuarios, 6 categorías, 8 eventos y 11 compras', () => {
    const repos = cargar();

    expect(repos.usuarios.todos()).toHaveLength(4);
    expect(repos.categorias.todos()).toHaveLength(6);
    expect(repos.eventos.todos()).toHaveLength(8);
    expect(repos.compras.todos()).toHaveLength(11);
  });

  it('hay al menos 2 organizadores y 2 compradores', () => {
    const repos = cargar();
    const organizadores = new Set(repos.eventos.todos().map((e) => e.organizador.id));
    const compradores = new Set(repos.compras.todos().map((c) => c.comprador.id));

    expect(organizadores.size).toBeGreaterThanOrEqual(2);
    expect(compradores.size).toBeGreaterThanOrEqual(2);
  });

  it('hay compras en los 5 estados', () => {
    const estados = new Set(cargar().compras.todos().map((c) => c.estado));

    expect([...estados].sort()).toEqual(Object.values(EstadoCompra).sort());
  });

  it('el stand up es hoy y todavía no empezó; tango e impro ya se realizaron', () => {
    const repos = cargar();
    const standup = repos.eventos.buscarPorId('e-standup');

    expect(standup.esElDiaDelEvento(AHORA)).toBe(true);
    expect(standup.yaSeRealizo(AHORA)).toBe(false);
    expect(repos.eventos.buscarPorId('e-tango').yaSeRealizo(AHORA)).toBe(true);
    expect(repos.eventos.buscarPorId('e-impro').yaSeRealizo(AHORA)).toBe(true);
  });

  it('Ana tiene puntaje 4,5 y Bruno 3', () => {
    const repos = cargar();

    expect(puntajeOrganizador(eventosDe(repos, 'u-ana'))).toBe(4.5);
    expect(puntajeOrganizador(eventosDe(repos, 'u-bruno'))).toBe(3);
  });

  it('Leo tiene k-009 UTILIZADA en Impro y todavía no lo reseñó', () => {
    const repos = cargar();
    const impro = repos.eventos.buscarPorId('e-impro');

    expect(repos.compras.buscarPorId('k-009').estado).toBe(EstadoCompra.UTILIZADA);
    expect(impro.resenias.some((r) => r.comprador.id === 'u-leo')).toBe(false);
  });

  it('k-001 está CONFIRMADA y faltan 10 días para su evento', () => {
    const k001 = cargar().compras.buscarPorId('k-001');

    expect(k001.estado).toBe(EstadoCompra.CONFIRMADA);
    expect(k001.evento.diasRestantes(AHORA)).toBe(10);
  });

  it('hay mensajes y favoritos precargados', () => {
    const repos = cargar();

    expect(repos.compras.buscarPorId('k-001').mensajes).toHaveLength(2);
    expect(repos.usuarios.buscarPorId('u-leo').favoritos.map((e) => e.id)).toEqual(['e-rock', 'e-hamlet']);
  });

  it('es determinístico: dos cargas con el mismo ahora dan los mismos ids y estados (SC-005)', () => {
    const resumen = (repos) => repos.compras.todos().map((c) => [c.id, c.estado, c.historial.length]);

    expect(resumen(cargar())).toEqual(resumen(cargar()));
    expect(cargar().eventos.todos().map((e) => e.fecha.getTime()))
      .toEqual(cargar().eventos.todos().map((e) => e.fecha.getTime()));
  });

  it('arrancando a las 23:30 de Buenos Aires, el stand up sigue siendo hoy', () => {
    const tarde = new Date('2026-11-18T23:30:00-03:00');
    const standup = cargar(tarde).eventos.buscarPorId('e-standup');

    expect(standup.esElDiaDelEvento(tarde)).toBe(true);
    expect(standup.yaSeRealizo(tarde)).toBe(false);
  });

  it('funciona con cualquier fecha de arranque (fechas relativas, FR-004)', () => {
    expect(() => cargar(new Date('2027-03-01T09:00:00-03:00'))).not.toThrow();
  });
});
