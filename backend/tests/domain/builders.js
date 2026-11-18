/**
 * Fábricas de datos de prueba: devuelven objetos válidos por defecto y aceptan
 * overrides, para que cada test muestre solo lo que le importa.
 * Los ids son incrementales para que los tests sean determinísticos.
 */
import { Usuario } from '../../src/domain/usuario.js';
import { Categoria } from '../../src/domain/categoria.js';
import { TipoEntrada } from '../../src/domain/tipoEntrada.js';
import { Evento } from '../../src/domain/evento.js';
import { Compra } from '../../src/domain/compra.js';

let secuencia = 0;
const siguienteId = (prefijo) => `${prefijo}${++secuencia}`;

/** Fecha y hora de Buenos Aires: en('2026-11-18T15:00:00'). */
export const en = (textoFechaHoraBA) => new Date(`${textoFechaHoraBA}-03:00`);

/** Momento "actual" por defecto de los tests: 10 días antes del evento por defecto. */
export const AHORA = en('2026-11-18T15:00:00');

export function crearUsuario(datos = {}) {
  return new Usuario({
    id: siguienteId('u'),
    nombre: 'Leo',
    apellido: 'Sosa',
    ...datos,
  });
}

export function crearCategoria(datos = {}) {
  return new Categoria({
    id: siguienteId('c'),
    nombre: 'Recitales',
    descripcion: 'Música en vivo',
    ...datos,
  });
}

export function crearTipoEntrada(datos = {}) {
  return new TipoEntrada({
    id: siguienteId('t'),
    nombre: 'General',
    descripcion: 'Campo',
    precio: 5000,
    cupo: 100,
    ...datos,
  });
}

export function crearEvento(datos = {}) {
  return new Evento({
    id: siguienteId('e'),
    nombre: 'Recital de prueba',
    descripcion: 'Un recital para los tests',
    categoria: datos.categoria ?? crearCategoria(),
    fecha: en('2026-11-28T21:00:00'),
    tiposEntrada: datos.tiposEntrada ?? [crearTipoEntrada()],
    multimedia: [],
    organizador: datos.organizador ?? crearUsuario({ nombre: 'Ana', apellido: 'Paz' }),
    ...datos,
  });
}

/**
 * Crea una compra con Compra.crear. Si no se pasa evento, crea uno nuevo;
 * si no se pasa tipo de entrada, usa el primero del evento.
 */
export function crearCompra(datos = {}) {
  const evento = datos.evento ?? crearEvento();
  return Compra.crear({
    id: siguienteId('k'),
    comprador: datos.comprador ?? crearUsuario(),
    evento,
    tipoEntrada: datos.tipoEntrada ?? evento.tiposEntrada[0],
    cantidad: datos.cantidad ?? 1,
    ahora: datos.ahora ?? AHORA,
  });
}
