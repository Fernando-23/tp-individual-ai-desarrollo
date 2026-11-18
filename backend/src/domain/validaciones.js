/**
 * Helpers internos de validación. Cada uno lanza ErrorValidacion con el nombre
 * del campo en el mensaje, o devuelve el valor ya normalizado.
 * No forman parte de la API pública del dominio.
 */
import { ErrorValidacion } from './errores.js';

export function texto(valor, campo) {
  if (typeof valor !== 'string') {
    throw new ErrorValidacion(`${campo} debe ser un texto`);
  }
  return valor.trim();
}

export function textoNoVacio(valor, campo) {
  const recortado = texto(valor, campo);
  if (recortado === '') {
    throw new ErrorValidacion(`${campo} no puede estar vacío`);
  }
  return recortado;
}

export function enteroMayorA(valor, minimo, campo) {
  if (!Number.isInteger(valor) || valor <= minimo) {
    throw new ErrorValidacion(`${campo} debe ser un número entero mayor a ${minimo}`);
  }
  return valor;
}

export function numeroNoNegativo(valor, campo) {
  if (typeof valor !== 'number' || !Number.isFinite(valor) || valor < 0) {
    throw new ErrorValidacion(`${campo} debe ser un número mayor o igual a 0`);
  }
  return valor;
}

export function instanciaDe(valor, Clase, campo) {
  if (!(valor instanceof Clase)) {
    throw new ErrorValidacion(`${campo} debe ser un ${Clase.name}`);
  }
  return valor;
}

export function fechaValida(valor, campo) {
  if (!(valor instanceof Date) || Number.isNaN(valor.getTime())) {
    throw new ErrorValidacion(`${campo} debe ser una fecha válida`);
  }
  return valor;
}

export function idValido(valor) {
  return textoNoVacio(valor, 'id');
}
