import { describe, it, expect } from 'vitest';
import * as dominio from '../../src/domain/index.js';

// API pública según specs/001-modelo-dominio/contracts/dominio.md.
// Si el contrato cambia, este test obliga a actualizar index.js (y viceversa).
const CONTRATO = [
  // Entidades
  'Usuario', 'Categoria', 'Evento', 'TipoEntrada', 'Compra', 'Resenia',
  // Valores
  'CambioEstadoCompra', 'Mensaje',
  // Estados y reglas
  'EstadoCompra', 'TRANSICIONES',
  // Funciones puras
  'puntajeOrganizador', 'diaCalendario', 'diasEntre', 'normalizarNombre',
  // Errores
  'ErrorDeDominio', 'ErrorValidacion', 'ErrorPermiso', 'ErrorConflicto',
];

describe('index.js expone exactamente el contrato del dominio', () => {
  it.each(CONTRATO)('exporta %s', (nombre) => {
    expect(dominio[nombre]).toBeDefined();
  });

  it('no exporta nada fuera del contrato', () => {
    expect(Object.keys(dominio).sort()).toEqual([...CONTRATO].sort());
  });
});
