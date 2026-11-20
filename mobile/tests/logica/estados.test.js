import { describe, it, expect } from 'vitest';
import { ESTADOS, infoEstado } from '../../src/logica/estados.js';
import { contraste } from '../../src/logica/contraste.js';
import { PARES_DE_CONTRASTE } from '../../src/tema.js';

const NOMBRES = ['PENDIENTE', 'CONFIRMADA', 'UTILIZADA', 'CANCELADA', 'REEMBOLSADA'];

describe('ESTADOS (FR-004)', () => {
  it('cada uno de los 5 estados tiene etiqueta, colores e ícono', () => {
    expect(Object.keys(ESTADOS)).toEqual(NOMBRES);
    for (const estado of Object.values(ESTADOS)) {
      expect(estado.etiqueta).toBeTruthy();
      expect(estado.fondo).toMatch(/^#[0-9A-F]{6}$/i);
      expect(estado.texto).toMatch(/^#[0-9A-F]{6}$/i);
      expect(estado.icono).toBeTruthy();
    }
  });

  it('etiquetas, fondos e íconos son distintos entre sí: no se depende solo del color', () => {
    const valores = Object.values(ESTADOS);
    for (const campo of ['etiqueta', 'fondo', 'icono']) {
      expect(new Set(valores.map((v) => v[campo])).size).toBe(5);
    }
  });

  it('infoEstado devuelve el estado o un "Desconocido" gris', () => {
    expect(infoEstado('CONFIRMADA')).toBe(ESTADOS.CONFIRMADA);
    expect(infoEstado('RARO').etiqueta).toBe('Desconocido');
  });
});

describe('contraste (WCAG)', () => {
  it('negro sobre blanco es 21 y un color sobre sí mismo es 1', () => {
    expect(contraste('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
    expect(contraste('#6CD443', '#6CD443')).toBeCloseTo(1, 5);
  });

  it('es simétrico', () => {
    expect(contraste('#14532D', '#FFFFFF')).toBeCloseTo(contraste('#FFFFFF', '#14532D'), 10);
  });
});

describe('Paleta accesible AAA (FR-019, SC-006)', () => {
  it('hay pares declarados, incluidos los 5 chips de estado', () => {
    expect(PARES_DE_CONTRASTE.length).toBeGreaterThan(10);
    for (const nombre of NOMBRES) {
      expect(PARES_DE_CONTRASTE.some((p) => p.nombre.includes(nombre))).toBe(true);
    }
  });

  it.each(PARES_DE_CONTRASTE.map((p) => [p.nombre, p]))('%s cumple su mínimo', (_nombre, par) => {
    expect(contraste(par.frente, par.fondo)).toBeGreaterThanOrEqual(par.minimo);
  });

  it('todo par de texto exige al menos 7:1 (AAA)', () => {
    for (const par of PARES_DE_CONTRASTE.filter((p) => p.tipo === 'texto')) {
      expect(par.minimo).toBeGreaterThanOrEqual(7);
    }
  });
});
