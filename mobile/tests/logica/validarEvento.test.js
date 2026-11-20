import { describe, it, expect } from 'vitest';
import { validarEvento } from '../../src/logica/validarEvento.js';

const AHORA = new Date('2026-11-18T18:00:00.000Z');

const formularioValido = () => ({
  nombre: ' Festival de Leo ',
  descripcion: 'Bandas emergentes',
  categoriaId: 'c-recitales',
  fecha: new Date('2026-12-08T23:00:00.000Z'),
  imagen: '',
  tiposEntrada: [
    { nombre: 'General', descripcion: '', precio: '5000', cupo: '200' },
    { nombre: 'VIP', descripcion: 'Cerca del escenario', precio: '15000', cupo: '20' },
  ],
});

describe('validarEvento (FR-018)', () => {
  it('un formulario válido devuelve los datos listos para la API, con números', () => {
    const resultado = validarEvento(formularioValido(), AHORA);

    expect(resultado.valido).toBe(true);
    expect(resultado.errores).toEqual({});
    expect(resultado.datos).toEqual({
      nombre: 'Festival de Leo',
      descripcion: 'Bandas emergentes',
      categoriaId: 'c-recitales',
      fecha: '2026-12-08T23:00:00.000Z',
      multimedia: [],
      tiposEntrada: [
        { nombre: 'General', descripcion: '', precio: 5000, cupo: 200 },
        { nombre: 'VIP', descripcion: 'Cerca del escenario', precio: 15000, cupo: 20 },
      ],
    });
  });

  it('una imagen https se manda como multimedia', () => {
    const resultado = validarEvento({ ...formularioValido(), imagen: 'https://ejemplo.com/a.jpg' }, AHORA);

    expect(resultado.datos.multimedia).toEqual(['https://ejemplo.com/a.jpg']);
  });

  it.each([
    ['nombre', { nombre: '   ' }],
    ['descripcion', { descripcion: '' }],
    ['categoriaId', { categoriaId: null }],
    ['fecha', { fecha: new Date('2026-11-01T00:00:00.000Z') }],
    ['fecha', { fecha: null }],
    ['imagen', { imagen: 'no es una url' }],
    ['tiposEntrada', { tiposEntrada: [] }],
  ])('marca el error en %s', (campo, cambio) => {
    const resultado = validarEvento({ ...formularioValido(), ...cambio }, AHORA);

    expect(resultado.valido).toBe(false);
    expect(resultado.errores[campo]).toBeTruthy();
  });

  it.each([
    ['tipos.0.nombre', { nombre: ' ' }],
    ['tipos.0.precio', { precio: '-1' }],
    ['tipos.0.precio', { precio: 'abc' }],
    ['tipos.0.precio', { precio: '' }],
    ['tipos.0.cupo', { cupo: '0' }],
    ['tipos.0.cupo', { cupo: '1.5' }],
  ])('marca el error en %s', (clave, cambio) => {
    const formulario = formularioValido();
    formulario.tiposEntrada[0] = { ...formulario.tiposEntrada[0], ...cambio };

    const resultado = validarEvento(formulario, AHORA);

    expect(resultado.valido).toBe(false);
    expect(resultado.errores[clave]).toBeTruthy();
  });

  it('precio 0 es válido (evento gratuito)', () => {
    const formulario = formularioValido();
    formulario.tiposEntrada[0].precio = '0';

    expect(validarEvento(formulario, AHORA).valido).toBe(true);
  });

  it('dos tipos con el mismo nombre ("VIP" y " vip ") → error en el segundo', () => {
    const formulario = formularioValido();
    formulario.tiposEntrada[0].nombre = ' vip ';

    const resultado = validarEvento(formulario, AHORA);

    expect(resultado.errores['tipos.1.nombre']).toMatch(/repetido/i);
  });
});
