import { describe, it, expect } from 'vitest';
import { crearEvento, crearTipoEntrada } from './builders.js';

const evento = crearEvento({
  tiposEntrada: [
    crearTipoEntrada({ nombre: 'General', precio: 3000 }),
    crearTipoEntrada({ nombre: 'VIP', precio: 12000 }),
  ],
});

describe('Evento.tuPrecioEstaEntre (Historia 5, FR-003)', () => {
  it('escenario 3: entre $10.000 y $15.000 → sí, por la entrada VIP', () => {
    expect(evento.tuPrecioEstaEntre(10000, 15000)).toBe(true);
  });

  it('escenario 4: entre $4.000 y $10.000 → no, ningún tipo cae en el rango', () => {
    expect(evento.tuPrecioEstaEntre(4000, 10000)).toBe(false);
  });

  it('los límites son inclusivos', () => {
    expect(evento.tuPrecioEstaEntre(12000, 12000)).toBe(true);
    expect(evento.tuPrecioEstaEntre(0, 3000)).toBe(true);
  });

  it('un rango con mínimo mayor que máximo no coincide con nada', () => {
    expect(evento.tuPrecioEstaEntre(15000, 1000)).toBe(false);
  });
});
