import { randomUUID } from 'node:crypto';
import express from 'express';
import { manejarErrores, rutaNoEncontrada } from './http/errores.js';
import { crearMiddlewaresUsuario } from './http/usuarioActual.js';
import { crearRutas } from './routes/index.js';
import { crearServicios } from './services/index.js';

/**
 * Arma la app de Express con lo que se le inyecta (research D2):
 * - repositorios: los 4 repositorios en memoria (ya cargados o vacíos);
 * - reloj: () => Date, la hora "actual" (fija en los tests);
 * - generarId: () => string, para lo que se crea en tiempo de ejecución.
 * No escucha ningún puerto: eso lo hace server.js.
 */
export function crearApp({ repositorios, reloj = () => new Date(), generarId = randomUUID }) {
  const servicios = crearServicios({ repositorios, reloj, generarId });
  const usuario = crearMiddlewaresUsuario(repositorios.usuarios);

  const app = express();
  app.use(express.json());
  app.use('/api', crearRutas({ servicios, usuario, reloj }));
  app.use(rutaNoEncontrada);
  app.use(manejarErrores);
  return app;
}
