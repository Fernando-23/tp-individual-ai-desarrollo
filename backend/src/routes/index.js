import { Router } from 'express';
import { crearRutasUsuarios } from './usuarios.js';

/**
 * Monta todas las rutas bajo /api. Cada módulo de rutas recibe los servicios
 * y los middlewares de usuario: las rutas no tocan repositorios (Principio II).
 */
export function crearRutas(dependencias) {
  const router = Router();

  router.get('/salud', (req, res) => {
    res.json({ ok: true });
  });
  router.use('/usuarios', crearRutasUsuarios(dependencias));

  return router;
}
