import { Router } from 'express';
import { crearRutasCategorias } from './categorias.js';
import { crearRutasCompras } from './compras.js';
import { crearRutasEventos } from './eventos.js';
import { crearRutasMisRecursos } from './misRecursos.js';
import { crearRutasUsuarios } from './usuarios.js';
import { crearVistas } from './vistas.js';

/**
 * Monta todas las rutas bajo /api. Cada módulo de rutas recibe los servicios
 * y los middlewares de usuario: las rutas no tocan repositorios (Principio II).
 */
export function crearRutas(dependencias) {
  const deps = { ...dependencias, vistas: crearVistas(dependencias) };
  const router = Router();

  router.get('/salud', (req, res) => {
    res.json({ ok: true });
  });
  router.use('/usuarios', crearRutasUsuarios(deps));
  router.use('/categorias', crearRutasCategorias(deps));
  router.use('/eventos', crearRutasEventos(deps));
  router.use('/compras', crearRutasCompras(deps));
  // Las rutas /mis-* exigen usuario: van al final para no interceptar las anteriores.
  router.use('/', crearRutasMisRecursos(deps));

  return router;
}
