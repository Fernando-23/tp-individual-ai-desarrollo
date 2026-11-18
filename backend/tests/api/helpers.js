/**
 * Helpers de los tests de API: cada test arma su propia app con el seed y un
 * reloj fijo (constitución, Principio I: sin estado compartido entre tests).
 */
import { crearApp } from '../../src/app.js';
import { crearRepositorios } from '../../src/repositories/repositorioEnMemoria.js';
import { cargarDatosDemo } from '../../src/seed/datosDemo.js';

/** "Ahora" de los tests: miércoles 18/11/2026 a las 15:00 de Buenos Aires. */
export const AHORA = new Date('2026-11-18T15:00:00-03:00');

export function appDePrueba({ ahora = AHORA } = {}) {
  const repositorios = crearRepositorios();
  // El seed se arma siempre con AHORA, aunque el reloj de la app sea otro:
  // así un test puede "adelantar el reloj" sobre los mismos datos.
  cargarDatosDemo(repositorios, AHORA);
  let contador = 0;
  const app = crearApp({
    repositorios,
    reloj: () => ahora,
    generarId: () => `gen-${++contador}`,
  });
  return { app, repositorios };
}

/** Header del usuario actual. */
export const como = (usuarioId) => ({ 'X-Usuario-Id': usuarioId });
