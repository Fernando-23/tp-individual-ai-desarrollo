import { describe, it, expect } from 'vitest';
import { crearEvento, en } from './builders.js';

// Evento por defecto de los builders: 28/11/2026 a las 21:00 de Buenos Aires.
const evento = crearEvento({ fecha: en('2026-11-28T21:00:00') });

describe('Evento.yaSeRealizo: su fecha y hora de inicio ya pasaron', () => {
  it('falso un minuto antes de empezar', () => {
    expect(evento.yaSeRealizo(en('2026-11-28T20:59:00'))).toBe(false);
  });

  it('verdadero justo al empezar y después', () => {
    expect(evento.yaSeRealizo(en('2026-11-28T21:00:00'))).toBe(true);
    expect(evento.yaSeRealizo(en('2026-11-29T10:00:00'))).toBe(true);
  });
});

describe('Evento.esElDiaDelEvento: es el día del evento o posterior (FR-015)', () => {
  it('falso el día anterior a las 23:59', () => {
    expect(evento.esElDiaDelEvento(en('2026-11-27T23:59:00'))).toBe(false);
  });

  it('verdadero desde las 00:01 del día del evento', () => {
    expect(evento.esElDiaDelEvento(en('2026-11-28T00:01:00'))).toBe(true);
  });

  it('verdadero los días siguientes', () => {
    expect(evento.esElDiaDelEvento(en('2026-11-29T12:00:00'))).toBe(true);
  });
});

describe('Evento.diasRestantes: días calendario de Buenos Aires (FR-018)', () => {
  it.each([
    ['10 días antes', '2026-11-18T15:00:00', 10],
    ['la noche anterior', '2026-11-27T23:59:00', 1],
    ['el mismo día temprano', '2026-11-28T00:01:00', 0],
    ['el día siguiente', '2026-11-29T00:01:00', -1],
  ])('%s', (_caso, ahora, esperado) => {
    expect(evento.diasRestantes(en(ahora))).toBe(esperado);
  });
});
