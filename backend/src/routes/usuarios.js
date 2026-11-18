import { Router } from 'express';
import * as presentar from '../http/presentadores.js';

/** GET /api/usuarios: la lista para elegir el usuario actual (FR-001). */
export function crearRutasUsuarios({ servicios }) {
  const router = Router();

  router.get('/', (req, res) => {
    res.json(servicios.usuarios.listar().map(presentar.usuario));
  });

  return router;
}
